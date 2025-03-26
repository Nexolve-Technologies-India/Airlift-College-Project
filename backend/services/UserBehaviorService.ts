// services/UserBehaviorService.ts
import { Types } from 'mongoose';
import User from '../models/User';
import Flight from '../models/flight';

// Define Flight interface based on flightSchema
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
  status: 'scheduled' | 'delayed' | 'cancelled';
}

class UserBehaviorService {
  static async addRecentlyViewedFlight(email: string, flightId: string): Promise<boolean> {
    try {
      // Find the user by email
      let user = await User.findOne({ email });

      // If user doesn't exist, create one
      if (!user) {
        user = new User({ email, name: 'Guest User' });
      }

      // Convert string flightId to ObjectId
      const flightObjectId = new Types.ObjectId(flightId);

      // Add flight to recently viewed
      user.recentlyViewedFlights.unshift({
        flightId: flightObjectId,
        viewedAt: new Date(),
      });

      // Keep only last 10 viewed flights
      if (user.recentlyViewedFlights.length > 10) {
        user.recentlyViewedFlights = user.recentlyViewedFlights.slice(0, 10);
      }

      await user.save();
      return true;
    } catch (error) {
      console.error('Error adding recently viewed flight:', error);
      return false;
    }
  }

  static async getRecentlyViewedFlights(email: string): Promise<FlightDoc[]> {
    try {
      const user = await User.findOne({ email });
      if (!user) return [];

      // Get flight details for each viewed flight
      const flightIds = user.recentlyViewedFlights
        .filter(item => item.flightId !== undefined) // Filter out undefined flightIds
        .map(item => item.flightId!); // Non-null assertion after filter
      const flights = await Flight.find({ _id: { $in: flightIds } });

      // Sort flights based on view order
      return flights.sort((a, b) => {
        const aIndex = user.recentlyViewedFlights.findIndex(
          item => item.flightId && item.flightId.toString() === a._id.toString()
        );
        const bIndex = user.recentlyViewedFlights.findIndex(
          item => item.flightId && item.flightId.toString() === b._id.toString()
        );
        return aIndex - bIndex;
      }) as FlightDoc[];
    } catch (error) {
      console.error('Error getting recently viewed flights:', error);
      return [];
    }
  }

  static async addSearchHistory(email: string, from: string, to: string, date: string): Promise<boolean> {
    try {
      // Find the user by email
      let user = await User.findOne({ email });

      // If user doesn't exist, create one
      if (!user) {
        user = new User({ email, name: 'Guest User' });
      }

      // Add search to history
      user.searchHistory.unshift({
        from,
        to,
        date,
        timestamp: new Date(),
      });

      // Keep only last 20 searches
      if (user.searchHistory.length > 20) {
        user.searchHistory = user.searchHistory.slice(0, 20);
      }

      await user.save();
      return true;
    } catch (error) {
      console.error('Error adding search history:', error);
      return false;
    }
  }

  static async getSimilarDestinations(to: string): Promise<string[]> {
    // Define destination clusters (simplified)
    const destinationClusters: Record<string, string[]> = {
      'metropolitan': ['Mumbai', 'Delhi', 'Kolkata'],
      'tech-hub': ['Bangalore', 'Hyderabad'],
      'coastal': ['Mumbai', 'Chennai'],
      'cultural': ['Delhi', 'Kolkata'],
    };

    // Find which cluster the destination belongs to
    let targetCluster = null;
    for (const [cluster, cities] of Object.entries(destinationClusters)) {
      if (cities.includes(to)) {
        targetCluster = cluster;
        break;
      }
    }

    // If found, return other cities in the same cluster
    if (targetCluster) {
      return destinationClusters[targetCluster].filter(city => city !== to);
    }

    // Fallback to random cities
    return ['Mumbai', 'Delhi', 'Bangalore'].filter(city => city !== to);
  }

  static async updateLoyaltyPoints(email: string, bookingAmount: number): Promise<{
    pointsAdded: number;
    totalPoints: number;
    tier: string;
  } | null> {
    try {
      // Find the user by email
      let user = await User.findOne({ email });

      // If user doesn't exist, create one
      if (!user) {
        user = new User({ email, name: 'Guest User' });
      }

      // Calculate points (10 points per ₹1000)
      const pointsToAdd = Math.floor(bookingAmount / 100);
      user.loyaltyPoints += pointsToAdd;

      // Update loyalty tier based on total points
      if (user.loyaltyPoints >= 5000) {
        user.loyaltyTier = 'platinum';
      } else if (user.loyaltyPoints >= 3000) {
        user.loyaltyTier = 'gold';
      } else if (user.loyaltyPoints >= 1000) {
        user.loyaltyTier = 'silver';
      }

      await user.save();
      return {
        pointsAdded: pointsToAdd,
        totalPoints: user.loyaltyPoints,
        tier: user.loyaltyTier,
      };
    } catch (error) {
      console.error('Error updating loyalty points:', error);
      return null;
    }
  }

  static getLoyaltyBenefits(tier: string) {
    const benefits = {
      'standard': {
        discountPercentage: 0,
        priorityBoarding: false,
        extraBaggage: false,
        loungeAccess: false,
      },
      'silver': {
        discountPercentage: 5,
        priorityBoarding: true,
        extraBaggage: false,
        loungeAccess: false,
      },
      'gold': {
        discountPercentage: 10,
        priorityBoarding: true,
        extraBaggage: true,
        loungeAccess: false,
      },
      'platinum': {
        discountPercentage: 15,
        priorityBoarding: true,
        extraBaggage: true,
        loungeAccess: true,
      },
    };

    return benefits[tier as keyof typeof benefits] || benefits.standard;
  }

  static async createPriceAlert(
    email: string,
    from: string,
    to: string,
    maxPrice: number,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    try {
      // Find the user by email
      let user = await User.findOne({ email });

      // If user doesn't exist, create one
      if (!user) {
        user = new User({ email, name: 'Guest User' });
      }

      // Add price alert
      user.priceAlerts.push({
        from,
        to,
        maxPrice,
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate),
        },
        isActive: true,
      });

      await user.save();
      return true;
    } catch (error) {
      console.error('Error creating price alert:', error);
      return false;
    }
  }
}

export default UserBehaviorService;