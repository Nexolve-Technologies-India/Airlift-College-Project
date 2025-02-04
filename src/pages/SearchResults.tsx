import React, { useMemo, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plane, Clock, DollarSign, Star, ThumbsUp } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';

// Define proper interfaces for type safety
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
}

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flights = [], ...searchData } = location.state as { flights: Flight[] } & SearchData;
  const [enhancedFlights, setEnhancedFlights] = useState<FlightWithScore[]>([]);
  const [model, setModel] = useState<tf.LayersModel | null>(null);

  // Initialize TensorFlow model
  useEffect(() => {
    const createModel = async () => {
      // Create a simple neural network
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [3], units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 4, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      // Compile the model
      model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
      });

      // Train the model with some initial data
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

  // Generate dummy training data
  const generateTrainingData = () => {
    const xs: number[][] = [];
    const ys: number[] = [];

    // Generate 100 samples of training data
    for (let i = 0; i < 100; i++) {
      const price = Math.random() * 900 + 100; // 100-1000
      const duration = Math.random() * 720; // 0-12 hours in minutes
      const departureHour = Math.random() * 24; // 0-24 hours
      
      // Normalize values
      const normalizedPrice = (price - 100) / 900;
      const normalizedDuration = duration / 720;
      const normalizedDepartureHour = departureHour / 24;

      xs.push([normalizedPrice, normalizedDuration, normalizedDepartureHour]);
      
      // Calculate ideal score based on our criteria
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

  // Train the model
  const trainModel = async (model: tf.LayersModel, data: { xs: tf.Tensor2d; ys: tf.Tensor1d }) => {
    await model.fit(data.xs, data.ys, {
      epochs: 50,
      batchSize: 32
    });
    
    data.xs.dispose();
    data.ys.dispose();
  };

  // Process flights with TensorFlow model
  useEffect(() => {
    if (!model || !flights.length) return;

    const processFlights = async () => {
      const processedFlights = await Promise.all(flights.map(async (flight) => {
        // Convert duration to minutes
        const [hours, mins] = flight.duration.split('h ').map(part => 
          parseInt(part.replace('m', '')) || 0
        );
        const durationMinutes = hours * 60 + mins;

        // Get departure hour
        const departureHour = parseInt(flight.departureTime.split(':')[0]);

        // Normalize inputs
        const normalizedPrice = (flight.price - 100) / 900;
        const normalizedDuration = durationMinutes / 720;
        const normalizedDepartureHour = departureHour / 24;

        // Prepare input tensor
        const inputTensor = tf.tensor2d(
          [[normalizedPrice, normalizedDuration, normalizedDepartureHour]]
        );

        // Get prediction
        const prediction = await model.predict(inputTensor) as tf.Tensor;
        const score = (await prediction.data())[0];
        
        // Cleanup tensors
        inputTensor.dispose();
        prediction.dispose();

        // Determine recommendation
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
          recommendation
        };
      }));

      setEnhancedFlights(processedFlights.sort((a, b) => b.aiScore - a.aiScore));
    };

    processFlights();
  }, [flights, model]);

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Flight Results</h2>
      <div className="space-y-4">
        {enhancedFlights.map((flight, index) => (
          <div 
            key={flight._id} 
            className={`bg-white rounded-lg shadow-md p-6 ${
              index < 2 ? 'border-2 border-blue-500' : ''
            }`}
          >
            {index < 2 && (
              <div className="flex items-center gap-2 mb-3 text-blue-600">
                <ThumbsUp className="w-5 h-5" />
                <span className="font-medium">AI Recommended - {flight.recommendation}</span>
                <div className="ml-2 flex items-center">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1">{(flight.aiScore * 5).toFixed(1)}</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-lg">{flight.airline}</h3>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{flight.duration}</span>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <p className="font-semibold">{flight.departureTime}</p>
                  <p className="text-sm text-gray-600">{searchData.from}</p>
                </div>
                <Plane className="text-blue-600" />
                <div className="text-center">
                  <p className="font-semibold">{flight.arrivalTime}</p>
                  <p className="text-sm text-gray-600">{searchData.to}</p>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  <DollarSign className="inline w-5 h-5" />
                  {flight.price}
                </p>
                <button
                  onClick={() => handleBooking(flight._id)}
                  className="mt-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;