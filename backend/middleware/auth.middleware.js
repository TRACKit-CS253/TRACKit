const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

const verifyToken = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'No token provided!'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;

    // Fetch the user's role (userType) from the database
    const user = await User.findByPk(decoded.id, { attributes: ['userType'] });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found!'
      });
    }

    req.userRole = user.userType; // Add userType to the request object
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized! Token is invalid.',
      error: err.message
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (user && user.userType === 'admin') {
      next();
      return;
    }

    res.status(403).json({
      message: "Require Admin Role!"
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin
};
