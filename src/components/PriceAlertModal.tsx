// components/PriceAlertModal.tsx
import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  from: string;
  to: string;
  email: string;
}

const PriceAlertModal: React.FC<Props> = ({ isOpen, onClose, from, to, email }) => {
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:5500/api/users/price-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          from,
          to,
          maxPrice,
          startDate,
          endDate,
        }),
      });

      if (response.ok) {
       setSuccess(true);
       setTimeout(() => {
         onClose();
       }, 2000);
     } else {
       const data = await response.json();
       setError(data.error || 'Failed to create price alert');
     }
   } catch (error) {
     setError('Network error. Please try again.');
   } finally {
     setLoading(false);
   }
 };

 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
     <div className="bg-white rounded-lg w-full max-w-md p-6">
       <div className="flex justify-between items-center mb-4">
         <h3 className="text-lg font-semibold flex items-center">
           <Bell className="mr-2 text-blue-600" />
           Set Price Alert
         </h3>
         <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
           <X />
         </button>
       </div>
       
       {success ? (
         <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
           Price alert created successfully! We'll notify you when prices drop.
         </div>
       ) : (
         <form onSubmit={handleSubmit}>
           <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Route
             </label>
             <div className="bg-gray-100 p-2 rounded text-gray-800">
               {from} → {to}
             </div>
           </div>
           
           <div className="mb-4">
             <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
               Maximum Price (₹)
             </label>
             <input
               type="number"
               id="maxPrice"
               value={maxPrice}
               onChange={(e) => setMaxPrice(Number(e.target.value))}
               className="w-full border border-gray-300 rounded p-2"
               min="1000"
               required
             />
           </div>
           
           <div className="grid grid-cols-2 gap-4 mb-4">
             <div>
               <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                 Start Date
               </label>
               <input
                 type="date"
                 id="startDate"
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="w-full border border-gray-300 rounded p-2"
                 required
               />
             </div>
             <div>
               <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                 End Date
               </label>
               <input
                 type="date"
                 id="endDate"
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="w-full border border-gray-300 rounded p-2"
                 required
               />
             </div>
           </div>
           
           {error && (
             <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
               {error}
             </div>
           )}
           
           <button
             type="submit"
             className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
               loading ? 'opacity-70 cursor-not-allowed' : ''
             }`}
             disabled={loading}
           >
             {loading ? 'Creating Alert...' : 'Create Alert'}
           </button>
         </form>
       )}
     </div>
   </div>
 );
};

export default PriceAlertModal;