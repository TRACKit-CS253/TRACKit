const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { isUserInCourse, isFacultyInCourse } = require('../middleware/course.middleware');

// Get all announcements for a course (users associated with course)
router.get('/course/:courseId', [verifyToken, isUserInCourse], announcementController.getAnnouncementsByCourse);

// Create a new announcement (faculty only)
router.post('/', [verifyToken, isFacultyInCourse], announcementController.createAnnouncement);

// Update an announcement (faculty only)
router.put('/:courseId/:id', [verifyToken, isFacultyInCourse], announcementController.updateAnnouncement);

// Delete an announcement (faculty only)
router.delete('/:courseId/:id', [verifyToken, isFacultyInCourse], announcementController.deleteAnnouncement);

module.exports = router;
