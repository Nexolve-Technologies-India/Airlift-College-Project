// File: chatSessionSchema.ts
import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  context: {
    step: {
      type: String,
      enum: [
        'initial',
        'departure',
        'destination',
        'date',
        'searching',
        'selecting_flight',
        'passenger_details',
        'passenger_email',
        'passenger_phone',
        'passenger_address',
        'payment',
        'completed'
      ],
      default: 'initial',
    },
    from: String,
    to: String,
    date: String,
    flights: [{
      airline: String,
      flightNumber: String,
      from: String,
      to: String,
      departureTime: String,
      arrivalTime: String,
      duration: String,
      price: Number,
      seatsAvailable: Number,
      status: String
    }],
    selectedFlight: {
      airline: String,
      flightNumber: String,
      from: String,
      to: String,
      departureTime: String,
      arrivalTime: String,
      duration: String,
      price: Number,
      seatsAvailable: Number,
      status: String
    },
    passengerDetails: {
      name: String,
      email: String,
      phone: String,
      address: String,
    },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'completed', 'failed'], 
      default: 'pending' 
    },
  },
  messages: [{
    content: String,
    sender: { type: String, enum: ['user', 'bot'] },
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export default mongoose.model('ChatSession', chatSessionSchema);