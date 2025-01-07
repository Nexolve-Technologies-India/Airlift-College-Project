import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  context: {
    intent: String,
    from: String,
    to: String,
    date: Date,
    selectedFlight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
    step: {
      type: String,
      enum: ['initial', 'searching', 'selecting_flight', 'passenger_details', 'payment'],
      default: 'initial',
    },
  },
  messages: [{
    content: String,
    sender: { type: String, enum: ['user', 'bot'] },
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export default mongoose.model('ChatSession', chatSessionSchema);