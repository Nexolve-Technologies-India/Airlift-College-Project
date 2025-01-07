import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';
import { flightService } from '../apiService';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const flights = await flightService.search(formData.from, formData.to, formData.date);
      navigate('/search', { state: { flights, ...formData } });
    } catch (error) {
      console.error('Error searching flights:', error);
      alert('Failed to search flights. Please try again.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div
        className="h-[600px] bg-cover bg-center relative"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-4">Your Journey Begins Here</h1>
              <p className="text-xl mb-8">Discover amazing flight deals to your dream destinations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-4xl mx-auto -mt-24 px-4 relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">From</label>
                <div className="mt-1 relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="pl-10 w-full rounded-md border border-gray-300 p-2"
                    placeholder="Departure City"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">To</label>
                <div className="mt-1 relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="pl-10 w-full rounded-md border border-gray-300 p-2"
                    placeholder="Arrival City"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <div className="mt-1 relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    required
                    className="pl-10 w-full rounded-md border border-gray-300 p-2"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Passengers</label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 p-2"
                  value={formData.passengers}
                  onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
            >
              Search Flights
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;