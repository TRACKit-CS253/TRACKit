const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

// Apply verifyToken middleware to all routes
router.use(verifyToken);

// User profile routes
router.get('/profile', (req, res) => {
  res.redirect(`/api/users/${req.userId}`);
});

router.get('/courses', (req, res) => {
  res.redirect(`/api/users/${req.userId}/courses`);
});

// Get user by ID - Protected with authorization check
router.get('/:id', userController.getUserById);

// Update user's own profile
router.put('/:id', userController.updateProfile);

// Change password route
router.put('/:id/change-password', verifyToken, userController.changePassword);

// Get user courses - Protected with authorization check
router.get('/:id/courses', userController.getUserCourses);

module.exports = router;
