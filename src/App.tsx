import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'; // Added Link import
// import Footer from './components/Footer'; // Removed unused Navbar import
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Explore from './pages/Explore';
import SearchResults from './pages/SearchResults';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Ticket from './pages/Ticket';
import Recommendations from './pages/Recommendations';
import ChatBot from './components/ChatBot';
import LoginPage from './pages/LoginPage';

// Define the Layout component with TypeScript
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Define the SkyWings Navbar directly here */}
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">SkyWings</div>
          <div className="flex gap-6">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/explore" className="hover:underline">Explore</Link>
            <Link to="/for-you" className="hover:underline">For You</Link>
            <Link to="/about" className="hover:underline">About</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
            <Link to="/login" className="hover:underline">Login</Link> {/* Added Login Link */}
          </div>
        </div>
      </nav>
      <main className="flex-grow">{children}</main>
      <ChatBot />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;