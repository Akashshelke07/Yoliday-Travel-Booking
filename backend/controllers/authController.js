const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN || '30d' 
    });
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        console.log('📝 Registration attempt:', { name, email });
        
        if (!name || !email || !password) {
            console.error('❌ Missing fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            console.error('❌ User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });
        console.log('✅ User registered:', user.email);
        
        res.status(201).json({ 
            message: 'User registered successfully',
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('💥 Register Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔑 Login attempt:', { email });
        
        if (!email || !password) {
            console.error('❌ Missing email or password');
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            console.error('❌ User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            console.error('❌ Invalid password');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('✅ Login successful:', user.email);

        res.json({ 
            message: 'Login successful',
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('💥 Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// FORGOT PASSWORD - Generate reset token and send email
const forgotPassword = async (req, res) => {
    console.log('\n========================================');
    console.log('🔐 FORGOT PASSWORD REQUEST STARTED');
    console.log('========================================');
    
    try {
        const { email } = req.body;
        
        console.log('📧 Email received:', email);
        
        // Validate email
        if (!email) {
            console.error('❌ Email is required');
            return res.status(400).json({ message: 'Email is required' });
        }

        console.log('🔍 Searching for user in database...');
        const user = await User.findOne({ email });
        
        if (!user) {
            console.error('❌ User not found for email:', email);
            // For security, return success even if user doesn't exist
            return res.status(200).json({ 
                message: 'If an account with that email exists, a password reset link has been sent.',
                debug: process.env.NODE_ENV === 'development' ? 'User not found' : undefined
            });
        }

        console.log('✅ User found:', { id: user._id, email: user.email, name: user.name });

        // Generate reset token
        console.log('🔑 Generating reset token...');
        const resetToken = crypto.randomBytes(32).toString('hex');
        console.log('✅ Reset token generated:', resetToken.substring(0, 10) + '...');
        
        // Hash token before saving to database
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        console.log('✅ Token hashed for storage');

        // Save hashed token and expiry to user
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();
        console.log('✅ Reset token saved to database');
        console.log('⏰ Token expires at:', new Date(user.resetPasswordExpire).toLocaleString());

        // Create reset URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
        console.log('🔗 Reset URL created:', resetUrl);

        // Check SendGrid configuration
        console.log('\n📧 EMAIL CONFIGURATION CHECK:');
        console.log('   SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
        console.log('   SENDGRID_API_KEY length:', process.env.SENDGRID_API_KEY?.length || 0);
        console.log('   SENDGRID_API_KEY preview:', process.env.SENDGRID_API_KEY?.substring(0, 10) + '...' || 'MISSING');
        console.log('   EMAIL_FROM:', process.env.EMAIL_FROM);
        console.log('   EMAIL_TO:', user.email);

        // Email content
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-bottom: 20px;">🔐 Password Reset Request</h2>
                    <p style="color: #555; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                    <p style="color: #555; font-size: 16px;">You requested a password reset for your Yoliday account. Click the button below to reset your password:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4CAF50; 
                                  color: white; 
                                  padding: 15px 30px; 
                                  text-decoration: none; 
                                  border-radius: 5px;
                                  display: inline-block;
                                  font-weight: bold;
                                  font-size: 16px;">
                            Reset Your Password
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
                    <p style="color: #4CAF50; word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 12px;">
                        ${resetUrl}
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">
                        ⏰ This link will expire in <strong>10 minutes</strong>.
                    </p>
                    <p style="color: #999; font-size: 12px;">
                        🛡️ If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                    </p>
                    
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">
                        Best regards,<br>
                        <strong>Yoliday Team</strong>
                    </p>
                </div>
            </div>
        `;

        console.log('\n📨 Attempting to send email via SendGrid...');
        
        try {
            const emailResult = await sendEmail({
                to: user.email,
                subject: '🔐 Password Reset Request - Yoliday',
                html: message
            });

            console.log('✅✅✅ EMAIL SENT SUCCESSFULLY! ✅✅✅');
            console.log('📧 Email details:', {
                to: user.email,
                subject: 'Password Reset Request - Yoliday',
                result: emailResult
            });

            console.log('\n========================================');
            console.log('✅ FORGOT PASSWORD COMPLETED SUCCESSFULLY');
            console.log('========================================\n');

            res.status(200).json({ 
                message: 'Password reset link has been sent to your email.',
                success: true,
                debug: process.env.NODE_ENV === 'development' ? {
                    email: user.email,
                    resetUrl: resetUrl,
                    expiresIn: '10 minutes'
                } : undefined
            });

        } catch (emailError) {
            console.error('\n❌❌❌ EMAIL SENDING FAILED! ❌❌❌');
            console.error('📧 Email Error Type:', emailError.name);
            console.error('📧 Email Error Message:', emailError.message);
            console.error('📧 Full Error:', emailError);
            
            if (emailError.response) {
                console.error('📧 SendGrid Response Body:', emailError.response.body);
                console.error('📧 SendGrid Response Code:', emailError.response.statusCode);
            }
            
            // Clear the reset token if email fails
            console.log('🗑️ Clearing reset token due to email failure...');
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            console.log('✅ Reset token cleared');
            
            console.log('\n========================================');
            console.log('❌ FORGOT PASSWORD FAILED - EMAIL ERROR');
            console.log('========================================\n');
            
            return res.status(500).json({ 
                message: 'Email could not be sent. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? {
                    message: emailError.message,
                    details: emailError.response?.body
                } : undefined
            });
        }

    } catch (error) {
        console.error('\n💥💥💥 FORGOT PASSWORD ERROR! 💥💥💥');
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);
        console.error('Full Error:', error);
        console.error('Stack Trace:', error.stack);
        
        console.log('\n========================================');
        console.log('❌ FORGOT PASSWORD FAILED - SERVER ERROR');
        console.log('========================================\n');
        
        res.status(500).json({ 
            message: 'Server error during password reset request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// RESET PASSWORD - Actually reset the password
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        console.log('🔐 Reset password attempt with token');

        if (!password) {
            console.error('❌ Password is required');
            return res.status(400).json({ message: 'Password is required' });
        }

        if (password.length < 6) {
            console.error('❌ Password too short');
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Hash the token from URL
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with this token and check if not expired
        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            console.error('❌ Invalid or expired token');
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        console.log('✅ Password reset successful for:', user.email);

        // Generate new auth token
        const authToken = generateToken(user._id);

        res.status(200).json({ 
            message: 'Password has been reset successfully',
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('💥 Reset password error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
};

module.exports = { register, login, forgotPassword, resetPassword };