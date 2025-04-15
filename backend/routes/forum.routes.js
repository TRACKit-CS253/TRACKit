const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forum.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { isUserInCourse, isFacultyInCourse } = require('../middleware/course.middleware');

// Get all forum posts for a course
router.get('/course/:courseId', [
  verifyToken, 
  isUserInCourse
], forumController.getPostsByCourse);

// Create a new forum post for a course
router.post('/course/:courseId', [
  verifyToken, 
  isUserInCourse
], forumController.createPost);

// Delete a forum post
router.delete('/post/:postId', [
  verifyToken
], forumController.deletePost);

// Create a reply to a post
router.post('/post/:postId/reply', [
  verifyToken
], forumController.createReply);

// Delete a reply
router.delete('/reply/:replyId', [
  verifyToken
], forumController.deleteReply);

module.exports = router;