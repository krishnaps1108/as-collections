import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('reports');
  const [products, setProducts] = useState([]);
  
  // Dashboard Analytics States
  const [dailySales, setDailySales] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [customerLogs, setCustomerLogs] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // Catalog Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hair Care');
  const [isAdult, setIsAdult] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(''); // Fallback price
  const [ingredientsText, setIngredientsText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Seller Creation Form States
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerPassword, setSellerPassword] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerAge, setSellerAge] = useState('');

  // Product Editing States
  const [editingProduct, setEditingProduct] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  
  let user = null;
  const userString = localStorage.getItem('user');
  if (userString && userString !== 'undefined' && userString !== 'null') {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error(e);
    }
  }

  // Redirect if not admin
  useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      Swal.fire({
        title: 'Access Denied',
        text: 'Only administrators can access this page.',
        icon: 'error',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
      navigate('/login');
    } else {
      fetchProducts();
      fetchAnalytics();
    }
  }, [token]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const salesRes = await axios.get('/api/admin/sales', { headers });
      setDailySales(salesRes.data.dailySales);
      setCategorySales(salesRes.data.categorySales);

      const logsRes = await axios.get('/api/admin/customers', { headers });
      setCustomerLogs(logsRes.data);

      const topProductsRes = await axios.get('/api/admin/top-products', { headers });
      setTopProducts(topProductsRes.data);
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
    }
  };

  // Add Variant helper
  const addVariant = () => {
    if (!newSize || !newPrice) return;
    setVariants([...variants, { size: newSize, price: Number(newPrice) }]);
    setNewSize('');
    setNewPrice('');
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Multer File Upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await axios.post('/api/upload', formData);
      setImageUrl(res.data.imageUrl);
      Swal.fire({
        title: 'Uploaded!',
        text: 'Image uploaded successfully.',
        icon: 'success',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to upload image.',
        icon: 'error',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
    } finally {
      setUploading(false);
    }
  };

  // Publish product from dashboard
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!imageUrl) {
      Swal.fire({ title: 'Image Required', text: 'Please upload an image first.', icon: 'warning', confirmButtonColor: '#2D5016', background: '#FDF6E3' });
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

      Swal.fire({ title: 'Success!', text: 'Product published successfully!', icon: 'success', confirmButtonColor: '#2D5016', background: '#FDF6E3' });
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setIngredientsText('');
      setVariants([]);
      setImageUrl('');
      const inputEl = document.getElementById('adminProductImage');
      if (inputEl) inputEl.value = '';

      fetchProducts();
      fetchAnalytics(); // Refresh analytics after publish
    } catch (err) {
      Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Publishing failed.', icon: 'error', confirmButtonColor: '#2D5016', background: '#FDF6E3' });
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

      Swal.fire({ title: 'Updated!', text: 'Product updated successfully!', icon: 'success', confirmButtonColor: '#2D5016', background: '#FDF6E3' });
      setEditingProduct(null);
      setName('');
      setDescription('');
      setPrice('');
      setIngredientsText('');
      setVariants([]);
      setImageUrl('');

      fetchProducts();
    } catch (err) {
      Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Update failed.', icon: 'error', confirmButtonColor: '#2D5016', background: '#FDF6E3' });
    }
  };

  const handleDeleteProduct = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This product will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#2D5016',
      confirmButtonText: 'Yes, delete it!',
      background: '#FDF6E3'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({ title: 'Deleted!', text: 'Product removed.', icon: 'success', confirmButtonColor: '#2D5016', background: '#FDF6E3' });
        fetchProducts();
      } catch (err) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete product.', icon: 'error', confirmButtonColor: '#2D5016', background: '#FDF6E3' });
      }
    }
  };

  // Add Seller Registration
  const handleAddSeller = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/admin/add-seller',
        {
          email: sellerEmail,
          password: sellerPassword,
          name: sellerName,
          phone: sellerPhone,
          age: Number(sellerAge)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        title: 'Seller Created! 🤝',
        text: `Seller account for ${sellerName} has been successfully registered.`,
        icon: 'success',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });

      setSellerEmail('');
      setSellerPassword('');
      setSellerName('');
      setSellerPhone('');
      setSellerAge('');
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Failed to register seller.',
        icon: 'error',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const COLORS = ['#2D5016', '#7A9E3B', '#8B6914', '#e5d3b3', '#40916c'];

  return (
    <div className="container-fluid px-3 px-md-5 py-5 mt-5 text-start">
      <div className="glass-panel" style={{ marginTop: '30px' }}>
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 border-bottom pb-3">
          <div>
            <h2 className="display-6 fw-bold m-0 text-success">Admin Management</h2>
            <p className="text-muted m-0">System metrics and catalog controls</p>
          </div>
          <button onClick={handleLogout} className="btn btn-danger-custom">Log Out</button>
        </div>

        {/* Navigation Tabs */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          <button 
            onClick={() => setActiveTab('reports')} 
            className={`btn px-4 py-2 rounded-pill fw-bold transition-smooth ${activeTab === 'reports' ? 'btn-success' : 'btn-outline-success'}`}
            style={{
              backgroundColor: activeTab === 'reports' ? 'var(--primary-green)' : 'transparent',
              borderColor: 'var(--primary-green)',
              color: activeTab === 'reports' ? 'var(--cream)' : 'var(--primary-green)'
            }}
          >
            📊 Sales & Reports
          </button>
          <button 
            onClick={() => setActiveTab('messages')} 
            className={`btn px-4 py-2 rounded-pill fw-bold transition-smooth ${activeTab === 'messages' ? 'btn-success' : 'btn-outline-success'}`}
            style={{
              backgroundColor: activeTab === 'messages' ? 'var(--primary-green)' : 'transparent',
              borderColor: 'var(--primary-green)',
              color: activeTab === 'messages' ? 'var(--cream)' : 'var(--primary-green)'
            }}
          >
            💬 WhatsApp Order Logs
          </button>
          <button 
            onClick={() => setActiveTab('sellers')} 
            className={`btn px-4 py-2 rounded-pill fw-bold transition-smooth ${activeTab === 'sellers' ? 'btn-success' : 'btn-outline-success'}`}
            style={{
              backgroundColor: activeTab === 'sellers' ? 'var(--primary-green)' : 'transparent',
              borderColor: 'var(--primary-green)',
              color: activeTab === 'sellers' ? 'var(--cream)' : 'var(--primary-green)'
            }}
          >
            🤝 Add Partner Seller
          </button>
          <button 
            onClick={() => setActiveTab('catalog')} 
            className={`btn px-4 py-2 rounded-pill fw-bold transition-smooth ${activeTab === 'catalog' ? 'btn-success' : 'btn-outline-success'}`}
            style={{
              backgroundColor: activeTab === 'catalog' ? 'var(--primary-green)' : 'transparent',
              borderColor: 'var(--primary-green)',
              color: activeTab === 'catalog' ? 'var(--cream)' : 'var(--primary-green)'
            }}
          >
            🛍️ Manage Catalog
          </button>
        </div>

        {/* TAB 1: REPORTS */}
        {activeTab === 'reports' && (
          <div className="fade-in-el">
            <div className="row g-4">
              
              {/* Daily Sales Chart */}
              <div className="col-12 col-xl-8">
                <div className="card p-3 border-0 shadow-sm h-100" style={{ backgroundColor: 'var(--cream)', border: '1.5px solid var(--glass-border)', borderRadius: '20px' }}>
                  <h5 className="fw-bold mb-3 text-success">Daily Order Revenues</h5>
                  <div style={{ width: '100%', height: 300 }}>
                    {dailySales.length > 0 ? (
                      <ResponsiveContainer>
                        <LineChart data={dailySales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => `₹${value}`} />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2D5016" strokeWidth={3} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted">No checkout data logged yet.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Sales Distribution */}
              <div className="col-12 col-xl-4">
                <div className="card p-3 border-0 shadow-sm h-100" style={{ backgroundColor: 'var(--cream)', border: '1.5px solid var(--glass-border)', borderRadius: '20px' }}>
                  <h5 className="fw-bold mb-3 text-success">Revenues by Category</h5>
                  <div style={{ width: '100%', height: 300 }}>
                    {categorySales.length > 0 ? (
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={categorySales}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="revenue"
                            nameKey="category"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categorySales.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `₹${value}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted">No sales metrics recorded.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Products Bar Chart */}
              <div className="col-12">
                <div className="card p-3 border-0 shadow-sm" style={{ backgroundColor: 'var(--cream)', border: '1.5px solid var(--glass-border)', borderRadius: '20px' }}>
                  <h5 className="fw-bold mb-3 text-success">Most Popular Products (WhatsApp Intents)</h5>
                  <div style={{ width: '100%', height: 300 }}>
                    {topProducts.length > 0 ? (
                      <ResponsiveContainer>
                        <BarChart data={topProducts}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value, name) => name === 'revenue' ? `₹${value}` : `${value} clicks`} />
                          <Legend />
                          <Bar dataKey="count" name="WhatsApp Clicks" fill="#7A9E3B" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="revenue" name="Total Revenue (₹)" fill="#2D5016" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-muted">No product click analytics recorded yet.</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: WHATSAPP ORDER LOGS */}
        {activeTab === 'messages' && (
          <div className="fade-in-el">
            <h4 className="fw-bold text-success mb-3">WhatsApp Order Intent Logs</h4>
            <p className="text-muted small">Logs of customers clicking checkout. Use buttons below to initiate direct replies on WhatsApp.</p>
            {customerLogs.length === 0 ? (
              <p className="text-muted">No client intentions logged yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle text-start" style={{ backgroundColor: 'var(--cream)', borderRadius: '12px', overflow: 'hidden' }}>
                  <thead className="table-success" style={{ backgroundColor: 'var(--primary-green) !important', color: '#fff' }}>
                    <tr>
                      <th>Customer Name</th>
                      <th>Phone</th>
                      <th>Product Name</th>
                      <th>Size/Variant</th>
                      <th>Total Value</th>
                      <th>Date Logged</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerLogs.map((log) => (
                      <tr key={log._id}>
                        <td className="fw-bold text-success">{log.customerName}</td>
                        <td>{log.customerPhone || 'N/A'}</td>
                        <td className="fw-semibold">{log.productName}</td>
                        <td><span className="badge bg-secondary">{log.variantSize || 'Standard'}</span></td>
                        <td className="fw-bold text-success-emphasis">₹{log.price}</td>
                        <td className="small text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                        <td>
                          {log.customerPhone ? (
                            <a 
                              href={`https://wa.me/${log.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${log.customerName}! 🌿 This is AS Collections. We received your order intent for *${log.productName}* (${log.variantSize || 'Standard'}). Let's arrange shipping!`)}`}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn btn-sm btn-whatsapp fw-bold rounded-pill px-3 py-1"
                            >
                              💬 Reply
                            </a>
                          ) : (
                            <span className="text-muted small">No Phone</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADD PARTNER SELLER */}
        {activeTab === 'sellers' && (
          <div className="fade-in-el" style={{ maxWidth: '600px' }}>
            <div className="card p-4 border-0 shadow-sm" style={{ backgroundColor: 'var(--cream)', border: '1.5px solid var(--glass-border)', borderRadius: '20px' }}>
              <h4 className="fw-bold text-success mb-3">🤝 Create Seller Account</h4>
              <p className="text-muted small">Register a verified partner account. They will be authorized to list and edit their own products on AS Collections.</p>
              
              <form onSubmit={handleAddSeller}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Seller Full Name</label>
                  <input type="text" className="form-control" placeholder="e.g. Salem Soap Hub" value={sellerName} onChange={(e) => setSellerName(e.target.value)} required />
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Age</label>
                    <input type="number" className="form-control" placeholder="30" value={sellerAge} onChange={(e) => setSellerAge(e.target.value)} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Phone Contact</label>
                    <input type="tel" className="form-control" placeholder="+91 XXXXX XXXXX" value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Email Username</label>
                  <input type="email" className="form-control" placeholder="partner@ascollections.com" value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} required />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Account Password</label>
                  <input type="password" className="form-control" placeholder="Set secure password" value={sellerPassword} onChange={(e) => setSellerPassword(e.target.value)} required />
                </div>

                <button type="submit" className="btn btn-custom w-100 py-2.5">Register Partner Seller</button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: MANAGE CATALOG */}
        {activeTab === 'catalog' && (
          <div className="fade-in-el">
            <div className="row g-4">
              
              {/* Product Form */}
              <div className="col-12 col-lg-5">
                <div className="card p-4 border-0 shadow-sm" style={{ backgroundColor: 'var(--cream)', border: '1.5px solid var(--glass-border)', borderRadius: '20px' }}>
                  <h4 className="fw-bold mb-3 text-success">
                    {editingProduct ? '✏️ Edit Product' : '➕ Add Product to Catalog'}
                  </h4>
                  
                  <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Product Name</label>
                      <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
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
                            id="adminIsAdultSwitch"
                            checked={isAdult}
                            onChange={(e) => setIsAdult(e.target.checked)} 
                          />
                          <label className="form-check-label fw-bold" htmlFor="adminIsAdultSwitch">Flag 18+ Only?</label>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Description</label>
                      <textarea className="form-control" rows="2" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Ingredients (comma separated)</label>
                      <input type="text" className="form-control" value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} />
                    </div>

                    {/* Variants */}
                    <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'rgba(45, 80, 22, 0.05)', border: '1px solid var(--glass-border)' }}>
                      <label className="form-label fw-bold text-success mb-2 d-block">Manage Size Variants</label>
                      <div className="d-flex gap-2 mb-2">
                        <input type="text" className="form-control" placeholder="Size" value={newSize} onChange={(e) => setNewSize(e.target.value)} />
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
                          <label className="form-label fw-bold">Standard Price (if no variants)</label>
                          <input type="number" className="form-control" placeholder="Price in ₹" value={price} onChange={(e) => setPrice(e.target.value)} />
                        </div>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">Upload Image</label>
                      <input type="file" id="adminProductImage" className="form-control" onChange={handleFileUpload} accept="image/*" />
                      {uploading && <div className="small text-success mt-1">Uploading...</div>}
                      {imageUrl && (
                        <div className="mt-3 text-center">
                          <div className="preview-box mx-auto" style={{ border: '1.5px solid var(--primary-green)' }}>
                            <img src={imageUrl} alt="Preview" style={{height:"300px", width:"100%"}} />
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

              {/* Listed Products */}
              <div className="col-12 col-lg-7">
                <h4 className="fw-bold mb-3 text-dark">Active Catalog ({products.length})</h4>
                <div className="row g-3">
                  {products.map(p => (
                    <div key={p._id} className="col-12 col-md-6 col-xl-4">
                      <div className="card h-100 p-2 border-0 shadow-sm d-flex flex-column justify-content-between" style={{ backgroundColor: 'var(--cream)', border: '1.5px solid var(--glass-border)' }}>
                        <div>
                          <img src={p.image} alt={p.name} className="rounded mb-2 w-100" style={{ height: '130px', objectFit: 'cover' }} />
                          <h6 className="fw-bold mb-1 text-success text-truncate">{p.name}</h6>
                          <p className="text-muted small mb-1">{p.category}</p>
                          <p className="fw-semibold text-dark mb-1">
                            {p.variants && p.variants.length > 0 
                              ? `Variants: ${p.variants.length}` 
                              : `Price: ₹${p.price}`
                            }
                          </p>
                        </div>
                        
                        <div className="d-flex gap-2 mt-2">
                          <button onClick={() => handleStartEdit(p)} className="btn btn-sm btn-secondary-custom py-1 flex-grow-1">✏️ Edit</button>
                          <button onClick={() => handleDeleteProduct(p._id)} className="btn btn-sm btn-danger-custom py-1 flex-grow-1">🗑 Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );

  function handleCancelEdit() {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setIngredientsText('');
    setVariants([]);
    setImageUrl('');
  }
}

export default AdminDashboard;