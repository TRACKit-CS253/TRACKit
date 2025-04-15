const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.User;
const Admin = db.Admin;
const Faculty = db.Faculty;
const Student = db.Student;

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    // Authorization check: Users can only view themselves unless they're admins
    if (req.userId != req.params.id && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own profile'
      });
    }
    
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get specific user type information with more detailed attributes
    let specificInfo = {};
    if (user.userType === 'admin') {
      specificInfo = await Admin.findOne({ where: { userId: user.id } });
    } else if (user.userType === 'faculty') {
      specificInfo = await Faculty.findOne({ 
        where: { userId: user.id },
        attributes: ['department', 'position'] // Explicitly include these fields
      });
    } else if (user.userType === 'student') {
      specificInfo = await Student.findOne({ 
        where: { userId: user.id },
        attributes: ['rollNumber', 'enrollmentYear', 'major'] // Explicitly include these fields
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...user.dataValues,
        specificInfo: specificInfo || {}
      }
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while retrieving the user'
    });
  }
};

// Get user courses
exports.getUserCourses = async (req, res) => {
  try {
    // Authorization check: Users can only view their own courses unless they're admins
    if (req.userId != req.params.id && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own courses'
      });
    }
    
    const userId = req.params.id;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'userType']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    let courses = [];
    
    if (user.userType === 'student') {
      const student = await Student.findByPk(userId, {
        include: [{
          model: db.Course,
          as: 'courses',
          through: { attributes: [] }
        }]
      });
      courses = student ? student.courses : [];
    } else if (user.userType === 'faculty') {
      const faculty = await Faculty.findByPk(userId, {
        include: [{
          model: db.Course,
          as: 'courses',
          through: { attributes: [] }
        }]
      });
      courses = faculty ? faculty.courses : [];
    }
    
    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving courses'
    });
  }
};

// Update user profile (only for the user themselves)
exports.updateProfile = async (req, res) => {
  try {
    // Users can only update their own profile
    if (req.userId != req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update your own profile'
      });
    }
    
    const userId = req.params.id;
    const updateData = { ...req.body };
    
    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = bcrypt.hashSync(updateData.password, 8);
    }
    
    // Don't allow changing userType
    delete updateData.userType;
    
    const [updated] = await User.update(updateData, {
      where: { id: userId }
    });
    
    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while updating the profile'
    });
  }
};

// Change user password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Password change attempt:', {
      requestUserId: req.userId,
      targetUserId: userId,
      hasOldPassword: !!req.body.oldPassword,
      hasNewPassword: !!req.body.newPassword
    });

    if (req.userId != userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only change your own password'
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both old and new passwords are required'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const passwordIsValid = bcrypt.compareSync(oldPassword, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 8);
    await user.update({ password: hashedPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while changing the password'
    });
  }
};
