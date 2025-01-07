import React from 'react';
import { useLocation } from 'react-router-dom';
import { Plane, User, Phone, Mail, MapPin } from 'lucide-react';
import { Flight } from '../apiService';

interface PassengerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const Ticket: React.FC = () => {
  const location = useLocation();
  const { flight, passenger } = location.state as { flight: Flight; passenger: PassengerDetails };

  const handleDownloadTicket = () => {
    // Implement ticket download logic
    alert('Downloading ticket...');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Boarding Pass</h2>
            <div className="flex items-center space-x-2">
              <Plane className="text-blue-600" />
              <span className="font-semibold">{flight.airline}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Passenger</h3>
            <div className="flex items-center space-x-2">
              <User className="text-gray-400" />
              <p className="font-semibold">{passenger.name}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Seat Number</h3>
            <p className="font-semibold">A1</p> {/* Replace with actual seat number */}
          </div>
        </div>

        <div className="my-6 flex items-center justify-between">
          <div className="text-center">
            <h3 className="text-sm text-gray-600 mb-1">From</h3>
            <p className="font-bold text-xl">{flight.from}</p>
            <p className="text-gray-600">{flight.departureTime}</p>
          </div>
          <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-4 relative">
            <Plane className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-blue-600" />
          </div>
          <div className="text-center">
            <h3 className="text-sm text-gray-600 mb-1">To</h3>
            <p className="font-bold text-xl">{flight.to}</p>
            <p className="text-gray-600">{flight.arrivalTime}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Contact Details</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="text-gray-400" />
                <p>{passenger.phone}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="text-gray-400" />
                <p>{passenger.email}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Address</h3>
            <div className="flex items-center space-x-2">
              <MapPin className="text-gray-400" />
              <p>{passenger.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleDownloadTicket}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Download Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ticket;