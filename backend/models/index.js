const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');

// const sequelize = new Sequelize( // Old SQLite connection
//   dbConfig.database,
//   null,
//   null,
//   {
//     dialect: dbConfig.dialect,
//     storage: dbConfig.storage,
//     logging: dbConfig.logging,
//     pool: dbConfig.pool
//   }
// );

const sequelize = new Sequelize( // New PostgreSQL connection
  dbConfig.database,
  dbConfig.username,  // Add username parameter (was null for SQLite)
  dbConfig.password,  // Add password parameter (was null for SQLite)
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user.model')(sequelize, Sequelize);
db.Admin = require('./admin.model')(sequelize, Sequelize);
db.Faculty = require('./faculty.model')(sequelize, Sequelize);
db.Student = require('./student.model')(sequelize, Sequelize);
db.Course = require('./course.model')(sequelize, Sequelize);
db.Announcement = require('./announcement.model')(sequelize, Sequelize);
db.CourseDescriptionEntry = require('./courseDescriptionEntry.model')(sequelize, Sequelize);
db.Exam = require('./exam.model')(sequelize, Sequelize);
db.Result = require('./result.model')(sequelize, Sequelize);
db.Event = require('./events_calendar')(sequelize, Sequelize); // Add this line to import the Event model
db.ForumPost = require('./forum_post.model')(sequelize, Sequelize);
db.ForumReply = require('./forum_reply.model')(sequelize, Sequelize);
db.Heading = require('./heading.model')(sequelize, Sequelize);
db.Subheading = require('./subheading.model')(sequelize, Sequelize);
db.Lecture = require('./lecture.model')(sequelize, Sequelize);

// Setup relationships
// User relationships with specialized models
db.User.hasOne(db.Faculty, { foreignKey: 'userId' });
db.Faculty.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasOne(db.Student, { foreignKey: 'userId' });
db.Student.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasOne(db.Admin, { foreignKey: 'userId' });
db.Admin.belongsTo(db.User, { foreignKey: 'userId' });

// Course relationships
db.Course.belongsToMany(db.Faculty, { 
  through: 'course_faculty',
  as: 'faculty',
  foreignKey: 'courseId'
});

db.Faculty.belongsToMany(db.Course, {
  through: 'course_faculty',
  as: 'courses',
  foreignKey: 'userId'
});

db.Course.belongsToMany(db.Student, {
  through: 'course_student',
  as: 'students',
  foreignKey: 'courseId'
});

db.Student.belongsToMany(db.Course, {
  through: 'course_student',
  as: 'courses',
  foreignKey: 'userId'
});

// Announcement relationships
db.Course.hasMany(db.Announcement, { foreignKey: 'courseId', as: 'announcements' });
db.Announcement.belongsTo(db.Course, { foreignKey: 'courseId' });

db.Faculty.hasMany(db.Announcement, { foreignKey: 'facultyId', as: 'announcements' });
db.Announcement.belongsTo(db.Faculty, { foreignKey: 'facultyId' });

// Course Description Entry relationships
db.Course.hasMany(db.CourseDescriptionEntry, { foreignKey: 'courseId', as: 'descriptionEntries' });
db.CourseDescriptionEntry.belongsTo(db.Course, { foreignKey: 'courseId' });

db.Faculty.hasMany(db.CourseDescriptionEntry, { foreignKey: 'facultyId', as: 'descriptionEntries' });
db.CourseDescriptionEntry.belongsTo(db.Faculty, { foreignKey: 'facultyId' });


// Exam and course relationships
db.Course.hasMany(db.Exam, { foreignKey: 'courseId', as: 'exams' });
db.Exam.belongsTo(db.Course, { foreignKey: 'courseId' });

// Exam and student relationships
db.Exam.belongsToMany(db.Student, { through: db.Result, foreignKey: 'examId' });
db.Student.belongsToMany(db.Exam, { through: db.Result, foreignKey: 'userId' });

// Exam and result relationships
db.Exam.hasMany(db.Result, { foreignKey: 'examId', as: 'results' });
db.Result.belongsTo(db.Exam, { foreignKey: 'examId' });

// student and result relationships
db.Student.hasMany(db.Result, { foreignKey: 'userId', as: 'results' });
db.Result.belongsTo(db.Student, { foreignKey: 'userId' });

// Add these relationships after other model associations

// Event relationships
db.Course.hasMany(db.Event, { foreignKey: 'courseId', as: 'events' });
db.Event.belongsTo(db.Course, { foreignKey: 'courseId' });
// Lecture relationships
// Heading relationships
db.Course.hasMany(db.Heading, { foreignKey: 'courseId', as: 'headings' });
db.Heading.belongsTo(db.Course, { foreignKey: 'courseId' });

// Subheading relationships
db.Heading.hasMany(db.Subheading, { foreignKey: 'headingId', as: 'subheadings' });
db.Subheading.belongsTo(db.Heading, { foreignKey: 'headingId' });

// Lecture relationships with Subheadings
db.Subheading.hasMany(db.Lecture, { foreignKey: 'subheadingId', as: 'lectures' });
db.Lecture.belongsTo(db.Subheading, { foreignKey: 'subheadingId' });

// If you want to track who created the event:
db.User.hasMany(db.Event, { foreignKey: 'createdBy', as: 'createdEvents' });
db.Event.belongsTo(db.User, { foreignKey: 'createdBy' });

db.ForumPost = require('./forum_post.model')(sequelize, Sequelize);
db.ForumReply = require('./forum_reply.model')(sequelize, Sequelize);

// Forum post relationships
db.User.hasMany(db.ForumPost, { foreignKey: 'userId', as: 'posts' });
db.ForumPost.belongsTo(db.User, { foreignKey: 'userId' });
db.Course.hasMany(db.ForumPost, { foreignKey: 'courseId', as: 'posts' });
db.ForumPost.belongsTo(db.Course, { foreignKey: 'courseId' });

// Forum reply relationships
db.User.hasMany(db.ForumReply, { foreignKey: 'userId', as: 'replies' });
db.ForumReply.belongsTo(db.User, { foreignKey: 'userId' });
db.ForumPost.hasMany(db.ForumReply, { foreignKey: 'postId', as: 'replies' });
db.ForumReply.belongsTo(db.ForumPost, { foreignKey: 'postId' });
// db.Faculty.hasMany(db.Lecture, { foreignKey: 'facultyId', as: 'lectures' });
// db.Lecture.belongsTo(db.Faculty, { foreignKey: 'facultyId' });

module.exports = db;
