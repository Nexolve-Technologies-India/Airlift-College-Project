const API_BASE_URL = 'http://localhost:5500/api';
import axios from 'axios';

// Define interfaces for flight and booking data
export interface Flight {
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

// Update in apiService.ts - Add these functions to the exported object

// Add these interfaces
interface LoyaltyInfo {
  loyaltyPoints: number;
  loyaltyTier: string;
  benefits: {
    discountPercentage: number;
    priorityBoarding: boolean;
    extraBaggage: boolean;
    loungeAccess: boolean;
  };
}

interface Recommendation {
  type: string;
  message: string;
  flights: Flight[];
}

// Add this service object
export const userService = {
  trackFlightView: async (email: string, flightId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/track-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, flightId }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error tracking flight view:', error);
      return false;
    }
  },
  
  trackSearch: async (email: string, from: string, to: string, date: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/track-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, from, to, date }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error tracking search:', error);
      return false;
    }
  },
  
  getRecentlyViewedFlights: async (email: string): Promise<Flight[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/recently-viewed/${email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recently viewed flights');
      }
      const data = await response.json();
      return data.flights || [];
    } catch (error) {
      console.error('Error fetching recently viewed flights:', error);
      return [];
    }
  },
  
  getSimilarDestinations: async (destination: string): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/similar-destinations/${destination}`);
      if (!response.ok) {
        throw new Error('Failed to fetch similar destinations');
      }
      const data = await response.json();
      return data.similarDestinations || [];
    } catch (error) {
      console.error('Error fetching similar destinations:', error);
      return [];
    }
  },
  
  getLoyaltyInfo: async (email: string): Promise<LoyaltyInfo | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/loyalty/${email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch loyalty info');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching loyalty info:', error);
      return null;
    }
  },
  
  updateLoyaltyPoints: async (email: string, bookingAmount: number): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/loyalty/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, bookingAmount }),
      });
      if (!response.ok) {
        throw new Error('Failed to update loyalty points');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating loyalty points:', error);
      return null;
    }
  },
  
  createPriceAlert: async (
    email: string, 
    from: string, 
    to: string, 
    maxPrice: number, 
    startDate: string, 
    endDate: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/price-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, from, to, maxPrice, startDate, endDate }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error creating price alert:', error);
      return false;
    }
  },
  
  getPersonalizedRecommendations: async (email: string): Promise<Recommendation | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/personalized/${email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return null;
    }
  },
  
  getPredictedTravelNeeds: async (email: string): Promise<Recommendation | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/predicted/${email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch predicted travel needs');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching predicted travel needs:', error);
      return null;
    }
  }
};

export const feedbackService = {
  submitFeedback: async (
    email: string,
    rating: number,
    comment: string,
    feedbackType: string,
    bookingId?: string,
    flightId?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          rating,
          comment,
          feedbackType,
          bookingId,
          flightId,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return false;
    }
  },
  
  getFeedbackStats: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch feedback stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      return null;
    }
  }
};

export default chatbotService;