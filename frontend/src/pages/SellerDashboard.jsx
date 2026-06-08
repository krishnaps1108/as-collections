import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hair Care');
  const [isAdult, setIsAdult] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(''); // Fallback if no variants
  const [ingredientsText, setIngredientsText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Variants list state
  const [variants, setVariants] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Editing state
  const [editingProduct, setEditingProduct] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  let user = null;
  const userString = localStorage.getItem('user');
  if (userString && userString !== 'undefined' && userString !== 'null') {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error(e);
    }
  }

  const fetchSellerProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      // Filter products created by this seller
      const sellerProducts = res.data.filter(p => p.seller === user.id);
      setProducts(sellerProducts);
    } catch (err) {
      console.error('Error fetching seller products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user || user.role !== 'seller') {
      Swal.fire({
        title: 'Access Denied',
        text: 'Only authorized sellers can access this dashboard.',
        icon: 'error',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
      navigate('/login');
    } else {
      fetchSellerProducts();
    }
  }, [token]);

  const addVariant = () => {
    if (!newSize || !newPrice) return;
    setVariants([...variants, { size: newSize, price: Number(newPrice) }]);
    setNewSize('');
    setNewPrice('');
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await axios.post('/api/upload', formData);
      setImageUrl(res.data.imageUrl);
      Swal.fire({
        title: 'Uploaded!',
        text: 'Product image uploaded successfully.',
        icon: 'success',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Image upload failed. Try again.',
        icon: 'error',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!imageUrl) {
      Swal.fire({
        title: 'Image Required',
        text: 'Please upload an image for the product first.',
        icon: 'warning',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
      return;
    }

    try {
      const payload = {
        name,
        category,
        isAdult,
        description,
        ingredients: ingredientsText,
        variants,
        price: price ? Number(price) : undefined,
        image: imageUrl
      };

      await axios.post(
        '/api/products',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        title: 'Published!',
        text: 'Product listed successfully!',
        icon: 'success',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });

      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setIngredientsText('');
      setVariants([]);
      setImageUrl('');
      setImageFile(null);
      const inputEl = document.getElementById('sellerProductImage');
      if (inputEl) inputEl.value = '';

      fetchSellerProducts();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to list product.',
        icon: 'error',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
    }
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setIsAdult(product.isAdult);
    setDescription(product.description || '');
    setPrice(product.price || '');
    setIngredientsText(product.ingredients ? product.ingredients.join(', ') : '');
    setVariants(product.variants || []);
    setImageUrl(product.image);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        category,
        isAdult,
        description,
        ingredients: ingredientsText,
        variants,
        price: price ? Number(price) : undefined,
        image: imageUrl
      };

      await axios.put(
        `/api/products/${editingProduct._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        title: 'Updated!',
        text: 'Product updated successfully!',
        icon: 'success',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });

      setEditingProduct(null);
      setName('');
      setDescription('');
      setPrice('');
      setIngredientsText('');
      setVariants([]);
      setImageUrl('');
      setImageFile(null);

      fetchSellerProducts();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to update product.',
        icon: 'error',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setIngredientsText('');
    setVariants([]);
    setImageUrl('');
    setImageFile(null);
  };

  return (
    <div className="container-fluid px-3 px-md-5 py-5 mt-5">
      <div className="glass-panel text-start" style={{ marginTop: '30px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="display-6 fw-bold m-0 text-success">Seller Portal</h2>
            <p className="text-muted m-0">Welcome, {user ? user.name : 'Seller'}</p>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/'); window.location.reload(); }} className="btn btn-sm btn-danger rounded-pill px-4">Log Out</button>
        </div>

        <div className="row g-4">
          {/* Create / Edit Form */}
          <div className="col-12 col-lg-5">
            <div className="card p-4 border-0 shadow-sm" style={{ backgroundColor: 'var(--cream)', border: '1.5px solid var(--glass-border)', borderRadius: '20px' }}>
              <h4 className="fw-bold mb-3 text-success">
                {editingProduct ? '✏️ Edit Listed Product' : '➕ List New Natural Product'}
              </h4>
              
              <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Product Name</label>
                  <input type="text" className="form-control" placeholder="e.g. AS Neem Soap" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Category</label>
                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Hair Care">Hair Care</option>
                      <option value="Wellness">Wellness</option>
                      <option value="Nutrition">Nutrition</option>
                      <option value="Herbal Foods">Herbal Foods</option>
                      <option value="Soaps">Soaps</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6 mb-3 d-flex align-items-center">
                    <div className="form-check form-switch mt-4">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="isAdultSwitch"
                        checked={isAdult}
                        onChange={(e) => setIsAdult(e.target.checked)} 
                      />
                      <label className="form-check-label fw-bold" htmlFor="isAdultSwitch">Flag 18+ Only?</label>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Description</label>
                  <textarea className="form-control" rows="2" placeholder="Brief details about use/benefits" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Ingredients (comma separated)</label>
                  <input type="text" className="form-control" placeholder="e.g. Coconut Oil, Neem, Brahmi" value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} />
                </div>

                {/* Variants Management */}
                <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(45, 80, 22, 0.05)', border: '1px solid var(--glass-border)' }}>
                  <label className="form-label fw-bold text-success mb-2 d-block">Manage Size Variants</label>
                  
                  <div className="d-flex gap-2 mb-2">
                    <input type="text" className="form-control" placeholder="Size (e.g. 200g, 1L)" value={newSize} onChange={(e) => setNewSize(e.target.value)} />
                    <input type="number" className="form-control" placeholder="Price (₹)" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
                    <button type="button" onClick={addVariant} className="btn btn-success px-3">Add</button>
                  </div>

                  {variants.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {variants.map((v, idx) => (
                        <span key={idx} className="badge bg-success text-white px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                          {v.size} - ₹{v.price}
                          <button type="button" onClick={() => removeVariant(idx)} className="btn-close btn-close-white" style={{ fontSize: '0.65rem' }}></button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3">
                      <label className="form-label fw-bold">Or Set Standard Price (no variants)</label>
                      <input type="number" className="form-control" placeholder="Price in ₹" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                  )}
                </div>

                {/* Image Upload */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Product Image</label>
                  <input 
                    type="file" 
                    id="sellerProductImage"
                    className="form-control" 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                  />
                  {uploading && <div className="small text-success mt-1">Uploading image file...</div>}
                  {imageUrl && (
                    <div className="mt-3 text-center">
                      <div className="preview-box mx-auto" style={{ border: '1.5px dashed var(--primary-green)' }}>
                        <img src={imageUrl} alt="Uploaded product preview" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-custom flex-grow-1 py-2">
                    {editingProduct ? 'Save Changes' : 'Publish Product'}
                  </button>
                  {editingProduct && (
                    <button type="button" onClick={handleCancelEdit} className="btn btn-secondary-custom py-2">Cancel</button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Seller Listed Products */}
          <div className="col-12 col-lg-7">
            <h4 className="fw-bold mb-3 text-dark">Your Active Listings ({products.length})</h4>
            {loading ? (
              <p className="text-muted">Loading your products...</p>
            ) : products.length === 0 ? (
              <p className="text-muted">You haven't listed any products yet. Create one on the left!</p>
            ) : (
              <div className="row g-3">
                {products.map(p => (
                  <div key={p._id} className="col-12 col-md-6 col-xl-4">
                    <div className="card h-100 p-2 border-0 shadow-sm d-flex flex-column justify-content-between" style={{ backgroundColor: 'var(--cream)', border: '1.5px solid var(--glass-border)' }}>
                      <div>
                        <div className="position-relative">
                          <img src={p.image} alt={p.name} className="rounded mb-2 w-100" style={{ height: '130px', objectFit: 'cover' }} />
                          {p.isAdult && <span className="badge bg-danger position-absolute top-0 end-0 m-1">18+</span>}
                        </div>
                        <h6 className="fw-bold mb-1 text-success text-truncate">{p.name}</h6>
                        <p className="text-muted small mb-1">{p.category}</p>
                        <p className="fw-semibold text-dark mb-1">
                          {p.variants && p.variants.length > 0 
                            ? `Variants: ${p.variants.length}` 
                            : `Price: ₹${p.price}`
                          }
                        </p>
                      </div>
                      
                      <button onClick={() => handleStartEdit(p)} className="btn btn-sm btn-secondary-custom py-1 mt-2">
                        ✏️ Edit Listing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default SellerDashboard;
