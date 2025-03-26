// routes/behaviorRoutes.ts
import express, { Request, Response } from 'express';
import User from '../models/User';

const router = express.Router();

// Define interface for SearchEntry (based on previous usage)
interface SearchEntry {
  timestamp: Date;
  date?: string;
  from?: string;
  to?: string;
}

// Get user behavior statistics
router.get('/stats/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get most frequent destinations, filtering out undefined 'to' values
    const destinations = (user.searchHistory as SearchEntry[])
      .filter(search => search.to !== undefined) // Ensure 'to' exists
      .map(search => search.to!)
      .reduce((acc: Record<string, number>, dest) => {
        acc[dest] = (acc[dest] || 0) + 1;
        return acc;
      }, {});

    const topDestinations = Object.entries(destinations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([dest]) => dest);

    // Get search frequency by day of week
    const dayOfWeekCounts = (user.searchHistory as SearchEntry[])
      .map(search => new Date(search.timestamp).getDay())
      .reduce((acc: Record<string, number>, day) => {
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
        acc[dayName] = (acc[dayName] || 0) + 1;
        return acc;
      }, {});

    return res.status(200).json({
      searchCount: user.searchHistory.length,
      recentlyViewedCount: user.recentlyViewedFlights.length,
      topDestinations,
      dayOfWeekCounts,
    });
  } catch (error) {
    console.error('Error fetching behavior stats:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear user behavior data
router.delete('/clear/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clear behavior data
    user.searchHistory = [];
    user.recentlyViewedFlights = [];

    await user.save();

    return res.status(200).json({ message: 'Behavior data cleared successfully' });
  } catch (error) {
    console.error('Error clearing behavior data:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;