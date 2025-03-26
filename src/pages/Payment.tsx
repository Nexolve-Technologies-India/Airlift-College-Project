import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Award } from 'lucide-react';
import { Flight } from '../apiService';
import { bookingService, userService } from '../apiService';
import FeedbackForm from '../components/FeedbackForm';

interface PassengerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight, passenger, bookingId, userEmail } = location.state as { 
    flight: Flight; 
    passenger: PassengerDetails; 
    bookingId: string;
    userEmail?: string;
  };
  const [loading, setLoading] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [loyaltyResult, setLoyaltyResult] = useState<any>(null);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate payment processing
      setTimeout(async () => {
        // Update booking status and payment status
        await bookingService.updateBookingStatus(bookingId, 'completed', 'confirmed');
        
        // Update loyalty points if we have user email
        if (userEmail) {
          const result = await userService.updateLoyaltyPoints(userEmail, flight.price);
          setLoyaltyResult(result);
        }
        
        setCompleted(true);
        
        // Redirect to ticket page after 2 seconds
        setTimeout(() => {
          navigate('/ticket', { 
            state: { 
              flight, 
              passenger, 
              bookingId,
              loyaltyResult
            } 
          });
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
      
      {completed ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">Your booking has been confirmed.</p>
          
          {loyaltyResult && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4 inline-block">
              <div className="flex items-center text-blue-800">
                <Award className="w-5 h-5 mr-2" />
                <span className="font-semibold">You earned {loyaltyResult.pointsAdded} loyalty points!</span>
              </div>
              {loyaltyResult.tier !== 'standard' && (
                <p className="text-sm text-blue-700 mt-1">
                  Enjoy your {loyaltyResult.tier} benefits on your next booking.
                </p>
              )}
            </div>
          )}
          
          <p className="text-sm text-gray-500">Redirecting to your e-ticket...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
            <div className="border-t border-b py-4">
              <div className="flex justify-between mb-2">
                <span>Flight Fare</span>
                <span>₹{flight.price}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Taxes & Fees</span>
                <span>₹{Math.round(flight.price * 0.1)}</span>
              </div>
              <div className="flex justify-between font-bold mt-4">
                <span>Total</span>
                <span>₹{flight.price + Math.round(flight.price * 0.1)}</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Card Number</label>
              <div className="mt-1 relative">
                <CreditCard className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  className="pl-10 w-full rounded-md border border-gray-300 p-2"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
               <input
                 type="text"
                 required
                 className="mt-1 w-full rounded-md border border-gray-300 p-2"
                 placeholder="MM/YY"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700">CVV</label>
               <div className="mt-1 relative">
                 <Lock className="absolute left-3 top-3 text-gray-400" />
                 <input
                   type="text"
                   required
                   className="pl-10 w-full rounded-md border border-gray-300 p-2"
                   placeholder="123"
                 />
               </div>
             </div>
           </div>
           <button
             type="submit"
             disabled={loading}
             className={`w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition ${
               loading ? 'opacity-50 cursor-not-allowed' : ''
             }`}
           >
             {loading ? 'Processing...' : 'Pay Now'}
           </button>
         </form>
       </div>
     )}
     
     {/* Add feedback form after payment is completed */}
     {completed && userEmail && (
       <FeedbackForm 
         email={userEmail} 
         bookingId={bookingId}
         feedbackType="booking"
       />
     )}
   </div>
 );
};

export default Payment;