import User from '../models/User';
import Flight from '../models/flight';
import Booking from '../models/booking';
import Recommendation from '../models/recommendationModel';
import tf from '@tensorflow/tfjs-node';

interface FlightDoc {
  _id: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsAvailable: number;
  date: Date;
  status: string;
}

interface Recommendation {
  type: 'neural' | 'personalized' | 'generic' | 'predicted';
  message: string;
  flights: FlightDoc[];
}

class RecommendationService {
  private static model: tf.LayersModel | null = null;
  private static isTraining = false;
  
  // Initialize the recommendation model
  static async initializeModel() {
    if (!this.model && !this.isTraining) {
      this.isTraining = true;
      try {
        // Neural Collaborative Filtering model
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({
          units: 128,
          activation: 'relu',
          inputShape: [15] // Number of features
        }));
        this.model.add(tf.layers.dropout({ rate: 0.2 }));
        this.model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
        this.model.add(tf.layers.dropout({ rate: 0.2 }));
        this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
        
        this.model.compile({
          optimizer: tf.train.adam(0.001),
          loss: 'binaryCrossentropy',
          metrics: ['accuracy']
        });
        
        console.log('Recommendation model initialized');
      } finally {
        this.isTraining = false;
      }
    }
    return this.model;
  }

  // Extract features from flight and user data
  private static extractFeatures(flight: FlightDoc, user: any): number[] {
    // Normalize features between 0-1
    const features = [
      flight.price / 5000, // Assuming max price is 5000
      this.normalizeDuration(flight.duration),
      ...this.encodeLocation(flight.from),
      ...this.encodeLocation(flight.to),
      this.isWeekend(flight.date) ? 1 : 0,
      this.isMorningFlight(flight.departureTime) ? 1 : 0,
      user?.preferences?.prefersWindowSeat ? 1 : 0,
      user?.preferences?.prefersAisleSeat ? 1 : 0,
      user?.preferences?.prefersDirectFlights ? 1 : 0
    ];
    
    return features.slice(0, 15); // Ensure we have exactly 15 features
  }

  private static normalizeDuration(duration: string): number {
    const [hours, mins] = duration.split('h');
    return (parseInt(hours) + (parseInt(mins) / 60)) / 12; // Normalize to 12h max
  }

  private static encodeLocation(location: string): number[] {
    // One-hot encode popular locations (simplified)
    const locations = ['DEL', 'BOM', 'BLR', 'HYD', 'MAA'];
    const index = locations.indexOf(location);
    return locations.map((_, i) => i === index ? 1 : 0);
  }

  private static isWeekend(date: Date): boolean {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  }

  private static isMorningFlight(time: string): boolean {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 6 && hour < 12;
  }

  // Train model with user's booking history
  private static async trainUserModel(userId: string) {
    if (!this.model) await this.initializeModel();
    if (!this.model) return null;
    
    const [bookings, allFlights] = await Promise.all([
      Booking.find({ 'passengerDetails.email': userId })
        .populate('flightId')
        .limit(1000),
      Flight.find().limit(1000)
    ]);
    
    if (bookings.length < 5) return null; // Not enough data
    
    // Prepare training data - positive (booked) and negative (not booked) examples
    const positiveExamples = bookings.map(booking => ({
      flight: booking.flightId,
      label: 1
    }));
    
    // Generate negative examples (flights not booked)
    const negativeExamples = allFlights
      .filter(f => !bookings.some(b => b.flightId._id.equals(f._id)))
      .slice(0, Math.min(positiveExamples.length * 3, 1000)) // 3:1 negative:positive ratio
      .map(flight => ({ flight, label: 0 }));
    
    const trainingData = [...positiveExamples, ...negativeExamples];
    
    // Shuffle data
    for (let i = trainingData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [trainingData[i], trainingData[j]] = [trainingData[j], trainingData[i]];
    }
    
    const user = await User.findById(userId);
    const features = trainingData.map(({ flight }) => 
      this.extractFeatures(flight, user));
    const labels = trainingData.map(({ label }) => label);
    
    const xs = tf.tensor2d(features);
    const ys = tf.tensor1d(labels);
    
    await this.model.fit(xs, ys, {
      epochs: 20,
      batchSize: 32,
      validationSplit: 0.2
    });
    
    return this.model;
  }

  // Get neural recommendations
  static async getNeuralRecommendations(email: string): Promise<Recommendation> {
    try {
      const user = await User.findOne({ email }).select('+preferences');
      if (!user) return this.getGenericRecommendations();
      
      // Get or train user model
      const userModel = await this.trainUserModel(user._id);
      if (!userModel) return this.getPersonalizedRecommendations(email);
      
      // Get candidate flights (next 30 days)
      const candidateFlights = await Flight.find({
        date: { 
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }).limit(500);
      
      if (candidateFlights.length === 0) {
        return this.getGenericRecommendations();
      }
      
      // Score each flight
      const scoredFlights = await Promise.all(
        candidateFlights.map(async (flight) => {
          const features = this.extractFeatures(flight, user);
          const score = await userModel.predict(tf.tensor2d([features])).data();
          return { flight, score: score[0] };
        })
      );
      
      // Sort by score and take top 5
      const topFlights = scoredFlights
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ flight, score }) => {
          // Store recommendation for future reference
          new Recommendation({
            userId: user._id,
            flightId: flight._id,
            score,
            recommendationType: 'neural'
          }).save();
          
          return flight.toObject();
        });
      
      return {
        type: 'neural',
        message: 'Recommended flights based on your travel patterns:',
        flights: topFlights
      };
    } catch (error) {
      console.error('Error in neural recommendations:', error);
      return this.getGenericRecommendations();
    }
  }

  // Get personalized recommendations based on search history
  static async getPersonalizedRecommendations(email: string): Promise<Recommendation> {
    try {
      const user = await User.findOne({ email });
      if (!user) return this.getGenericRecommendations();

      // Get user's booking history
      const bookings = await Booking.find({ 'passengerDetails.email': email })
        .populate('flightId')
        .limit(100);
      
      if (bookings.length === 0) {
        return this.getGenericRecommendations();
      }
      
      // Count destinations
      const destinationCounts = new Map<string, number>();
      bookings.forEach(booking => {
        const flight = booking.flightId as unknown as FlightDoc;
        const count = destinationCounts.get(flight.to) || 0;
        destinationCounts.set(flight.to, count + 1);
      });
      
      // Sort by frequency
      const sortedDestinations = [...destinationCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([dest]) => dest);
      
      // Get flights to top destinations
      const recommendedFlights = [];
      for (const dest of sortedDestinations.slice(0, 3)) {
        const flights = await Flight.find({
          to: dest,
          date: { $gte: new Date() }
        }).limit(2);
        recommendedFlights.push(flights);
      }
      
      if (recommendedFlights.length > 0) {
        return {
          type: 'personalized',
          message: 'Based on your booking history:',
          flights: recommendedFlights.slice(0, 5).map(f => f.toObject())
        };
      }
      
      return this.getGenericRecommendations();
    } catch (error) {
      console.error('Error in personalized recommendations:', error);
      return this.getGenericRecommendations();
    }
  }

  // Get generic popular recommendations
  static async getGenericRecommendations(): Promise<Recommendation> {
    try {
      const popularFlights = await Flight.find({
        to: { $in: ['Mumbai', 'Delhi', 'Bangalore'] },
        date: { $gte: new Date() }
      }).limit(5);
      
      return {
        type: 'generic',
        message: 'Popular flights you might like:',
        flights: popularFlights.map(f => f.toObject())
      };
    } catch (error) {
      console.error('Error in generic recommendations:', error);
      return {
        type: 'generic',
        message: 'Popular flights you might like:',
        flights: []
      };
    }
  }

  // Get predicted travel needs (frequent routes)
  static async getPredictedTravelNeeds(email: string): Promise<Recommendation | null> {
    try {
      const bookings = await Booking.find({ 'passengerDetails.email': email })
        .populate('flightId')
        .limit(100);
      
      if (bookings.length < 3) return null;
      
      // Find most frequent route
      const routeCounts = new Map<string, number>();
      bookings.forEach(booking => {
        const flight = booking.flightId as unknown as FlightDoc;
        const route = `${flight.from}-${flight.to}`;
        const count = routeCounts.get(route) || 0;
        routeCounts.set(route, count + 1);
      });
      
      const sortedRoutes = [...routeCounts.entries()].sort((a, b) => b[1] - a[1]);
      if (sortedRoutes[0][1] < 2) return null; // Need at least 2 bookings on same route
      
      const [from, to] = sortedRoutes[0][0].split('-');
      const upcomingFlights = await Flight.find({
        from,
        to,
        date: { $gte: new Date() }
      }).limit(3);
      
      if (upcomingFlights.length === 0) return null;
      
      return {
        type: 'predicted',
        message: `You frequently travel from ${from} to ${to}. Upcoming flights:`,
        flights: upcomingFlights.map(f => f.toObject())
      };
    } catch (error) {
      console.error('Error in predicted recommendations:', error);
      return null;
    }
  }
}

export default RecommendationService;