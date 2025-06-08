import React from 'react';
import { Plane, Clock } from 'lucide-react';

interface FlightCardProps {
  flight: {
    _id: string;
    airline: string;
    flightNumber: string;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    date: string;
  };
  onClick: () => void;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onClick }) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div 
      className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{flight.airline}</h3>
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {flight.flightNumber}
        </span>
      </div>
      
      <div className="flex items-center justify-between my-3">
        <div className="text-center">
          <p className="font-bold text-xl">{flight.from}</p>
          <p className="text-sm text-gray-600">{flight.departureTime}</p>
        </div>
        
        <div className="flex flex-col items-center mx-2">
          <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
          <div className="relative">
            <div className="h-px w-16 bg-gray-300"></div>
            <Plane className="absolute -top-2 -right-2 text-blue-500 transform rotate-45" size={16} />
          </div>
        </div>
        
        <div className="text-center">
          <p className="font-bold text-xl">{flight.to}</p>
          <p className="text-sm text-gray-600">{flight.arrivalTime}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-3 border-t">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="mr-1" size={14} />
          <span>{formatDate(flight.date)}</span>
        </div>
        <div className="font-bold text-lg">₹{flight.price.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default FlightCard;