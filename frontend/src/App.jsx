import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Atmosphere from './components/Atmosphere';
import Footer from './components/Footer';
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import Cart from './pages/Cart';

function App() {
  const whatsappUrl = "https://wa.me/917395832383?text=Hello%20AS%20Collections!%20🌿%20I%20would%20like%20to%20know%20more%20about%20your%20natural%20handmade%20products.";

  return (
    <Router>
      {/* Background theme layers, drifting fog & moving leaves/pollen */}
      <Atmosphere />
      
      {/* Glassmorphism Navigation bar */}
      <Navbar />
      
      {/* Page Routing */}
      <div className="main-content-wrapper" style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </div>

      {/* Floating Sticky Pulse WhatsApp Button */}
      <a 
        href={whatsappUrl}
        className="whatsapp-sticky pulse-icon"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
      >
        💬
      </a>

      {/* Forest-themed Footer */}
      <Footer />
    </Router>
  );
}

export default App;