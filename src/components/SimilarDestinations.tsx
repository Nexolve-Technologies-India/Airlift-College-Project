// components/SimilarDestinations.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

interface Props {
  destination: string;
}

const SimilarDestinations: React.FC<Props> = ({ destination }) => {
  const [similarDestinations, setSimilarDestinations] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSimilarDestinations = async () => {
      try {
        const response = await fetch(`http://localhost:5500/api/users/similar-destinations/${destination}`);
        const data = await response.json();
        setSimilarDestinations(data.similarDestinations || []);
      } catch (error) {
        console.error('Error fetching similar destinations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (destination) {
      fetchSimilarDestinations();
    } else {
      setLoading(false);
    }
  }, [destination]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>;
  }

  if (similarDestinations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center mb-4">
        <MapPin className="mr-2 text-blue-600" />
        <h3 className="text-lg font-semibold">Similar Destinations</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        If you like {destination}, you might also be interested in these destinations:
      </p>
      
      <div className="flex flex-wrap gap-2">
        {similarDestinations.map((city) => (
          <Link
            key={city}
            to={`/search?from=${destination}&to=${city}`}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition"
          >
            {city}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarDestinations;