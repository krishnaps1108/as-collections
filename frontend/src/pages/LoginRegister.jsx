import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // user, seller

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', {
        email: loginEmail,
        password: loginPassword
      });

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      Swal.fire({
        title: 'Welcome Back! 🌿',
        text: `Logged in successfully as ${user.name}`,
        icon: 'success',
        timer: 1600,
        showConfirmButton: false,
        background: '#FDF6E3',
        iconColor: '#2D5016'
      });

      // Redirect depending on user role
      if (user.role === 'admin') {
        localStorage.setItem('adminToken', token);
        navigate('/admin');
      } else if (user.role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/');
      }
      window.location.reload();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Login failed. Please check your credentials.',
        icon: 'error',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        title: 'Error!',
        text: 'Passwords do not match.',
        icon: 'error',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
      return;
    }

    try {
      await axios.post('/api/auth/register', {
        name,
        age: Number(age),
        phone,
        email,
        password,
        role
      });

      Swal.fire({
        title: 'Registered Successfully! 🎉',
        text: 'You can now log in using your new credentials.',
        icon: 'success',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });

      // Reset form and switch to login
      setIsLogin(true);
      setLoginEmail(email);
      setLoginPassword(password);
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Registration failed. Try a different email.',
        icon: 'error',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await axios.get('/api/auth/google');
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      Swal.fire({
        title: 'Logged in with Google! 🌿',
        text: `Welcome, ${user.name}`,
        icon: 'success',
        timer: 1600,
        showConfirmButton: false,
        background: '#FDF6E3',
        iconColor: '#2D5016'
      });

      navigate('/');
      window.location.reload();
    } catch (err) {
      Swal.fire({
        title: 'Google OAuth failed',
        text: 'Unable to authorize with Google OAuth.',
        icon: 'error',
        confirmButtonColor: '#2D5016',
        background: '#FDF6E3'
      });
    }
  };

  return (
    <div className="container-fluid px-3 px-md-5 py-5 mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel text-start p-4 p-md-5 w-100" style={{ maxWidth: '560px', marginTop: '30px' }}>
        
        {/* Tab Headers */}
        <div className="d-flex justify-content-center gap-4 mb-4 border-bottom pb-2">
          <button 
            className={`btn btn-link fs-4 fw-bold text-decoration-none p-0 ${isLogin ? 'text-success border-bottom border-success border-3' : 'text-muted'}`}
            onClick={() => setIsLogin(true)}
            style={{ color: isLogin ? 'var(--primary-green) !important' : 'inherit' }}
          >
            Sign In
          </button>
          <button 
            className={`btn btn-link fs-4 fw-bold text-decoration-none p-0 ${!isLogin ? 'text-success border-bottom border-success border-3' : 'text-muted'}`}
            onClick={() => setIsLogin(false)}
            style={{ color: !isLogin ? 'var(--primary-green) !important' : 'inherit' }}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit}>
            
            <div className="mb-3">
              <label className="form-label fw-bold">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="name@example.com" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-bold">Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Enter password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn btn-custom w-100 py-2.5 mb-3">Sign In</button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Age</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Min age 10" 
                  min="10"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required 
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="+91 XXXXX XXXXX" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>



            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="At least 6 chars" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <div className="col-md-6 mb-4">
                <label className="form-label fw-bold">Retype Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Confirm password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-custom w-100 py-2.5 mb-3">Register Account</button>
          </form>
        )}

        {/* Divider line */}
        <div className="d-flex align-items-center my-3 text-muted">
          <hr className="flex-grow-1" />
          <span className="px-3 small">Happy To See You...!!!</span>
          <hr className="flex-grow-1" />
        </div>

        {/* OAuth Buttons */}
        {/* <button 
          onClick={handleGoogleLogin} 
          className="btn btn-outline-dark w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 rounded-pill fw-bold"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.988 0-.746-.08-1.32-.176-1.886H12.24z"/>
          </svg>
          Continue with Google
        </button> */}

      </div>
    </div>
  );
}

export default LoginRegister;
