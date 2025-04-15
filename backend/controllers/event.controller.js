const db = require('../models');
const Event = db.Event;
// Add this to your controllers/event.controller.js

// Get all events for a user (from their enrolled courses)
exports.getEventsByUser = async (req, res) => {
    try {
      const userId = req.params.userId;
      const { start, end } = req.query; // Optional date range parameters
      
      // Find all courses the user is enrolled in
      const user = await db.User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      let courses;
      if (user.userType === 'student') {
        const student = await db.Student.findOne({ where: { userId } });
        courses = await student.getCourses();
      } else if (user.userType === 'faculty') {
        const faculty = await db.Faculty.findOne({ where: { userId } });
        courses = await faculty.getCourses();
      } else {
        courses = await db.Course.findAll();
      }
      
      const courseIds = courses.map(course => course.id);
      
      // Build the query for events
      const whereClause = { courseId: { [db.Sequelize.Op.in]: courseIds } };
      
      // Add date range filter if provided
      if (start && end) {
        whereClause.start = { 
          [db.Sequelize.Op.gte]: new Date(start),
          [db.Sequelize.Op.lte]: new Date(end)
        };
      }
      
      // Fetch all events for these courses
      const events = await db.Event.findAll({
        where: whereClause,
        order: [['start', 'ASC']]
      });
      
      res.status(200).json({
        success: true,
        data: events
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Some error occurred while retrieving events'
      });
    }
  };
// Get all events for a specific course
exports.getEventsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const events = await Event.findAll({
      where: { courseId },
      order: [['start', 'ASC']]
    });
    
    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while retrieving events'
    });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, start, end } = req.body;
    
    // Validate that start is before end
    if (new Date(start) >= new Date(end)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }
    
    const event = await Event.create({
      title,
      description,
      start,
      end,
      courseId,
      createdBy: req.userId // Assuming you have user ID from auth middleware
    });
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while creating the event'
    });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, start, end } = req.body;
    
    // Validate that start is before end
    if (start && end && new Date(start) >= new Date(end)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }
    
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    await event.update({
      title: title || event.title,
      description: description || event.description,
      start: start || event.start,
      end: end || event.end
    });
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while updating the event'
    });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByPk(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    await event.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while deleting the event'
    });
  }
};