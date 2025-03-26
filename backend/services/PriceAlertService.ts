// services/PriceAlertService.ts
import User from '../models/User';
import Flight from '../models/flight'; // Corrected to lowercase 'flight'

// Define interfaces for TypeScript
interface DateRange {
  start: Date;
  end: Date;
}

interface PriceAlert {
  from: string;
  to: string;
  maxPrice: number;
  dateRange: DateRange;
  isActive: boolean;
}

// Define Flight interface based on flightSchema
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

interface Notification {
  email: string;
  alert: PriceAlert;
  flights: FlightDoc[];
}

class PriceAlertService {
  static async createAlert(
    email: string,
    from: string,
    to: string,
    maxPrice: number,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    try {
      // Find the user
      let user = await User.findOne({ email });

      // Create user if doesn't exist
      if (!user) {
        user = new User({
          email,
          name: 'Guest User',
          loyaltyPoints: 0,
          loyaltyTier: 'standard',
          priceAlerts: [], // Initialize priceAlerts array
        });
      }

      // Add the price alert
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

  static async getAlerts(email: string): Promise<PriceAlert[]> {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return [];
      }

      return user.priceAlerts as PriceAlert[]; // Type assertion based on usage
    } catch (error) {
      console.error('Error getting price alerts:', error);
      return [];
    }
  }

  static async checkPriceDrops(): Promise<Notification[]> {
    try {
      // Get all active price alerts
      const users = await User.find({ 'priceAlerts.isActive': true });

      const notifications: Notification[] = [];

      // Check each user's alerts
      for (const user of users) {
        for (const alert of user.priceAlerts as PriceAlert[]) { // Type assertion
          if (!alert.isActive) continue;

          // Find flights that match the alert criteria
          const flights = await Flight.find({
            from: alert.from,
            to: alert.to,
            price: { $lte: alert.maxPrice },
            date: {
              $gte: alert.dateRange.start,
              $lte: alert.dateRange.end,
            },
          }).limit(5);

          // If matching flights found, create notification
          if (flights.length > 0) {
            notifications.push({
              email: user.email,
              alert,
              flights: flights as FlightDoc[], // Type assertion based on Flight model
            });
          }
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error checking price drops:', error);
      return [];
    }
  }
}

export default PriceAlertService;