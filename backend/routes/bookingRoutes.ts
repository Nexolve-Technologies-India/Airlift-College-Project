import express, { Request, Response } from 'express';
import Booking from '../models/booking';

const router = express.Router();

// Create a new booking
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// Update booking status
router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentStatus, bookingStatus } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, bookingStatus },
      { new: true }
    );
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.status(200).json(booking);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

export default router;