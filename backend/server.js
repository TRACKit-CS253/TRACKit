require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./models');
const path = require('path');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mailer = require('./mailer'); // Import mailer.js
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');

const app = express();

// app.set('trust proxy', 1); 


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

// Rate limiting
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

app.use(bodyParser.urlencoded({ extended: true }));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename using timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer upload instance with file size limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: function (req, file, cb) {
    // Accept csv files and common text formats that could be CSV
    const filetypes = /csv|text|plain|excel|octet-stream/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype || extname) {
      return cb(null, true);
    }

    cb(new Error('File upload only supports CSV files!'));
  }
});

// Make upload middleware available to route handlers
app.locals.upload = upload;

// Import routes
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
app.use('/api', require('./routes/proxyRoutes'));

// Example using the middleware in routes
const adminController = require('./controllers/admin.controller');
app.post('/api/admin/bulk-create-courses', upload.single('file'), adminController.bulkCreateCourses);
app.post('/api/admin/bulk-create-students', upload.single('file'), adminController.bulkCreateStudents);
app.post('/api/admin/bulk-create-faculty', upload.single('file'), adminController.bulkCreateFaculty);

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
const shouldForceSync = process.env.NODE_ENV === 'development' && process.env.FORCE_SYNC === 'true';

db.sequelize.sync({ force: shouldForceSync })
  .then(async () => {
    console.log('Database synced successfully');
    const userCount = await db.User.count();

    if (shouldForceSync || userCount === 0) {
      console.log(shouldForceSync ? 'Force sync enabled...' : 'Database appears empty...');
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

// Add proper error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

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
