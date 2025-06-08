import express, { Request, Response } from 'express';
import Booking from '../models/booking';

const router = express.Router();

// Create a new booking
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { destination, name, email, phone, address, passengers, totalAmount } = req.body;
    
    const booking = new Booking({
      destination,
      passengerDetails: {
        name,
        email,
        phone,
        address
      },
      passengers,
      totalAmount,
      paymentStatus: 'pending',
      bookingStatus: 'confirmed'
    });

    await booking.save();
    
    res.status(201).json({
      success: true,
      bookingId: booking.ticketNumber,
      booking
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'An unknown error occurred' 
      });
    }
  }
});

// Get all bookings
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// Get booking by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findOne({ ticketNumber: req.params.id });
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

// Update booking status
router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentStatus, bookingStatus } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { ticketNumber: req.params.id },
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