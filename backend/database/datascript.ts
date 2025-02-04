import mongoose from 'mongoose';
import Flight from '../models/flight';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:8848/FlightDB');

// Function to get random element from array
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Function to generate all hours of the day (00:00 to 23:00)
const generateHourlyTimes = (): string[] => {
  return Array.from({ length: 24 }, (_, i) => 
    `${String(i).padStart(2, '0')}:00`
  );
};

// Function to calculate arrival time based on departure time and duration
const calculateArrivalTime = (departureTime: string, durationHours: number): string => {
  const [hours, minutes] = departureTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationHours * 60;
  
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

// Function to generate a single flight object
const generateFlight = (
  airline: string,
  flightNumber: string,
  from: string,
  to: string,
  departureTime: string,
  date: string
) => {
  // Possible durations in hours
  const possibleDurations = [2, 2.5, 3];
  const durationHours = getRandomElement(possibleDurations);
  
  // Calculate arrival time based on departure time and duration
  const arrivalTime = calculateArrivalTime(departureTime, durationHours);
  
  // Possible prices
  const possiblePrices = [3000, 4000, 5000, 6000, 7000];
  
  return {
    airline,
    flightNumber,
    from,
    to,
    departureTime,
    arrivalTime,
    duration: `${durationHours}h ${durationHours % 1 ? '30m' : '0m'}`,
    price: getRandomElement(possiblePrices),
    seatsAvailable: 100,
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
    { from: 'Chennai', to: 'Mumbai' },
    { from: 'Mumbai', to: 'Chennai' },
    { from: 'Kolkata', to: 'Mumbai' },
    { from: 'Mumbai', to: 'Kolkata' },
    { from: 'Delhi', to: 'Bangalore' },
    { from: 'Bangalore', to: 'Delhi' },
    { from: 'Mumbai', to: 'Hyderabad' },
    { from: 'Hyderabad', to: 'Mumbai' },
    { from: 'Kolkata', to: 'Delhi' },
    { from: 'Delhi', to: 'Kolkata' },
    { from: 'Delhi', to: 'Hyderabad' },
    { from: 'Hyderabad', to: 'Delhi' },
  ];

  const startDate = new Date('2025-01-01');
  const endDate = new Date('2026-01-01');
  const hourlyDepartures = generateHourlyTimes();

  let flightCounter = 100; // Starting flight number

  for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    routes.forEach((route) => {
      // Generate flights for each hour
      hourlyDepartures.forEach((departureTime) => {
        flights.push(
          generateFlight(
            airline,
            `SW${flightCounter}`,
            route.from,
            route.to,
            departureTime,
            dateString
          )
        );
        flightCounter++;
      });
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