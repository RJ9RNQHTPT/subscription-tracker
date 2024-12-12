const nodemailer = require('nodemailer');

// Utility function to validate email addresses
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const sendReminderEmail = async (recipientEmail, subscription) => {
    if (!isValidEmail(recipientEmail)) {
        console.error(`❌ Invalid email address: ${recipientEmail}`);
        return; // Exit the function if email is invalid
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your preferred email service
        auth: {
            user: process.env.EMAIL_USER, // smartsubstracker@gmail.com .env
            pass: process.env.EMAIL_PASS, // yrwc uqqx ybjq mvvs .env
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender email
        to: recipientEmail, // Recipient email
        subject: `Reminder: ${subscription.serviceName} Subscription Ending Soon`,
        text: `Hi, your subscription to "${subscription.serviceName}" will end on ${subscription.endDate}. Please renew if you'd like to continue.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Reminder email sent to ${recipientEmail}`);
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
};

module.exports = sendReminderEmail;
