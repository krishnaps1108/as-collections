import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve user info from local storage
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Handle shrink on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update cart count badge
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(count);
  };

  useEffect(() => {
    updateCartCount();
    // Poll or listen to storage changes
    window.addEventListener('storage', updateCartCount);
    const interval = setInterval(updateCartCount, 1000); // Poll as fallback
    return () => {
      window.removeEventListener('storage', updateCartCount);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  // Scroll to catalog section if on home page, otherwise navigate home
  const handleScrollToProducts = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const catalogEl = document.getElementById('catalog-section');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  const handleScrollToAbout = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const aboutEl = document.getElementById('about-section');
      if (aboutEl) {
        aboutEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const aboutEl = document.getElementById('about-section');
        if (aboutEl) {
          aboutEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg transition-smooth ${
      scrolled 
        ? 'py-2 shadow-lg' 
        : 'py-3'
    }`} style={{
      backgroundColor: scrolled ? 'rgba(45, 80, 22, 0.82)' : 'rgba(45, 80, 22, 0.82)',
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '2.5px solid var(--warm-beige)',
      zIndex: 1050,
      transition: 'all 0.4s ease'
    }}>
      <div className="container px-3">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="fs-3">🌿</span>
       <span className="fw-bold m-0" style={{ color: '#E1C699', fontSize: '1.8rem',fontFamily:"popins" }}>
  AS Collections
</span>
        </Link>
        
        <button 
          className="navbar-toggler border-0 text-white" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Main Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-semibold text-center text-lg-start ps-lg-4">
            <li className="nav-item">
              <Link className="nav-link text-white-50 hover-link px-3" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white-50 hover-link px-3" href="#products" onClick={handleScrollToProducts}>Products</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white-50 hover-link px-3" href="#about" onClick={handleScrollToAbout}>About</a>
            </li>
          </ul>

          {/* Right Links */}
          <div className="d-flex flex-column flex-lg-row align-items-center gap-3">
            {/* Phone Pulse Link */}
            <a 
              href="tel:+917395832383" 
              className="d-flex align-items-center gap-2 text-decoration-none text-white fw-bold px-3 py-1.5 rounded-pill pulse-icon" 
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1.5px solid var(--warm-beige)' }}
            >
              <span>📞</span>
              <span className="fs-6">+91 7395 832 383</span>
            </a>

            {/* Shopping Cart Link */}
            <Link 
              className="position-relative d-flex align-items-center gap-2 text-decoration-none text-white fw-semibold px-3" 
              to="/cart"
            >
              <span className="fs-4">🛒</span>
              <span className="d-lg-none">Cart</span>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-danger border border-light" style={{ fontSize: '0.75rem' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Login / Dashboard Link */}
            {token ? (
              <div className="d-flex align-items-center gap-2">
                {user && user.role === 'admin' ? (
                  <Link className="btn btn-outline-light rounded-pill px-3 py-1.5 fw-bold" to="/admin">Admin Dashboard</Link>
                ) : user && user.role === 'seller' ? (
                  <Link className="btn btn-outline-light rounded-pill px-3 py-1.5 fw-bold" to="/seller">Seller Dashboard</Link>
                ) : (
                  <span className="text-white-50 small me-2">Hi, {user ? user.name : 'User'}</span>
                )}
                <button onClick={handleLogout} className="btn btn-sm btn-danger rounded-pill px-3 py-1.5">Log Out</button>
              </div>
            ) : (
              <Link 
                className="btn btn-outline-light rounded-pill px-4 py-1.5 fw-bold hover-green-fill" 
                to="/login"
                style={{ transition: 'all 0.3s' }}
              >
                Login / My Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;