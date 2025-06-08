import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Mic, Calendar, Users, MapPin, CreditCard, Clock } from 'lucide-react';

declare global {
  interface Window {
    webkitSpeechRecognition: unknown;
  }
}

interface SpeechRecognition extends EventTarget {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new (): SpeechRecognition;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface Message {
  text: string;
  isBot: boolean;
  component?: React.ReactNode;
}

interface FlightQuery {
  from: string;
  to: string;
  date: string;
  passengers: number;
  returnDate?: string;
  tripType: 'one-way' | 'round-trip';
}

interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  seats: number;
}

interface BookingState {
  step: 'initial' | 'searching' | 'from' | 'to' | 'date' | 'passengers' | 'tripType' | 'returnDate' | 'results' | 'booking' | 'payment' | 'confirmation';
  query: Partial<FlightQuery>;
  selectedFlight?: Flight;
  bookingDetails?: unknown;
}

const EnhancedChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "✈️ Hi! I'm your flight booking assistant. I can help you search flights, compare prices, and book tickets. Just tell me where you want to go! For example: 'I want to book a flight from Pune to Delhi on 23rd June 2025'", isBot: true },
  ]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [bookingState, setBookingState] = useState<BookingState>({
    step: 'initial',
    query: { tripType: 'one-way', passengers: 1 }
  });
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Sample flight data
  const sampleFlights: Flight[] = [
    { id: '1', airline: 'Air India', from: 'Pune', to: 'Delhi', departure: '06:00', arrival: '08:30', duration: '2h 30m', price: 4500, seats: 12 },
    { id: '2', airline: 'SpiceJet', from: 'Pune', to: 'Delhi', departure: '14:15', arrival: '16:45', duration: '2h 30m', price: 3800, seats: 8 },
    { id: '3', airline: 'Vistara', from: 'Pune', to: 'Delhi', departure: '20:30', arrival: '23:00', duration: '2h 30m', price: 5200, seats: 15 },
    { id: '4', airline: 'IndiGo', from: 'Mumbai', to: 'Bangalore', departure: '07:45', arrival: '09:15', duration: '1h 30m', price: 3200, seats: 20 },
    { id: '5', airline: 'GoAir', from: 'Delhi', to: 'Mumbai', departure: '11:30', arrival: '13:45', duration: '2h 15m', price: 4100, seats: 6 },
    { id: '6', airline: 'IndiGo', from: 'Mumbai', to: 'Delhi', departure: '09:00', arrival: '11:30', duration: '2h 30m', price: 3900, seats: 18 },
    { id: '7', airline: 'Air India', from: 'Bangalore', to: 'Mumbai', departure: '16:45', arrival: '18:15', duration: '1h 30m', price: 3600, seats: 10 },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced date parsing function
  const parseDate = (input: string): string | null => {
    try {
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // Remove common words and normalize
      const cleanInput = input.toLowerCase()
        .replace(/on|at|in|the|of/g, '')
        .replace(/(\d+)(st|nd|rd|th)/g, '$1')
        .trim();

      // Various date patterns
      const patterns = [
        // DD/MM/YYYY or DD-MM-YYYY
        /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/,
        // DD Month YYYY
        /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
        // Month DD, YYYY
        /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i,
        // DD Month (current year)
        /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      ];

      const monthNames = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
      };

      for (const pattern of patterns) {
        const match = cleanInput.match(pattern);
        if (match) {
          let day: number, month: number, year: number;

          if (pattern.source.includes('january|february')) {
            // Month name patterns
            if (match[3]) {
              // Month DD, YYYY format
              month = monthNames[match[1].toLowerCase() as keyof typeof monthNames];
              day = parseInt(match[2]);
              year = parseInt(match[3]);
            } else {
              // DD Month or DD Month YYYY format
              day = parseInt(match[1]);
              month = monthNames[match[2].toLowerCase() as keyof typeof monthNames];
              year = match[3] ? parseInt(match[3]) : currentYear;
            }
          } else {
            // Numeric patterns (DD/MM/YYYY)
            day = parseInt(match[1]);
            month = parseInt(match[2]) - 1; // JavaScript months are 0-indexed
            year = parseInt(match[3]);
          }

          const parsedDate = new Date(year, month, day);
          
          // Validate date and check if it's in the future
          if (parsedDate.getTime() > today.getTime()) {
            return parsedDate.toISOString().split('T')[0];
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Date parsing error:', error);
      return null;
    }
  };

  // Enhanced query parsing
  const parseFlightQuery = (input: string): Partial<FlightQuery> => {
    try {
      const query: Partial<FlightQuery> = {};
      const lowerInput = input.toLowerCase();

      // Parse cities (from/to)
      const fromMatch = lowerInput.match(/from\s+([a-zA-Z\s]+?)(?:\s+to|\s+→|\s+-)/);
      const toMatch = lowerInput.match(/to\s+([a-zA-Z\s]+?)(?:\s+on|\s+for|\s+in|\s*$)/);
      
      if (fromMatch) query.from = fromMatch[1].trim();
      if (toMatch) query.to = toMatch[1].trim();

      // Parse date
      const date = parseDate(input);
      if (date) query.date = date;

      // Parse passengers
      const passengerMatch = lowerInput.match(/(\d+)\s*(?:passenger|person|people|pax)/);
      if (passengerMatch) query.passengers = parseInt(passengerMatch[1]);

      // Parse trip type
      if (lowerInput.includes('round trip') || lowerInput.includes('return')) {
        query.tripType = 'round-trip';
      }

      return query;
    } catch (error) {
      console.error('Query parsing error:', error);
      return {};
    }
  };

  const addMessage = (text: string, isBot: boolean = true, component?: React.ReactNode) => {
    setMessages(prev => [...prev, { text, isBot, component }]);
  };

  const searchFlights = (query: FlightQuery): Flight[] => {
    try {
      return sampleFlights.filter(flight => 
        flight.from.toLowerCase().includes(query.from.toLowerCase()) &&
        flight.to.toLowerCase().includes(query.to.toLowerCase())
      );
    } catch (error) {
      console.error('Flight search error:', error);
      return [];
    }
  };

  const FlightResults: React.FC<{ flights: Flight[], onSelect: (flight: Flight) => void }> = ({ flights, onSelect }) => (
    <div className="space-y-3 mt-3">
      <h4 className="font-semibold text-sm">Available Flights:</h4>
      {flights.map(flight => (
        <div key={flight.id} className="border rounded-lg p-3 bg-white shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-semibold text-blue-600">{flight.airline}</div>
              <div className="text-sm text-gray-600">{flight.from} → {flight.to}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">₹{flight.price.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{flight.seats} seats left</div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div>
              <Clock className="inline w-4 h-4 mr-1" />
              {flight.departure} - {flight.arrival}
            </div>
            <div className="text-gray-600">{flight.duration}</div>
          </div>
          <button
            onClick={() => onSelect(flight)}
            className="w-full mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Select Flight
          </button>
        </div>
      ))}
    </div>
  );

  const BookingForm: React.FC<{ flight: Flight, onConfirm: (details: unknown) => void }> = ({ flight, onConfirm }) => {
    const [details, setDetails] = useState({
      name: '',
      email: '',
      phone: '',
      passengers: bookingState.query.passengers || 1
    });

    return (
      <div className="space-y-3 mt-3">
        <h4 className="font-semibold text-sm">Booking Details:</h4>
        <div className="bg-blue-50 p-3 rounded-lg text-sm">
          <div className="font-semibold">{flight.airline}</div>
          <div>{flight.from} → {flight.to}</div>
          <div>{flight.departure} - {flight.arrival}</div>
          <div className="font-bold">₹{flight.price.toLocaleString()} × {details.passengers} = ₹{(flight.price * details.passengers).toLocaleString()}</div>
        </div>
        
        <input
          type="text"
          placeholder="Full Name"
          value={details.name}
          onChange={(e) => setDetails({...details, name: e.target.value})}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="email"
          placeholder="Email"
          value={details.email}
          onChange={(e) => setDetails({...details, email: e.target.value})}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={details.phone}
          onChange={(e) => setDetails({...details, phone: e.target.value})}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
        
        <button
          onClick={() => onConfirm(details)}
          disabled={!details.name || !details.email || !details.phone}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition text-sm disabled:bg-gray-400"
        >
          <CreditCard className="inline w-4 h-4 mr-1" />
          Proceed to Payment
        </button>
      </div>
    );
  };

  const processMessage = (userInput: string) => {
    try {
      // Parse the input for flight queries
      const parsedQuery = parseFlightQuery(userInput);
      
      // Check if it's a complete query
      if (parsedQuery.from && parsedQuery.to && parsedQuery.date) {
        const date = new Date(parsedQuery.date);
        const formattedDate = date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        setBookingState(prev => ({
          ...prev,
          query: { ...prev.query, ...parsedQuery },
          step: 'results'
        }));

        const flights = searchFlights(parsedQuery as FlightQuery);
        
        if (flights.length > 0) {
          addMessage(`Perfect! I found ${flights.length} flights from ${parsedQuery.from} to ${parsedQuery.to} on ${formattedDate} for ${parsedQuery.passengers || 1} passenger(s).`, true,
            <FlightResults 
              flights={flights} 
              onSelect={(flight) => {
                setBookingState(prev => ({ ...prev, selectedFlight: flight, step: 'booking' }));
                addMessage(`Great choice! You selected the ${flight.airline} flight departing at ${flight.departure}. Let me help you complete the booking.`, true,
                  <BookingForm 
                    flight={flight} 
                    onConfirm={(details) => {
                      setBookingState(prev => ({ ...prev, bookingDetails: details, step: 'payment' }));
                      addMessage(`Booking confirmed! 🎉\n\nBooking Reference: FL${Date.now()}\nFlight: ${flight.airline} ${flight.from}-${flight.to}\nDate: ${parsedQuery.date}\nPassenger: ${details.name}\nTotal: ₹${(flight.price * (parsedQuery.passengers || 1)).toLocaleString()}\n\nYour e-ticket has been sent to ${details.email}. Have a great trip!`);
                    }}
                  />
                );
              }}
            />
          );
        } else {
          addMessage(`I couldn't find any flights from ${parsedQuery.from} to ${parsedQuery.to} on ${formattedDate}. Would you like to try different dates or cities?`);
        }
      }
      // Handle incomplete queries with conversational flow
      else if (userInput.toLowerCase().includes('flight') || userInput.toLowerCase().includes('book')) {
        if (!parsedQuery.from) {
          setBookingState(prev => ({ ...prev, step: 'from' }));
          addMessage("I'd be happy to help you book a flight! From which city would you like to depart?");
        } else if (!parsedQuery.to) {
          setBookingState(prev => ({ ...prev, query: { ...prev.query, ...parsedQuery }, step: 'to' }));
          addMessage(`Great! Flying from ${parsedQuery.from}. Which city is your destination?`);
        }
      }
      // Handle conversational flow based on current step
      else {
        switch (bookingState.step) {
          case 'from':
            setBookingState(prev => ({ 
              ...prev, 
              query: { ...prev.query, from: userInput },
              step: 'to' 
            }));
            addMessage(`Perfect! Flying from ${userInput}. Where would you like to go?`);
            break;
            
          case 'to':
            setBookingState(prev => ({ 
              ...prev, 
              query: { ...prev.query, to: userInput },
              step: 'date' 
            }));
            addMessage(`Excellent! ${bookingState.query.from} to ${userInput}. What's your preferred travel date? (e.g., "23rd June 2025" or "15/07/2025")`);
            break;
            
          case 'date':
            { const parsedDate = parseDate(userInput);
            if (parsedDate) {
              const date = new Date(parsedDate);
              const formattedDate = date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
              
              setBookingState(prev => ({ 
                ...prev, 
                query: { ...prev.query, date: parsedDate },
                step: 'passengers' 
              }));
              addMessage(`Great! Travel date set to ${formattedDate}. How many passengers will be traveling?`);
            } else {
              addMessage("I couldn't understand that date. Please provide a future date like '23rd June 2025' or '15/07/2025'.");
            }
            break; }
            
          case 'passengers':
            { const passengers = parseInt(userInput);
            if (passengers > 0 && passengers <= 10) {
              const query = { ...bookingState.query, passengers } as FlightQuery;
              setBookingState(prev => ({ ...prev, query, step: 'results' }));
              
              const flights = searchFlights(query);
              if (flights.length > 0) {
                addMessage(`Perfect! Searching flights for ${passengers} passenger(s)...`, true,
                  <FlightResults 
                    flights={flights} 
                    onSelect={(flight) => {
                      setBookingState(prev => ({ ...prev, selectedFlight: flight, step: 'booking' }));
                      addMessage(`Excellent choice! Let's complete your booking for the ${flight.airline} flight.`, true,
                        <BookingForm 
                          flight={flight} 
                          onConfirm={(details) => {
                            setBookingState(prev => ({ ...prev, bookingDetails: details, step: 'confirmation' }));
                            addMessage(`🎉 Booking Confirmed!\n\nReference: FL${Date.now()}\n${flight.airline} - ${query.from} to ${query.to}\nDate: ${new Date(query.date).toLocaleDateString()}\nPassengers: ${passengers}\nTotal: ₹${(flight.price * passengers).toLocaleString()}\n\nE-ticket sent to ${details.email}!`);
                          }}
                        />
                      );
                    }}
                  />
                );
              } else {
                addMessage("Sorry, no flights found for your criteria. Would you like to try different dates?");
              }
            } else {
              addMessage("Please enter a valid number of passengers (1-10).");
            }
            break; }
            
          default:
            // General help and other queries
            if (userInput.toLowerCase().includes('help')) {
              addMessage("I can help you with:\n• Flight search and booking\n• Price comparison\n• Booking management\n• Cancellations and changes\n\nJust tell me what you need! You can say something like 'Book a flight from Mumbai to Delhi on 25th December 2025'");
            } else if (userInput.toLowerCase().includes('cancel') || userInput.toLowerCase().includes('reschedule')) {
              addMessage("To cancel or reschedule your booking, I'll need your booking reference number. Please provide your booking reference (format: FL123456789).");
            } else {
              addMessage("I'm here to help with flight bookings! You can:\n• Search for flights by saying 'I want to book a flight'\n• Give me complete details like 'Flight from Pune to Delhi on 23rd June 2025'\n• Ask about prices, availability, or booking management\n\nWhat would you like to do?");
            }
        }
      }
    } catch (error) {
      console.error('Message processing error:', error);
      addMessage('I apologize for the confusion. Could you please rephrase your request? For example: "I want to book a flight from Mumbai to Delhi on 25th June 2025"');
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    // Process message after a brief delay
    setTimeout(() => {
      try {
        processMessage(userInput);
      } catch (error) {
        console.error('Error in handleSend:', error);
        addMessage('I apologize, but I encountered an issue. Please try again with a simpler request.');
      } finally {
        setIsTyping(false);
      }
    }, 500);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition. Please use Chrome or another supported browser.');
      return;
    }

    try {
      const recognition = new (window as any).webkitSpeechRecognition() as SpeechRecognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Speech recognition setup error:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    } catch (error) {
      console.error('Stop listening error:', error);
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[700px] bg-white rounded-xl shadow-2xl flex flex-col border">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                ✈️
              </div>
              <div>
                <h3 className="font-semibold">Flight Assistant</h3>
                <p className="text-xs opacity-90">Smart Booking Helper</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white hover:bg-opacity-20 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.isBot
                      ? 'bg-white text-gray-800 shadow-sm border'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  }`}
                >
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {msg.text}
                  </div>
                  {msg.component && (
                    <div className="mt-2">
                      {msg.component}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Container */}
          <div className="p-4 border-t bg-white rounded-b-xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message... e.g., 'Flight from Mumbai to Delhi on 25th Dec 2025'"
                className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
              />
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gray-500 hover:bg-gray-600'
                } text-white`}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Send
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 flex items-center justify-center space-x-4">
              <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />Future dates supported</span>
              <span className="flex items-center"><Users className="w-3 h-3 mr-1" />Multi-passenger</span>
              <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />All cities</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedChatBot;