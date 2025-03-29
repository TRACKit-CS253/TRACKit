const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config();

router.post('/send-email', async (req, res) => {
  const { subject, message, userEmail } = req.body;

  try {
    // Configure the transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
      auth: {
        user: process.env.EMAIL, // Replace with your email
        pass: process.env.PASS, // Replace with your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: userEmail, // Sender's email
      to: 'trackit.cs253@gmail.com', // Admin's email
      subject: `Contact Form: ${subject}`,
      text: `Message from ${userEmail}:\n\n${message}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
});

module.exports = router;