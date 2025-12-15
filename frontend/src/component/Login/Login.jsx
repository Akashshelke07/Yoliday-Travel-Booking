import React, { useState } from 'react';
import ForgotPassword from '../ForgotPassword/ForgotPassword';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // DEBUG: Log login attempt
    console.log('🔍 Login attempt:', { email, password: '***' });

    try {
      console.log('📡 Sending request to: http://localhost:5000/api/auth/login');
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // DEBUG: Log response status
      console.log('📥 Response status:', response.status);
      console.log('📥 Response status text:', response.statusText);
      
      const responseData = await response.json();
      
      // DEBUG: Log response data (hide sensitive token)
      console.log('📥 Response data:', {
        ...responseData,
        token: responseData.token ? responseData.token.substring(0, 20) + '...' : 'N/A',
        user: responseData.user || 'N/A'
      });

      if (response.ok) {
        console.log('✅ Login response OK');
        
        if (responseData.token) {
          // CRITICAL FIX: Clear old tokens FIRST, then set new ones
          console.log('🗑️ Clearing old tokens...');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          
          // Set new tokens
          console.log('💾 Saving new token...');
          localStorage.setItem('token', responseData.token);
          localStorage.setItem('authToken', responseData.token);
          
          console.log('✅ Token saved to localStorage');
          console.log('🔑 Token preview:', responseData.token.substring(0, 30) + '...');
          console.log('🔑 Token length:', responseData.token.length);
          
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
          console.error('❌ No token in response');
          setError('Login successful, but no token received from server.');
        }
      } else {
        console.error('❌ Login failed with status:', response.status);
        console.error('❌ Error message:', responseData.message);
        
        if (response.status === 401) {
          setError('Invalid email or password. Please try again.');
        } else if (response.status === 400) {
          setError(responseData.message || 'Invalid request. Please check your input.');
        } else {
          setError(responseData.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      console.error('💥 Fetch error occurred');
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
      console.log('🏁 Login attempt finished');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      {showForgotPassword ? (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      ) : (
        <div className="login-card">
          <form onSubmit={handleLogin}>
            <h2 className="login-title">Welcome Back</h2>
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
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
              value={loading ? "Signing In..." : "Sign In"}
              className="submit-btn"
              disabled={loading}
            />

            <div className="form-footer">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="link-btn"
                disabled={loading}
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => navigate('/Register')}
                className="link-btn"
                style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}
                disabled={loading}
              >
                Don't have an account? <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Register Now</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;