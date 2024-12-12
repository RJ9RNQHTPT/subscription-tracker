// Import required modules
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables at the start
const sendReminderEmail = require('./utils/sendReminderEmail');

// Debugging: Confirm .env variables are being loaded correctly
console.log('Debug: Checking .env variables...');
console.log('EMAIL_USER:', process.env.EMAIL_USER); // Should log your email
console.log('EMAIL_PASS:', process.env.EMAIL_PASS); // Should log your app password

// Define a test subscription object
const subscription = {
  serviceName: 'Netflix',
  endDate: '2024-12-07', // Adjust date to ensure it's valid
};

// Call the sendReminderEmail function
sendReminderEmail('smartsubstracker@gmail.com', subscription)
  .then(() => console.log('✅ Test email sent successfully'))
  .catch((error) => console.error('❌ Failed to send email:', error));



