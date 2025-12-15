const express = require('express');
const { login, register, forgotPassword, resetPassword } = require('../controllers/authController');
const router = express.Router();

// Authentication routes
router.post('/login', login);
router.post('/register', register);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;