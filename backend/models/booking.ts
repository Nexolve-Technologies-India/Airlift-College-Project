import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  flightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true,
  },
  passengerDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  bookingDate: { type: Date, default: Date.now },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'pending',
  },
  totalAmount: { type: Number, required: true },
  ticketNumber: { type: String, unique: true },
  seatNumber: { type: String, required: true },
}, { timestamps: true });

// Generate ticket number before saving
bookingSchema.pre('save', async function (next) {
  if (!this.ticketNumber) {
    this.ticketNumber = 'TK' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

export default mongoose.model('Booking', bookingSchema);