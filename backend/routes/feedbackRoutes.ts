// routes/feedbackRoutes.ts
import express, { Request, Response } from 'express';
import FeedbackService from '../services/FeedbackService';

const router = express.Router();

// Add feedback
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, rating, comment, feedbackType, bookingId, flightId } = req.body;

    if (!email || !rating || !feedbackType) {
      return res.status(400).json({ error: 'Email, rating, and feedbackType are required' });
    }

    const feedback = await FeedbackService.addFeedback(
      email,
      rating,
      comment || '',
      feedbackType,
      bookingId,
      flightId
    );

    if (feedback) {
      return res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } else {
      return res.status(500).json({ error: 'Failed to submit feedback' });
    }
  } catch (error) {
    console.error('Error submitting feedback:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get feedback stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await FeedbackService.getFeedbackStats();

    if (stats) {
      return res.status(200).json(stats);
    } else {
      return res.status(500).json({ error: 'Failed to get feedback stats' });
    }
  } catch (error) {
    console.error('Error fetching feedback stats:', error); // Use error to log it
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;