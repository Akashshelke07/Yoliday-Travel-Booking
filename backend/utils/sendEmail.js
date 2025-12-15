const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
    try {
        const msg = {
            to: options.to,
            from: process.env.EMAIL_FROM,
            subject: options.subject,
            html: options.html
        };

        const info = await sgMail.send(msg);
        console.log('✅ Email sent via SendGrid');
        return info;

    } catch (error) {
        console.error('❌ SendGrid error:', error);
        if (error.response) {
            console.error('SendGrid error details:', error.response.body);
        }
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;