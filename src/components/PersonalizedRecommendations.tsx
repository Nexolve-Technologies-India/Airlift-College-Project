// components/PersonalizedRecommendations.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Sparkles } from 'lucide-react';

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

interface Props {
  email: string;
}

const PersonalizedRecommendations: React.FC<Props> = ({ email }) => {
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`http://localhost:5500/api/recommendations/personalized/${email}`);
        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [email]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-60 rounded-lg"></div>;
  }

  if (!recommendations || recommendations.flights.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center mb-4">
        {recommendations.type === 'personalized' ? (
         <Sparkles className="mr-2 text-blue-600" />
       ) : (
         <TrendingUp className="mr-2 text-blue-600" />
       )}
       <h3 className="text-lg font-semibold">
         {recommendations.type === 'personalized' ? 'Just For You' : 'Popular Flights'}
       </h3>
     </div>
     
     <p className="text-sm text-gray-600 mb-3">
       {recommendations.message}
     </p>
     
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
       {recommendations.flights.slice(0, 3).map((flight) => (
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
           <div className="text-xs text-gray-500 my-2">
             {new Date(flight.date).toLocaleDateString()}
           </div>
           <Link 
             to={`/booking?flightId=${flight._id}`} 
             className="block text-center text-sm bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition"
           >
             Book Now
           </Link>
         </div>
       ))}
     </div>
   </div>
 );
};

export default PersonalizedRecommendations;