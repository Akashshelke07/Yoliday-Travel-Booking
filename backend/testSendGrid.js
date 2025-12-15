// testSendGrid.js
// Place this file in your backend root folder and run: node testSendGrid.js

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

console.log('\n========================================');
console.log('🧪 TESTING SENDGRID EMAIL');
console.log('========================================\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log('   ✓ SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
console.log('   ✓ SENDGRID_API_KEY format:', process.env.SENDGRID_API_KEY?.startsWith('SG.') ? 'Valid (starts with SG.)' : 'Invalid');
console.log('   ✓ SENDGRID_API_KEY length:', process.env.SENDGRID_API_KEY?.length || 0);
console.log('   ✓ EMAIL_FROM:', process.env.EMAIL_FROM || 'MISSING');
console.log();

if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ ERROR: SENDGRID_API_KEY is missing from .env file!');
    console.error('   Please add: SENDGRID_API_KEY=SG.your_key_here');
    process.exit(1);
}

if (!process.env.EMAIL_FROM) {
    console.error('❌ ERROR: EMAIL_FROM is missing from .env file!');
    console.error('   Please add: EMAIL_FROM=shelkeakash0828@gmail.com');
    process.exit(1);
}

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log('✅ SendGrid API key configured\n');

// Prepare test email
const msg = {
    to: 'akashshelke594@gmail.com',
    from: process.env.EMAIL_FROM,
    subject: '🧪 Test Email - Yoliday SendGrid Setup',
    text: 'This is a plain text test email from your Yoliday backend.',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4CAF50;">✅ SendGrid is Working!</h2>
            <p>If you're reading this, your SendGrid email configuration is set up correctly.</p>
            <hr style="border: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 14px;">
                <strong>Configuration Details:</strong><br>
                From: ${process.env.EMAIL_FROM}<br>
                To: akashshelke594@gmail.com<br>
                Date: ${new Date().toLocaleString()}
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This is a test email from Yoliday Travel Booking System.
            </p>
        </div>
    `
};

console.log('📧 Sending test email...');
console.log('   From:', msg.from);
console.log('   To:', msg.to);
console.log('   Subject:', msg.subject);
console.log();

// Send email
sgMail
    .send(msg)
    .then((response) => {
        console.log('✅✅✅ EMAIL SENT SUCCESSFULLY! ✅✅✅');
        console.log('   Status Code:', response[0].statusCode);
        console.log('   Status Message:', response[0].statusMessage);
        console.log();
        console.log('📬 Check your inbox at: akashshelke594@gmail.com');
        console.log('   (Don\'t forget to check spam folder!)');
        console.log();
        console.log('========================================');
        console.log('✅ TEST COMPLETED SUCCESSFULLY');
        console.log('========================================\n');
    })
    .catch((error) => {
        console.error('\n❌❌❌ EMAIL SENDING FAILED! ❌❌❌\n');
        console.error('Error Details:');
        console.error('   Name:', error.name);
        console.error('   Message:', error.message);
        console.error();
        
        if (error.response) {
            console.error('SendGrid Response:');
            console.error('   Status Code:', error.response.statusCode);
            console.error('   Body:', JSON.stringify(error.response.body, null, 2));
            console.error();
            
            // Specific error handling
            if (error.response.statusCode === 403) {
                console.error('🔴 AUTHENTICATION ERROR');
                console.error('   Your API key is invalid or doesn\'t have the right permissions.');
                console.error('   Solution: Create a new API key with "Mail Send" permission.');
            } else if (error.response.statusCode === 400) {
                const errorBody = error.response.body;
                if (errorBody.errors && errorBody.errors[0]?.message?.includes('does not match a verified')) {
                    console.error('🔴 SENDER EMAIL NOT VERIFIED');
                    console.error('   The "from" email address is not verified in SendGrid.');
                    console.error('   Solution: Verify', process.env.EMAIL_FROM, 'in SendGrid dashboard.');
                }
            }
        }
        
        console.error('Full Error:', error);
        console.error();
        console.error('========================================');
        console.error('❌ TEST FAILED');
        console.error('========================================\n');
        process.exit(1);
    });