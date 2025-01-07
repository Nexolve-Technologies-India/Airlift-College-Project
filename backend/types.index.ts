import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import flightRoutes from './routes/flightRoutes';
import bookingRoutes from './routes/bookingRoutes';
import chatbotRoutes from './routes/chatbotRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FlightDB')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    if (error instanceof Error) {
      console.error('MongoDB connection error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;