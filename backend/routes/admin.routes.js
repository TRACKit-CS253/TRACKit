const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to verify admin access for all routes in this file
router.use([authMiddleware.verifyToken, authMiddleware.isAdmin]);

// User management routes
router.post('/student', adminController.addStudent);
router.post('/faculty', adminController.addFaculty);
router.post('/bulk-faculty', upload.single('file'), adminController.bulkCreateFaculty); // Add file upload middleware
router.post('/user', adminController.createUser);
router.post('/bulk-students', upload.single('file'), adminController.bulkCreateStudents); // Add file upload middleware
router.get('/users', adminController.getAllUsers);
router.put('/user/:userId', adminController.updateUser);
router.delete('/user/:userId', adminController.deleteUser);

// Course management routes
router.post('/course', adminController.createCourse);
router.post('/bulk-courses', upload.single('file'), adminController.bulkCreateCourses); // Ensure 'file' matches the frontend field name
router.get('/courses', adminController.getAllCourses);
router.put('/course/:courseId', adminController.updateCourse);
router.delete('/course/:courseId', adminController.deleteCourse);

// Add a test endpoint to check database connectivity and persistence
router.get('/test-db', adminController.testDBPersistence);

// Add debug endpoint
router.get('/test-course-api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Course API is working',
    authStatus: 'Authenticated',
    user: {
      id: req.userId,
      role: req.userRole
    }
  });
});

module.exports = router;
