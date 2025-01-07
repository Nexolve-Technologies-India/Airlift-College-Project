import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock } from 'lucide-react';
import { Flight } from '../apiService';
import { bookingService } from '../apiService';

interface PassengerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight, passenger, bookingId } = location.state as { flight: Flight; passenger: PassengerDetails; bookingId: string };
  const [loading, setLoading] = useState<boolean>(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate payment processing
      setTimeout(async () => {
        // Update booking status and payment status
        await bookingService.updateBookingStatus(bookingId, 'completed', 'confirmed');
        navigate('/ticket', { state: { flight, passenger, bookingId } });
      }, 2000);
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
          <div className="border-t border-b py-4">
            <div className="flex justify-between mb-2">
              <span>Flight Fare</span>
              <span>${flight.price}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Taxes & Fees</span>
              <span>${Math.round(flight.price * 0.1)}</span>
            </div>
            <div className="flex justify-between font-bold mt-4">
              <span>Total</span>
              <span>${flight.price + Math.round(flight.price * 0.1)}</span>
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
    </div>
  );
};

export default Payment;