import React, { useState } from 'react';
import './ForgotPassword.css';

function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('🔍 Forgot password attempt for:', email);

    // Validate email
    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      console.log('📡 Sending request to:', 'http://localhost:5000/api/auth/forgot-password');
      
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (response.ok) {
        console.log('✅ Password reset request successful');
        setSuccess(data.message || 'Password reset link has been sent to your email.');
        setEmail('');
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        console.error('❌ Password reset failed:', data.message);
        setError(data.message || 'Failed to send reset link. Please try again.');
      }
    } catch (err) {
      console.error('💥 Forgot password error:', err);
      setError('Cannot connect to server. Please ensure the backend is running on http://localhost:5000');
    } finally {
      setLoading(false);
      console.log('🏁 Forgot password attempt finished');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Reset Your Password</h2>
        <p className="forgot-password-description">
          Enter your registered email address, and we'll send you a link to reset your password.
        </p>
        
        {error && (
          <div 
            className="error-message" 
            style={{ 
              color: 'red', 
              padding: '10px', 
              marginBottom: '15px', 
              border: '1px solid red', 
              borderRadius: '4px',
              backgroundColor: '#fee'
            }}
          >
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div 
            className="success-message" 
            style={{ 
              color: 'green', 
              padding: '10px', 
              marginBottom: '15px', 
              border: '1px solid green', 
              borderRadius: '4px',
              backgroundColor: '#efe'
            }}
          >
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleForgotPassword}>
          <label htmlFor="forgot-email">Email Address</label>
          <input
            type="email"
            id="forgot-email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input 
            type="submit" 
            value={loading ? "Sending..." : "Send Reset Link"} 
            disabled={loading}
          />
          <button 
            type="button" 
            onClick={onClose} 
            className="cancel-button"
            disabled={loading}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;