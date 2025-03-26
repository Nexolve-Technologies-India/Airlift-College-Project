// routes/loyaltyRoutes.ts
import express, { Request, Response } from 'express';
import User from '../models/User';

const router = express.Router();

// Get loyalty tiers information
router.get('/tiers', (_req: Request, res: Response) => {
  const loyaltyTiers = {
    standard: {
      pointsRequired: 0,
      benefits: {
        discountPercentage: 0,
        priorityBoarding: false,
        extraBaggage: false,
        loungeAccess: false,
      },
    },
    silver: {
      pointsRequired: 1000,
      benefits: {
        discountPercentage: 5,
        priorityBoarding: true,
        extraBaggage: false,
        loungeAccess: false,
      },
    },
    gold: {
      pointsRequired: 3000,
      benefits: {
        discountPercentage: 10,
        priorityBoarding: true,
        extraBaggage: true,
        loungeAccess: false,
      },
    },
    platinum: {
      pointsRequired: 5000,
      benefits: {
        discountPercentage: 15,
        priorityBoarding: true,
        extraBaggage: true,
        loungeAccess: true,
      },
    },
  };

  return res.status(200).json(loyaltyTiers); // Added return for consistency
});

// Get points to next tier
router.get('/next-tier/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { loyaltyPoints, loyaltyTier } = user;

    let nextTier: string | null;
    let pointsRequired: number;

    if (loyaltyTier === 'standard') {
      nextTier = 'silver';
      pointsRequired = 1000 - loyaltyPoints;
    } else if (loyaltyTier === 'silver') {
      nextTier = 'gold';
      pointsRequired = 3000 - loyaltyPoints;
    } else if (loyaltyTier === 'gold') {
      nextTier = 'platinum';
      pointsRequired = 5000 - loyaltyPoints;
    } else {
      nextTier = null;
      pointsRequired = 0;
    }

    return res.status(200).json({
      currentTier: loyaltyTier,
      currentPoints: loyaltyPoints,
      nextTier,
      pointsRequired: Math.max(0, pointsRequired),
    });
  } catch (error) {
    console.error('Error fetching next tier info:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;