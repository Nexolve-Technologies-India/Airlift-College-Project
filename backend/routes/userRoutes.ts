// routes/userRoutes.ts
import express, { Request, Response } from 'express';
import UserBehaviorService from '../services/UserBehaviorService';
import User from '../models/User';

const router = express.Router();

// Track flight view
router.post('/track-view', async (req: Request, res: Response) => {
  try {
    const { email, flightId } = req.body;

    if (!email || !flightId) {
      return res.status(400).json({ error: 'Email and flightId are required' });
    }

    const success = await UserBehaviorService.addRecentlyViewedFlight(email, flightId);

    if (success) {
      return res.status(200).json({ message: 'Flight view tracked successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to track flight view' });
    }
  } catch (error) {
    console.error('Error tracking flight view:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recently viewed flights
router.get('/recently-viewed/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const flights = await UserBehaviorService.getRecentlyViewedFlights(email);
    return res.status(200).json({ flights });
  } catch (error) {
    console.error('Error fetching recently viewed flights:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Track search
router.post('/track-search', async (req: Request, res: Response) => {
  try {
    const { email, from, to, date } = req.body;

    if (!email || !from || !to || !date) {
      return res.status(400).json({ error: 'Email, from, to, and date are required' });
    }

    const success = await UserBehaviorService.addSearchHistory(email, from, to, date);

    if (success) {
      return res.status(200).json({ message: 'Search tracked successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to track search' });
    }
  } catch (error) {
    console.error('Error tracking search:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get similar destinations
router.get('/similar-destinations/:destination', async (req: Request, res: Response) => {
  try {
    const { destination } = req.params;

    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    const similarDestinations = await UserBehaviorService.getSimilarDestinations(destination);
    return res.status(200).json({ similarDestinations });
  } catch (error) {
    console.error('Error fetching similar destinations:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get loyalty info
router.get('/loyalty/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const benefits = UserBehaviorService.getLoyaltyBenefits(user.loyaltyTier);

    return res.status(200).json({
      loyaltyPoints: user.loyaltyPoints,
      loyaltyTier: user.loyaltyTier,
      benefits,
    });
  } catch (error) {
    console.error('Error fetching loyalty info:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update loyalty points
router.post('/loyalty/update', async (req: Request, res: Response) => {
  try {
    const { email, bookingAmount } = req.body;

    if (!email || !bookingAmount) {
      return res.status(400).json({ error: 'Email and bookingAmount are required' });
    }

    const result = await UserBehaviorService.updateLoyaltyPoints(email, bookingAmount);

    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json({ error: 'Failed to update loyalty points' });
    }
  } catch (error) {
    console.error('Error updating loyalty points:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create price alert
router.post('/price-alert', async (req: Request, res: Response) => {
  try {
    const { email, from, to, maxPrice, startDate, endDate } = req.body;

    if (!email || !from || !to || !maxPrice || !startDate || !endDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const success = await UserBehaviorService.createPriceAlert(email, from, to, maxPrice, startDate, endDate);

    if (success) {
      return res.status(200).json({ message: 'Price alert created successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to create price alert' });
    }
  } catch (error) {
    console.error('Error creating price alert:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get price alerts
router.get('/price-alerts/:email', async (req: Request, res: Response) => {
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

export default router;