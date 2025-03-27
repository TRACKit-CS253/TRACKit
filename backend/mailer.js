const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const port = 3005;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // To handle JSON requests

const users = {
  'akashv22@iitk.ac.in': {
    email: 'akashv22@iitk.ac.in',
    password: 'initialpassword'
  }
};

// Function to send a password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'pwdchange247@gmail.com', // Use an app password instead of a regular password
        pass: 'ujkhrsqgutoszoew',
      },
    });

    const mailOptions = {
      from: 'pwdchange247@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: http://localhost:${port}/reset-password/${resetToken}`,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

// Function to send a test password reset email when the server starts
const sendTestEmail = async () => {
  const email = 'akashv22@iitk.ac.in';
  const resetToken = crypto.randomBytes(20).toString('hex');
  users[email].resetToken = resetToken;

  const { success } = await sendPasswordResetEmail(email, resetToken);
  if (success) {
    console.log('Test email sent successfully');
  } else {
    console.log('Error sending test email');
  }
};

// Route to initiate password reset
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).send('Email is required');
  }

  if (users[email]) {
    const resetToken = crypto.randomBytes(20).toString('hex');
    users[email].resetToken = resetToken;

    const { success } = await sendPasswordResetEmail(email, resetToken);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error sending email'
      });
    }
  } else {
    res.status(404).send('Email not found');
  }
});

// Route to validate reset token and show password reset form
app.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  
  if (Object.values(users).some(user => user.resetToken === token)) {
    res.send('<form method="post" action="/reset-password"><input type="password" name="password" required><input type="submit" value="Reset Password"></form>');
  } else {
    res.status(404).send('Invalid or expired token');
  }
});

// Route to update the password
app.post('/reset-password', (req, res) => {
  const { token, password } = req.body;
  
  const user = Object.values(users).find(user => user.resetToken === token);
  if (user) {
    user.password = password;
    delete user.resetToken;
    res.status(200).send('Password updated successfully');
  } else {
    res.status(404).send('Invalid or expired token');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  sendTestEmail();
});