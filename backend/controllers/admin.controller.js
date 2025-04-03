const db = require('../models');
const bcrypt = require('bcryptjs');
const { parse } = require('csv-parse/sync');
const User = db.User;
const Admin = db.Admin;
const Faculty = db.Faculty;
const Student = db.Student;
const Course = db.Course;

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        { model: Student, as: 'student', attributes: ['rollNumber', 'enrollmentYear', 'major'] },
        { model: Faculty, as: 'faculty', attributes: ['department', 'position'] }
      ]
    });
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Some error occurred while retrieving users'
    });
  }
};

// Add student
exports.addStudent = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    // Validate required fields
    const requiredFields = ['username', 'email', 'password', 'firstName'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Additional validation for student-specific fields
    const studentFields = ['rollNumber', 'enrollmentYear', 'major'];
    const missingStudentFields = studentFields.filter(field => !req.body[field]);
    
    if (missingStudentFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required student fields: ${missingStudentFields.join(', ')}`
      });
    }

    // Validate enrollment year
    if (isNaN(req.body.enrollmentYear) || req.body.enrollmentYear < 2000 || req.body.enrollmentYear > 2099) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enrollment year'
      });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username: req.body.username },
          { email: req.body.email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Check for existing roll number
    const existingStudent = await Student.findOne({
      where: { rollNumber: req.body.rollNumber }
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Roll number already exists'
      });
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userType: 'student'
    }, { transaction: t });

    await Student.create({
      userId: user.id,
      rollNumber: req.body.rollNumber,
      enrollmentYear: parseInt(req.body.enrollmentYear),
      major: req.body.major
    }, { transaction: t });

    await t.commit();
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      userId: user.id
    });
  } catch (error) {
    await t.rollback();
    
    // Better error handling
    let errorMessage = 'Error creating student';
    if (error.name === 'SequelizeValidationError') {
      errorMessage = error.errors.map(e => e.message).join(', ');
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = 'Username, email or roll number already exists';
    }
    
    res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
};

// Add faculty
exports.addFaculty = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    // Validate required fields
    const requiredFields = ['username', 'email', 'password', 'firstName', 'department', 'position'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username: req.body.username },
          { email: req.body.email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName || '',
      userType: 'faculty'
    }, { transaction: t });

    await Faculty.create({
      userId: user.id,
      department: req.body.department,
      position: req.body.position
    }, { transaction: t });

    await t.commit();
    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      userId: user.id
    });
  } catch (error) {
    await t.rollback();
    let errorMessage = 'Error creating faculty';
    if (error.name === 'SequelizeValidationError') {
      errorMessage = error.errors.map(e => e.message).join(', ');
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = 'Username or email already exists';
    }
    
    res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
};

// Create a generic user (admin only)
exports.createUser = async (req, res) => {
  const t = await db.sequelize.transaction();
  
  try {
    // Validate required fields
    const requiredFields = ['username', 'email', 'password', 'firstName', 'userType'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Additional validation for student-specific fields
    if (req.body.userType === 'student') {
      const studentFields = ['rollNumber', 'enrollmentYear', 'major'];
      const missingStudentFields = studentFields.filter(field => !req.body[field]);
      
      if (missingStudentFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required student fields: ${missingStudentFields.join(', ')}`
        });
      }

      // Validate enrollment year
      if (isNaN(req.body.enrollmentYear) || req.body.enrollmentYear < 2000 || req.body.enrollmentYear > 2099) {
        return res.status(400).json({
          success: false,
          message: 'Invalid enrollment year'
        });
      }
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username: req.body.username },
          { email: req.body.email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 8);

    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userType: req.body.userType
    }, { transaction: t });

    if (req.body.userType === 'student') {
      await Student.create({
        userId: user.id,
        rollNumber: req.body.rollNumber,
        enrollmentYear: parseInt(req.body.enrollmentYear),
        major: req.body.major
      }, { transaction: t });
    } else if (req.body.userType === 'faculty') {
      await Faculty.create({
        userId: user.id,
        department: req.body.department || '',
        position: req.body.position || ''
      }, { transaction: t });
    } else if (req.body.userType === 'admin') {
      await Admin.create({
        userId: user.id
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: user.id
    });
  } catch (error) {
    await t.rollback();
    // Improve error message handling
    let errorMessage = 'Some error occurred while creating the user';
    if (error.name === 'SequelizeValidationError') {
      errorMessage = error.errors.map(e => e.message).join(', ');
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = 'Username or email already exists';
    }
    
    res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
};

