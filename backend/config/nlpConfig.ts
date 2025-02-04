export interface NLPConfig {
  confidenceThreshold: number;
  language: string;
  cities: string[];
  airlines: string[];
  defaultResponses: DefaultResponses;
  entityPatterns: EntityPatterns;
  flightPatterns: FlightPatterns;
}

interface DefaultResponses {
  greeting: string[];
  farewell: string[];
  unknown: string[];
  confirmation: string[];
  error: string[];
  [key: string]: string[];
}

interface EntityPatterns {
  date: RegExp[];
  time: RegExp[];
  email: RegExp;
  phone: RegExp;
  price: RegExp;
  flightNumber: RegExp;
}

interface FlightPatterns {
  departureTimes: string[];
  arrivalTimes: string[];
  duration: string;
  basePrice: number;
  dateRange: {
    start: string;
    end: string;
  };
}

const nlpConfig: NLPConfig = {
  confidenceThreshold: 0.7,
  language: 'en',
  
  // Cities served by SkyWings Airlines
  cities: [
    'Mumbai', 'Delhi', 'Bangalore', 
    'Chennai', 'Kolkata', 'Hyderabad'
  ],

  // Available airlines
  airlines: ['SkyWings Airlines'],

  // Default response templates
  defaultResponses: {
    greeting: [
      'Welcome to SkyWings Airlines! How can I assist you with your flight booking today?',
      'Hello! I\'m here to help you book your SkyWings Airlines flight.',
      'Hi! Looking to book a flight with SkyWings Airlines? I\'m here to help!'
    ],
    
    farewell: [
      'Thank you for choosing SkyWings Airlines. Have a great flight!',
      'Thanks for booking with SkyWings Airlines. Have a safe journey!',
      'We look forward to welcoming you aboard SkyWings Airlines!'
    ],
    
    unknown: [
      'I didn\'t quite catch that. Could you please rephrase?',
      'I\'m not sure I understood. Could you say that differently?',
      'Could you please provide more details about what you\'re looking for?'
    ],
    
    confirmation: [
      'I\'ve got that information. Let me check the available flights.',
      'Perfect! I\'ll search for flights matching your criteria.',
      'Great! Let me find the best flights for you.'
    ],
    
    error: [
      'I encountered an error while processing your request. Let\'s try again.',
      'Something went wrong. Could we restart your booking?',
      'I apologize for the inconvenience. Please try your request again.'
    ],

    locationRequest: [
      'Which city would you like to depart from? We serve Mumbai, Delhi, Bangalore, Chennai, Kolkata, and Hyderabad.',
      'Please specify your departure city from our network: Mumbai, Delhi, Bangalore, Chennai, Kolkata, or Hyderabad.',
      'Where will you be starting your journey? You can choose from Mumbai, Delhi, Bangalore, Chennai, Kolkata, or Hyderabad.'
    ],

    destinationRequest: [
      'Which city would you like to fly to? We serve Mumbai, Delhi, Bangalore, Chennai, Kolkata, and Hyderabad.',
      'Please choose your destination from our network: Mumbai, Delhi, Bangalore, Chennai, Kolkata, or Hyderabad.',
      'Where would you like to go? You can choose from Mumbai, Delhi, Bangalore, Chennai, Kolkata, or Hyderabad.'
    ],

    dateRequest: [
      'When would you like to travel? (YYYY-MM-DD) Our flights are available from 2025-01-01 to 2026-01-01.',
      'Please specify your travel date (YYYY-MM-DD). We\'re currently booking flights between January 2025 and January 2026.',
      'What\'s your preferred date of travel? (YYYY-MM-DD) You can book flights from January 2025 to January 2026.'
    ],

    timeRequest: [
      'We have flights at 08:00, 10:00, 12:00, 14:00, 16:00, and 18:00. Which time would you prefer?',
      'Choose from our daily flights: 8 AM, 10 AM, 12 PM, 2 PM, 4 PM, or 6 PM.',
      'Select your preferred departure time: 8 AM, 10 AM, 12 PM, 2 PM, 4 PM, or 6 PM.'
    ],

    flightSelection: [
      'Please select your preferred flight by typing its number.',
      'Which flight would you like to book? Enter the flight number (e.g., SW101).',
      'Type the flight number of your choice (starts with SW).'
    ],

    passengerDetailsRequest: [
      'Please provide your full name for the booking.',
      'What name should I put on the ticket?',
      'Enter the passenger\'s complete name as it appears on their ID.'
    ],

    emailRequest: [
      'Please provide your email address for booking confirmation.',
      'Where should I send your booking confirmation email?',
      'Enter your email address for your flight details.'
    ],

    phoneRequest: [
      'Please provide your contact number for booking updates.',
      'What\'s the best phone number to reach you?',
      'Enter your mobile number for flight notifications.'
    ],

    addressRequest: [
      'Please provide your complete address for our records.',
      'What\'s your mailing address?',
      'Enter your full address for the booking.'
    ]
  },

  // Regular expression patterns
  entityPatterns: {
    date: [
      /\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
      /\d{2}\/\d{2}\/\d{4}/, // DD/MM/YYYY
      /\d{2}-\d{2}-\d{4}/ // DD-MM-YYYY
    ],
    
    time: [
      /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, // 24-hour format
      /^(0?[8]|1[0,2,4,6,8]):00$/ // Specific flight times
    ],
    
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    
    phone: /^(?:\+91|0)?[6789]\d{9}$/,  // Indian phone number format
    
    price: /^₹?\s?5000$/,  // Fixed price
    
    flightNumber: /^SW[1-9]\d{2}$/  // SkyWings flight number format
  },

  // Flight-specific patterns
  flightPatterns: {
    departureTimes: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    arrivalTimes: ['10:30', '12:30', '14:30', '16:30', '18:30', '20:30'],
    duration: '2h 30m',
    basePrice: 5000,
    dateRange: {
      start: '2025-01-01',
      end: '2026-01-01'
    }
  }
};

// Helper function to get random response
export const getRandomResponse = (responses: string[]): string => {
  return responses[Math.floor(Math.random() * responses.length)];
};

// Helper function to validate entities
export const validateEntity = (type: keyof EntityPatterns, value: string): boolean => {
  if (type === 'date') {
    return nlpConfig.entityPatterns.date.some(pattern => pattern.test(value));
  }
  if (type === 'time') {
    return nlpConfig.entityPatterns.time.some(pattern => pattern.test(value));
  }
  return nlpConfig.entityPatterns[type].test(value);
};

// Helper function to check if city is valid
export const isSupportedCity = (city: string): boolean => {
  return nlpConfig.cities.includes(city);
};

// Helper function to validate flight number
export const isValidFlightNumber = (flightNumber: string): boolean => {
  return nlpConfig.entityPatterns.flightNumber.test(flightNumber);
};

// Helper function to check if date is within range
export const isDateInRange = (date: string): boolean => {
  const checkDate = new Date(date);
  const startDate = new Date(nlpConfig.flightPatterns.dateRange.start);
  const endDate = new Date(nlpConfig.flightPatterns.dateRange.end);
  return checkDate >= startDate && checkDate <= endDate;
};

export default nlpConfig;