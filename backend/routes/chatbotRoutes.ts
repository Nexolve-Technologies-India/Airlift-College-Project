import express, { Request, Response } from 'express';
import ChatSession from '../models/ChatSession';
import Flight from '../models/flight';
import Booking from '../models/booking';
import NLPService from '../services/nlpService';
import IntentClassifier from '../utils/intentClassifier';

const router = express.Router();
const nlpService = NLPService.getInstance();
const intentClassifier = IntentClassifier.getInstance();

type Step =
  | 'initial'
  | 'departure'
  | 'destination'
  | 'date'
  | 'searching'
  | 'selecting_flight'
  | 'passenger_details'
  | 'passenger_email'
  | 'passenger_phone'
  | 'passenger_address'
  | 'payment'
  | 'completed';

type PaymentStatus = 'pending' | 'completed' | 'failed';

interface PassengerDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface FlightData {
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

interface SessionContext {
  step: Step;
  paymentStatus: PaymentStatus;
  from?: string;
  to?: string;
  date?: string;
  flights?: FlightData[];
  selectedFlight?: FlightData;
  passengerDetails?: PassengerDetails;
  intent?: string;
  entities?: unknown[];
}

const generateSeatNumber = (): string => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const randomNumber = Math.floor(Math.random() * 30) + 1;
  return `${randomLetter}${randomNumber}`;
};

const nullToUndefined = <T>(value: T | null): T | undefined => 
  value === null ? undefined : value;

