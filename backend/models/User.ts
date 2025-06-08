import mongoose, { Document, Schema, Model } from 'mongoose';

// DateRange interface for price alert date ranges
interface DateRange {
  start: Date;
  end: Date;
}

// PriceAlert interface
interface PriceAlert {
  alertName: string;
  thresholdPrice: number;  // consistent naming
  active: boolean;
  createdAt: Date;

  from: string;
  to: string;
  dateRange: DateRange;
}

// Search history subdocument interface
interface SearchHistoryItem {
  timestamp: Date;
  date?: string;
  from?: string;
  to?: string;
}

// Preferences subdocument interface
interface Preferences {
  prefersWindowSeat: boolean;
  prefersAisleSeat: boolean;
  prefersDirectFlights: boolean;
  preferredAirlines: string[];
  budgetRange: {
    min: number;
    max: number;
  };
}

// Main user interface extending mongoose Document
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  searchHistory: SearchHistoryItem[];
  preferences: Preferences;
  loyaltyPoints: number;
  loyaltyTier: 'standard' | 'silver' | 'gold' | 'platinum';
  priceAlerts: PriceAlert[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for DateRange subdocument
const DateRangeSchema = new Schema<DateRange>(
  {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  { _id: false }
);

// Schema for PriceAlert subdocument
const PriceAlertSchema = new Schema<PriceAlert>(
  {
    alertName: { type: String, required: true },
    thresholdPrice: { type: Number, required: true },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },

    from: { type: String, required: true },
    to: { type: String, required: true },
    dateRange: { type: DateRangeSchema, required: true },
  },
  { _id: false }
);

// Schema for SearchHistoryItem subdocument
const SearchHistoryItemSchema = new Schema<SearchHistoryItem>(
  {
    timestamp: { type: Date, default: Date.now },
    date: { type: String },
    from: { type: String },
    to: { type: String },
  },
  { _id: false }
);

// Schema for Preferences subdocument
const PreferencesSchema = new Schema<Preferences>(
  {
    prefersWindowSeat: { type: Boolean, default: false },
    prefersAisleSeat: { type: Boolean, default: false },
    prefersDirectFlights: { type: Boolean, default: true },
    preferredAirlines: [{ type: String }],
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 10000 },
    },
  },
  { _id: false }
);

// User schema
const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    searchHistory: [SearchHistoryItemSchema],
    preferences: PreferencesSchema,
    loyaltyPoints: { type: Number, default: 0 },
    loyaltyTier: {
      type: String,
      enum: ['standard', 'silver', 'gold', 'platinum'],
      default: 'standard',
    },
    priceAlerts: [PriceAlertSchema],
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
