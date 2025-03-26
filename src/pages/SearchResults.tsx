import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, Clock, Star, ThumbsUp, Sun, Sunset, Moon } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';

// Interfaces
interface Flight {
  _id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
}

interface SearchData {
  from: string;
  to: string;
  date: string;
  passengers: string;
}

interface FlightWithScore extends Flight {
  aiScore: number;
  recommendation: string;
  timeCategory: string;
}

interface FilterState {
  timeCategories: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  prices: {
    [key: string]: boolean;
  };
  durations: {
    '2h': boolean;
    '2.5h': boolean;
    '3h': boolean;
  };
}

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flights = [], ...searchData } = location.state as { flights: Flight[] } & SearchData;
  
  const [enhancedFlights, setEnhancedFlights] = useState<FlightWithScore[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<FlightWithScore[]>([]);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [filters, setFilters] = useState<FilterState>({
    timeCategories: {
      morning: false,
      afternoon: false,
      evening: false,
      night: false
    },
    prices: {
      '3000': false,
      '4000': false,
      '5000': false,
      '6000': false,
      '7000': false
    },
    durations: {
      '2h': false,
      '2.5h': false,
      '3h': false
    }
  });

  // Initialize TensorFlow model
  useEffect(() => {
    const createModel = async () => {
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [3], units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 4, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
      });

      const dummyData = generateTrainingData();
      await trainModel(model, dummyData);
      setModel(model);
    };

    createModel();
    return () => {
      if (model) {
        model.dispose();
      }
    };
  }, []);

  const generateTrainingData = () => {
    const xs: number[][] = [];
    const ys: number[] = [];

    for (let i = 0; i < 100; i++) {
      const price = Math.random() * 900 + 100;
      const duration = Math.random() * 720;
      const departureHour = Math.random() * 24;
      
      const normalizedPrice = (price - 100) / 900;
      const normalizedDuration = duration / 720;
      const normalizedDepartureHour = departureHour / 24;

      xs.push([normalizedPrice, normalizedDuration, normalizedDepartureHour]);
      
      const score = (
        (1 - normalizedPrice) * 0.4 + 
        (1 - normalizedDuration) * 0.3 + 
        (departureHour >= 6 && departureHour <= 10 ? 1 : 0.5) * 0.3
      );
      
      ys.push(score);
    }

    return {
      xs: tf.tensor2d(xs),
      ys: tf.tensor1d(ys)
    };
  };

  const trainModel = async (model: tf.LayersModel, data: { xs: tf.Tensor2d; ys: tf.Tensor1d }) => {
    await model.fit(data.xs, data.ys, {
      epochs: 50,
      batchSize: 32
    });
    data.xs.dispose();
    data.ys.dispose();
  };

  const getTimeCategory = (hour: number): string => {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  useEffect(() => {
    if (!model || !flights.length) return;

    const processFlights = async () => {
      setIsLoading(true); // Start loading
      const processedFlights = await Promise.all(flights.map(async (flight) => {
        const [hours, mins] = flight.duration.split('h ').map(part => 
          parseInt(part.replace('m', '')) || 0
        );
        const durationMinutes = hours * 60 + mins;
        const departureHour = parseInt(flight.departureTime.split(':')[0]);

        const normalizedPrice = (flight.price - 100) / 900;
        const normalizedDuration = durationMinutes / 720;
        const normalizedDepartureHour = departureHour / 24;

        const inputTensor = tf.tensor2d(
          [[normalizedPrice, normalizedDuration, normalizedDepartureHour]]
        );

        const prediction = await model.predict(inputTensor) as tf.Tensor;
        const score = (await prediction.data())[0];
        
        inputTensor.dispose();
        prediction.dispose();

        let recommendation = '';
        if (normalizedPrice < 0.3) {
          recommendation = 'Best value for money';
        } else if (normalizedDuration < 0.3) {
          recommendation = 'Fastest route available';
        } else if (departureHour >= 6 && departureHour <= 10) {
          recommendation = 'Optimal departure time';
        } else {
          recommendation = 'Balanced choice';
        }

        return {
          ...flight,
          aiScore: score,
          recommendation,
          timeCategory: getTimeCategory(departureHour)
        };
      }));

      setEnhancedFlights(processedFlights.sort((a, b) => b.aiScore - a.aiScore));
      setIsLoading(false); // End loading
    };

    processFlights();
  }, [flights, model]);

  useEffect(() => {
    let filtered = [...enhancedFlights];

    // Apply time category filters
    const activeTimeCategories = Object.entries(filters.timeCategories)
      .filter(([_, isActive]) => isActive)
      .map(([category]) => category);

    if (activeTimeCategories.length > 0) {
      filtered = filtered.filter(flight => 
        activeTimeCategories.includes(flight.timeCategory)
      );
    }

    // Apply price filters
    const activePrices = Object.entries(filters.prices)
      .filter(([_, isActive]) => isActive)
      .map(([price]) => parseInt(price));

    if (activePrices.length > 0) {
      filtered = filtered.filter(flight => 
        activePrices.includes(flight.price)
      );
    }

    // Apply duration filters
    const activeDurations = Object.entries(filters.durations)
      .filter(([_, isActive]) => isActive)
      .map(([duration]) => duration);

    if (activeDurations.length > 0) {
      filtered = filtered.filter(flight => {
        const [hours] = flight.duration.split('h ').map(part => 
          parseFloat(part.replace('m', '')) || 0
        );
        const durationStr = hours === 2 ? '2h' : 
                           hours === 2.5 ? '2.5h' : 
                           hours === 3 ? '3h' : '';
        return activeDurations.includes(durationStr);
      });
    }

    setFilteredFlights(filtered);
  }, [enhancedFlights, filters]);

  const handleFilterChange = (
    category: 'timeCategories' | 'prices' | 'durations',
    value: string
  ) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [value]: !prev[category][value]
      }
    }));
  };

  const handleBooking = (flightId: string) => {
    const selectedFlight = flights.find((f) => f._id === flightId);
    if (selectedFlight) {
      navigate('/booking', {
        state: {
          ...searchData,
          flight: selectedFlight,
        },
      });
    }
  };

  const TimeCategoryIcon = ({ category }: { category: string }) => {
    switch (category) {
      case 'morning':
        return <Sun className="w-4 h-4" />;
      case 'afternoon':
        return <Sun className="w-4 h-4" />;
      case 'evening':
        return <Sunset className="w-4 h-4" />;
      case 'night':
        return <Moon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Flight Results</h2>
        
        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading flight results...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Time Category Filters */}
                <div>
                  <h4 className="font-medium mb-2">Time of Day</h4>
                  <div className="space-y-2">
                    {Object.entries(filters.timeCategories).map(([category, isChecked]) => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleFilterChange('timeCategories', category)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="flex items-center space-x-1">
                          <TimeCategoryIcon category={category} />
                          <span className="capitalize">{category}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filters */}
                <div>
                  <h4 className="font-medium mb-2">Price Range</h4>
                  <div className="space-y-2">
                    {Object.entries(filters.prices).map(([price, isChecked]) => (
                      <label key={price} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleFilterChange('prices', price)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>₹{price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Duration Filters */}
                <div>
                  <h4 className="font-medium mb-2">Flight Duration</h4>
                  <div className="space-y-2">
                    {Object.entries(filters.durations).map(([duration, isChecked]) => (
                      <label key={duration} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleFilterChange('durations', duration)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{duration}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Results */}
            <div className="space-y-4">
              {filteredFlights.map((flight, index) => (
                <div 
                  key={flight._id}
                  className={`bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${
                    index < 2 ? 'border-l-4 border-blue-500' : ''
                  }`}
                >
                  {index < 2 && (
                    <div className="flex items-center gap-2 mb-4 text-blue-600">
                      <ThumbsUp className="w-5 h-5" />
                      <span className="font-medium">{flight.recommendation}</span>
                      <div className="ml-2 flex items-center">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1">{(flight.aiScore * 5).toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <TimeCategoryIcon category={flight.timeCategory} />
                      <div>
                        <h3 className="font-semibold text-lg">{flight.airline}</h3>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{flight.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="font-semibold text-lg">{flight.departureTime}</p>
                        <p className="text-sm text-gray-600">{searchData.from}</p>
                      </div>
                      <Plane className="text-blue-600 transform rotate-45" />
                      <div className="text-center">
                        <p className="font-semibold text-lg">{flight.arrivalTime}</p>
                        <p className="text-sm text-gray-600">{searchData.to}</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{flight.price.toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleBooking(flight._id)}
                        className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors duration-200"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredFlights.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="max-w-md mx-auto">
                  <Plane className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Flights Found</h3>
                  <p className="text-gray-500">
                    No flights match your current filters. Try adjusting your filter criteria to see more results.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with flight count */}
      {!isLoading && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <p className="text-gray-600">
              Showing {filteredFlights.length} of {enhancedFlights.length} flights
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;