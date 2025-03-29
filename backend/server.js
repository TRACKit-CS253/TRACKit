require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./models');
const path = require('path');
const fileUpload = require('express-fileupload');


const app = express();

// Security middleware
app.use(helmet());
app.use(express.json());

// Update CORS configuration
app.use(cors({
  origin: `${process.env.FRONTEND_URL}`, // or whatever port your frontend is running on
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

//Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25000 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Import routes


// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/announcements', require('./routes/announcement.routes'));
app.use('/api/lectures', require('./routes/lecture.routes'));
app.use('/api/course-descriptions', require('./routes/courseDescriptionEntry.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/faculty', require('./routes/faculty.routes'));
app.use('/api/result', require('./routes/result.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/events', require('./routes/event.routes'));
app.use('/api/forum', require('./routes/forum.routes'));
app.use('/api/contact', require('./routes/mail.routes'));

// Log all registered routes
const listRoutes = (app) => {
  console.log('Registered routes:');
  app._router.stack.forEach((middleware) => {
      if (middleware.route) {
          console.log(`${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
      } else if (middleware.name === 'router') {
          middleware.handle.stack.forEach((handler) => {
              if (handler.route) {
                  console.log(`${handler.route.stack[0].method.toUpperCase()} /api${handler.route.path}`);
              }
          });
      }
  });
};
listRoutes(app);

// Initialize database and sync models
// Modified to preserve data between restarts in development mode
const shouldForceSync = process.env.NODE_ENV === 'development' && process.env.FORCE_SYNC === 'true';

db.sequelize.sync({ force: shouldForceSync })
  .then(async () => {
    console.log('Database synced successfully');
    // Only initialize sample data if we're forcing a sync
    if (shouldForceSync) {
      console.log('Waiting for database tables to settle before initialization...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      try {
        await require('./utils/initState')();
        console.log('Sample data initialized successfully');
      } catch (error) {
        console.error('Error during state initialization:', error);
      }
    }
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
  });
  

// Add this to server.js before app.listen()
console.log('Registered routes:');
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(r.route.stack[0].method.toUpperCase() + ' ' + r.route.path);
  }
});

// Add proper error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Ensure routes are properly mounted
app.use('/users', require('./routes/user.routes'));

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});