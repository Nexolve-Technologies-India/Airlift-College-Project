// services/PriceAlertService.ts
import User from '../models/User';
import Flight from '../models/flight'; // Adjust if your filename casing differs

interface DateRange {
  start: Date;
  end: Date;
}

interface PriceAlert {
  alertName: string;
  thresholdPrice: number;
  active: boolean;
  createdAt: Date;
  from?: string;
  to?: string;
  dateRange?: DateRange;
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
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          name: 'Guest User',
          loyaltyPoints: 0,
          loyaltyTier: 'standard',
          priceAlerts: [],
        });
      }

      user.priceAlerts.push({
        alertName: `${from} to ${to} under ${maxPrice}`,
        thresholdPrice: maxPrice,
        active: true,
        createdAt: new Date(),
        from,
        to,
        dateRange: {
          start: new Date(startDate),
          end: new Date(endDate),
        },
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

      if (!user) return [];

      // Cast is temporary until User schema is properly typed
      return user.priceAlerts as unknown as PriceAlert[];
    } catch (error) {
      console.error('Error getting price alerts:', error);
      return [];
    }
  }

  static async checkPriceDrops(): Promise<Notification[]> {
    try {
      const users = await User.find({ 'priceAlerts.active': true });

      const notifications: Notification[] = [];

      for (const user of users) {
        for (const alert of user.priceAlerts as unknown as PriceAlert[]) {
          if (!alert.active) continue;

          // Defensive check for dateRange
          if (!alert.dateRange?.start || !alert.dateRange?.end) continue;

          const flights = await Flight.find({
            from: alert.from,
            to: alert.to,
            price: { $lte: alert.thresholdPrice },
            date: {
              $gte: alert.dateRange.start,
              $lte: alert.dateRange.end,
            },
          }).limit(5);

          if (flights.length > 0) {
            notifications.push({
              email: user.email,
              alert,
              flights: flights as FlightDoc[],
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
