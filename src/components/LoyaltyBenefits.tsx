// components/LoyaltyBenefits.tsx
import React, { useEffect, useState } from 'react';
import { Award, Star, Shield } from 'lucide-react';

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

interface Props {
  email: string;
}

const LoyaltyBenefits: React.FC<Props> = ({ email }) => {
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLoyaltyInfo = async () => {
      try {
        const response = await fetch(`http://localhost:5500/api/users/loyalty/${email}`);
        
        if (response.ok) {
          const data = await response.json();
          setLoyaltyInfo(data);
        } else {
          console.error('Failed to fetch loyalty info');
        }
      } catch (error) {
        console.error('Error fetching loyalty info:', error);
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchLoyaltyInfo();
    } else {
      setLoading(false);
    }
  }, [email]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-40 rounded-lg"></div>;
  }

  if (!loyaltyInfo) {
    return null;
  }

  const { loyaltyPoints, loyaltyTier, benefits } = loyaltyInfo;

  // Get tier color
  const getTierColor = () => {
    switch (loyaltyTier) {
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center mb-4">
        <Award className="mr-2 text-blue-600" />
        <h3 className="text-lg font-semibold">Your Loyalty Benefits</h3>
      </div>
      
      <div className="flex items-center mb-4">
        <div className={`px-3 py-1 rounded-full border ${getTierColor()} flex items-center mr-4`}>
          <Star className="w-4 h-4 mr-1" />
          <span className="font-semibold capitalize">{loyaltyTier}</span>
        </div>
        <div>
          <span className="text-gray-600 text-sm">Loyalty Points:</span>
          <span className="ml-2 font-semibold">{loyaltyPoints}</span>
        </div>
      </div>
      
      <div className="border-t pt-3">
        <h4 className="text-sm font-semibold mb-2 flex items-center">
          <Shield className="w-4 h-4 mr-1 text-blue-600" />
          Your Benefits
        </h4>
        
        <ul className="space-y-2 text-sm">
          {benefits.discountPercentage > 0 && (
            <li className="flex items-center">
              <span className="w-4 h-4 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2 text-xs">✓</span>
              <span>{benefits.discountPercentage}% discount on all flights</span>
            </li>
          )}
          {benefits.priorityBoarding && (
            <li className="flex items-center">
              <span className="w-4 h-4 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2 text-xs">✓</span>
              <span>Priority boarding</span>
            </li>
          )}
          {benefits.extraBaggage && (
            <li className="flex items-center">
              <span className="w-4 h-4 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2 text-xs">✓</span>
              <span>Extra baggage allowance</span>
            </li>
          )}
          {benefits.loungeAccess && (
            <li className="flex items-center">
              <span className="w-4 h-4 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2 text-xs">✓</span>
              <span>Airport lounge access</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default LoyaltyBenefits;