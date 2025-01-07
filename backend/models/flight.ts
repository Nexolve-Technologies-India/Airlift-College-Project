import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
  airline: { type: String, required: true },
  flightNumber: { type: String, required: true, unique: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true },
  seatsAvailable: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'delayed', 'cancelled'],
    default: 'scheduled',
  },
});

// Index for flight search
flightSchema.index({ from: 1, to: 1, date: 1 });

export default mongoose.model('Flight', flightSchema);