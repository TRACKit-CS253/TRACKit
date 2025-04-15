const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Admin only routes
router.post('/', [verifyToken, isAdmin], courseController.createCourse);
router.put('/:id', [verifyToken, isAdmin], courseController.updateCourse);
router.delete('/:id', [verifyToken, isAdmin], courseController.deleteCourse);

// Course enrollment management (admin only)
router.post('/add-faculty', [verifyToken, isAdmin], courseController.addFacultyToCourse);
router.delete('/remove-faculty/:courseId/:userId', [verifyToken, isAdmin], courseController.removeFacultyFromCourse);
router.post('/add-student', [verifyToken, isAdmin], courseController.addStudentToCourse);
router.delete('/remove-student/:courseId/:userId', [verifyToken, isAdmin], courseController.removeStudentFromCourse);

module.exports = router;
