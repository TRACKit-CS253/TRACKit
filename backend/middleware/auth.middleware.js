const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(403).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Invalid token' 
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.userType !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Require Admin role' 
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const isFaculty = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.userType !== 'faculty' && user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Require Faculty role'
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isFaculty
};
