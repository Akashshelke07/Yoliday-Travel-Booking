import React, { useState } from 'react';
import "./Booking.css";
import destinationsData from './data/destinationsData.json';

function Booking() {
  const [fullname, setfullname] = useState('');
  const [contact, setcontact] = useState('');
  const [email, setemail] = useState('');
  const [destination, setdestination] = useState(null);
  const [customDestination, setCustomDestination] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Validation state for real-time feedback
  const [validationErrors, setValidationErrors] = useState({
    fullname: '',
    contact: '',
    email: '',
    destination: '',
    customPrice: '',
    days: ''
  });

  const allDestinations = destinationsData;

  // Validation Functions
  const validateFullName = (name) => {
    if (!name.trim()) {
      return 'Full name is required';
    }
    if (name.trim().length < 3) {
      return 'Name must be at least 3 characters long';
    }
    if (name.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Name can only contain letters and spaces';
    }
    return '';
  };

  const validateContact = (phone) => {
    if (!phone.trim()) {
      return 'Contact number is required';
    }
    // Remove all spaces and special characters for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check if it contains only digits
    if (!/^\d+$/.test(cleanPhone)) {
      return 'Contact number can only contain digits';
    }
    
    // Check length (exactly 10 digits)
    if (cleanPhone.length !== 10) {
      return 'Contact number must be exactly 10 digits';
    }
    
    // Check if it starts with valid digits (Indian numbers start with 6-9)
    if (!/^[6-9]/.test(cleanPhone)) {
      return 'Contact number must start with 6, 7, 8, or 9';
    }
    
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    // Comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address (e.g., user@example.com)';
    }
    if (email.length > 100) {
      return 'Email must be less than 100 characters';
    }
    return '';
  };

  const validateDestination = (dest, customDest) => {
    if (!dest && !customDest.trim()) {
      return 'Please select or enter a destination';
    }
    if (customDest.trim() && customDest.trim().length < 3) {
      return 'Custom destination must be at least 3 characters';
    }
    if (customDest.trim() && customDest.trim().length > 100) {
      return 'Custom destination must be less than 100 characters';
    }
    return '';
  };

  const validateCustomPrice = (price, isCustomDest) => {
    if (isCustomDest) {
      if (price === '') {
        return 'Price is required for custom destination';
      }
      const numPrice = parseFloat(price);
      if (isNaN(numPrice)) {
        return 'Price must be a valid number';
      }
      if (numPrice < 0) {
        return 'Price cannot be negative';
      }
      if (numPrice === 0) {
        return 'Price must be greater than 0';
      }
      if (numPrice > 1000000) {
        return 'Price seems too high (max: ₹10,00,000)';
      }
    }
    return '';
  };

  const validateDays = (days) => {
    const numDays = parseInt(days);
    if (isNaN(numDays)) {
      return 'Number of days must be a valid number';
    }
    if (numDays < 1) {
      return 'Number of days must be at least 1';
    }
    if (numDays > 365) {
      return 'Number of days cannot exceed 365';
    }
    return '';
  };

  // Real-time validation handlers
  const handleFullNameChange = (e) => {
    const value = e.target.value;
    setfullname(value);
    const error = validateFullName(value);
    setValidationErrors(prev => ({ ...prev, fullname: error }));
    if (error) setError(null);
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    // Allow only digits and limit to 10 characters
    if (value === '' || /^\d{0,10}$/.test(value)) {
      setcontact(value);
      const error = validateContact(value);
      setValidationErrors(prev => ({ ...prev, contact: error }));
      if (error) setError(null);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setemail(value);
    const error = validateEmail(value);
    setValidationErrors(prev => ({ ...prev, email: error }));
    if (error) setError(null);
  };

  const handleDestinationChange = (e) => {
    const selectedDestination = allDestinations.find(
      (dest) => dest.title === e.target.value
    );
    setdestination(selectedDestination || null);
    setCustomDestination('');
    setCustomPrice('');
    setError(null);
    setSuccess(false);
    setValidationErrors(prev => ({ ...prev, destination: '', customPrice: '' }));
  };

  const handleCustomDestinationChange = (e) => {
    const value = e.target.value;
    setCustomDestination(value);
    setdestination(null);
    setError(null);
    setSuccess(false);
    const error = validateDestination(null, value);
    setValidationErrors(prev => ({ ...prev, destination: error }));
  };

  const handleCustomPriceChange = (e) => {
    const value = e.target.value;
    // Allow empty string or valid positive numbers (including decimals)
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomPrice(value);
      const error = validateCustomPrice(value, customDestination.trim() !== '');
      setValidationErrors(prev => ({ ...prev, customPrice: error }));
      if (error) setError(null);
    }
  };

  const handleDaysChange = (e) => {
    const value = e.target.value;
    setDays(value);
    const error = validateDays(value);
    setValidationErrors(prev => ({ ...prev, days: error }));
    if (error) setError(null);
  };

  const sendData = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    console.log('🔍 Booking attempt started');
    console.log('📋 Form data:', {
      fullname,
      contact,
      email,
      destination: destination?.title || customDestination,
      days
    });

    // Comprehensive Validation
    const errors = {
      fullname: validateFullName(fullname),
      contact: validateContact(contact),
      email: validateEmail(email),
      destination: validateDestination(destination, customDestination),
      customPrice: validateCustomPrice(customPrice, customDestination.trim() !== ''),
      days: validateDays(days)
    };

    setValidationErrors(errors);

    // Check if any validation errors exist
    const hasErrors = Object.values(errors).some(error => error !== '');
    
    if (hasErrors) {
      console.error('❌ Validation failed with errors:', errors);
      const firstError = Object.values(errors).find(error => error !== '');
      setError(firstError);
      return;
    }

    console.log('✅ All validations passed');

    // CRITICAL: Check for authentication token
    const token = localStorage.getItem('token');
    console.log('🔑 Checking for authentication token...');
    console.log('🔑 Token exists:', !!token);
    
    if (!token) {
      console.error('❌ NO TOKEN FOUND IN LOCALSTORAGE!');
      console.error('❌ User needs to login first');
      console.error('❌ Available localStorage keys:', Object.keys(localStorage));
      setError('No token found, please log in.');
      return;
    }
    
    console.log('🔑 Token preview:', token.substring(0, 30) + '...');
    console.log('🔑 Token length:', token.length);

    setLoading(true);

    const currentDestinationTitle = destination?.title || customDestination;
    const currentPrice = destination?.price || parseFloat(customPrice);
    const totalCost = currentPrice * parseInt(days);

    if (isNaN(totalCost) || totalCost < 0) {
      console.error('❌ Total cost calculation failed');
      setError("Could not calculate total cost. Please check inputs.");
      setLoading(false);
      return;
    }

    const bookingData = {
      fullname: fullname.trim(),
      contact: contact.trim(),
      email: email.trim().toLowerCase(),
      destination: currentDestinationTitle.trim(),
      price: currentPrice,
      days: parseInt(days),
      totalCost,
    };

    console.log('📦 Booking data prepared:', bookingData);

    try {
      console.log('📡 Sending POST request to: http://localhost:5000/api/booking/bookings');
      console.log('📡 Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.substring(0, 20)}...`
      });
      
      const response = await fetch('http://localhost:5000/api/booking/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      console.log('📥 Response received');
      console.log('📥 Response status:', response.status);
      console.log('📥 Response status text:', response.statusText);
      console.log('📥 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (response.ok) {
        console.log('✅ BOOKING SUCCESSFUL!');
        console.log('✅ Booking details:', {
          id: data.booking?._id || 'N/A',
          destination: data.booking?.destination || currentDestinationTitle,
          totalCost: data.booking?.totalCost || totalCost
        });
        
        setSuccess(true);
        
        // Reset form
        console.log('🔄 Resetting form...');
        setfullname('');
        setcontact('');
        setemail('');
        setdestination(null);
        setCustomDestination('');
        setCustomPrice('');
        setDays(1);
        setValidationErrors({
          fullname: '',
          contact: '',
          email: '',
          destination: '',
          customPrice: '',
          days: ''
        });
        
        console.log('✅ Form reset complete');
      } else {
        console.error('❌ Booking failed with status:', response.status);
        console.error('❌ Error details:', data);
        
        if (response.status === 401) {
          console.error('❌ AUTHENTICATION ERROR - Token might be invalid or expired');
          console.error('❌ Token used:', token.substring(0, 30) + '...');
          setError('Authentication failed. Your session may have expired. Please login again.');
        } else if (response.status === 400) {
          console.error('❌ BAD REQUEST - Check booking data');
          console.error('❌ Sent data:', bookingData);
          setError(data.message || 'Invalid booking data. Please check your inputs.');
        } else if (response.status === 500) {
          console.error('❌ SERVER ERROR');
          setError('Server error occurred. Please try again later.');
        } else {
          setError(data.message || 'Booking failed. Please check your details.');
        }
      }
    } catch (error) {
      console.error('💥 BOOKING ERROR OCCURRED');
      console.error('💥 Error type:', error.name);
      console.error('💥 Error message:', error.message);
      console.error('💥 Full error:', error);
      console.error('💥 Error stack:', error.stack);
      
      if (error.message === 'Failed to fetch') {
        console.error('💥 BACKEND NOT REACHABLE');
        console.error('💥 Possible causes:');
        console.error('   1. Backend server not running');
        console.error('   2. Backend crashed');
        console.error('   3. Wrong port (should be 5000)');
        console.error('   4. CORS issue');
        setError('Cannot connect to server. Please ensure backend is running on http://localhost:5000');
      } else if (error.name === 'TypeError') {
        console.error('💥 TYPE ERROR - Possibly network or parsing issue');
        setError('Network error occurred. Please check your connection and try again.');
      } else {
        setError('Something went wrong while connecting to the server. Please try again.');
      }
    } finally {
      setLoading(false);
      console.log('🏁 Booking attempt finished');
    }
  };

  const isCustomDestinationEntered = customDestination.trim() !== '';
  const filteredDropdownDestinations = allDestinations.filter(
    (dest) => dest.title.toLowerCase() !== customDestination.toLowerCase()
  );

  const currentPriceForDisplay = destination?.price || (customPrice !== '' ? parseFloat(customPrice) : 0);
  const displayTotalCost = !isNaN(currentPriceForDisplay) && !isNaN(parseInt(days)) && parseInt(days) > 0
    ? currentPriceForDisplay * parseInt(days)
    : 0;

  return (
    <div className="booking-page">
      <div className="booking-container glass-panel">
        <form onSubmit={sendData} className="booking-form">
          <h2 className="booking-title">
            Book Your Trip
          </h2>

          {/* Full Name Field */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              onChange={handleFullNameChange}
              value={fullname}
              className={`form-input ${validationErrors.fullname ? 'input-error' : ''}`}
              required
              maxLength={50}
            />
            {validationErrors.fullname && (
              <div className="field-error">
                {validationErrors.fullname}
              </div>
            )}
          </div>

          {/* Contact Number Field */}
          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input
              type="tel"
              placeholder="10-digit phone number"
              onChange={handleContactChange}
              value={contact}
              className={`form-input ${validationErrors.contact ? 'input-error' : ''}`}
              required
              maxLength={10}
              pattern="[6-9]\d{9}"
            />
            {validationErrors.contact && (
              <div className="field-error">
                {validationErrors.contact}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="user@example.com"
              onChange={handleEmailChange}
              value={email}
              className={`form-input ${validationErrors.email ? 'input-error' : ''}`}
              required
              maxLength={100}
            />
            {validationErrors.email && (
              <div className="field-error">
                {validationErrors.email}
              </div>
            )}
          </div>

          {/* Destination Dropdown */}
          <div className="form-group">
            <label className="form-label">Select Destination</label>
            <select
              onChange={handleDestinationChange}
              className={`form-input ${validationErrors.destination ? 'input-error' : ''}`}
              disabled={isCustomDestinationEntered}
              value={destination?.title || ''}
            >
              <option value="">-- Choose your adventure --</option>
              {filteredDropdownDestinations.map((dest, index) => (
                <option key={index} value={dest.title}>
                  {dest.title} - ₹{dest.price}
                </option>
              ))}
            </select>
          </div>

          {destination && (
            <div className="destination-info">
              <h3>Selected: {destination.title}</h3>
              <p>Price per day: ₹{destination.price}</p>
            </div>
          )}

          {/* Custom Destination */}
          <div className="form-group">
            <label className="form-label">Or Custom Destination</label>
            <input
              type="text"
              placeholder="e.g., My Dream Location"
              onChange={handleCustomDestinationChange}
              value={customDestination}
              disabled={destination !== null}
              className={`form-input ${validationErrors.destination ? 'input-error' : ''}`}
              maxLength={100}
            />
            {validationErrors.destination && (
              <div className="field-error">
                {validationErrors.destination}
              </div>
            )}
          </div>

          {/* Custom Price */}
          {isCustomDestinationEntered && (
            <div className="form-group">
              <label className="form-label">Estimated Price (per day)</label>
              <input
                type="number"
                placeholder="e.g., 5000"
                onChange={handleCustomPriceChange}
                value={customPrice}
                disabled={destination !== null}
                className={`form-input ${validationErrors.customPrice ? 'input-error' : ''}`}
                min="1"
                max="1000000"
                step="0.01"
              />
              {validationErrors.customPrice && (
                <div className="field-error">
                  {validationErrors.customPrice}
                </div>
              )}
            </div>
          )}

          {/* Number of Days */}
          <div className="form-group">
            <label className="form-label">Number of Days</label>
            <input
              type="number"
              value={days}
              min="1"
              max="365"
              onChange={handleDaysChange}
              className={`form-input ${validationErrors.days ? 'input-error' : ''}`}
              required
            />
            {validationErrors.days && (
              <div className="field-error">
                {validationErrors.days}
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="price-summary">
            <h3>
              Total: ₹{displayTotalCost.toLocaleString('en-IN')}
            </h3>
            {displayTotalCost > 0 && (
              <p>
                ({days} day{parseInt(days) > 1 ? 's' : ''} × ₹{currentPriceForDisplay.toLocaleString('en-IN')})
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="success-message">
              ✅ Booking Confirmed!
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>

          <div className="required-note">
            * All fields are required
          </div>
        </form>
      </div>
    </div>
  );
}

export default Booking;