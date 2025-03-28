const nodemailer = require('nodemailer');

// Create reusable transporter 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pwdchange247@gmail.com',
    pass: 'ujkhrsqgutoszoew'
  },
});

// Function to send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const mailOptions = {
      from: 'pwdchange247@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="http://localhost:3000/reset-password/${resetToken}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', email);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Only export the function
module.exports = {
  sendPasswordResetEmail
};
