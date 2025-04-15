const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public routes for authentication
router.post('/login', authController.login);
router.post('/check-username', authController.checkUsername);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

// Protected route for changing password when logged in
router.put('/change-password', verifyToken, authController.changePassword);

// Protected routes (Admin only)
router.post('/signup', [verifyToken, isAdmin], authController.signup);

module.exports = router;
