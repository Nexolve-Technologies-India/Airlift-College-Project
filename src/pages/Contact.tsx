import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Have questions? We're here to help and answer any question you might have.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-gray-600">support@skywings.com</p>
                <p className="text-gray-600">info@skywings.com</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Phone className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Phone</h3>
                <p className="text-gray-600">+1 (234) 567-8900</p>
                <p className="text-gray-600">+1 (234) 567-8901</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <MapPin className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Address</h3>
                <p className="text-gray-600">
                  123 Aviation Street<br />
                  New York, NY 10001<br />
                  United States
                </p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mt-8">
            <div className="bg-gray-200 w-full h-64 rounded-lg">
              {/* Map placeholder */}
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Map Integration
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                className="w-full rounded-md border border-gray-300 p-2"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full rounded-md border border-gray-300 p-2"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                className="w-full rounded-md border border-gray-300 p-2"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                required
                rows={6}
                className="w-full rounded-md border border-gray-300 p-2"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}