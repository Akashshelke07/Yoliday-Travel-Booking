import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './component/Navbar/Navbar.jsx';
import Home from './component/Home.jsx';
import Login from './component/Login/Login.jsx';
import Register from './component/Register/Register.jsx';
import Booking from './component/Booking/Booking.jsx';
import Destination from './component/Destination.jsx';
import ResetPassword from './component/ResetPassword/ResetPassword.jsx'; // NEW
import Footer from './component/Footer.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in on component mount
  useEffect(() => {
    console.log('🔍 App mounted - checking for existing authentication...');
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (token) {
      console.log('✅ Token found - user is logged in');
      setIsLoggedIn(true);
    } else {
      console.log('❌ No token found - user needs to login');
    }
  }, []);

  // Log when isLoggedIn state changes
  useEffect(() => {
    console.log('🔄 isLoggedIn state changed to:', isLoggedIn);
  }, [isLoggedIn]);

  return (
    <BrowserRouter>
      <>
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Destination" element={<Destination />} />
          
          {/* Login Route */}
          <Route 
            path="/Login" 
            element={
              isLoggedIn ? (
                <Navigate to="/Destination" />
              ) : (
                <Login setIsLoggedIn={setIsLoggedIn} />
              )
            } 
          />
          
          {/* Register Route */}
          <Route 
            path="/Register" 
            element={
              isLoggedIn ? (
                <Navigate to="/Destination" />
              ) : (
                <Register setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />
          
          {/* Reset Password Route - NEW */}
          <Route 
            path="/reset-password/:token" 
            element={<ResetPassword setIsLoggedIn={setIsLoggedIn} />} 
          />
          
          {/* Booking Route */}
          <Route 
            path="/Booking" 
            element={
              isLoggedIn ? (
                <Booking />
              ) : (
                <Navigate to="/Login" />
              )
            } 
          />
        </Routes>
      </>
      <Footer />
    </BrowserRouter>
  );
}

export default App;