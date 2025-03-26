// services/LoyaltyService.ts
import User from '../models/User';

class LoyaltyService {
  static getTierBenefits(tier: string) {
    const benefits = {
      'standard': {
        discountPercentage: 0,
        priorityBoarding: false,
        extraBaggage: false,
        loungeAccess: false
      },
      'silver': {
        discountPercentage: 5,
        priorityBoarding: true,
        extraBaggage: false,
        loungeAccess: false
      },
      'gold': {
        discountPercentage: 10,
        priorityBoarding: true,
        extraBaggage: true,
        loungeAccess: false
      },
      'platinum': {
        discountPercentage: 15,
        priorityBoarding: true,
        extraBaggage: true,
        loungeAccess: true
      }
    };
    
    return benefits[tier as keyof typeof benefits] || benefits.standard;
  }
  
  static async updatePoints(email: string, bookingAmount: number) {
    try {
      // Calculate points (10 points per ₹1000)
      const pointsToAdd = Math.floor(bookingAmount / 100);
      
      // Find user and update points
      const user = await User.findOne({ email });
      
      if (!user) {
        // Create new user if doesn't exist
        const newUser = new User({
          email,
          name: 'Guest User',
          loyaltyPoints: pointsToAdd,
          loyaltyTier: pointsToAdd >= 5000 ? 'platinum' : 
                       pointsToAdd >= 3000 ? 'gold' : 
                       pointsToAdd >= 1000 ? 'silver' : 'standard'
        });
        
        await newUser.save();
        return {
          pointsAdded: pointsToAdd,
          totalPoints: pointsToAdd,
          tier: newUser.loyaltyTier
        };
      }
      
      // Update existing user
      user.loyaltyPoints += pointsToAdd;
      
      // Update tier based on total points
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
        tier: user.loyaltyTier
      };
    } catch (error) {
      console.error('Error updating loyalty points:', error);
      throw error;
    }
  }
  
  static async getPointsHistory(email: string): Promise<{ date: Date; points: number; reason: string }[]> {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        return [];
      }

      // In a real implementation, you might have a separate PointsHistory model
      // For this example, we'll return mock data tied to the user's email
      const mockHistory = [
        { 
          date: new Date(), 
          points: 500, 
          reason: `Flight booking by ${email}` 
        },
        { 
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
          points: 300, 
          reason: `Flight booking by ${email}` 
        }
      ];
      
      return mockHistory;
    } catch (error) {
      console.error('Error fetching points history:', error);
      throw error;
    }
  }
}

export default LoyaltyService;