import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Menu, X, User, Phone, Info } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Plane className="h-8 w-8" />
            <span className="font-bold text-xl">SkyWings</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-blue-200 transition">Home</Link>
            <Link to="/explore" className="hover:text-blue-200 transition">Explore</Link>
            <Link to="/about" className="hover:text-blue-200 transition">About</Link>
            <Link to="/contact" className="hover:text-blue-200 transition">Contact</Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 hover:bg-blue-700 rounded">Home</Link>
            <Link to="/explore" className="block px-3 py-2 hover:bg-blue-700 rounded">Explore</Link>
            <Link to="/about" className="block px-3 py-2 hover:bg-blue-700 rounded">About</Link>
            <Link to="/contact" className="block px-3 py-2 hover:bg-blue-700 rounded">Contact</Link>
          </div>
        </div>
      )}
    </nav>
  );
}