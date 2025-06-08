import express, { Request, Response } from 'express';
import RecommendationService from '../services/RecommendationService';

const router = express.Router();

// Get neural recommendations
router.get('/neural/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const recommendations = await RecommendationService.getNeuralRecommendations(email);
    return res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error fetching neural recommendations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

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
    console.error('Error fetching personalized recommendations:', error);
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
    console.error('Error fetching predicted travel needs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get generic recommendations
router.get('/generic', async (req: Request, res: Response) => {
  try {
    const recommendations = await RecommendationService.getGenericRecommendations();
    return res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error fetching generic recommendations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;