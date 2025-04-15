const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result.controller');

// Route to get results for a student in a course
router.get('/student/:userId/course/:courseId', resultController.getStudentResults);

// Route to get exam names and IDs for a course
router.get('/course/:courseId/exams', resultController.getExamsForCourse);

// Route to get exam details and student results for an exam in a course
router.get('/course/:courseId/exam/:examId', resultController.getExamDetailsAndResults);

// Route to fetch student details for a course
router.get('/course/:courseId/students', resultController.getStudentsForCourse);

// Route to publish exam results for a course
router.post('/course/:courseId/publish', resultController.publishExamResults);

// Route to delete an exam and associated results
router.delete('/exam/:examId/delete', resultController.deleteExam);

// Route to modify an exam and associated results
router.put('/exam/:examId/modify', resultController.modifyExam);

// route to get exams with details for a course.
router.get('/course/:courseId/exams/details', resultController.getExamsWithDetailsForCourse);

module.exports = router;