import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { FaBars, FaTimes } from 'react-icons/fa';

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // CRITICAL FIX: Clear ALL tokens from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    
    // Optional: If you want to clear everything
    // localStorage.clear();
    
    console.log('✅ Logged out successfully - all tokens cleared');
    console.log('🔍 Token check after logout:', localStorage.getItem('token'));
    
    setIsLoggedIn(false);
    setMenuOpen(false);
    
    // Redirect to home page after logout
    navigate('/');
  };

  return (
    <nav className="navbar-container">
      {/* Logo as a Link */}
      <Link to="/" className="logo-link" onClick={() => setMenuOpen(false)}>
        <span className="logo">Yoliday</span>
      </Link>

      {/* Hamburger Menu */}
      <div className="hamburger-menu" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Navigation Links */}
      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <li>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/Destination" className="nav-link" onClick={() => setMenuOpen(false)}>
            Destination
          </Link>
        </li>
        <li>
          <Link to="/Booking" className="nav-link" onClick={() => setMenuOpen(false)}>
            Booking
          </Link>
        </li>
        {!isLoggedIn ? (
          <>
            <li>
              <Link to="/Login" className="nav-link" onClick={() => setMenuOpen(false)}>
                 Login
              </Link>
            </li>
            <li>
               <Link to="/Register" className="nav-link" onClick={() => setMenuOpen(false)}>
                 Get Started
               </Link>
            </li>
          </>
        ) : (
          <li>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;