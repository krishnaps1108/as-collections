import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
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

  // Sync selected variant with URL query param if this card matches the query product
  useEffect(() => {
    const queryProductId = searchParams.get('product');
    const queryVariant = searchParams.get('variant');
    if (queryProductId === product._id && queryVariant && hasVariants) {
      const match = product.variants.find(v => v.size.toLowerCase() === queryVariant.toLowerCase());
      if (match) {
        setSelectedVariant(match);
      }
    }
  }, [searchParams, product._id, hasVariants]);

  const currentPrice = hasVariants ? selectedVariant.price : product.price;
  const currentSize = hasVariants ? selectedVariant.size : 'Standard';

  const handleVariantChange = (variant, e) => {
    e.stopPropagation();
    setSelectedVariant(variant);
    
    // Update query string for shareability
    setSearchParams(prev => {
      prev.set('product', product._id);
      prev.set('variant', variant.size);
      return prev;
    });
  };

  const handleAddToCart = (e, silent = false) => {
    e.stopPropagation();
    triggerLeafBlast(e);

    // Verify age if needed
    if (product.isAdult && !ageVerified) {
      triggerAgeVerification((verified) => {
        if (verified) executeAddToCart(silent);
      });
    } else {
      executeAddToCart(silent);
    }
  };

  const executeAddToCart = (silent) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
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
    
    if (!silent) {
      Swal.fire({
        title: 'Added to Cart! 🌿',
        text: `${product.name} (${currentSize}) added successfully.`,
        icon: 'success',
        timer: 1600,
        showConfirmButton: false,
        background: '#FDF6E3',
        iconColor: '#2D5016'
      });
    }
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
        if (callback) callback(true);
      } else {
        if (callback) callback(false);
      }
    });
  };

  const handleWhatsAppCheckout = async (e) => {
    e.stopPropagation();
    triggerLeafBlast(e);

    if (product.isAdult && !ageVerified) {
      triggerAgeVerification((verified) => {
        if (verified) executeWhatsAppCheckout();
      });
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

  const copyShareLink = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?product=${product._id}${hasVariants ? `&variant=${currentSize}` : ''}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      Swal.fire({
        title: 'Link Copied!',
        text: 'Product link copied to clipboard. Share the nature!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#FDF6E3',
        iconColor: '#7A9E3B'
      });
    });
  };

  return (
    <div className="col-12 col-md-6 col-lg-4 d-flex align-items-stretch mb-4">
      <div className="product-static-card w-100 text-start d-flex flex-column justify-content-between">
        
        {/* Brand/Label overlay & 18+ alert */}
        <div className="brand-label-overlay">{product.label || 'AS Collections'}</div>
        {product.isAdult && !ageVerified && (
          <span className="adult-badge">18+ Only</span>
        )}

        {/* Product Image */}
        <div className="position-relative overflow-hidden" style={{ height: '230px' }}>
          <img 
            src={product.image} 
            alt={product.name} 
            className={`w-100 h-100 object-fit-cover transition-smooth ${
              product.isAdult && !ageVerified ? 'blurred-image' : ''
            }`}
          />
          {product.isAdult && !ageVerified && (
            <div 
              className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-center p-3"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
              onClick={(e) => {
                e.stopPropagation();
                triggerAgeVerification();
              }}
            >
              <button className="btn btn-sm btn-light fw-bold rounded-pill">Verify Age to View</button>
            </div>
          )}
        </div>

        {/* Content details directly on front face */}
        <div className="p-3 d-flex flex-column justify-content-between flex-grow-1">
          <div>
            <div className="d-flex justify-content-between align-items-start gap-1">
              <h5 className="fw-bold mb-1 fs-5 text-truncate" style={{ maxWidth: '85%' }}>{product.name}</h5>
              <button 
                onClick={copyShareLink} 
                className="btn btn-link text-success p-0 m-0 border-0 fs-5"
                title="Copy Shareable Link"
              >
                🔗
              </button>
            </div>
            <p className="text-muted small mb-2">{product.category}</p>
            
            <p className="small text-muted mb-3 text-start" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '38px', fontSize: '0.85rem' }}>
              {product.description || 'Traditional organic product crafted for ultimate natural nourishment and skin restoration.'}
            </p>

            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mb-3">
                <div className="d-flex flex-wrap gap-1">
                  {product.ingredients.slice(0, 4).map(ing => (
                    <span key={ing} className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {/* Variant Pills */}
            {hasVariants && (
              <div className="d-flex flex-wrap gap-1.5 mb-3">
                {product.variants.map((v) => (
                  <button
                    key={v.size}
                    onClick={(e) => handleVariantChange(v, e)}
                    className={`variant-pill py-1 px-3 ${selectedVariant.size === v.size ? 'active' : ''}`}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            )}
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fs-4 fw-bold text-success">₹{currentPrice}</span>
              <span className="text-muted small fw-semibold">Nature's choice 💚</span>
            </div>

            {/* Action Buttons with Leaves Blast Particles */}
            <div className="d-flex flex-column gap-2" style={{ position: 'relative', overflow: 'visible' }}>
              
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
                className="btn btn-whatsapp w-100 py-2 rounded-pill fw-bold text-center d-flex align-items-center justify-content-center gap-2"
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                💬 Buy on WhatsApp
              </button>
              <button 
                onClick={(e) => handleAddToCart(e, false)}
                className="btn btn-custom w-100 py-2 rounded-pill fw-bold bounce-click d-flex align-items-center justify-content-center gap-2"
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                🛒 Add to Cart
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductCard;