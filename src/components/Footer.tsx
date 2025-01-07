import React from 'react';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">SkyWings</h3>
            <p className="text-gray-400">Your trusted partner for seamless flight bookings.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
              <li><a href="/explore" className="text-gray-400 hover:text-white">Explore Flights</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@skywings.com</li>
              <li>Phone: +1 234 567 890</li>
              <li>Address: 123 Aviation Street</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400"><Facebook /></a>
              <a href="#" className="hover:text-blue-400"><Twitter /></a>
              <a href="#" className="hover:text-blue-400"><Instagram /></a>
              <a href="#" className="hover:text-blue-400"><Mail /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2024 SkyWings. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}