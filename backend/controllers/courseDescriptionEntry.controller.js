const db = require('../models');
const CourseDescriptionEntry = db.CourseDescriptionEntry;
const Faculty = db.Faculty;
const User = db.User;

// Get all course description entries for a specific course
exports.getDescriptionEntriesByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const entries = await CourseDescriptionEntry.findAll({
      where: { courseId },
      include: [{
      model: Faculty,
      attributes: ['userId', 'department', 'position'],
      include: {
        model: User,
        attributes: ['firstName', 'lastName', 'email', 'username']
      }
      }],
      // Ascending by id
      order: [['id', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while retrieving course description entries'
    });
  }
};

// Create a new course description entry
exports.createDescriptionEntry = async (req, res) => {
  try {
    const { courseId, courseDescriptionEntryHeading, courseDescriptionEntryBody } = req.body;
    const facultyId = req.userId; // Faculty ID is the user ID
    
    const entry = await CourseDescriptionEntry.create({
      courseId,
      facultyId,
      courseDescriptionEntryHeading,
      courseDescriptionEntryBody
    });
    
    res.status(201).json({
      success: true,
      message: 'Course description entry created successfully',
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while creating the course description entry'
    });
  }
};

// Update a course description entry
exports.updateDescriptionEntry = async (req, res) => {
  try {
    const entryId = req.params.id;
    const courseId = req.params.courseId;
    const { courseDescriptionEntryHeading, courseDescriptionEntryBody } = req.body;
    
    // Check if entry exists
    //const entry = await CourseDescriptionEntry.findByPk(entryId);
    const entry = await CourseDescriptionEntry.findOne({
      where: {
        id: entryId,
        courseId: courseId
      }
    });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Course description entry not found'
      });
    }
    
    // Update entry
    await entry.update({
      courseDescriptionEntryHeading: courseDescriptionEntryHeading || entry.courseDescriptionEntryHeading,
      courseDescriptionEntryBody: courseDescriptionEntryBody || entry.courseDescriptionEntryBody,
      updatedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Course description entry updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while updating the course description entry'
    });
  }
};

// Delete a course description entry
exports.deleteDescriptionEntry = async (req, res) => {
  try {
    const entryId = req.params.id;
    const courseId = req.params.courseId;
    // Check if entry exists
    //const entry = await CourseDescriptionEntry.findByPk(entryId);
    const entry = await CourseDescriptionEntry.findOne({
      where: {
        id: entryId,
        courseId: courseId
      }
    });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Course description entry not found'
      });
    }
    
    // Delete entry
    await entry.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Course description entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while deleting the course description entry'
    });
  }
};
