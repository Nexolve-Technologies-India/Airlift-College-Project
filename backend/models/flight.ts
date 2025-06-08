import mongoose, { Document, Model, Types } from 'mongoose';

// Interface describing a Flight (plain object)
export interface IFlight {
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsAvailable: number;
  date: Date;
  status: 'scheduled' | 'delayed' | 'cancelled';
}

// Mongoose Document interface with explicit _id type
export interface IFlightDocument extends IFlight, Document<Types.ObjectId> {
  _id: Types.ObjectId;
}

// Mongoose Schema using the document interface
const flightSchema = new mongoose.Schema<IFlightDocument>({
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

// Create compound index for faster queries on from, to, date
flightSchema.index({ from: 1, to: 1, date: 1 });

// Create the Mongoose model with the IFlightDocument interface
const FlightModel: Model<IFlightDocument> = mongoose.model<IFlightDocument>('Flight', flightSchema);

export default FlightModel;

// Example helper function to fetch all flights as plain objects
export async function getFlights(): Promise<IFlight[]> {
  const flights = await FlightModel.find({}).lean() as IFlight[];
  return flights;
}
