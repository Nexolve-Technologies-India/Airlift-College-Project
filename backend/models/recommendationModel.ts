import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  flightId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Flight', 
    required: true 
  },
  score: { 
    type: Number, 
    required: true 
  }, // Prediction score from 0-1
  recommendationType: {
    type: String,
    enum: ['collaborative', 'content', 'hybrid', 'popular'],
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: { expires: '30d' } // Recommendations expire after 30 days
  }
});

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
export default Recommendation;