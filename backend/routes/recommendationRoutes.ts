// routes/recommendationRoutes.ts
import express, { Request, Response } from 'express';
import RecommendationService from '../services/RecommendationService';

const router = express.Router();

// Get personalized recommendations
router.get('/personalized/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const recommendations = await RecommendationService.getPersonalizedRecommendations(email);
    return res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get predicted travel needs
router.get('/predicted/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const prediction = await RecommendationService.getPredictedTravelNeeds(email);

    if (prediction) {
      return res.status(200).json(prediction);
    } else {
      return res.status(404).json({ message: 'No predictions available' });
    }
  } catch (error) {
    console.error('Error fetching predicted travel needs:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;