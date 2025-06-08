import express, { Request, Response } from 'express';
import User from '../models/User';

const router = express.Router();

// Interface to match your existing searchHistory schema
interface SearchEntry {
  timestamp: Date;
  date?: string;
  from?: string;
  to?: string;
}

// Get user behavior statistics
router.get('/stats/:email', async (req: Request<{ email: string }>, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Type assertion for searchHistory
    const searchHistory = user.searchHistory as unknown as SearchEntry[];

    // Get most frequent destinations
    const destinations = searchHistory
      .filter(search => search.to)
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
    const dayOfWeekCounts = searchHistory
      .map(search => new Date(search.timestamp).getDay())
      .reduce((acc: Record<string, number>, day) => {
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
        acc[dayName] = (acc[dayName] || 0) + 1;
        return acc;
      }, {});

    return res.status(200).json({
      searchCount: searchHistory.length,
      topDestinations,
      dayOfWeekCounts,
    });
  } catch (error) {
    console.error('Error fetching behavior stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear user search history
router.delete('/clear/:email', async (req: Request<{ email: string }>, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clear search history
    user.searchHistory = [];
    await user.save();

    return res.status(200).json({ message: 'Search history cleared successfully' });
  } catch (error) {
    console.error('Error clearing search history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;