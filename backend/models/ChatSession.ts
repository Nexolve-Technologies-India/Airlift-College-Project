import mongoose from 'mongoose';

// Define types for TypeScript
export interface IMessage {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface IFlightDetails {
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsAvailable: number;
  status: string;
}

export interface IPassengerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface IChatContext {
  // NLP related fields
  intent?: string;
  entities?: {
    location?: string[];
    date?: string[];
    airline?: string[];
    price?: number[];
    [key: string]: any;
  };
  confidence?: number;
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };

  // Booking flow fields
  step: 'initial' | 'departure' | 'destination' | 'date' | 'searching' | 
        'selecting_flight' | 'passenger_details' | 'passenger_email' | 
        'passenger_phone' | 'passenger_address' | 'payment' | 'completed';
  from?: string;
  to?: string;
  date?: string;
  flights?: IFlightDetails[];
  selectedFlight?: IFlightDetails;
  passengerDetails?: IPassengerDetails;
  paymentStatus: 'pending' | 'completed' | 'failed';
}

export interface IChatSession {
  userId?: mongoose.Types.ObjectId;
  status: 'active' | 'completed';
  context: IChatContext;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const chatSessionSchema = new mongoose.Schema<IChatSession>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false
  },
  
  status: { 
    type: String, 
    enum: ['active', 'completed'], 
    default: 'active' 
  },
  
  context: {
    // NLP related fields
    intent: { 
      type: String,
      required: false 
    },
    entities: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: false
    },
    confidence: {
      type: Number,
      required: false
    },
    sentiment: {
      score: Number,
      label: {
        type: String,
        enum: ['positive', 'negative', 'neutral']
      }
    },

    // Booking flow fields
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
    content: {
      type: String,
      required: true
    },
    sender: { 
      type: String, 
      enum: ['user', 'bot'],
      required: true
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
  }]
}, 
{
  timestamps: true
});

// Add any indexes if needed
chatSessionSchema.index({ userId: 1 });
chatSessionSchema.index({ 'context.step': 1 });
chatSessionSchema.index({ status: 1 });
chatSessionSchema.index({ createdAt: 1 });

// Add any instance methods if needed
chatSessionSchema.methods.isActive = function(): boolean {
  return this.status === 'active';
};

// Add any static methods if needed
chatSessionSchema.statics.findActiveSession = function(userId: string) {
  return this.findOne({ userId, status: 'active' });
};

// Create and export the model
const ChatSession = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);
export default ChatSession;