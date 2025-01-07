import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Flight } from '../apiService';
import { bookingService } from '../apiService';

interface PassengerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const Booking: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight } = location.state as { flight: Flight };
  const [formData, setFormData] = useState<PassengerDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bookingData = {
      flightId: flight._id,
      passengerDetails: formData,
      totalAmount: flight.price + Math.round(flight.price * 0.1), // Include total amount
      seatNumber: generateSeatNumber(), // Generate seat number on the frontend
    };
    try {
      // Call the API to create a booking
      const createdBooking = await bookingService.create(bookingData);
      // Navigate to the payment page with booking ID
      navigate('/payment', { state: { flight, passenger: formData, bookingId: createdBooking._id } });
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  // Generate a random seat number (e.g., A1, B2, C3)
  const generateSeatNumber = (): string => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const randomNumber = Math.floor(Math.random() * 30) + 1; // Random seat number between 1 and 30
    return `${randomLetter}${randomNumber}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Passenger Details</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <div className="mt-1 relative">
              <User className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                className="pl-10 w-full rounded-md border border-gray-300 p-2"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                required
                className="pl-10 w-full rounded-md border border-gray-300 p-2"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <div className="mt-1 relative">
              <Phone className="absolute left-3 top-3 text-gray-400" />
              <input
                type="tel"
                required
                className="pl-10 w-full rounded-md border border-gray-300 p-2"
                placeholder="1234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <div className="mt-1 relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" />
              <textarea
                required
                className="pl-10 w-full rounded-md border border-gray-300 p-2"
                placeholder="123 Main St, New York, NY 10001"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
            >
              Proceed to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;