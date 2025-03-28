const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public routes
router.post('/login', authController.login);
router.post('/check-username', authController.checkUsername);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes (Admin only)
router.post('/signup', [verifyToken, isAdmin], authController.signup);

module.exports = router;
