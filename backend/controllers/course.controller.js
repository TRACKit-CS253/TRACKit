const db = require('../models');
const Course = db.Course;
const Faculty = db.Faculty;
const Student = db.Student;

// Create a new course (admin only)
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      code: req.body.code,
      name: req.body.name,
      description: req.body.description,
      credits: req.body.credits,
      semester: req.body.semester
    });
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      courseId: course.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while creating the course'
    });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while retrieving courses'
    });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { 
          model: Faculty, 
          as: 'faculty', 
          through: { attributes: [] },
          include: {
            model: db.User,
            attributes: ['id', 'username', 'email', 'firstName', 'lastName'] // Exclude password for security
          }
        },
        { 
          model: Student, 
          as: 'students', 
          through: { attributes: [] },
          include: {
            model: db.User,
            attributes: ['id', 'username', 'email', 'firstName', 'lastName'] // Exclude password for security
          }
        }
      ]
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while retrieving the course'
    });
  }
};

// Update a course (admin only)
exports.updateCourse = async (req, res) => {
  try {
    const [updated] = await Course.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while updating the course'
    });
  }
};

// Delete a course (admin only)
exports.deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while deleting the course'
    });
  }
};

// Add faculty to course (admin only)
exports.addFacultyToCourse = async (req, res) => {
  try {
    const { courseId, userId } = req.body;
    const course = await Course.findByPk(courseId);
    const faculty = await Faculty.findByPk(userId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }
    
    await course.addFaculty(faculty);
    
    res.status(200).json({
      success: true,
      message: 'Faculty added to course successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while adding faculty to course'
    });
  }
};

// Remove faculty from course (admin only)
exports.removeFacultyFromCourse = async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    const course = await Course.findByPk(courseId);
    const faculty = await Faculty.findByPk(userId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }
    
    await course.removeFaculty(faculty);
    
    res.status(200).json({
      success: true,
      message: 'Faculty removed from course successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while removing faculty from course'
    });
  }
};

// Add student to course (admin only)
exports.addStudentToCourse = async (req, res) => {
  try {
    const { courseId, userId } = req.body;
    const course = await Course.findByPk(courseId);
    const student = await Student.findByPk(userId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    await course.addStudent(student);
    
    res.status(200).json({
      success: true,
      message: 'Student added to course successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while adding student to course'
    });
  }
};

// Remove student from course (admin only)
exports.removeStudentFromCourse = async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    const course = await Course.findByPk(courseId);
    const student = await Student.findByPk(userId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    await course.removeStudent(student);
    
    res.status(200).json({
      success: true,
      message: 'Student removed from course successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while removing student from course'
    });
  }
};
