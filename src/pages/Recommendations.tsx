// pages/Recommendations.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Plane, ArrowRight } from 'lucide-react';
import { userService } from '../apiService';

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
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<Recommendation | null>(null);
  const [predictedNeeds, setPredictedNeeds] = useState<Recommendation | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real app, you'd get this from auth service
    const email = localStorage.getItem('userEmail') || 'demo@example.com';
    setUserEmail(email);
    
    const fetchRecommendations = async () => {
      try {
        // Fetch personalized recommendations
        const personalizedData = await userService.getPersonalizedRecommendations(email);
        setPersonalizedRecommendations(personalizedData);
        
        // Fetch predicted travel needs
        const predictedData = await userService.getPredictedTravelNeeds(email);
        setPredictedNeeds(predictedData);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);
  
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
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Personalized Recommendations</h1>
      
      {personalizedRecommendations && personalizedRecommendations.flights.length > 0 ? (
        <div className="mb-12">
          <div className="flex items-center mb-4">
            <Sparkles className="text-blue-600 mr-2" />
            <h2 className="text-2xl font-semibold">Just For You</h2>
          </div>
          
          <p className="text-gray-600 mb-6">{personalizedRecommendations.message}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalizedRecommendations.flights.map(renderFlightCard)}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-semibold mb-2">No Personalized Recommendations Yet</h2>
          <p className="text-gray-600">
            Search and book more flights to get personalized recommendations based on your preferences.
          </p>
        </div>
      )}
      
      {predictedNeeds && predictedNeeds.flights.length > 0 ? (
        <div>
          <div className="flex items-center mb-4">
            <Plane className="text-blue-600 mr-2" />
            <h2 className="text-2xl font-semibold">Predicted Travel Needs</h2>
          </div>
          
          <p className="text-gray-600 mb-6">{predictedNeeds.message}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictedNeeds.flights.map(renderFlightCard)}
          </div>
        </div>
      ) : null}
      
      {(!personalizedRecommendations || personalizedRecommendations.flights.length === 0) && 
       (!predictedNeeds || predictedNeeds.flights.length === 0) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
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
      )}
    </div>
  );
};

export default Recommendations;