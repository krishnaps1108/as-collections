import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // To toggle between setup & login
  const navigate = useNavigate();

  const handleAction = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? 'register' : 'login';
    try {
      const res = await axios.post(`/api/auth/${endpoint}`, { email, password });
      if (isRegistering) {
        Swal.fire({
          title: 'Registered!',
          text: 'Admin registered successfully! Now please log in.',
          icon: 'success',
          confirmButtonColor: '#2d6a4f',
          background: '#fdfbf7'
        });
        setIsRegistering(false);
      } else {
        localStorage.setItem('adminToken', res.data.token);
        navigate('/admin');
        window.location.reload();
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Authentication error',
        icon: 'error',
        confirmButtonColor: '#2d6a4f',
        background: '#fdfbf7'
      });
    }
  };

  return (
    <div className="container py-5 fade-in-el" style={{ maxWidth: '480px' }}>
      <div className="glass-panel text-center">
        <h2 className="mb-4 display-6 fw-bold">{isRegistering ? 'Register Admin' : 'Admin Login'}</h2>
        <form onSubmit={handleAction} className="text-start">
          <div className="mb-3">
            <label className="form-label fw-semibold">Admin Email</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="admin@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-custom w-100 py-3 mt-3 fs-5">
            {isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <p 
          className="mt-4 m-0 text-success fw-semibold" 
          style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }} 
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 'Already have an account? Login here' : 'First time setup? Create admin credentials here'}
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;