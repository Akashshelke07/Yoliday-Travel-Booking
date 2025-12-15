import React, { useState } from 'react';
import ForgotPassword from '../ForgotPassword/ForgotPassword';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Register({ setIsLoggedIn }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    // DEBUG: Log registration attempt
    console.log('🔍 Registration attempt:', { 
      name, 
      email, 
      password: '***',
      passwordLength: password.length 
    });

    try {
      console.log('📡 Sending request to: http://localhost:5000/api/auth/register');
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response status text:', response.statusText);
      
      const data = await response.json();
      
      // DEBUG: Log response data
      console.log('📥 Response data:', {
        ...data,
        token: data.token ? data.token.substring(0, 20) + '...' : 'N/A',
        user: data.user || 'N/A'
      });

      if (response.ok) {
        console.log('✅ Registration successful');
        
        if (data.token) {
          // CRITICAL FIX: Clear old tokens FIRST, then set new ones
          console.log('🗑️ Clearing old tokens...');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          
          console.log('💾 Saving new token...');
          localStorage.setItem('token', data.token);
          localStorage.setItem('authToken', data.token);
          
          console.log('✅ Token saved after registration');
          console.log('🔑 Token preview:', data.token.substring(0, 30) + '...');
          console.log('🔑 Token length:', data.token.length);
          
          // Verify token was saved
          const savedToken = localStorage.getItem('token');
          console.log('✅ Token verification:', savedToken ? '✅ Token found in storage' : '❌ Token NOT saved!');
          
          if (savedToken) {
            console.log('✅ Setting isLoggedIn to true');
            setIsLoggedIn(true);
            console.log('🔄 Navigating to /Destination');
            navigate('/Destination');
          } else {
            console.error('❌ Token save verification failed!');
            setError('Failed to save authentication token. Please try again.');
          }
        } else {
          console.warn('⚠️ No token received, redirecting to login');
          setError('Registration successful, but no token received for auto-login.');
          navigate('/Login');
        }
      } else {
        console.error('❌ Registration failed with status:', response.status);
        console.error('❌ Error message:', data.message);
        
        if (response.status === 400) {
          if (data.message && data.message.includes('already exists')) {
            setError('This email is already registered. Please login or use a different email.');
          } else {
            setError(data.message || 'Invalid registration data. Please check your inputs.');
          }
        } else if (response.status === 500) {
          setError('Server error occurred. Please try again later.');
        } else {
          setError(data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('💥 Registration error occurred');
      console.error('💥 Error type:', err.name);
      console.error('💥 Error message:', err.message);
      console.error('💥 Full error:', err);
      
      if (err.message === 'Failed to fetch') {
        setError('Cannot connect to server. Please ensure the backend is running on http://localhost:5000');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      console.log('🏁 Registration attempt finished');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="register-container">
      {showForgotPassword ? (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      ) : (
        <div className="register-card">
          <form onSubmit={handleRegister}>
            <h2 className="register-title">Create Account</h2>
            {error && (
              <div 
                className="error-message" 
                style={{ 
                  color: 'red', 
                  padding: '10px', 
                  marginBottom: '10px', 
                  border: '1px solid red', 
                  borderRadius: '4px',
                  backgroundColor: '#fee'
                }}
              >
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                className="form-input"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="Create a password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle"
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <input
              type="submit"
              value={loading ? "Creating Account..." : "Get Started"}
              className="submit-btn"
              disabled={loading}
            />

            <div className="form-footer">
              <button
                type="button"
                onClick={() => navigate('/Login')}
                className="link-btn"
                style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}
                disabled={loading}
              >
                Already have an account? <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Login Now</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Register;