import React from 'react';
import { Shield, Users, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About SkyWings</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted partner in air travel, making your journey comfortable and memorable since 2024.
        </p>
      </div>

      {/* Mission Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-4">
            At SkyWings, we're committed to making air travel accessible, comfortable, and enjoyable for everyone. 
            We believe in connecting people with their destinations while providing exceptional service at competitive prices.
          </p>
          <p className="text-gray-600">
            Our team of dedicated professionals works tirelessly to ensure that every booking is handled with care and attention to detail.
          </p>
        </div>
        <div>
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Airport Terminal"
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-blue-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Trust & Reliability</h3>
            <p className="text-gray-600">
              We prioritize your safety and security in every booking we handle.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-blue-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Customer First</h3>
            <p className="text-gray-600">
              Your satisfaction is our top priority, and we're here to serve you 24/7.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="text-blue-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
            <p className="text-gray-600">
              Connect to hundreds of destinations worldwide with our extensive network.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'John Smith',
              role: 'CEO',
              image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
            },
            {
              name: 'Sarah Johnson',
              role: 'Head of Operations',
              image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
            },
            {
              name: 'Michael Chen',
              role: 'Customer Service Director',
              image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
            }
          ].map((member, index) => (
            <div key={index} className="text-center">
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}