// Bulk create students from CSV
exports.bulkCreateStudents = async (req, res) => {
  // More flexible file detection logic
  console.log("Request files structure:", req.files ? Object.keys(req.files) : "No req.files");
  console.log("Request file structure:", req.file ? "req.file exists" : "No req.file");
  
  const uploadedFile = req.files?.file || // express-fileupload style
                      (req.files && Object.values(req.files)[0]) || // Alternative access
                      req.file; // multer style
  
  if (!uploadedFile) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a CSV file',
      debug: { 
        hasFiles: !!req.files,
        hasFile: !!req.file,
        filesKeys: req.files ? Object.keys(req.files) : [],
        contentType: req.headers['content-type'] 
      }
    });
  }

  // Log file information for debugging
  console.log("Processing file:", uploadedFile.name || uploadedFile.originalname);
  console.log("File size:", uploadedFile.size, "bytes");
  console.log("File type:", uploadedFile.mimetype);

  const t = await db.sequelize.transaction();
  
  try {
    // Get file data regardless of upload library
    let csvData;
    if (uploadedFile.data) {
      // For express-fileupload
      csvData = uploadedFile.data.toString('utf8');
    } else if (uploadedFile.buffer) {
      // For multer
      csvData = uploadedFile.buffer.toString('utf8');
    } else {
      // Try to read from the file path (less common)
      try {
        const fs = require('fs');
        csvData = fs.readFileSync(uploadedFile.path, 'utf8');
      } catch (readError) {
        throw new Error('Unable to read file content');
      }
    }
    
    console.log("CSV Data length:", csvData.length, "characters");
    if (csvData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded CSV file is empty'
      });
    }

    // ...existing code to process the CSV...
    const records = parse(csvData, {  
      columns: true,
      skip_empty_lines: true,
      trim: true,
      skipLinesWithEmpty: true,
      relaxColumnCount: true,
      relaxQuotes: true,
      delimiter: ','
    });

    const requiredColumns = ['username', 'email', 'password', 'firstName', 'lastName', 
                           'rollNumber', 'enrollmentYear', 'major'];
    
    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is empty'
      });
    }
    
    const firstRecord = records[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRecord));

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns in CSV: ${missingColumns.join(', ')}`
      });
    }

    const createdUsers = [];
    const errors = [];

    for (const [index, record] of records.entries()) {
      try {
        // Basic validation
        if (!record.username || !record.email || !record.password || !record.firstName || 
            !record.rollNumber || !record.enrollmentYear || !record.major) {
          throw new Error('Missing required fields');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(record.email)) {
          throw new Error('Invalid email format');
        }

        // Username validation
        if (record.username.length < 3 || record.username.length > 50) {
          throw new Error('Username must be between 3 and 50 characters');
        }

        // Enrollment year validation
        const enrollmentYear = parseInt(record.enrollmentYear);
        if (isNaN(enrollmentYear) || enrollmentYear < 2000 || enrollmentYear > 2099) {
          throw new Error('Invalid enrollment year (must be between 2000 and 2099)');
        }

        // Check for existing username or email
        const existingUser = await User.findOne({
          where: {
            [db.Sequelize.Op.or]: [
              { username: record.username },
              { email: record.email }
            ]
          }
        });

        if (existingUser) {
          throw new Error('Username or email already exists');
        }

        // Check for existing roll number
        const existingStudent = await Student.findOne({
          where: { rollNumber: record.rollNumber }
        });

        if (existingStudent) {
          throw new Error('Roll number already exists');
        }

        const hashedPassword = bcrypt.hashSync(record.password, 8);
        
        const user = await User.create({
          username: record.username,
          email: record.email,
          password: hashedPassword,
          firstName: record.firstName,
          lastName: record.lastName || null,
          userType: 'student'
        }, { transaction: t });

        await Student.create({
          userId: user.id,
          rollNumber: record.rollNumber,
          enrollmentYear: enrollmentYear,
          major: record.major
        }, { transaction: t });

        createdUsers.push(user.id);
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Errors occurred while processing CSV',
        errors: errors
      });
    }

    await t.commit();
    res.status(201).json({
      success: true,
      message: `Successfully created ${createdUsers.length} students`,
      userIds: createdUsers
    });
  } catch (error) {
    await t.rollback();
    console.error("CSV Processing Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error processing CSV file',
      hint: 'Make sure the CSV file contains the required columns for students'
    });
  }
};

// Bulk create faculty from CSV
exports.bulkCreateFaculty = async (req, res) => {
  // More flexible file detection logic
  console.log("Request files structure:", req.files ? Object.keys(req.files) : "No req.files");
  console.log("Request file structure:", req.file ? "req.file exists" : "No req.file");
  
  const uploadedFile = req.files?.file || // express-fileupload style
                      (req.files && Object.values(req.files)[0]) || // Alternative access
                      req.file; // multer style
  
  if (!uploadedFile) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a CSV file',
      debug: { 
        hasFiles: !!req.files,
        hasFile: !!req.file,
        filesKeys: req.files ? Object.keys(req.files) : [],
        contentType: req.headers['content-type'] 
      }
    });
  }

  // Log file information for debugging
  console.log("Processing file:", uploadedFile.name || uploadedFile.originalname);
  console.log("File size:", uploadedFile.size, "bytes");
  console.log("File type:", uploadedFile.mimetype);

  const t = await db.sequelize.transaction();
  
  try {
    // Get file data regardless of upload library
    let csvData;
    if (uploadedFile.data) {
      // For express-fileupload
      csvData = uploadedFile.data.toString('utf8');
    } else if (uploadedFile.buffer) {
      // For multer
      csvData = uploadedFile.buffer.toString('utf8');
    } else {
      // Try to read from the file path (less common)
      try {
        const fs = require('fs');
        csvData = fs.readFileSync(uploadedFile.path, 'utf8');
      } catch (readError) {
        throw new Error('Unable to read file content');
      }
    }
    
    console.log("CSV Data length:", csvData.length, "characters");
    if (csvData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded CSV file is empty'
      });
    }

    // ...existing code to process the CSV...
    const records = parse(csvData, {  
      columns: true,
      skip_empty_lines: true,
      trim: true,
      skipLinesWithEmpty: true,
      relaxColumnCount: true,
      relaxQuotes: true,
      delimiter: ','
    });

    const requiredColumns = ['username', 'email', 'password', 'firstName', 'lastName', 
                           'department', 'position'];
    
    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is empty'
      });
    }
    
    const firstRecord = records[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRecord));

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns in CSV: ${missingColumns.join(', ')}`
      });
    }

    const createdUsers = [];
    const errors = [];

    for (const [index, record] of records.entries()) {
      try {
        // Basic validation
        if (!record.username || !record.email || !record.password || !record.firstName || 
            !record.department || !record.position) {
          throw new Error('Missing required fields');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(record.email)) {
          throw new Error('Invalid email format');
        }

        // Username validation
        if (record.username.length < 3 || record.username.length > 50) {
          throw new Error('Username must be between 3 and 50 characters');
        }

        // Check for existing username or email
        const existingUser = await User.findOne({
          where: {
            [db.Sequelize.Op.or]: [
              { username: record.username },
              { email: record.email }
            ]
          }
        });

        if (existingUser) {
          throw new Error('Username or email already exists');
        }

        const hashedPassword = bcrypt.hashSync(record.password, 8);
        
        const user = await User.create({
          username: record.username,
          email: record.email,
          password: hashedPassword,
          firstName: record.firstName,
          lastName: record.lastName || '',
          userType: 'faculty'
        }, { transaction: t });

        await Faculty.create({
          userId: user.id,
          department: record.department,
          position: record.position
        }, { transaction: t });

        createdUsers.push(user.id);
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Errors occurred while processing CSV',
        errors: errors
      });
    }

    await t.commit();
    res.status(201).json({
      success: true,
      message: `Successfully created ${createdUsers.length} faculty members`,
      userIds: createdUsers
    });
  } catch (error) {
    await t.rollback();
    console.error("CSV Processing Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error processing CSV file',
      hint: 'Make sure the CSV file contains the required columns for faculty'
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    // Update the User table
    const [updated] = await User.update(req.body, {
      where: { id: req.params.userId },
      transaction: t,
    });

    if (updated === 0) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if the user exists and fetch user details
    const user = await User.findByPk(req.params.userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found after update',
      });
    }

    // Update student or faculty details if applicable
    if (user.userType === 'student' && req.body.student) {
      const { rollNumber, enrollmentYear, major } = req.body.student;

      // Validate student-specific fields
      if (!rollNumber || !enrollmentYear || !major) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Missing required student fields: rollNumber, enrollmentYear, or major',
        });
      }

      await Student.update(
        { rollNumber, enrollmentYear, major },
        { where: { userId: req.params.userId }, transaction: t }
      );
    } else if (user.userType === 'faculty' && req.body.faculty) {
      const { department, position } = req.body.faculty;

      // Validate faculty-specific fields
      if (!department || !position) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Missing required faculty fields: department or position',
        });
      }

      await Faculty.update(
        { department, position },
        { where: { userId: req.params.userId }, transaction: t }
      );
    }

    await t.commit();
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    await t.rollback();
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user',
    });
  }
};


// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if(user.userType==="admin"){
      return res.status(400).json({
        success: false,
        error: 'Cannot delete an admin',
        message: 'Cannot delete an admin'
      });
    }
    
    await user.destroy();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting user'
    });
  }
};

// Course management functions
exports.createCourse = async (req, res) => {
  try {
    // Check if a course with the same code already exists
    const existingCourse = await Course.findOne({
      where: { code: req.body.code }
    });
    
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'A course with this code already exists'
      });
    }
    
    // Validate required fields
    const requiredFields = ['code', 'name', 'credits', 'semester'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Validate credits
    const credits = parseInt(req.body.credits);
    if (isNaN(credits) || credits <= 0 || credits > 20) {
      return res.status(400).json({
        success: false,
        message: 'Credits must be between 1 and 20'
      });
    }
    
    const course = await Course.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      courseId: course.id
    });
  } catch (error) {
    // Log the detailed error for debugging
    console.error('Error creating course:', error);
    
    let errorMessage = 'Error creating course';
    if (error.name === 'SequelizeValidationError') {
      errorMessage = error.errors.map(e => e.message).join(', ');
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = 'Course code already exists';
    }
    
    res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
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

// Bulk create courses from CSV
exports.bulkCreateCourses = async (req, res) => {
  // Check both req.files and req.file to support different upload libraries
  console.log("Request files structure:", req.files ? Object.keys(req.files) : "No req.files");
  console.log("Request file structure:", req.file ? "req.file exists" : "No req.file");
  
  // More flexible file detection logic
  const uploadedFile = req.files?.file || // express-fileupload style
                      (req.files && Object.values(req.files)[0]) || // Alternative access
                      req.file; // multer style
  
  if (!uploadedFile) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a CSV file',
      debug: { 
        hasFiles: !!req.files,
        hasFile: !!req.file,
        filesKeys: req.files ? Object.keys(req.files) : [],
        contentType: req.headers['content-type'] 
      }
    });
  }

  // Log file information for debugging
  console.log("Processing file:", uploadedFile.name || uploadedFile.originalname);
  console.log("File size:", uploadedFile.size, "bytes");
  console.log("File type:", uploadedFile.mimetype);

  const t = await db.sequelize.transaction();
  
  try {
    // Get file data regardless of upload library
    let csvData;
    if (uploadedFile.data) {
      // For express-fileupload
      csvData = uploadedFile.data.toString('utf8');
    } else if (uploadedFile.buffer) {
      // For multer
      csvData = uploadedFile.buffer.toString('utf8');
    } else {
      // Try to read from the file path (less common)
      try {
        const fs = require('fs');
        csvData = fs.readFileSync(uploadedFile.path, 'utf8');
      } catch (readError) {
        throw new Error('Unable to read file content');
      }
    }
    
    console.log("CSV Data length:", csvData.length, "characters");
    if (csvData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded CSV file is empty'
      });
    }

    // Parse the CSV with more robust settings
    let records;
    try {
      records = parse(csvData, {  
        columns: true,
        skip_empty_lines: true,
        trim: true,
        skipLinesWithEmpty: true,
        relaxColumnCount: true,
        relaxQuotes: true,
        delimiter: ','
      });
      
      console.log("Successfully parsed CSV with", records.length, "records");
      if (records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'The CSV file contains no valid data rows'
        });
      }
    } catch (parseError) {
      console.error("CSV Parse Error:", parseError);
      return res.status(400).json({
        success: false,
        message: `CSV parsing failed: ${parseError.message}`,
        hint: 'Please check your CSV format and ensure it uses proper formatting',
        error: parseError.message
      });
    }
    
    // Map expected CSV headers to model fields - handle both formats
    const headerMap = {
      'course code': 'code',
      'coursecode': 'code',
      'code': 'code',
      'course name': 'name',
      'coursename': 'name',
      'name': 'name',
      'credits': 'credits',
      'semester': 'semester',
      'description': 'description'
    };
    
    const requiredFields = ['code', 'name', 'credits', 'semester'];
    
    // Check if all required columns exist in the CSV (with any valid header format)
    const missingColumns = [];
    const foundMappings = {};
    
    // First, create a mapping from the CSV headers to our field names
    for (const header of Object.keys(records[0])) {
      const normalizedHeader = header.toLowerCase().trim().replace(/\s+/g, '');
      if (headerMap[normalizedHeader] || headerMap[header.toLowerCase().trim()]) {
        const fieldName = headerMap[normalizedHeader] || headerMap[header.toLowerCase().trim()];
        foundMappings[fieldName] = header;
      }
    }
    
    console.log("Found header mappings:", foundMappings);
    
    // Check for missing required fields
    for (const field of requiredFields) {
      if (!foundMappings[field]) {
        missingColumns.push(field);
      }
    }

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns in CSV: ${missingColumns.join(', ')}`,
        foundColumns: Object.keys(records[0]),
        expectedColumnFormats: Object.keys(headerMap).filter(key => 
          requiredFields.includes(headerMap[key])),
        hint: 'Make sure your CSV contains the required headers: course code, course name, credits, semester'
      });
    }

    // Extract all course codes from the CSV file to check for duplicates
    const csvCourseCodes = records.map(record => 
      record[foundMappings.code].trim().toUpperCase());
    
    // Check if any course codes in the CSV already exist in the database
    const existingCourses = await Course.findAll({
      where: { 
        code: {
          [db.Sequelize.Op.in]: csvCourseCodes
        }
      },
      attributes: ['code']
    });
    
    // If we found existing courses with the same codes, return an error
    if (existingCourses.length > 0) {
      const duplicateCodes = existingCourses.map(course => course.code);
      return res.status(400).json({
        success: false,
        message: 'These course codes already exist. Please use different CSV file or remove duplicate entries.',
        duplicateCodes: duplicateCodes,
        hint: `Found ${duplicateCodes.length} courses that already exist in the database.`
      });
    }

    const createdCourses = [];
    const errors = [];

    // Process each record from the CSV
    for (const [index, record] of records.entries()) {
      try {
        // Extract values from the record using our mappings
        const code = record[foundMappings.code]?.trim();
        const name = record[foundMappings.name]?.trim();
        const creditsStr = record[foundMappings.credits]?.trim();
        const semester = record[foundMappings.semester]?.trim();
        const description = foundMappings.description ? 
          record[foundMappings.description]?.trim() : '';

        // Basic validation
        if (!code) {
          throw new Error('Missing course code');
        }
        if (!name) {
          throw new Error('Missing course name');
        }
        if (!creditsStr) {
          throw new Error('Missing credits');
        }
        if (!semester) {
          throw new Error('Missing semester');
        }

        // Credits validation
        const credits = parseInt(creditsStr);
        if (isNaN(credits)) {
          throw new Error('Credits must be a number');
        }
        if (credits <= 0 || credits > 20) {
          throw new Error('Credits must be between 1 and 20');
        }

        // Semester validation - more flexible with case
        const normalizedSemester = semester.toLowerCase();
        const validSemesters = ['fall', 'spring', 'summer'];
        if (!validSemesters.includes(normalizedSemester)) {
          throw new Error('Invalid semester (must be Fall, Spring, or Summer)');
        }

        // Create the course
        const course = await Course.create({
          code: code,
          name: name,
          description: description || '',
          credits: credits,
          semester: semester.charAt(0).toUpperCase() + semester.slice(1).toLowerCase(), // Proper case
        }, { transaction: t });

        createdCourses.push({
          id: course.id,
          code: course.code
        });
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error.message}`); // +2 because row 1 is header
      }
    }

    if (errors.length > 0) {
      console.error("CSV processing errors:", errors);
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Errors occurred while processing CSV (${errors.length} errors)`,
        errors: errors,
        totalRows: records.length,
        successfulRows: createdCourses.length
      });
    }

    await t.commit();
    res.status(201).json({
      success: true,
      message: `Successfully created ${createdCourses.length} courses`,
      courses: createdCourses
    });
  } catch (error) {
    await t.rollback();
    console.error("CSV Processing Fatal Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing CSV file',
      hint: 'Make sure the CSV file contains the required columns: course code, course name, credits, semester',
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const [updated] = await Course.update(req.body, {
      where: { id: req.params.courseId }
    });
    
    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating course'
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.destroy({
      where: { id: req.params.courseId }
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting course'
    });
  }
};

// Helper function to verify user addition and database persistence
exports.testDBPersistence = async (req, res) => {
  try {
    // Count total users
    const userCount = await User.count();
    
    // Get basic DB stats
    const dbStats = {
      totalUsers: userCount,
      students: await Student.count(),
      faculty: await Faculty.count(),
      admins: await Admin.count(),
      courses: await Course.count()
    };
    
    res.status(200).json({
      success: true,
      message: 'Database connection test successful',
      persistenceEnabled: process.env.FORCE_SYNC !== 'true',
      stats: dbStats,
      note: process.env.FORCE_SYNC === 'true' ? 
        'WARNING: Database is configured to reset on server restart!' : 
        'Database persistence is enabled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection test failed',
      error: error.message
    });
  }
};
