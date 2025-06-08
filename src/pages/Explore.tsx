import React, { useState } from 'react';
import { Plane, Sun, Umbrella, Mountain, Map, Camera, Coffee, Utensils, X } from 'lucide-react';

// Define TypeScript interfaces
interface Destination {
  name: string;
  image: string;
  description: string;
  price: string;
  highlights: string[];
}

interface Experience {
  icon: React.ReactNode;
  name: string;
  description: string;
}

interface Category {
  icon: React.ReactNode;
  name: string;
  description: string;
  image: string;
}

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  passengers: number;
}

const Explore: React.FC = () => {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    passengers: 1,
  });
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string>('');

  // Destinations data
  const destinations: Destination[] = [
    {
      name: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      description: 'The city of love and lights',
      price: 'from $499',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame']
    },
    {
      name: 'Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      description: 'A blend of tradition and innovation',
      price: 'from $799',
      highlights: ['Mount Fuji', 'Shibuya Crossing', 'Imperial Palace']
    },
    {
      name: 'New York, USA',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      description: 'The city that never sleeps',
      price: 'from $299',
      highlights: ['Times Square', 'Central Park', 'Statue of Liberty']
    },
    {
      name: 'Dubai, UAE',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      description: 'Luxury in the desert',
      price: 'from $599',
      highlights: ['Burj Khalifa', 'Palm Jumeirah', 'Dubai Mall']
    },
    {
      name: 'Rome, Italy',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      description: 'Eternal city of history',
      price: 'from $449',
      highlights: ['Colosseum', 'Vatican City', 'Trevi Fountain']
    },
    {
      name: 'Sydney, Australia',
      image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      description: 'Where nature meets city',
      price: 'from $899',
      highlights: ['Opera House', 'Bondi Beach', 'Harbour Bridge']
    },
    {
      name: 'Machu Picchu, Peru',
      image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      description: 'Ancient wonder of the world',
      price: 'from $699',
      highlights: ['Inca Trail', 'Sacred Valley', 'Cusco']
    },
    {
      name: 'Bangkok, Thailand',
      image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      description: 'City of angels',
      price: 'from $399',
      highlights: ['Grand Palace', 'Wat Arun', 'Floating Markets']
    }
  ];

  const experiences: Experience[] = [
    {
      icon: <Map className="w-6 h-6" />,
      name: 'Guided Tours',
      description: 'Expert local guides'
    },
    {
      icon: <Camera className="w-6 h-6" />,
      name: 'Photo Spots',
      description: 'Instagram-worthy locations'
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      name: 'Local Cafes',
      description: 'Authentic experiences'
    },
    {
      icon: <Utensils className="w-6 h-6" />,
      name: 'Food Tours',
      description: 'Culinary adventures'
    }
  ];

  const categories: Category[] = [
    {
      icon: <Sun className="w-6 h-6" />,
      name: 'Beach Getaways',
      description: 'Relax on pristine beaches',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
    },
    {
      icon: <Mountain className="w-6 h-6" />,
      name: 'Mountain Escapes',
      description: 'Adventure in the heights',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
    },
    {
      icon: <Umbrella className="w-6 h-6" />,
      name: 'Tropical Paradise',
      description: 'Experience island life',
      image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
    },
    {
      icon: <Plane className="w-6 h-6" />,
      name: 'City Breaks',
      description: 'Explore urban culture',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
    }
  ];

  const handleBookNow = (destination: Destination): void => {
    setSelectedDestination(destination);
    setShowBookingModal(true);
    setBookingSuccess(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePassengerChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value) || 1;
    setBookingForm(prev => ({
      ...prev,
      passengers: Math.max(1, Math.min(10, value))
    }));
  };

  const handleSubmitBooking = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      // Extract numeric value from price string (e.g., "from $499" -> 499)
      const priceValue = parseInt(selectedDestination?.price.replace(/\D/g, '') || '0');
      
      const bookingData = {
        destination: selectedDestination?.name,
        ...bookingForm,
        totalAmount: priceValue * bookingForm.passengers,
        bookingDate: new Date().toISOString(),
        paymentStatus: 'pending',
        bookingStatus: 'confirmed'
      };

      // Simulate API call
      console.log('Submitting booking:', bookingData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock booking ID
      const mockBookingId = `TRV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      setBookingId(mockBookingId);
      setBookingSuccess(true);
      
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    }
  };

  const resetForm = (): void => {
    setBookingForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      passengers: 1,
    });
    setShowBookingModal(false);
    setBookingSuccess(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Book Your Trip</h3>
                <button 
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {!bookingSuccess ? (
                <>
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold">{selectedDestination?.name}</h4>
                    <p className="text-gray-600">{selectedDestination?.price}</p>
                  </div>
                  
                  <form onSubmit={handleSubmitBooking}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={bookingForm.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={bookingForm.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={bookingForm.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={bookingForm.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Passengers
                        </label>
                        <input
                          type="number"
                          id="passengers"
                          name="passengers"
                          min="1"
                          max="10"
                          value={bookingForm.passengers}
                          onChange={handlePassengerChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                      >
                        Confirm Booking
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-green-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-600 mb-4">Your trip to {selectedDestination?.name} has been booked successfully.</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">Booking ID: {bookingId}</p>
                  <button
                    onClick={resetForm}
                    className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div 
        className="h-[400px] rounded-xl bg-cover bg-center relative mb-16"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl">
          <div className="h-full flex items-center justify-center text-center">
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-4">Explore Amazing Destinations</h1>
              <p className="text-xl max-w-2xl">
                Discover new places and create unforgettable memories with our curated travel experiences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Travel Categories</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="h-48 relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30">
                  <div className="h-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="bg-white bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <div className="text-white">{category.icon}</div>
                      </div>
                      <h3 className="text-xl font-semibold">{category.name}</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experiences */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Travel Experiences</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {experiences.map((experience, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <div className="text-blue-600">{experience.icon}</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{experience.name}</h3>
              <p className="text-gray-600">{experience.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Destinations */}
      <div>
        <h2 className="text-3xl font-bold mb-8">Featured Destinations</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {destinations.map((destination, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{destination.name}</h3>
                <p className="text-gray-600 mb-4">{destination.description}</p>
                <div className="space-y-2 mb-4">
                  {destination.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-600">
                      <div className="w-1 h-1 bg-blue-600 rounded-full mr-2"></div>
                      {highlight}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-semibold">{destination.price}</span>
                  <button 
                    onClick={() => handleBookNow(destination)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    aria-label={`Book ${destination.name}`}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;