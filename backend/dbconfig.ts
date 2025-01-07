import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:8848/FlightDB');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
console.error("An error occurred:", error);
    process.exit(1);
  }
};

export default connectDB;