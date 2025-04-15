const db = require('../models');
const Announcement = db.Announcement;
const Faculty = db.Faculty;
const User = db.User;

// Get all announcements for a specific course
exports.getAnnouncementsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const announcements = await Announcement.findAll({
      where: { courseId },
      include: [{
        model: Faculty,
        attributes: ['userId', 'department', 'position'],
        include: {
          model: User,
          attributes: ['firstName', 'lastName', 'email','username']
        }
      }],
      order: [['createdAt', 'DESC']] // Most recent first
    });
    
    res.status(200).json({
      success: true,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while retrieving announcements'
    });
  }
};

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { courseId, announcementHeading, announcementBody } = req.body;
    const facultyId = req.userId; // Faculty ID is the user ID
    
    const announcement = await Announcement.create({
      courseId,
      facultyId,
      announcementHeading,
      announcementBody
    });
    
    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while creating the announcement'
    });
  }
};

// Update an announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;
    const courseId = req.params.courseId;
    const { announcementHeading, announcementBody } = req.body;
    
    // Check if announcement exists
    const announcement = await Announcement.findOne({
      where: {
        id: announcementId,
        courseId: courseId
      }
    });
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    // Update announcement
    await announcement.update({
      announcementHeading: announcementHeading || announcement.announcementHeading,
      announcementBody: announcementBody || announcement.announcementBody,
      updatedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while updating the announcement'
    });
  }
};

// Delete an announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;
    const courseId = req.params.courseId;
    // Check if announcement exists
    const announcement = await Announcement.findOne({
      where: {
        id: announcementId,
        courseId: courseId
      }
    });
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    // Delete announcement
    await announcement.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while deleting the announcement'
    });
  }
};
