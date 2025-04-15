const db = require('../models');
const Student = db.Student;
const User = db.User;

// Get student profile by ID
exports.getStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // First find the student record
    const student = await Student.findOne({ 
      where: { userId: studentId }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Then get the associated user
    const user = await User.findByPk(studentId, {
      attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'userType']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Combine student and user data
    const profileData = {
      ...user.dataValues,
      rollNumber: student.rollNumber,
      enrollmentYear: student.enrollmentYear,
      major: student.major
    };

    console.log('Student profile data:', profileData);

    res.status(200).json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while retrieving student profile'
    });
  }
};

// Update student details
exports.updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { rollNumber, enrollmentYear, major } = req.body;

    // Check if student exists
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update student profile
    await student.update({
      rollNumber: rollNumber || student.rollNumber,
      enrollmentYear: enrollmentYear || student.enrollmentYear,
      major: major || student.major
    });

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while updating student profile'
    });
  }
};

// get UserId by RollNumber
exports.getUserIdByRollNumber = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const student = await Student.findOne({ where: { rollNumber } });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    res.status(200).json({
      success: true,
      userId: student.userId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while retrieving student'
    });
  }
};