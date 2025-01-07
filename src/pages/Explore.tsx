import React from 'react';
import { Plane, Sun, Umbrella, Mountain, Map, Camera, Coffee, Utensils } from 'lucide-react';

export default function Explore() {
  const destinations = [
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

  const experiences = [
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

  const categories = [
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
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
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
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
}