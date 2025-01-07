import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Explore from './pages/Explore';
import SearchResults from './pages/SearchResults';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Ticket from './pages/Ticket';
import ChatBot from './components/ChatBot';

// Define the Layout component with TypeScript
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
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
          <Route path="/ticket" element={<Ticket />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;