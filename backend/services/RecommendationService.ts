import User, { IUser } from '../models/User';
import Flight from '../models/flight';
import Booking from '../models/booking';
import Recommendation from '../models/recommendationModel';
import tf from '@tensorflow/tfjs';
import { Types } from 'mongoose';

interface FlightDoc {
  _id: Types.ObjectId | string;
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

interface RecommendationResult {
  type: 'neural' | 'personalized' | 'generic' | 'predicted';
  message: string;
  flights: FlightDoc[];
}

class RecommendationService {
  private static model: tf.Sequential | null = null;
  private static isTraining = false;

  static async initializeModel() {
    if (!this.model && !this.isTraining) {
      this.isTraining = true;
      try {
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({ units: 128, activation: 'relu', inputShape: [15] }));
        this.model.add(tf.layers.dropout({ rate: 0.2 }));
        this.model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
        this.model.add(tf.layers.dropout({ rate: 0.2 }));
        this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

        this.model.compile({
          optimizer: tf.train.adam(0.001),
          loss: 'binaryCrossentropy',
          metrics: ['accuracy'],
        });

        console.log('Recommendation model initialized');
      } finally {
        this.isTraining = false;
      }
    }
    return this.model;
  }

  private static extractFeatures(flight: FlightDoc, user: IUser | null): number[] {
    const baseFeatures = [
      flight.price / 5000,
      this.normalizeDuration(flight.duration),
      ...this.encodeLocation(flight.from),
      ...this.encodeLocation(flight.to),
      this.isWeekend(flight.date) ? 1 : 0,
      this.isMorningFlight(flight.departureTime) ? 1 : 0,
      user?.preferences?.prefersWindowSeat ? 1 : 0,
      user?.preferences?.prefersAisleSeat ? 1 : 0,
      user?.preferences?.prefersDirectFlights ? 1 : 0,
    ];

    while (baseFeatures.length < 15) baseFeatures.push(0);
    return baseFeatures;
  }

  private static normalizeDuration(duration: string): number {
    const parts = duration.match(/(\d+)h\s*(\d+)?m?/);
    const hours = parts ? parseInt(parts[1]) : 0;
    const minutes = parts && parts[2] ? parseInt(parts[2]) : 0;
    return (hours + minutes / 60) / 12;
  }

  private static encodeLocation(location: string): number[] {
    const locations = ['DEL', 'BOM', 'BLR', 'HYD', 'MAA'];
    return locations.map((loc) => (loc === location ? 1 : 0));
  }

  private static isWeekend(date: Date): boolean {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  }

  private static isMorningFlight(time: string): boolean {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 6 && hour < 12;
  }

  private static async trainUserModel(userId: string): Promise<tf.Sequential | null> {
    if (!this.model) await this.initializeModel();
    if (!this.model) return null;

    const [bookings, allFlights] = await Promise.all([
      Booking.find({ 'passengerDetails.email': userId })
        .populate('flightId')
        .limit(1000)
        .lean<{ flightId: FlightDoc }[]>(),
      Flight.find().limit(1000).lean<FlightDoc[]>(),
    ]);

    if (bookings.length < 5) return null;

    const positiveExamples = bookings
      .filter((b) => b.flightId)
      .map((b) => ({ flight: b.flightId as FlightDoc, label: 1 }));

    const positiveIds = new Set(positiveExamples.map((b) => String(b.flight._id)));

    const negativeExamples = allFlights
      .filter((f) => !positiveIds.has(String(f._id)))
      .slice(0, Math.min(positiveExamples.length * 3, 1000))
      .map((flight) => ({ flight, label: 0 }));

    const trainingData = [...positiveExamples, ...negativeExamples];

    for (let i = trainingData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [trainingData[i], trainingData[j]] = [trainingData[j], trainingData[i]];
    }

    const user = await User.findById(userId).lean<{ _id: Types.ObjectId } & IUser>();
    if (!user) return null;

    const features = trainingData.map(({ flight }) => this.extractFeatures(flight, user));
    const labels = trainingData.map(({ label }) => label);

    const xs = tf.tensor2d(features, [features.length, 15]);
    const ys = tf.tensor1d(labels);

    await this.model.fit(xs, ys, {
      epochs: 20,
      batchSize: 32,
      validationSplit: 0.2,
    });

    xs.dispose();
    ys.dispose();

    return this.model;
  }

  static async getNeuralRecommendations(email: string): Promise<RecommendationResult> {
    try {
      const user = await User.findOne({ email }).lean<{ _id: Types.ObjectId } & IUser>();
      if (!user) return this.getGenericRecommendations();

      const userModel = await this.trainUserModel(user._id.toString());
      if (!userModel) return this.getPersonalizedRecommendations(email);

      const candidateFlights = await Flight.find({
        date: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
        .limit(500)
        .lean<FlightDoc[]>();

      const scoredFlights = await Promise.all(
        candidateFlights.map(async (flight) => {
          const features = this.extractFeatures(flight, user);
          const scoreTensor = userModel.predict(tf.tensor2d([features])) as tf.Tensor;
          const score = (await scoreTensor.data())[0];
          scoreTensor.dispose();
          return { flight, score };
        })
      );

      const topFlights = scoredFlights
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ flight, score }) => {
          new Recommendation({
            userId: user._id,
            flightId: flight._id,
            score,
            recommendationType: 'neural',
          }).save();
          return flight;
        });

      return {
        type: 'neural',
        message: 'Recommended flights based on your travel patterns:',
        flights: topFlights,
      };
    } catch (error) {
      console.error('Error in neural recommendations:', error);
      return this.getGenericRecommendations();
    }
  }

  static async getPersonalizedRecommendations(email: string): Promise<RecommendationResult> {
    try {
      const user = await User.findOne({ email }).lean<{ _id: Types.ObjectId } & IUser>();
      if (!user) return this.getGenericRecommendations();

      const flights = await Flight.find({
        from: { $in: [user.preferences?.preferredAirlines || ''] },
        price: {
          $gte: user.preferences?.budgetRange.min || 0,
          $lte: user.preferences?.budgetRange.max || 10000,
        },
        date: { $gte: new Date() },
      })
        .limit(5)
        .lean<FlightDoc[]>();

      return {
        type: 'personalized',
        message: 'Flights matching your preferences',
        flights,
      };
    } catch (error) {
      console.error('Error in personalized recommendations:', error);
      return this.getGenericRecommendations();
    }
  }

  static async getGenericRecommendations(): Promise<RecommendationResult> {
    const flights = await Flight.find({ date: { $gte: new Date() } })
      .sort({ seatsAvailable: -1 })
      .limit(5)
      .lean<FlightDoc[]>();

    return {
      type: 'generic',
      message: 'Popular flights you may like',
      flights,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getPredictedTravelNeeds(_email: string): Promise<RecommendationResult | null> {
    return this.getGenericRecommendations();
  }
}

export default RecommendationService;
