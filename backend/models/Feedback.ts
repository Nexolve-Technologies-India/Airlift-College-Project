// models/Feedback.ts
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  email: { type: String, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: String,
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  },
  feedbackType: {
    type: String,
    enum: ['booking', 'flight', 'website', 'chatbot'],
    default: 'booking'
  }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);