router.post('/message', async (req: Request, res: Response): Promise<void> => {
  const { message, sessionId } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    // Process message with NLP
    const nlpResponse = await nlpService.processMessage(message);
    const intentMatch = intentClassifier.classifyIntent(message);

    let session;
    
    if (sessionId && sessionId.match(/^[0-9a-fA-F]{24}$/)) {
      session = await ChatSession.findById(sessionId);
    }
    
    if (!session) {
      session = new ChatSession({
        context: {
          step: 'initial',
          paymentStatus: 'pending',
          passengerDetails: {},
          intent: intentMatch.intent,
          entities: nlpResponse.entities
        },
      });
    }

    const context: SessionContext = {
      step: session.context?.step || 'initial',
      paymentStatus: session.context?.paymentStatus || 'pending',
      from: nullToUndefined(session.context?.from),
      to: nullToUndefined(session.context?.to),
      date: nullToUndefined(session.context?.date),
      flights: session.context?.flights?.map(f => ({
        airline: f.airline || '',
        flightNumber: f.flightNumber || '',
        from: f.from || '',
        to: f.to || '',
        departureTime: f.departureTime || '',
        arrivalTime: f.arrivalTime || '',
        duration: f.duration || '',
        price: Number(f.price) || 0,
        seatsAvailable: Number(f.seatsAvailable) || 0,
        status: f.status || ''
      })),
      selectedFlight: session.context?.selectedFlight ? {
        airline: session.context.selectedFlight.airline || '',
        flightNumber: session.context.selectedFlight.flightNumber || '',
        from: session.context.selectedFlight.from || '',
        to: session.context.selectedFlight.to || '',
        departureTime: session.context.selectedFlight.departureTime || '',
        arrivalTime: session.context.selectedFlight.arrivalTime || '',
        duration: session.context.selectedFlight.duration || '',
        price: Number(session.context.selectedFlight.price) || 0,
        seatsAvailable: Number(session.context.selectedFlight.seatsAvailable) || 0,
        status: session.context.selectedFlight.status || ''
      } : undefined,
      passengerDetails: session.context?.passengerDetails ? {
        name: nullToUndefined(session.context.passengerDetails.name),
        email: nullToUndefined(session.context.passengerDetails.email),
        phone: nullToUndefined(session.context.passengerDetails.phone),
        address: nullToUndefined(session.context.passengerDetails.address)
      } : undefined,
      intent: intentMatch.intent,
      entities: nlpResponse.entities
    };

    let response = '';
    console.log('Current Step:', context.step);
    console.log('Detected Intent:', intentMatch.intent);

    switch (context.step) {
      case 'initial':
        if (intentMatch.intent === 'greeting') {
          response = 'Hello! Welcome to SkyWings Airlines. Where are you departing from?';
        } else {
          response = 'Where are you departing from?';
        }
        context.step = 'departure';
        break;

      case 'departure':
        { const locationEntity = nlpResponse.entities.find(e => e.type === 'location');
        context.from = locationEntity ? locationEntity.value : message;
        response = 'Got it! Where are you flying to?';
        context.step = 'destination';
        break; }

      case 'destination':
        { const toLocationEntity = nlpResponse.entities.find(e => e.type === 'location');
        context.to = toLocationEntity ? toLocationEntity.value : message;
        response = 'Great! What date are you planning to travel? (YYYY-MM-DD)';
        context.step = 'date';
        break; }

      case 'date':
        { const dateEntity = nlpResponse.entities.find(e => e.type === 'date');
        context.date = dateEntity ? dateEntity.value : message;
        const flights = await Flight.find({
          from: context.from,
          to: context.to,
          date: context.date,
        }).lean();

        if (flights.length > 0) {
          context.flights = flights.map(flight => ({
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            from: flight.from,
            to: flight.to,
            departureTime: flight.departureTime,
            arrivalTime: flight.arrivalTime,
            duration: flight.duration,
            price: flight.price,
            seatsAvailable: flight.seatsAvailable,
            status: flight.status
          }));
          
          response = 'Here are the available flights:\n';
          context.flights.forEach((flight, index) => {
            response += `${index + 1}. ${flight.airline} - Flight ${flight.flightNumber} - ₹${flight.price} - ${flight.departureTime}\n`;
          });
          response += 'Please type the number of the flight you want to book.';
          context.step = 'selecting_flight';
        } else {
          response = 'No flights found for your search. Please try again.';
          context.step = 'initial';
        }
        break; }

      case 'selecting_flight':
        if (context.flights && context.flights.length > 0) {
          const flightIndex = parseInt(message) - 1;
          const selectedFlight = context.flights[flightIndex];
          if (selectedFlight) {
            context.selectedFlight = selectedFlight;
            response = 'Flight selected! Please provide your full name.';
            context.step = 'passenger_details';
          } else {
            response = 'Invalid selection. Please try again.';
          }
        } else {
          response = 'No flights available. Please start over.';
          context.step = 'initial';
        }
        break;

      case 'passenger_details':
        if (!context.passengerDetails) context.passengerDetails = {};
        context.passengerDetails.name = message;
        response = 'Thank you! Please provide your email address.';
        context.step = 'passenger_email';
        break;

      case 'passenger_email':
        if (context.passengerDetails) {
          context.passengerDetails.email = message;
          response = 'Got it! Please provide your phone number.';
          context.step = 'passenger_phone';
        }
        break;

      case 'passenger_phone':
        if (context.passengerDetails) {
          context.passengerDetails.phone = message;
          response = 'Almost done! Please provide your address.';
          context.step = 'passenger_address';
        }
        break;

      case 'passenger_address':
        if (context.passengerDetails && context.selectedFlight) {
          context.passengerDetails.address = message;
          response = 'Thank you! Your booking is being processed. Please wait...';
          context.step = 'payment';

          try {
            const flight = await Flight.findOne({
              flightNumber: context.selectedFlight.flightNumber
            });

            if (!flight) {
              throw new Error('Flight not found');
            }

            const bookingData = {
              flightId: flight._id,
              passengerDetails: context.passengerDetails,
              totalAmount: context.selectedFlight.price,
              seatNumber: generateSeatNumber(),
              bookingStatus: 'confirmed',
              paymentStatus: 'completed',
              bookingDate: new Date(),
            };

            const booking = new Booking(bookingData);
            await booking.save();

            context.paymentStatus = 'completed';
            response = `Booking confirmed! Your ticket number is ${booking.ticketNumber}. Your seat number is ${booking.seatNumber}.`;
            context.step = 'completed';
          } catch (error) {
            console.error('Error creating booking:', error);
            response = 'Sorry, there was an error processing your booking. Please try again.';
            context.step = 'initial';
          }
        }
        break;

      default:
        if (intentMatch.intent === 'farewell') {
          response = 'Thank you for choosing SkyWings Airlines. Have a great day!';
        } else {
          response = 'Sorry, I did not understand that. How can I help you?';
          context.step = 'initial';
        }
    }

    // Update session messages and context
    session.messages.push({ 
      content: message, 
      sender: 'user',
      timestamp: new Date()
    });

    session.messages.push({ 
      content: response, 
      sender: 'bot',
      timestamp: new Date()
    });

    session.context = context as unknown;
    await session.save();

    res.json({ 
      message: response, 
      sessionId: session._id 
    });
  } catch (error) {
    console.error('Detailed error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      error: 'An error occurred while processing your message',
      details: errorMessage 
    });
  }
});

export default router;