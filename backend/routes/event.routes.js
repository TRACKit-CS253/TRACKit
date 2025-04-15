const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all events for a course
router.get('/course/:courseId', eventController.getEventsByCourse);

// Create a new event for a course
router.post('/course/:courseId', verifyToken, eventController.createEvent);

// Update an event
router.put('/:eventId', verifyToken, eventController.updateEvent);

// Delete an event
router.delete('/:eventId', verifyToken, eventController.deleteEvent);

// Add to your routes/event.routes.js
router.get('/user/:userId', verifyToken, eventController.getEventsByUser);
module.exports = router;