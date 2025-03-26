// routes/alertRoutes.ts
import express, { Request, Response } from 'express';
import User from '../models/User';

const router = express.Router();

// Define interface for PriceAlert (assuming this matches your User schema)
interface PriceAlert {
  _id: import('mongoose').Types.ObjectId; // Mongoose adds _id to embedded documents
  from: string;
  to: string;
  maxPrice: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  isActive: boolean;
}

// Get all price alerts for a user
router.get('/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ priceAlerts: user.priceAlerts || [] });
  } catch (error) {
    console.error('Error fetching price alerts:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete price alert
router.delete('/:email/:alertId', async (req: Request, res: Response) => {
  try {
    const { email, alertId } = req.params;

    if (!email || !alertId) {
      return res.status(400).json({ error: 'Email and alertId are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove the alert with the matching ID
    user.priceAlerts = (user.priceAlerts as PriceAlert[]).filter(
      alert => alert._id.toString() !== alertId
    );

    await user.save();

    return res.status(200).json({ message: 'Price alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting price alert:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;