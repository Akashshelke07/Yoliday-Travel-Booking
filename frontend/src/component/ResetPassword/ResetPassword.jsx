import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../ForgotPassword/ForgotPassword.css'; // Reuse same styles

function ResetPassword({ setIsLoggedIn }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { token } = useParams();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('🔐 Reset password attempt');

    // Validation
    if (!password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('📡 Sending reset request');
      
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (response.ok) {
        console.log('✅ Password reset successful');
        setSuccess('Password reset successfully! Redirecting to login...');
        
        // If token is returned, log the user in automatically
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('authToken', data.token);
          setIsLoggedIn(true);
          
          setTimeout(() => {
            navigate('/Destination');
          }, 2000);
        } else {
          // Otherwise, redirect to login
          setTimeout(() => {
            navigate('/Login');
          }, 2000);
        }
      } else {
        console.error('❌ Password reset failed:', data.message);
        setError(data.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      console.error('💥 Reset password error:', err);
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Reset Your Password</h2>
        <p className="forgot-password-description">
          Enter your new password below.
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

        <form onSubmit={handleResetPassword}>
          <label htmlFor="password">New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Enter new password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '5px'
              }}
              disabled={loading}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirm New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '5px'
              }}
              disabled={loading}
            >
              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <input 
            type="submit" 
            value={loading ? "Resetting..." : "Reset Password"} 
            disabled={loading}
          />
          
          <button 
            type="button" 
            onClick={() => navigate('/Login')} 
            className="cancel-button"
            disabled={loading}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;