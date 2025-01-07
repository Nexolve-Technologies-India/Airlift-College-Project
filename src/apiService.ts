const API_BASE_URL = 'http://localhost:5500/api';
import axios from 'axios';

// Define interfaces for flight and booking data
interface Flight {
  _id: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsAvailable: number;
  date: string;
  status: string;
}

interface Booking {
  _id: string;
  flightId: string;
  passengerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  bookingDate: Date;
  paymentStatus: string;
  bookingStatus: string;
  totalAmount: number;
  ticketNumber: string;
  seatNumber: string;
}

interface ChatbotResponse {
  message: string;
  sessionId: string;
}

/**
 * Flight-related API calls
 */
export const flightService = {
  search: async (from: string, to: string, date: string): Promise<Flight[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/flights/search?from=${from}&to=${to}&date=${date}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch flights: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching flights:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Flight> => {
    try {
      const response = await fetch(`${API_BASE_URL}/flights/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch flight details: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching flight details:', error);
      throw error;
    }
  },
};

/**
 * Booking-related API calls
 */
export const bookingService = {
  create: async (bookingData: any): Promise<Booking> => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) {
        throw new Error(`Failed to create booking: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  updateBookingStatus: async (id: string, paymentStatus: string, bookingStatus: string): Promise<Booking> => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus, bookingStatus }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update booking status: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },
};

const chatbotService = {
  sendMessage: async (message: string, sessionId?: string): Promise<ChatbotResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chatbot/message`, {
        message,
        sessionId: sessionId || ''
      });
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  },
};

export default chatbotService;