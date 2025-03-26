// models/User.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  
  // Loyalty program
  loyaltyPoints: { type: Number, default: 0 },
  loyaltyTier: { 
    type: String, 
    enum: ['standard', 'silver', 'gold', 'platinum'], 
    default: 'standard' 
  },
  
  // Behavior tracking
  searchHistory: [{
    from: String,
    to: String,
    date: String,
    timestamp: { type: Date, default: Date.now }
  }],
  recentlyViewedFlights: [{
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
    viewedAt: { type: Date, default: Date.now }
  }],
  
  // Price alerts
  priceAlerts: [{
    from: String,
    to: String,
    maxPrice: Number,
    dateRange: {
      start: Date,
      end: Date
    },
    isActive: { type: Boolean, default: true }
  }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);