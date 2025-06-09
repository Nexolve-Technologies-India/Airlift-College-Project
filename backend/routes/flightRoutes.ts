import express, { Request, Response } from 'express';
import Flight from '../models/flight';

const router = express.Router();

// Search flights
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to, date } = req.query;
    if (!from || !to || !date) {
      res.status(400).json({ error: 'Missing required query parameters: from, to, date' });
      return;
    }

    const fromStr = String(from).trim().toUpperCase();
    const toStr = String(to).trim().toUpperCase();
    const dateStr = String(date).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      res.status(400).json({ error: 'Invalid date format, use YYYY-MM-DD' });
      return;
    }

    const flights = await Flight.find({
      from: new RegExp(`^${fromStr}$`, 'i'),
      to: new RegExp(`^${toStr}$`, 'i'),
      date: dateStr,
    });

    if (flights.length === 0) {
      res.status(404).json({ message: 'No flights found for the given search criteria.' });
      return;
    }

    res.status(200).json({ flights });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

// Get all flights (with pagination)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 10;
    const skip = (page - 1) * limit;

    const flights = await Flight.find({}).skip(skip).limit(limit);
    const total = await Flight.countDocuments({});

    res.status(200).json({ flights, total, page, limit });
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
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ error: 'Invalid flight ID format' });
      return;
    }

    const flight = await Flight.findById(id);
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