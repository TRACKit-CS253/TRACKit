const db = require('../models');
const User = db.User;
const Faculty = db.Faculty;
const Student = db.Student;
const Course = db.Course;

/**
 * Middleware to check if user is associated with course (either as faculty or student)
 */
const isUserInCourse = async (req, res, next) => {
  try {
    const userId = req.userId;
    const courseId = parseInt(req.params.courseId || req.body.courseId);
    
    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course ID is required' 
      });
    }
    
    // Get user type
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if admin (admins have access to all courses)
    if (user.userType === 'admin') {
      return next();
    }
    
    // Check if faculty associated with course
    if (user.userType === 'faculty') {
      const facultyCourses = await Faculty.findByPk(userId, {
        include: [{
          model: Course,
          as: 'courses',
          where: { id: courseId },
          required: false
        }]
      });
      
      if (facultyCourses && facultyCourses.courses && facultyCourses.courses.length > 0) {
        return next();
      }
    }
    
    // Check if student associated with course
    if (user.userType === 'student') {
      const studentCourses = await Student.findByPk(userId, {
        include: [{
          model: Course,
          as: 'courses',
          where: { id: courseId },
          required: false
        }]
      });
      
      if (studentCourses && studentCourses.courses && studentCourses.courses.length > 0) {
        return next();
      }
    }
    
    // If we get here, user is not associated with course
    return res.status(403).json({
      success: false,
      message: 'You are not associated with this course'
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Middleware to check if user is faculty in course
 */
console.log('isFacultyInCourse Middleware Hit');
const isFacultyInCourse = async (req, res, next) => {
  try {
    const userId = req.userId;
    const courseId = parseInt(req.params.courseId || req.body.courseId);
    
    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course ID is required' 
      });
    }
    
    // Get user type
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if admin (admins have faculty privileges)
    if (user.userType === 'admin') {
      return next();
    }
    
    // Check if faculty and associated with course
    if (user.userType === 'faculty') {
      const facultyCourses = await Faculty.findByPk(userId, {
        include: [{
          model: Course,
          as: 'courses',
          where: { id: courseId },
          required: false
        }]
      });
      
      if (facultyCourses && facultyCourses.courses && facultyCourses.courses.length > 0) {
        return next();
      }
    }
    
    // If we get here, user is not faculty associated with course
    return res.status(403).json({
      success: false,
      message: 'You must be faculty associated with this course'
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  isUserInCourse,
  isFacultyInCourse
};
