import { Router, Request, Response } from 'express';
import User from '../models/User';

const router = Router();

// Get user data
router.get('/:email', (req: Request<{ email: string }>, res: Response): void => {
  const { email } = req.params;

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  User.findOne({ email })
    .then(user => {
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ 
        preferences: user.preferences,
        searchHistory: user.searchHistory || []
      });
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Update user preferences
router.put('/:email/preferences', (
  req: Request<{ email: string }, unknown, { preferences: unknown }>,
  res: Response
): void => {
  const { email } = req.params;
  const { preferences } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  User.findOneAndUpdate(
    { email },
    { $set: { preferences } },
    { new: true }
  )
    .then(user => {
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ 
        message: 'Preferences updated successfully',
        preferences: user.preferences
      });
    })
    .catch(error => {
      console.error('Error updating preferences:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

export default router;