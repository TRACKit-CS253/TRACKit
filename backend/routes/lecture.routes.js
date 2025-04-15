const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lecture.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { isUserInCourse, isFacultyInCourse } = require('../middleware/course.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');

// ✅ Route to Get All Lectures for a Course (for users associated with the course)
router.get('/course/:courseId', [verifyToken, isUserInCourse], lectureController.getLecturesByCourse);

// ✅ Route to Create a New Lecture (faculty only, with multiple PDF uploads)
router.post(
    '/', 
    [uploadMiddleware('files', 10), verifyToken, isFacultyInCourse], 
    lectureController.createLecture
);

// ✅ Route to Create a Heading (faculty only)
router.post(
    '/heading', 
    [verifyToken, isFacultyInCourse], 
    lectureController.createHeading
);

// // ✅ Route to Edit a Heading (faculty only)
// router.put(
//     '/:courseId/heading', 
//     [verifyToken, isFacultyInCourse], 
//     lectureController.editHeading
// );

// ✅ Route to Delete a Heading (faculty only)
router.delete(
    '/:courseId/heading', 
    [verifyToken, isFacultyInCourse], 
    lectureController.deleteHeading
);

// ✅ Route to Create a Subheading (faculty only)
router.post(
    '/subheading', 
    [verifyToken, isFacultyInCourse], 
    lectureController.createSubheading
);

// ✅ Route to Edit a Subheading (faculty only)
router.put('/:courseId/subheading', [verifyToken, isFacultyInCourse], (req, res, next) => {
    console.log('Edit Subheading Route Hit:', req.params, req.body);
    next();
}, lectureController.editSubheading);

// ✅ Route to Delete a Subheading (faculty only)
router.delete(
    '/:courseId/subheading', 
    [verifyToken, isFacultyInCourse], 
    lectureController.deleteSubheading
);

// ✅ Route to Update a Lecture (faculty only, with multiple PDF uploads)
router.put(
    '/:courseId/:id', 
    [verifyToken, isFacultyInCourse, uploadMiddleware('files', 10)], 
    lectureController.updateLecture
);

// ✅ Route to Delete a Lecture (faculty only)
router.delete(
    '/:courseId/:id', 
    [verifyToken, isFacultyInCourse], 
    lectureController.deleteLecture
);

module.exports = router;
