import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface Flight {
  _id: string;
  airline: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  date: string;
}

interface Props {
  email: string;
}

const RecentlyViewedFlights: React.FC<Props> = ({ email }) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentlyViewedFlights = async () => {
      try {
        if (!email || typeof email !== 'string' || !email.includes('@')) {
          throw new Error('Invalid email prop');
        }
        const encodedEmail = encodeURIComponent(email);
        const url = `http://localhost:5500/api/users/recently-viewed/${encodedEmail}`;
        console.log('Fetching flights from:', url);
        const response = await fetch(url);
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API data:', data);
        if (!data || !Array.isArray(data.flights)) {
          console.warn('Invalid API response, expected flights array:', data);
          setFlights([]);
        } else {
          setFlights(data.flights);
        }
      } catch (error) {
        console.error('Error fetching recently viewed flights:', error);
        setFlights([]);
        setError('Failed to load flights. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchRecentlyViewedFlights();
    } else {
      setLoading(false);
      setFlights([]);
    }
  }, [email]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-40 rounded-lg"></div>;
  }

  if (error) {
    return <div className="bg-white rounded-lg shadow-md p-4 mb-6 text-red-600">{error}</div>;
  }

  if (!Array.isArray(flights) || flights.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center mb-4">
          <Clock className="mr-2 text-blue-600" />
          <h3 className="text-lg font-semibold">Recently Viewed Flights</h3>
        </div>
        <p className="text-gray-600">No recently viewed flights.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center mb-4">
        <Clock className="mr-2 text-blue-600" />
        <h3 className="text-lg font-semibold">Recently Viewed Flights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flights.slice(0, 3).map((flight) => (
          <div key={flight._id} className="border rounded-md p-3 hover:shadow-md transition">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{flight.airline}</span>
              <span className="text-blue-600 font-bold">₹{flight.price}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <div>
                <div>{flight.from}</div>
                <div>{flight.departureTime}</div>
              </div>
              <div className="text-center">→</div>
              <div className="text-right">
                <div>{flight.to}</div>
                <div>{flight.arrivalTime}</div>
              </div>
            </div>
            <Link
              to={`/booking?flightId=${encodeURIComponent(flight._id)}`}
              className="mt-3 block text-center text-sm bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition"
            >
              Book Again
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RecentlyViewedFlights);