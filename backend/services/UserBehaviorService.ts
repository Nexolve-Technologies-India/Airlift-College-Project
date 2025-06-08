import { Types, Document } from 'mongoose';
import User from '../models/User';
import Flight from '../models/flight';

// Define the FlightDoc interface for type safety
interface FlightDoc {
  _id: Types.ObjectId;
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

// Define types for recently viewed flights, search history, and price alerts
interface RecentlyViewedFlight {
  flightId: Types.ObjectId | null | undefined; // Allow null/undefined for Mongoose flexibility
  viewedAt: Date;
}

interface SearchHistoryEntry {
  from: string;
  to: string;
  date: string;
  timestamp: Date;
}

interface PriceAlert {
  from: string;
  to: string;
  maxPrice: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  isActive: boolean;
}

// Define the User document interface for Mongoose
interface UserDocument extends Document {
  name: string;
  email: string;
  loyaltyPoints: number;
  loyaltyTier: 'standard' | 'silver' | 'gold' | 'platinum';
  searchHistory: Types.DocumentArray<SearchHistoryEntry>;
  recentlyViewedFlights: Types.DocumentArray<RecentlyViewedFlight>;
  priceAlerts: Types.DocumentArray<PriceAlert>;
  phone?: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}

// Define return type for updateLoyaltyPoints
interface LoyaltyUpdateResult {
  pointsAdded: number;
  totalPoints: number;
  tier: string;
}

// Define error result type for better error handling
interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class UserBehaviorService {
  static async addRecentlyViewedFlight(email: string, flightId: string): Promise<ServiceResult<boolean>> {
    try {
      // Validate flightId
      if (!Types.ObjectId.isValid(flightId)) {
        return { success: false, error: 'Invalid flight ID' };
      }

      let user = (await User.findOne({ email })) as UserDocument | null;
      if (!user) {
        user = new User({ email, name: 'Guest User' }) as unknown as UserDocument;
      }

      const flightObjectId = new Types.ObjectId(flightId);
      user.recentlyViewedFlights.unshift({
        flightId: flightObjectId,
        viewedAt: new Date(),
      });

      // Limit to 10 entries
      if (user.recentlyViewedFlights.length > 10) {
        user.recentlyViewedFlights = user.recentlyViewedFlights.slice(0, 10) as Types.DocumentArray<RecentlyViewedFlight>;
      }

      await user.save();
      return { success: true, data: true };
    } catch (error) {
      console.error('Error adding recently viewed flight:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getRecentlyViewedFlights(email: string): Promise<ServiceResult<FlightDoc[]>> {
    try {
      const user = (await User.findOne({ email })) as UserDocument | null;
      if (!user) {
        return { success: true, data: [] };
      }

      const flightIds = user.recentlyViewedFlights
        .filter((item: RecentlyViewedFlight) => item.flightId && Types.ObjectId.isValid(item.flightId))
        .map((item: RecentlyViewedFlight) => item.flightId!); // Non-null assertion since we filtered

      const flights = await Flight.find({ _id: { $in: flightIds } });

      // Sort flights based on the order in recentlyViewedFlights
      const sortedFlights = flights.sort((a, b) => {
        const aIndex = user.recentlyViewedFlights.findIndex(
          (item: RecentlyViewedFlight) =>
            item.flightId && item.flightId.toString() === a._id.toString()
        );
        const bIndex = user.recentlyViewedFlights.findIndex(
          (item: RecentlyViewedFlight) =>
            item.flightId && item.flightId.toString() === b._id.toString()
        );
        return aIndex - bIndex;
      });

      return { success: true, data: sortedFlights as FlightDoc[] };
    } catch (error) {
      console.error('Error getting recently viewed flights:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async addSearchHistory(email: string, from: string, to: string, date: string): Promise<ServiceResult<boolean>> {
    try {
      let user = (await User.findOne({ email })) as UserDocument | null;
      if (!user) {
        user = new User({ email, name: 'Guest User' }) as unknown as UserDocument;
      }

      user.searchHistory.unshift({
        from,
        to,
        date,
        timestamp: new Date(),
      });

      // Limit to 20 entries
      if (user.searchHistory.length > 20) {
        user.searchHistory = user.searchHistory.slice(0, 20) as Types.DocumentArray<SearchHistoryEntry>;
      }

      await user.save();
      return { success: true, data: true };
    } catch (error) {
      console.error('Error adding search history:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getSimilarDestinations(to: string): Promise<ServiceResult<string[]>> {
    try {
      const destinationClusters: Record<string, string[]> = {
        metropolitan: ['Mumbai', 'Delhi', 'Kolkata'],
        'tech-hub': ['Bangalore', 'Hyderabad'],
        coastal: ['Mumbai', 'Chennai'],
        cultural: ['Delhi', 'Kolkata'],
      };

      let targetCluster: string | null = null;
      for (const [cluster, cities] of Object.entries(destinationClusters)) {
        if (cities.includes(to)) {
          targetCluster = cluster;
          break;
        }
      }

      const similarDestinations = targetCluster
        ? destinationClusters[targetCluster].filter(city => city !== to)
        : ['Mumbai', 'Delhi', 'Bangalore'].filter(city => city !== to);

      return { success: true, data: similarDestinations };
    } catch (error) {
      console.error('Error getting similar destinations:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateLoyaltyPoints(email: string, bookingAmount: number): Promise<ServiceResult<LoyaltyUpdateResult>> {
    try {
      // Validate bookingAmount
      if (bookingAmount < 0) {
        return { success: false, error: 'Booking amount cannot be negative' };
      }

      let user = (await User.findOne({ email })) as UserDocument | null;
      if (!user) {
        user = new User({ email, name: 'Guest User' }) as unknown as UserDocument;
      }

      const pointsToAdd = Math.floor(bookingAmount / 100);
      user.loyaltyPoints += pointsToAdd;

      if (user.loyaltyPoints >= 5000) {
        user.loyaltyTier = 'platinum';
      } else if (user.loyaltyPoints >= 3000) {
        user.loyaltyTier = 'gold';
      } else if (user.loyaltyPoints >= 1000) {
        user.loyaltyTier = 'silver';
      }

      await user.save();
      return {
        success: true,
        data: {
          pointsAdded: pointsToAdd,
          totalPoints: user.loyaltyPoints,
          tier: user.loyaltyTier,
        },
      };
    } catch (error) {
      console.error('Error updating loyalty points:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static getLoyaltyBenefits(tier: string): ServiceResult<{
    discountPercentage: number;
    priorityBoarding: boolean;
    extraBaggage: boolean;
    loungeAccess: boolean;
  }> {
    try {
      const benefits = {
        standard: {
          discountPercentage: 0,
          priorityBoarding: false,
          extraBaggage: false,
          loungeAccess: false,
        },
        silver: {
          discountPercentage: 5,
          priorityBoarding: true,
          extraBaggage: false,
          loungeAccess: false,
        },
        gold: {
          discountPercentage: 10,
          priorityBoarding: true,
          extraBaggage: true,
          loungeAccess: false,
        },
        platinum: {
          discountPercentage: 15,
          priorityBoarding: true,
          extraBaggage: true,
          loungeAccess: true,
        },
      };

      const result = benefits[tier as keyof typeof benefits] || benefits.standard;
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting loyalty benefits:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async createPriceAlert(
    email: string,
    from: string,
    to: string,
    maxPrice: number,
    startDate: string,
    endDate: string
  ): Promise<ServiceResult<boolean>> {
    try {
      // Validate inputs
      if (maxPrice < 0) {
        return { success: false, error: 'Max price cannot be negative' };
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { success: false, error: 'Invalid date format' };
      }
      if (start > end) {
        return { success: false, error: 'Start date must be before end date' };
      }

      let user = (await User.findOne({ email })) as UserDocument | null;
      if (!user) {
        user = new User({ email, name: 'Guest User' }) as unknown as UserDocument;
      }

      user.priceAlerts.push({
        from,
        to,
        maxPrice,
        dateRange: {
          start,
          end,
        },
        isActive: true,
      });

      await user.save();
      return { success: true, data: true };
    } catch (error) {
      console.error('Error creating price alert:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export default UserBehaviorService;