import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

function ProductDetailModal({ product, onClose }) {
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState(
    hasVariants ? product.variants[0] : null
  );

  // Manage age-verification status
  const [ageVerified, setAgeVerified] = useState(() => {
    return localStorage.getItem('age-verified-18') === 'true';
  });

  // Particle explosion state for leaves blast
  const [particles, setParticles] = useState([]);

  const currentPrice = hasVariants ? selectedVariant.price : product.price;
  const currentSize = hasVariants ? selectedVariant.size : 'Standard';

  // Trigger leaves blast at button click coordinates
  const triggerLeafBlast = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticles = Array.from({ length: 15 }).map((_, i) => {
      const angle = Math.random() * 360;
      const distance = 40 + Math.random() * 70;
      const tx = Math.cos(angle * Math.PI / 180) * distance;
      const ty = Math.sin(angle * Math.PI / 180) * distance;
      const tr = 180 + Math.random() * 360;
      const colorClass = `color-${1 + Math.floor(Math.random() * 3)}`;
      return {
        id: `${Date.now()}-${i}-${Math.random()}`,
        x,
        y,
        tx: `${tx}px`,
        ty: `${ty}px`,
        tr: `${tr}deg`,
        colorClass
      };
    });

    setParticles(prev => [...prev, ...newParticles]);

    // Clean up particles after animation completes
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 850);
  };

  const handleAddToCart = (e) => {
    triggerLeafBlast(e);

    // Verify age if needed
    if (product.isAdult && !ageVerified) {
      triggerAgeVerification(() => executeAddToCart());
    } else {
      executeAddToCart();
    }
  };

  const executeAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if variant matches
    const existingIndex = cart.findIndex(item => 
      item._id === product._id && 
      (hasVariants ? item.selectedSize === currentSize : true)
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        price: currentPrice,
        image: product.image,
        category: product.category,
        selectedSize: currentSize,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    Swal.fire({
      title: 'Added to Cart! 🌿',
      text: `${product.name} (${currentSize}) added successfully.`,
      icon: 'success',
      timer: 1600,
      showConfirmButton: false,
      background: '#FDF6E3',
      iconColor: '#2D5016'
    });
    
    // Close the detail overlay modal
    onClose();
  };

  const triggerAgeVerification = (callback) => {
    Swal.fire({
      title: 'Age Verification Required',
      text: 'This product contains ingredients suitable for adults (18+). Are you 18 or older?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, I am 18+',
      cancelButtonText: 'No, exit',
      confirmButtonColor: '#2D5016',
      cancelButtonColor: '#dc3545',
      background: '#FDF6E3'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem('age-verified-18', 'true');
        setAgeVerified(true);
        if (callback) callback();
      }
    });
  };

  const handleWhatsAppCheckout = async (e) => {
    triggerLeafBlast(e);

    if (product.isAdult && !ageVerified) {
      triggerAgeVerification(() => executeWhatsAppCheckout());
    } else {
      executeWhatsAppCheckout();
    }
  };

  const executeWhatsAppCheckout = async () => {
    const userString = localStorage.getItem('user');
    let user = null;
    if (userString && userString !== 'undefined' && userString !== 'null') {
      try {
        user = JSON.parse(userString);
      } catch (e) {
        console.error(e);
      }
    }
    const name = user ? user.name : 'Guest';
    const phone = user ? user.phone : '';

    const shareUrl = `${window.location.origin}/?product=${product._id}${hasVariants ? `&variant=${currentSize}` : ''}`;

    // Log order intent in backend
    try {
      await axios.post('/api/orders/whatsapp-log', {
        name,
        phone,
        cartItems: [{
          name: product.name,
          price: currentPrice,
          size: currentSize,
          category: product.category,
          quantity: 1
        }]
      });
    } catch (err) {
      console.error('Error logging WhatsApp checkout intent:', err);
    }

    // Construct WhatsApp message with specific variant deep link
    const msg = `Hello AS Collections! 🌿\n\nI'd like to order:\n*${product.name}* - ${currentSize} @ ₹${currentPrice}\n\n🔗 *Product Details:* ${shareUrl}\n\nPlease confirm availability. Thank you!`;
    const url = `https://wa.me/917395832383?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
      style={{ backgroundColor: 'rgba(45, 80, 22, 0.65)', backdropFilter: 'blur(12px)', zIndex: 1100 }}
      onClick={onClose}
    >
      <div 
        className="card p-4 border-0 shadow-lg text-start" 
        style={{ 
          maxWidth: '780px', 
          width: '92%', 
          borderRadius: '24px', 
          backgroundColor: 'var(--cream)', 
          border: '2px solid var(--primary-green)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
          <h4 className="fw-bold m-0 text-success">🌿 Product Details</h4>
          <button onClick={onClose} className="btn-close" aria-label="Close"></button>
        </div>

        <div className="row g-4 align-items-stretch">
          {/* Left Column - Image */}
          <div className="col-12 col-md-5">
            <div className="position-relative overflow-hidden rounded-4 h-100" style={{ minHeight: '260px' }}>
              <div className="brand-label-overlay">{product.label || 'AS Collections'}</div>
              {product.isAdult && !ageVerified && <span className="adult-badge">18+ Only</span>}
              <img 
                src={product.image} 
                alt={product.name} 
                className={`w-100 h-100 object-fit-cover transition-smooth ${product.isAdult && !ageVerified ? 'blurred-image' : ''}`} 
              />
              {product.isAdult && !ageVerified && (
                <div 
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-center p-3"
                  style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                  onClick={() => triggerAgeVerification()}
                >
                  <button className="btn btn-sm btn-light fw-bold rounded-pill">Verify Age to View</button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Text Details */}
          <div className="col-12 col-md-7 d-flex flex-column justify-content-between">
            <div>
              <h3 className="fw-bold text-success mb-1">{product.name}</h3>
              <p className="text-muted small mb-2">{product.category}</p>
              <p className="text-muted mb-3" style={{ fontSize: '0.92rem', lineHeight: '1.5' }}>
                {product.description || 'Traditional organic product crafted for ultimate natural nourishment and skin restoration.'}
              </p>

              {/* Ingredients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="mb-3">
                  <h6 className="fw-bold small text-success-emphasis mb-1">Key Ingredients:</h6>
                  <div className="d-flex flex-wrap gap-1.5">
                    {product.ingredients.map(ing => (
                      <span key={ing} className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1" style={{ fontSize: '0.75rem' }}>
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants Selector */}
              {hasVariants && (
                <div className="mb-3">
                  <h6 className="fw-bold small text-success-emphasis mb-2">Select Size:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.size}
                        onClick={() => setSelectedVariant(v)}
                        className={`variant-pill py-1.5 px-3.5 ${selectedVariant.size === v.size ? 'active' : ''}`}
                        style={{ fontSize: '0.85rem' }}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fs-3 fw-bold text-success">₹{currentPrice}</span>
                <span className="text-muted small fw-semibold">Nature's choice 💚</span>
              </div>

              {/* Action Buttons with Leaves Blast Particles */}
              <div className="d-flex flex-column flex-sm-row gap-2 mt-auto" style={{ position: 'relative', overflow: 'visible' }}>
                
                {/* Particle Overlay */}
                {particles.map(p => (
                  <svg
                    key={p.id}
                    className={`leaf-blast-particle ${p.colorClass}`}
                    style={{
                      left: p.x,
                      top: p.y,
                      '--tx': p.tx,
                      '--ty': p.ty,
                      '--tr': p.tr
                    }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M17,8C8,20 4,21 3,21C3,21 3,20 4,17C8,4 20,3 21,3C21,3 20,4 17,8Z" />
                  </svg>
                ))}

                <button 
                  onClick={handleWhatsAppCheckout}
                  className="btn btn-whatsapp flex-grow-1 py-2.5 rounded-pill fw-bold text-center d-flex align-items-center justify-content-center gap-2"
                >
                  💬 Buy on WhatsApp
                </button>
                <button 
                  onClick={handleAddToCart}
                  className="btn btn-custom flex-grow-1 py-2.5 rounded-pill fw-bold bounce-click d-flex align-items-center justify-content-center gap-2"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductDetailModal;
