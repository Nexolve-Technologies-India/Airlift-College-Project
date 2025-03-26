// services/RecommendationService.ts
import User from '../models/User';
import Flight from '../models/flight';
import Booking from '../models/booking';

// Define interfaces based on assumed model structures
interface SearchEntry {
  timestamp: Date;
  date?: string;
  from?: string;
  to?: string;
}

interface FlightDoc {
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
  status: 'scheduled' | 'delayed' | 'cancelled';
}

interface Recommendation {
  type: 'personalized' | 'generic' | 'predicted';
  message: string;
  flights: FlightDoc[];
}

class RecommendationService {
  static async getPersonalizedRecommendations(email: string): Promise<Recommendation> {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        // Return generic recommendations if user doesn't exist
        return this.getGenericRecommendations();
      }

      // Analyze search history
      const searchHistory = (user.searchHistory || []) as SearchEntry[];
      const destinations = new Map<string, number>();

      // Count destination frequencies
      searchHistory.forEach((search) => {
        if (search.to) { // Check if 'to' exists
          const count = destinations.get(search.to) || 0;
          destinations.set(search.to, count + 1);
        }
      });

      // Sort destinations by frequency
      const sortedDestinations = [...destinations.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([dest]) => dest);

      // Get recommendations based on top destinations
      if (sortedDestinations.length > 0) {
        const topDestination = sortedDestinations[0];

        // Find flights to top destination
        const flights = await Flight.find({
          to: topDestination,
          date: { $gte: new Date() }, // Future flights only
        }).limit(5);

        if (flights.length > 0) {
          return {
            type: 'personalized',
            message: `Based on your search history, we found these flights to ${topDestination}:`,
            flights: flights as FlightDoc[],
          };
        }
      }

      // Fallback to generic recommendations
      return this.getGenericRecommendations();
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return this.getGenericRecommendations();
    }
  }

  static async getGenericRecommendations(): Promise<Recommendation> {
    try {
      // Get popular destinations
      const popularDestinations = ['Mumbai', 'Delhi', 'Bangalore'];

      // Get upcoming flights to popular destinations
      const flights = await Flight.find({
        to: { $in: popularDestinations },
        date: { $gte: new Date() },
      }).limit(5);

      return {
        type: 'generic',
        message: 'Popular flights you might be interested in:',
        flights: flights as FlightDoc[],
      };
    } catch (error) {
      console.error('Error getting generic recommendations:', error);
      return {
        type: 'generic',
        message: 'Popular flights you might be interested in:',
        flights: [],
      };
    }
  }

  static async getPredictedTravelNeeds(email: string): Promise<Recommendation | null> {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return null;
      }

      // Get past bookings and populate flight details
      const bookings = await Booking.find({ 'passengerDetails.email': email }).populate('flightId');

      if (bookings.length === 0) {
        return null;
      }

      // Extract booking patterns
      const bookingFrequency = new Map<string, number>();
      let mostFrequentRoute = { from: '', to: '' };
      let maxFrequency = 0;

      bookings.forEach((booking) => {
        // Assuming flightId is populated with Flight document
        const flight = booking.flightId as unknown as FlightDoc;
        if (flight && flight.from && flight.to) {
          const route = `${flight.from}-${flight.to}`;
          const count = bookingFrequency.get(route) || 0;
          bookingFrequency.set(route, count + 1);

          // Track most frequent route
          if (count + 1 > maxFrequency) {
            maxFrequency = count + 1;
            mostFrequentRoute = { from: flight.from, to: flight.to };
          }
        }
      });

      // If we have a most frequent route with more than 1 occurrence
      if (maxFrequency > 1) {
        // Get upcoming flights for that route
        const flights = await Flight.find({
          from: mostFrequentRoute.from,
          to: mostFrequentRoute.to,
          date: { $gte: new Date() },
        }).limit(3);

        if (flights.length > 0) {
          return {
            type: 'predicted',
            message: `We noticed you travel from ${mostFrequentRoute.from} to ${mostFrequentRoute.to} frequently. Here are some upcoming flights:`,
            flights: flights as FlightDoc[],
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error predicting travel needs:', error);
      return null;
    }
  }
}

export default RecommendationService;