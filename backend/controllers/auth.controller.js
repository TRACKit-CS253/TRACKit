const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mailConfig = require('../config/mail.config');
const db = require('../models');
const { sendPasswordResetEmail } = require('../mailer');
const User = db.User;
const Admin = db.Admin;
const Faculty = db.Faculty;
const Student = db.Student;
const OTP = db.OTP;  // Add this line

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: mailConfig.service,
  auth: {
    user: mailConfig.email,
    pass: mailConfig.password,
  },
});

exports.signup = async (req, res) => {
  // Only admins can create users, this is just for structure
  try {
    // Hash password
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    // Create user
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userType: req.body.userType
    });

    // Create specific user type record
    if (req.body.userType === 'admin') {
      await Admin.create({
        userId: user.id,
        //adminLevel: req.body.adminLevel || 1
      });
    } else if (req.body.userType === 'faculty') {
      await Faculty.create({
        userId: user.id,
        department: req.body.department,
        position: req.body.position
      });
    } else if (req.body.userType === 'student') {
      await Student.create({
        userId: user.id,
        rollNumber: req.body.rollNumber,
        enrollmentYear: req.body.enrollmentYear,
        major: req.body.major
      });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: user.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred during registration'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check password
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    
    if (!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Fetch additional user-specific data based on user type
    let additionalData = {};

    if (user.userType === 'student') {
      const student = await Student.findOne({ where: { userId: user.id } });
      if (student) {
        additionalData = {
          rollNumber: student.rollNumber,
          enrollmentYear: student.enrollmentYear,
          major: student.major
        };
      }
    } else if (user.userType === 'faculty') {
      const faculty = await Faculty.findOne({ where: { userId: user.id } });
      if (faculty) {
        additionalData = {
          department: faculty.department,
          position: faculty.position
        };
      }
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, userType: user.userType }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        ...additionalData  // Include the user-specific data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred during login'
    });
  }
};

exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.body;

    // Find user
    const user = await User.findOne({ 
      where: { username },
      attributes: ['id', 'email'] // Only fetch necessary fields
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No such user exists'
      });
    }

    // User exists, send success response
    return res.status(200).json({
      success: true,
      message: 'User found',
      userId: user.id,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error checking username'
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account with that email address exists'
      });
    }

    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    
    // Save or update OTP
    await OTP.upsert({
      userId: user.id,
      otp: otp,
      expiry: new Date(Date.now() + 600000) // 10 minutes
    });

    // Send OTP email
    const result = await sendPasswordResetEmail(email, otp);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'OTP has been sent to your email'
      });
    } else {
      throw new Error(result.error || 'Failed to send OTP');
    }

  } catch (error) {
    console.error('OTP send error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP'
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // First find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Then check OTP
    const otpRecord = await OTP.findOne({
      where: {
        userId: user.id,
        otp: parseInt(otp),
        expiry: { [db.Sequelize.Op.gt]: new Date() }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Delete OTP after successful verification
    await otpRecord.destroy();

    // Generate temporary token
    const resetToken = jwt.sign(
      { id: user.id, purpose: 'reset-password' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.status(200).json({
      success: true,
      userId: user.id,
      token: resetToken,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying OTP'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired reset session'
      });
    }

    // Check if the token was meant for password reset
    if (decoded.purpose !== 'reset-password' || decoded.id !== userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid reset attempt'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check for complexity (at least one uppercase, one lowercase, one number, one special character)
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    // Update password
    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    await user.update({
      password: hashedPassword
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting password'
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId; // From verifyToken middleware

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const validPassword = bcrypt.compareSync(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    await user.update({ password: hashedPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error changing password'
    });
  }
};
