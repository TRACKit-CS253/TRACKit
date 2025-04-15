const express = require('express');
const router = express.Router();
const courseDescEntryController = require('../controllers/courseDescriptionEntry.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { isUserInCourse, isFacultyInCourse } = require('../middleware/course.middleware');

// Get all course description entries for a course (users associated with course)
router.get('/course/:courseId', [verifyToken, isUserInCourse], courseDescEntryController.getDescriptionEntriesByCourse);

// Create a new course description entry (faculty only)
router.post('/', [verifyToken, isFacultyInCourse], courseDescEntryController.createDescriptionEntry);

// Update a course description entry (faculty only)
router.put('/:courseId/:id', [verifyToken, isFacultyInCourse], courseDescEntryController.updateDescriptionEntry);

// Delete a course description entry (faculty only)
router.delete('/:courseId/:id', [verifyToken, isFacultyInCourse], courseDescEntryController.deleteDescriptionEntry);

module.exports = router;
