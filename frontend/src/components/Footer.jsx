import React from 'react';

function Footer() {
  const whatsappUrl = "https://wa.me/917395832383?text=Hello%20AS%20Collections!%20🌿%20I%20would%20like%20to%20know%20more%20about%20your%20natural%20handmade%20products.";

  return (
    <footer className="mt-5 text-white" style={{
      background: 'linear-gradient(180deg, rgba(45, 80, 22, 0.95) 0%, rgba(27, 48, 13, 0.99) 100%)',
      borderTop: '4px solid var(--sage-green)',
      position: 'relative',
      zIndex: 1
    }}>
      <div className="container py-5">
        <div className="row g-4 text-center text-md-start align-items-center">
          {/* Brand Info */}
          <div className="col-12 col-md-6">
            <h3 className="brand-title text-white mb-2" style={{ color: '#FDF6E3 !important', fontSize: '2rem' }}>
              AS Collections
            </h3>
            <p className="tagline-font mb-3" style={{ color: '#F5E6C8' }}>Skin Glowing, Nature's Touch</p>
            <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2 mb-4 fs-6 fw-semibold text-white-50">
              <span>🌿 Natural</span> | 
              <span>✋ Handmade</span> | 
              <span>💚 Pure</span> | 
              <span>🧴 Chemical Free</span>
            </div>
          </div>

          {/* Socials & Contacts */}
          <div className="col-12 col-md-6 text-center text-md-end">
            <h5 className="fw-bold mb-3" style={{ color: '#FDF6E3' }}>Get In Touch</h5>
            
            <div className="mb-2">
              <a href="tel:+917395832383" className="text-white text-decoration-none d-inline-flex align-items-center gap-2 mb-2 fs-5 hover-link">
                📞 +91 7395 832 383
              </a>
            </div>
            
            <div className="mb-3">
              <a href="mailto:ascollections@gmail.com" className="text-white-50 text-decoration-none fs-6 hover-link">
                📧 ascollections@gmail.com
              </a>
            </div>

            <div className="mb-4">
              <a 
                href="https://www.instagram.com/as_collections_hub" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-outline-light btn-sm rounded-pill px-3 py-1 me-2 mb-3"
              >
                📸 Instagram: @as_collections_hub
              </a>
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-whatsapp btn-sm rounded-pill px-3 py-1 text-white fw-bold align-items-center gap-1"
              >
                💬 WhatsApp Chat
              </a>
            </div>
          </div>
        </div>

        <div className="leaf-divider my-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17,8C8,20 4,21 3,21C3,21 3,20 4,17C8,4 20,3 21,3C21,3 20,4 17,8Z" />
          </svg>
        </div>

        <div className="text-center text-white-50 small mt-2">
          <p className="m-0">© 2025 AS Collections. All Rights Reserved. Made with 💚 & Nature.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
