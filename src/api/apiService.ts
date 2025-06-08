import axios from 'axios';

const API_BASE_URL = 'http://localhost:5173/api'; // Adjust based on your backend URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const flightService = {
  async search(from: string, to: string, date: string): Promise<unknown[]> {
    try {
      const response = await apiClient.get('/flights/search', {
        params: { from, to, date },
      });
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Failed to fetch flights');
    }
  },
};

export const userService = {
  async trackSearch(email: string, from: string, to: string, date: string): Promise<void> {
    try {
      await apiClient.post('/user/track-search', {
        email,
        from,
        to,
        date,
      });
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  },
};