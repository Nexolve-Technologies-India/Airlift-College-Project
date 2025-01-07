import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, Clock, DollarSign } from 'lucide-react';
import { Flight } from '../apiService';

interface SearchData {
  from: string;
  to: string;
  date: string;
  passengers: string;
}

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flights, ...searchData } = location.state as { flights: Flight[] } & SearchData;

  const handleBooking = (flightId: string) => {
    const selectedFlight = flights.find((f) => f._id === flightId);
    if (selectedFlight) {
      navigate('/booking', {
        state: {
          ...searchData,
          flight: selectedFlight,
        },
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Flight Results</h2>
      <div className="space-y-4">
        {flights.map((flight) => (
          <div key={flight._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-lg">{flight.airline}</h3>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{flight.duration}</span>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <p className="font-semibold">{flight.departureTime}</p>
                  <p className="text-sm text-gray-600">{searchData.from}</p>
                </div>
                <Plane className="text-blue-600" />
                <div className="text-center">
                  <p className="font-semibold">{flight.arrivalTime}</p>
                  <p className="text-sm text-gray-600">{searchData.to}</p>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  <DollarSign className="inline w-5 h-5" />
                  {flight.price}
                </p>
                <button
                  onClick={() => handleBooking(flight._id)}
                  className="mt-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;