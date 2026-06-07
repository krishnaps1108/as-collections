import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  // Retrieve user info if logged in
  const userString = localStorage.getItem('user');
  let user = null;
  if (userString && userString !== 'undefined' && userString !== 'null') {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(items);
  }, []);

  const updateQuantity = (id, size, change) => {
    const updated = cartItems.map(item => {
      if (item._id === id && item.selectedSize === size) {
        const newQty = item.quantity + change;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (id, size) => {
    const filtered = cartItems.filter(item => !(item._id === id && item.selectedSize === size));
    setCartItems(filtered);
    localStorage.setItem('cart', JSON.stringify(filtered));
  };

  const clearCart = () => {
    localStorage.removeItem('cart');
    setCartItems([]);
    setUploadedImageUrl('');
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await axios.post('/api/upload', formData);
      setUploadedImageUrl(res.data.imageUrl);
      Swal.fire({
        title: 'Uploaded!',
        text: 'Image uploaded successfully.',
        icon: 'success',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to upload image. Please try again.',
        icon: 'error',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleWhatsAppCheckout = async () => {
    if (cartItems.length === 0) {
      Swal.fire({
        title: 'Empty Cart',
        text: 'Your cart is empty! Please add products before checking out.',
        icon: 'warning',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
      return;
    }

    const name = user ? user.name : 'Guest';
    const phone = user ? user.phone : '';

    // Log the order intent in the backend DB
    const itemsToLog = cartItems.map(item => ({
      name: item.name,
      price: item.price,
      size: item.selectedSize || 'Standard',
      category: item.category || 'Soaps',
      quantity: item.quantity
    }));

    try {
      await axios.post('/api/orders/whatsapp-log', {
        name,
        phone,
        cartItems: itemsToLog
      });
    } catch (err) {
      console.error('Error logging WhatsApp checkout intent:', err);
    }

    // Redirect to WhatsApp business number
    const whatsappNumber = '917395832383';

    let messageBody = `🌿 *AS COLLECTIONS ORDER REQUEST* 🌿\n\n`;
    messageBody += `Customer: *${name}*\n`;
    if (phone) messageBody += `Phone: ${phone}\n`;
    messageBody += `--------------------------\n`;
    
    cartItems.forEach((item, index) => {
      messageBody += `${index + 1}. *${item.name}*\n`;
      messageBody += `   Quantity: ${item.quantity}\n`;
      messageBody += `   Size/Variant: ${item.selectedSize || 'Standard'}\n`;
      messageBody += `   Price: ₹${item.price} each\n\n`;
    });

    messageBody += `--------------------------\n`;
    messageBody += `Total Bill Amount: *₹${calculateTotal()}*\n`;
    
    if (uploadedImageUrl) {
      messageBody += `Payment Receipt / Attachment URL: ${uploadedImageUrl}\n\n`;
    } else {
      messageBody += `\n`;
    }

    messageBody += `Please confirm my order. Thank you! 💚`;

    const encodedMessage = encodeURIComponent(messageBody);
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
  };

  return (
    <div className="container-fluid px-3 px-md-5 py-5 mt-5">
      <div className="glass-panel" style={{ marginTop: '30px' }}>
        <h2 className="display-6 fw-bold mb-4 text-start">Your Shopping Cart 🛒</h2>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <p className="fs-5 text-muted mb-4">Your cart is empty. Pick out some natural skincare and hair products on the home page!</p>
            <a href="/" className="btn btn-custom px-4 py-2 text-decoration-none">🌿 Browse Products</a>
          </div>
        ) : (
          <div className="row g-4 text-start">
            {/* Cart Items List */}
            <div className="col-12 col-lg-8">
              <div className="d-flex flex-column gap-3">
                {cartItems.map((item) => (
                  <div 
                    key={`${item._id}-${item.selectedSize}`} 
                    className="card p-3 border-0 shadow-sm d-flex flex-row align-items-center justify-content-between flex-wrap gap-3" 
                    style={{ backgroundColor: 'var(--cream)', border: '1.5px solid var(--glass-border)' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <img src={item.image} alt={item.name} className="rounded" style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1.5px solid var(--glass-border)' }} />
                      <div>
                        <h4 className="fs-5 fw-bold m-0 text-success">{item.name}</h4>
                        <p className="text-muted m-0 mt-1 small">Variant: {item.selectedSize || 'Standard'}</p>
                        <p className="text-muted m-0 mt-1">₹{item.price} each</p>
                      </div>
                    </div>
                    
                    {/* Quantity Selector */}
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-sm btn-secondary-custom px-2 py-1" onClick={() => updateQuantity(item._id, item.selectedSize, -1)}>-</button>
                      <span className="fw-bold fs-5 px-2">{item.quantity}</span>
                      <button className="btn btn-sm btn-secondary-custom px-2 py-1" onClick={() => updateQuantity(item._id, item.selectedSize, 1)}>+</button>
                    </div>

                    <div className="text-end">
                      <p className="fw-bold fs-5 m-0 text-dark">₹{item.price * item.quantity}</p>
                      <button className="btn btn-link text-danger p-0 mt-1 small text-decoration-none" onClick={() => removeItem(item._id, item.selectedSize)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="d-flex justify-content-between mt-4">
                <button onClick={clearCart} className="btn btn-secondary-custom">Clear All Items</button>
              </div>
            </div>
            
            {/* Order Summary & File Upload */}
            <div className="col-12 col-lg-4">
              <div className="card p-4 border-0 shadow-sm" style={{ backgroundColor: 'var(--cream)', border: '1.5px solid var(--glass-border)', borderRadius: '20px' }}>
                <h3 className="fs-4 fw-bold mb-3 border-bottom pb-2">Order Summary</h3>
                <div className="d-flex justify-content-between fs-5 mb-3">
                  <span>Subtotal:</span>
                  <span className="fw-bold">₹{calculateTotal()}</span>
                </div>
                
                {/* File Upload Section */}
                <div className="mb-4">
                  <label className="form-label fw-semibold mb-2 d-block">
                    Upload Payment Proof / Attachment (Optional)
                  </label>
                  
                  <div className="input-group">
                    <input 
                      type="file" 
                      className="form-control" 
                      id="cartUpload" 
                      onChange={handleFileUpload} 
                      accept="image/*"
                      disabled={uploading}
                    />
                  </div>
                  
                  {uploading && (
                    <div className="mt-2 text-success small">
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Uploading attachment...
                    </div>
                  )}

                  {uploadedImageUrl && (
                    <div className="mt-3 text-center">
                      <span className="badge bg-success mb-2">✓ Attached Successfully</span>
                      <div className="preview-box mx-auto" style={{ border: '1.5px dashed var(--primary-green)' }}>
                        <img src={uploadedImageUrl} alt="Uploaded attachment preview" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between fs-4 fw-bold mb-4">
                    <span>Grand Total:</span>
                    <span className="text-success">₹{calculateTotal()}</span>
                  </div>
                  
                  <button 
                    onClick={handleWhatsAppCheckout} 
                    className="btn btn-whatsapp w-100 py-3 fs-5 pulse-icon rounded-pill fw-bold"
                  >
                    💬 Order via WhatsApp
                  </button>
                  <p className="text-center text-muted small mt-2 m-0" style={{ fontSize: '0.8rem' }}>
                    Clicking will open WhatsApp and format your order. You can chat with us to finish the details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;