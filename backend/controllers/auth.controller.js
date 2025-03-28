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
      { expiresIn: '24h' }
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
  console.log('Received password reset request for:', email);

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account with that email address exists'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const result = await sendPasswordResetEmail(email, resetToken);

    if (result.success) {
      // Save reset token to user record
      await user.update({
        resetToken: resetToken,
        resetTokenExpiry: new Date(Date.now() + 3600000) // 1 hour expiry
      });

      console.log('Password reset email sent successfully');
      return res.status(200).json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Reset email error:', error);
    return res.status(500).json({
      success: false, 
      message: 'Error sending password reset email'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          [db.Sequelize.Op.gt]: new Date() // Token hasn't expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired'
      });
    }

    // Hash new password and update user
    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};
