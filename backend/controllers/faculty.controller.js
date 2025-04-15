const db = require('../models');
const Faculty = db.Faculty;
const User = db.User;

// Get faculty profile by ID
exports.getFacultyProfile = async (req, res) => {
  try {
    const facultyId = req.params.id;
    const faculty = await Faculty.findOne({ 
      where: { userId: facultyId },
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'userType']
      }]
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Combine faculty and user data for a complete profile
    const profileData = {
      userId: faculty.User.id,
      username: faculty.User.username,
      firstName: faculty.User.firstName,
      lastName: faculty.User.lastName,
      email: faculty.User.email,
      userType: faculty.User.userType,
      department: faculty.department,
      position: faculty.position
    };

    res.status(200).json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error fetching faculty profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while retrieving faculty profile'
    });
  }
};

// Update faculty details
exports.updateFacultyProfile = async (req, res) => {
  try {
    const facultyId = req.params.id;
    const { department, position } = req.body;

    // Check if faculty exists
    const faculty = await Faculty.findByPk(facultyId);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Update faculty profile
    await faculty.update({
      department: department || faculty.department,
      position: position || faculty.position
    });

    res.status(200).json({
      success: true,
      message: 'Faculty profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while updating faculty profile'
    });
  }
};
