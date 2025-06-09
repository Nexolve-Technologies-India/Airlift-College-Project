import 'reflect-metadata';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import flightRoutes from './routes/flightRoutes';
import bookingRoutes from './routes/bookingRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import userRoutes from './routes/userRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import alertRoutes from './routes/alertRoutes';
import behaviorRoutes from './routes/behaviorRoutes';

// Import NLP services
import NLPService from './services/nlpService';
import IntentClassifier from './utils/intentClassifier';
import nlpConfig from './config/nlpConfig';

dotenv.config();

const app = express();

// Initialize NLP services
const initializeNLPServices = () => {
  try {
    NLPService.getInstance();
    IntentClassifier.getInstance();
    console.log('NLP services initialized successfully');
  } catch (error) {
    console.error('Error initializing NLP services:', error);
  }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Custom middleware for chatbot route logging
app.use('/api/chatbot', (_req, _res, next) => {
  console.log(`Chatbot Request - ${new Date().toISOString()}`);
  next();
});

// Error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Routes
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/users', userRoutes);  // This now handles all user-related routes including loyalty
app.use('/api/feedback', feedbackRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/behavior', behaviorRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    nlpStatus: 'initialized',
    supportedCities: nlpConfig.cities,
    flightTimings: nlpConfig.flightPatterns.departureTimes
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FlightDB')
  .then(() => {
    console.log('Connected to MongoDB');
    initializeNLPServices();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Supported Cities:', nlpConfig.cities);
  console.log('Flight Timings:', nlpConfig.flightPatterns.departureTimes);
});

export default app;