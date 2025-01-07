import express, { Request, Response } from 'express';
import Flight from '../models/flight';

const router = express.Router();

// Search flights
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to, date } = req.query;

    // Validate query parameters
    if (!from || !to || !date) {
      res.status(400).json({ error: 'Missing required query parameters: from, to, date' });
      return;
    }

    // Search for flights in the database
    const flights = await Flight.find({ from, to, date });

    if (flights.length === 0) {
      res.status(404).json({ message: 'No flights found for the given search criteria.' });
      return;
    }

    res.status(200).json(flights);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// Get all flights (for debugging or frontend display)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const flights = await Flight.find({});
    res.status(200).json(flights);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// Get flight details by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      res.status(404).json({ message: 'Flight not found' });
      return;
    }

    res.status(200).json(flight);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

export default router;