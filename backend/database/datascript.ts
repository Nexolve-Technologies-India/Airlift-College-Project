import mongoose from 'mongoose';
import Flight from '../models/flight';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:8848/FlightDB');

// Function to generate a single flight object
const generateFlight = (
  airline: string,
  flightNumber: string,
  from: string,
  to: string,
  departureTime: string,
  arrivalTime: string,
  duration: string,
  price: number,
  seatsAvailable: number,
  date: string
) => {
  return {
    airline,
    flightNumber,
    from,
    to,
    departureTime,
    arrivalTime,
    duration,
    price,
    seatsAvailable,
    date,
    status: 'scheduled',
  };
};

// Function to generate flights for the given parameters
const generateFlights = () => {
  const flights: any[] = [];
  const airline = 'SkyWings Airlines';
  const routes = [
    { from: 'Mumbai', to: 'Delhi' },
    { from: 'Delhi', to: 'Mumbai' },
    { from: 'Mumbai', to: 'Bangalore' },
    { from: 'Bangalore', to: 'Mumbai' },
  ];

  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-01-31');

  let flightCounter = 100; // Starting flight number

  for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    routes.forEach((route) => {
      // Morning flight
      flights.push(
        generateFlight(
          airline,
          `SW${flightCounter}`,
          route.from,
          route.to,
          '08:00',
          '10:30',
          '2h 30m',
          5000,
          100,
          dateString
        )
      );
      flightCounter++;

      // Evening flight
      flights.push(
        generateFlight(
          airline,
          `SW${flightCounter}`,
          route.from,
          route.to,
          '18:00',
          '20:30',
          '2h 30m',
          5000,
          100,
          dateString
        )
      );
      flightCounter++;
    });
  }

  return flights;
};

// Insert flights into the database
const seedFlights = async () => {
  try {
    // Clear existing flights
    console.log('Clearing existing flights...');
    await Flight.deleteMany({});

    // Generate and insert new flights
    console.log('Generating new flights...');
    const flights = generateFlights();
    
    console.log('Inserting flights into database...');
    await Flight.insertMany(flights);

    console.log('Flight data seeded successfully!');
    console.log(`Total flights inserted: ${flights.length}`);
  } catch (error) {
    console.error('Error seeding flight data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the seeding function
seedFlights();


//Run code by command - npx ts-node datascript.ts