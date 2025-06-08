import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true,
  },
  passengerDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  passengers: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  bookingDate: { 
    type: Date, 
    default: Date.now 
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending', 'completed'],
    default: 'confirmed',
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  ticketNumber: { 
    type: String, 
    unique: true 
  },
}, { timestamps: true });

// Generate ticket number before saving
bookingSchema.pre('save', async function (next) {
  if (!this.ticketNumber) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.ticketNumber = `TRV-${Date.now().toString().slice(-6)}-${randomNum}`;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;