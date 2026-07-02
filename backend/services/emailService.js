const brevo = require('../config/brevo');

async function sendOTP(email, otp) {
  const emailData = {
    sender: {
      name: process.env.FROM_NAME,
      email: process.env.FROM_EMAIL
    },
    to: [{ email }],
    subject: 'Password Reset OTP',
    htmlContent: `
      <h2>Password Reset</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
    `
  };

  return brevo.transactionalEmails.sendTransacEmail(emailData);
}

module.exports = { sendOTP };
