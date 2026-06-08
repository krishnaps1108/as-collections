import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import ReviewSection from '../components/ReviewSection';
import ProductDetailModal from '../components/ProductDetailModal';
import frontimg from "../assets/images/frontimg.jpeg"

function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const categories = ['All', 'Hair Care', 'Wellness', 'Nutrition', 'Herbal Foods', 'Soaps'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data);
        setFilteredProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by category
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  // Read deep link product ID from search parameters
  const queryProductId = searchParams.get('product');
  const detailProduct = queryProductId ? products.find(p => p._id === queryProductId) : null;

  return (
    <div className="container-fluid px-3 px-md-5 py-5 mt-5">
      
      {/* Deep Link Product Details Modal Overlay */}
      {detailProduct && (
        <ProductDetailModal 
          product={detailProduct} 
          onClose={() => setSearchParams({})} 
        />
      )}

      {/* Hero Welcome Banner */}
      <div className="glass-panel p-4 p-md-5 mb-5 fade-in-el" style={{ marginTop: '0px' }}>
        <div className="row align-items-center">
          {/* Left Column - Image */}
          <div className="col-12 col-lg-6 mb-4 mb-lg-0 text-center d-flex justify-content-center align-items-center">
            <img 
              src={frontimg}
              alt="AS Collections Logo" 
              className="img-fluid shadow-lg animate-hover"
              style={{ 
               width: '100%',
          maxWidth: '400px', 
          height: 'auto',
          aspectRatio: '1 / 1', 
          borderRadius: '50%',
          objectFit: 'contain',
          border: '6px solid var(--warm-beige)',
          boxShadow: '0 15px 35px rgba(45, 80, 22, 0.18)',
          transform: window.innerWidth > 768 ? 'scale(1.06)' : 'none',
                display: 'block'
              }}
            />
          </div>
          
          {/* Right Column - Text & Details */}
          <div className="col-12 col-lg-6 ps-lg-5 text-start">
            <span 
        className="badge bg-success mb-3 px-3 py-2 fs-6 rounded-pill d-inline-block text-wrap" 
        style={{ 
          backgroundColor: 'var(--primary-green)',
          lineHeight: '1.4' 
        }}
      >
        🌿 100% Organic & Natural Handmade Products
      </span>
            <h1 className="display-4 fw-bold mb-2">AS Collections</h1>
            <p className="tagline-font mb-3">Skin Glowing, Nature's Touch</p>
            <p className="fs-5 text-muted mb-4 lead" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
              We craft 100% natural, hand-pressed, herb-infused oils, wellness powders, and luxurious homemade soaps. Formulated traditional recipes that preserve the raw goodness of nature for your hair and skin.
            </p>
            
            <div className="d-flex flex-wrap gap-2 mt-2">
              <span className="detail-tag" style={{ backgroundColor: 'rgba(45, 80, 22, 0.1)', color: 'var(--primary-green)' }}>📍 Salem, Tamil Nadu</span>
              <span className="detail-tag" style={{ backgroundColor: 'rgba(45, 80, 22, 0.1)', color: 'var(--primary-green)' }}>📞 +91 7395 832 383</span>
              <span className="detail-tag" style={{ backgroundColor: 'rgba(45, 80, 22, 0.1)', color: 'var(--primary-green)' }}>🚚 India-Wide Shipping</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaf Divider */}
      <div className="leaf-divider">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17,8C8,20 4,21 3,21C3,21 3,20 4,17C8,4 20,3 21,3C21,3 20,4 17,8Z" />
        </svg>
      </div>

      {/* Catalog & Filter Section */}
      <div className="mb-5" id="catalog-section">
        <h2 className="display-6 fw-bold mb-2 text-center">Our Premium Organic Lineup</h2>
        <p className="text-center text-muted mb-4 max-w-600 mx-auto">
          Explore our range of traditional herbal soaps, cold-pressed oils, and health powders.
        </p>

        {/* Category Selector Tabs */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn px-4 py-2 rounded-pill fw-bold transition-smooth ${
                selectedCategory === cat
                  ? 'btn-success bg-success'
                  : 'btn-outline-success border-success'
              }`}
              style={{
                backgroundColor: selectedCategory === cat ? 'var(--primary-green)' : 'transparent',
                borderColor: 'var(--primary-green)',
                color: selectedCategory === cat ? 'var(--cream)' : 'var(--primary-green)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading products...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4 justify-content-center">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-12 text-center py-5">
                <p className="text-muted fs-5">No products found in this category.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Leaf Divider */}
      <div className="leaf-divider" id="about-section">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17,8C8,20 4,21 3,21C3,21 3,20 4,17C8,4 20,3 21,3C21,3 20,4 17,8Z" />
        </svg>
      </div>

      {/* About Section */}
      <div className="glass-panel p-4 p-md-5 mb-5 text-start">
        <div className="row align-items-center">
          <div className="col-12 col-md-8">
            <h2 className="fw-bold mb-3">About AS Collections</h2>
            <p className="text-muted" style={{ lineHeight: '1.7' }}>
              At AS Collections, we believe in the restorative powers of Mother Nature. Located in Salem, Tamil Nadu, we specialize in producing 100% chemical-free, natural soaps, oils, and nutritional powders. Every product is handcrafted with care using hand-picked herbs and oils, ensuring that your skin glows naturally and shines beautifully. Thank you for supporting our organic handmade journey!
            </p>
          </div>
          <div className="col-12 col-md-4 text-center mt-3 mt-md-0">
            <span className="fs-1">🍃 🧴 🧼</span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="glass-panel p-4 p-md-5">
        <ReviewSection />
      </div>
    </div>
  );
}

export default Home;
