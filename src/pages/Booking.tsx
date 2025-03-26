import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Award } from 'lucide-react';
import { Flight } from '../apiService';
import { bookingService, userService } from '../apiService';
import LoyaltyBenefits from '../components/LoyaltyBenefits';

interface PassengerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface LoyaltyInfo {
  loyaltyPoints: number;
  loyaltyTier: string;
  benefits: {
    discountPercentage: number;
    priorityBoarding: boolean;
    extraBaggage: boolean;
    loungeAccess: boolean;
  };
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
  
  // New states for behavior tracking
  const [userEmail, setUserEmail] = useState<string>('');
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [displayPrice, setDisplayPrice] = useState<number>(flight.price);

  // Fetch loyalty info on load
  useEffect(() => {
    // In a real app, you'd get this from auth service
    const email = localStorage.getItem('userEmail') || 'demo@example.com';
    setUserEmail(email);
    setFormData(prev => ({ ...prev, email }));
    
    // Get loyalty info
    const fetchLoyaltyInfo = async () => {
      try {
        const info = await userService.getLoyaltyInfo(email);
        setLoyaltyInfo(info);
        
        // Calculate discounted price if user has benefits
        if (info && info.benefits.discountPercentage > 0) {
          const discountedPrice = flight.price - (flight.price * info.benefits.discountPercentage / 100);
          setDisplayPrice(Math.round(discountedPrice));
        }
      } catch (error) {
        console.error('Error fetching loyalty info:', error);
      }
    };
    
    fetchLoyaltyInfo();
  }, [flight.price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bookingData = {
      flightId: flight._id,
      passengerDetails: {
        ...formData,
        email: userEmail, // Use the tracked email
      },
      totalAmount: displayPrice, // Use the possibly discounted price
      seatNumber: generateSeatNumber(), // Generate seat number on the frontend
    };
    
    try {
      // Call the API to create a booking
      const createdBooking = await bookingService.create(bookingData);
      
      // Update loyalty points if we have user info
      if (userEmail) {
        await userService.updateLoyaltyPoints(userEmail, displayPrice);
      }
      
      // Navigate to the payment page with booking ID
      navigate('/payment', { 
        state: { 
          flight: { ...flight, price: displayPrice }, // Use the discounted price
          passenger: formData, 
          bookingId: createdBooking._id,
          userEmail
        } 
      });
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
      
      {/* Display loyalty benefits if available */}
      {loyaltyInfo && <LoyaltyBenefits email={userEmail} />}
      
      {/* Flight summary with loyalty discount */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Flight Summary</h3>
        <div className="flex justify-between mb-2">
          <span>{flight.airline} - {flight.flightNumber}</span>
          <span>{new Date(flight.date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>{flight.from} → {flight.to}</span>
          <span>{flight.departureTime} - {flight.arrivalTime}</span>
        </div>
        
        {/* Price with loyalty discount */}
        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between font-semibold">
            <span>Original Price:</span>
            <span>₹{flight.price}</span>
          </div>
          
          {loyaltyInfo && loyaltyInfo.benefits.discountPercentage > 0 && (
            <div className="flex justify-between text-green-600 mt-2">
              <span className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                {loyaltyInfo.loyaltyTier} Member Discount ({loyaltyInfo.benefits.discountPercentage}%):
              </span>
              <span>-₹{Math.round(flight.price * loyaltyInfo.benefits.discountPercentage / 100)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Final Price:</span>
            <span>₹{displayPrice}</span>
          </div>
        </div>
      </div>
      
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