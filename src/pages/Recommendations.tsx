// pages/Recommendations.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Plane, ArrowRight, Star, Clock, AlertCircle } from 'lucide-react';
import { userService } from '../apiService';

// Extended interface for additional methods that might exist
interface ExtendedUserService {
  getNeuralRecommendations?: (email: string) => Promise<Recommendation>;
  getGenericRecommendations?: () => Promise<Recommendation>;
}

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

interface Recommendation {
  type: string;
  message: string;
  flights: Flight[];
}

const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you'd get this from auth service
    const email = localStorage.getItem('userEmail') || 'demo@example.com';
    setUserEmail(email);
    
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const extendedUserService = userService as typeof userService & ExtendedUserService;
        
        // Always fetch these two core recommendations
        const corePromises = [
          extendedUserService.getPersonalizedRecommendations(email),
          extendedUserService.getPredictedTravelNeeds(email)
        ];
        
        // Conditionally add neural recommendations if available
        const promises = extendedUserService.getNeuralRecommendations 
          ? [extendedUserService.getNeuralRecommendations(email), ...corePromises]
          : corePromises;
        
        const results = await Promise.all(promises);
        
        // Extract results based on what we fetched
        const [neural, personalized, predicted] = extendedUserService.getNeuralRecommendations
          ? [results[0], results[1], results[2]]
          : [null, results[0], results[1]];
        
        const recs: Recommendation[] = [];
        if (neural && neural.flights && neural.flights.length > 0) recs.push(neural);
        if (personalized && personalized.flights && personalized.flights.length > 0) recs.push(personalized);
        if (predicted && predicted?.flights && predicted.flights.length > 0) recs.push(predicted);
        
        // If no recommendations, try to get generic ones
        if (recs.length === 0 && extendedUserService.getGenericRecommendations) {
          try {
            const generic = await extendedUserService.getGenericRecommendations();
            if (generic && generic.flights && generic.flights.length > 0) {
              recs.push(generic);
            }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err) {
            console.log('Generic recommendations not available');
          }
        }
        
        setRecommendations(recs);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  const getIconForType = (type: string) => {
    switch(type) {
      case 'neural': 
        return <Star className="text-yellow-500 mr-2" size={20} />;
      case 'personalized': 
        return <Sparkles className="text-blue-600 mr-2" size={20} />;
      case 'predicted': 
        return <Clock className="text-green-500 mr-2" size={20} />;
      case 'generic': 
        return <Plane className="text-gray-500 mr-2" size={20} />;
      default: 
        return <Plane className="text-gray-500 mr-2" size={20} />;
    }
  };

  const getTypeTitle = (type: string) => {
    switch(type) {
      case 'neural': return 'AI Recommendations';
      case 'personalized': return 'Just For You';
      case 'predicted': return 'Predicted Travel Needs';
      case 'generic': return 'Popular Flights';
      default: return 'Recommendations';
    }
  };
  
  // Handle booking a flight
  const handleBookFlight = (flight: Flight) => {
    // Track this flight view
    if (userEmail) {
      userService.trackFlightView(userEmail, flight._id);
    }
    
    // Navigate to the booking page with the flight data
    navigate('/booking', {
      state: {
        flight,
        from: flight.from,
        to: flight.to,
        date: flight.date,
        passengers: '1'
      }
    });
  };
  
  const renderFlightCard = (flight: Flight) => (
    <div key={flight._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold">{flight.airline}</span>
        <span className="text-blue-600 font-bold">₹{flight.price}</span>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="text-center">
          <div className="text-lg font-semibold">{flight.departureTime}</div>
          <div className="text-sm text-gray-600">{flight.from}</div>
        </div>
        
        <div className="flex-1 px-4">
          <div className="relative">
            <div className="border-t-2 border-gray-300 w-full absolute top-1/2"></div>
            <div className="absolute -top-1 right-0">
              <ArrowRight className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold">{flight.arrivalTime}</div>
          <div className="text-sm text-gray-600">{flight.to}</div>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mb-3">
        {new Date(flight.date).toLocaleDateString()}
      </div>
      
      <button 
        onClick={() => handleBookFlight(flight)}
        className="w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Book Now
      </button>
    </div>
  );
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Recommendations</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Personalized Recommendations</h1>
      
      {recommendations.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Plane className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold mb-4">No Recommendations Available</h2>
          <p className="text-gray-600 mb-6">
            We don't have enough data to provide personalized recommendations yet.
            Start searching and booking flights to get tailored suggestions.
          </p>
          <Link 
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Explore Flights
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {recommendations.map((rec, index) => (
            <div key={index}>
              <div className="flex items-center mb-4">
                {getIconForType(rec.type)}
                <h2 className="text-2xl font-semibold">{getTypeTitle(rec.type)}</h2>
              </div>
              
              <p className="text-gray-600 mb-6">{rec.message}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rec.flights.map(renderFlightCard)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;