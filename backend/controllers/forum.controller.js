const db = require('../models');
const ForumPost = db.ForumPost;
const ForumReply = db.ForumReply;
const User = db.User;
const Course = db.Course;

// Get all forum posts for a course
exports.getPostsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const posts = await ForumPost.findAll({
      where: { courseId },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'firstName', 'lastName', 'userType']
        },
        {
          model: db.ForumReply,
          as: 'replies',
          include: [{
            model: User,
            attributes: ['id', 'username', 'firstName', 'lastName', 'userType']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while retrieving forum posts'
    });
  }
};

// Create a new forum post
exports.createPost = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { query } = req.body;
    const userId = req.userId; // From JWT middleware
    
    // Validate required fields
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot be empty'
      });
    }
    
    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const post = await ForumPost.create({
      query,
      courseId,
      userId
    });
    
    // Include user info in response
    const postWithUser = await ForumPost.findByPk(post.id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'firstName', 'lastName', 'userType']
      }]
    });
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: postWithUser
    });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while creating the post'
    });
  }
};

// Delete a forum post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId; // From JWT middleware
    
    // Find the post
    const post = await ForumPost.findByPk(postId, {
      include: [{ model: User }]
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user is owner of the post or a faculty/admin
    const user = await User.findByPk(userId);
    if (post.userId !== userId && user.userType === 'student') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this post'
      });
    }
    
    // Delete all replies to this post first
    await ForumReply.destroy({
      where: { postId }
    });
    
    // Delete the post
    await post.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while deleting the post'
    });
  }
};

// Create a reply to a post
exports.createReply = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.userId; // From JWT middleware
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Reply content cannot be empty'
      });
    }
    
    // Check if post exists
    const post = await ForumPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }
    
    // Create reply
    const reply = await ForumReply.create({
      content,
      postId,
      userId
    });
    
    // Include user info in response
    const replyWithUser = await ForumReply.findByPk(reply.id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'firstName', 'lastName', 'userType']
      }]
    });
    
    res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      data: replyWithUser
    });
  } catch (error) {
    console.error('Error creating forum reply:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while creating the reply'
    });
  }
};

// Delete a reply
exports.deleteReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const userId = req.userId; // From JWT middleware
    
    // Find the reply
    const reply = await ForumReply.findByPk(replyId, {
      include: [{ model: User }]
    });
    
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    // Check if user is owner of the reply or a faculty/admin
    const user = await User.findByPk(userId);
    if (reply.userId !== userId && user.userType === 'student') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this reply'
      });
    }
    
    // Delete the reply
    await reply.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting forum reply:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while deleting the reply'
    });
  }
};