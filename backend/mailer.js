const nodemailer = require('nodemailer');
const mailConfig = require('./config/mail.config');

const transporter = nodemailer.createTransport({
  service: mailConfig.service,
  auth: {
    user: mailConfig.email,
    pass: mailConfig.password,
  },
});

const sendPasswordResetEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: mailConfig.email,
      to: email,
      subject: 'TRACKit Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2d3748;">Password Reset OTP</h1>
          <p>You have requested to reset your password.</p>
          <p>Your OTP for password reset is: <strong style="font-size: 24px; color: #4a5568;">${otp}</strong></p>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this password reset, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail
};
