const db = require('../models');
const bcrypt = require('bcryptjs');
const { parse } = require('csv-parse/sync');
const { password } = require('../config/mail.config');
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

    // Validate roll number - must be numeric only
    if (!/^\d+$/.test(req.body.rollNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Roll number must contain only numeric characters'
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

    const password = req.body.password;

    // Check password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check for complexity (at least one uppercase, one lowercase, one number, one special character)
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(hasUpperCase && hasNumbers && hasSpecialChar)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one number, and one special character'
      });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 8);
    
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

      // Validate roll number - must be numeric only
      if (!/^\d+$/.test(req.body.rollNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Roll number must contain only numeric characters'
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

    // Parse the CSV
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

    // Extract usernames, emails, and roll numbers to check for duplicates
    const usernames = records.map(record => record.username);
    const emails = records.map(record => record.email);
    const rollNumbers = records.map(record => record.rollNumber);

    // Check for existing usernames or emails
    const existingUsers = await User.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { username: { [db.Sequelize.Op.in]: usernames } },
          { email: { [db.Sequelize.Op.in]: emails } }
        ]
      },
      attributes: ['username', 'email']
    });

    // Check for existing roll numbers
    const existingStudents = await Student.findAll({
      where: { rollNumber: { [db.Sequelize.Op.in]: rollNumbers } },
      attributes: ['rollNumber']
    });

    // Create lookup sets for faster existence checks
    const existingUsernamesSet = new Set(existingUsers.map(user => user.username.toLowerCase()));
    const existingEmailsSet = new Set(existingUsers.map(user => user.email.toLowerCase()));
    const existingRollNumbersSet = new Set(existingStudents.map(student => student.rollNumber));

    const createdStudents = [];
    const duplicateUsernames = [];
    const duplicateEmails = [];
    const duplicateRollNumbers = [];
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

        // Roll number validation - must be numeric only
        if (!/^\d+$/.test(record.rollNumber)) {
          throw new Error('Roll number must contain only numeric characters');
        }

        // Enrollment year validation
        const enrollmentYear = parseInt(record.enrollmentYear);
        if (isNaN(enrollmentYear) || enrollmentYear < 2000 || enrollmentYear > 2099) {
          throw new Error('Invalid enrollment year (must be between 2000 and 2099)');
        }

        // Check for duplicates within the database
        const usernameExists = existingUsernamesSet.has(record.username.toLowerCase());
        const emailExists = existingEmailsSet.has(record.email.toLowerCase());
        const rollNumberExists = existingRollNumbersSet.has(record.rollNumber);

        if (usernameExists) {
          duplicateUsernames.push(record.username);
          continue; // Skip this record but continue processing others
        }

        if (emailExists) {
          duplicateEmails.push(record.email);
          continue; // Skip this record but continue processing others
        }

        if (rollNumberExists) {
          duplicateRollNumbers.push(record.rollNumber);
          continue; // Skip this record but continue processing others
        }

        // Create the user and student
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

        // Add to tracking sets to prevent duplicates within the CSV
        existingUsernamesSet.add(record.username.toLowerCase());
        existingEmailsSet.add(record.email.toLowerCase());
        existingRollNumbersSet.add(record.rollNumber);

        createdStudents.push({
          id: user.id,
          username: user.username,
          rollNumber: record.rollNumber
        });
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error.message}`); // +2 because row 1 is header
      }
    }

    // Only roll back if no students were created and there were errors
    if (createdStudents.length === 0 && (errors.length > 0 || 
        duplicateUsernames.length > 0 || duplicateEmails.length > 0 || duplicateRollNumbers.length > 0)) {
      await t.rollback();
      
      let message = 'No students were created due to errors or duplicates';
      if (duplicateUsernames.length > 0 && errors.length === 0) {
        message = 'All usernames in the CSV already exist in the database';
      }
      
      return res.status(400).json({
        success: false,
        message: message,
        errors: errors,
        duplicateUsernames: duplicateUsernames.length > 0 ? duplicateUsernames : undefined,
        duplicateEmails: duplicateEmails.length > 0 ? duplicateEmails : undefined,
        duplicateRollNumbers: duplicateRollNumbers.length > 0 ? duplicateRollNumbers : undefined,
        totalRows: records.length
      });
    }

    await t.commit();
    
    // Return a success response with information about created students and duplicates
    let message = `Successfully created ${createdStudents.length} students`;
    let totalDuplicates = duplicateUsernames.length + duplicateEmails.length + duplicateRollNumbers.length;
    if (totalDuplicates > 0) {
      message += `, skipped ${totalDuplicates} duplicate records`;
    }
    
    res.status(201).json({
      success: true,
      message: message,
      students: createdStudents,
      duplicateUsernames: duplicateUsernames.length > 0 ? duplicateUsernames : undefined,
      duplicateEmails: duplicateEmails.length > 0 ? duplicateEmails : undefined,
      duplicateRollNumbers: duplicateRollNumbers.length > 0 ? duplicateRollNumbers : undefined,
      skippedCount: totalDuplicates,
      createdCount: createdStudents.length,
      totalRows: records.length
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

    // Parse the CSV
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

    // Extract usernames and emails to check for duplicates
    const usernames = records.map(record => record.username);
    const emails = records.map(record => record.email);

    // Check for existing usernames or emails
    const existingUsers = await User.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { username: { [db.Sequelize.Op.in]: usernames } },
          { email: { [db.Sequelize.Op.in]: emails } }
        ]
      },
      attributes: ['username', 'email']
    });

    // Create lookup sets for faster existence checks
    const existingUsernamesSet = new Set(existingUsers.map(user => user.username.toLowerCase()));
    const existingEmailsSet = new Set(existingUsers.map(user => user.email.toLowerCase()));

    const createdFaculty = [];
    const duplicateUsernames = [];
    const duplicateEmails = [];
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

        // Password validation
        if (record.password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        // Check for duplicates within the database
        const usernameExists = existingUsernamesSet.has(record.username.toLowerCase());
        const emailExists = existingEmailsSet.has(record.email.toLowerCase());

        if (usernameExists) {
          duplicateUsernames.push(record.username);
          continue; // Skip this record but continue processing others
        }

        if (emailExists) {
          duplicateEmails.push(record.email);
          continue; // Skip this record but continue processing others
        }

        // Create the user and faculty
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

        // Add to tracking sets to prevent duplicates within the CSV
        existingUsernamesSet.add(record.username.toLowerCase());
        existingEmailsSet.add(record.email.toLowerCase());

        createdFaculty.push({
          id: user.id,
          username: user.username,
          department: record.department
        });
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error.message}`); // +2 because row 1 is header
      }
    }

    // Only roll back if no faculty were created and there were errors
    if (createdFaculty.length === 0 && (errors.length > 0 || 
        duplicateUsernames.length > 0 || duplicateEmails.length > 0)) {
      await t.rollback();
      
      let message = 'No faculty members were created due to errors or duplicates';
      if (duplicateUsernames.length > 0 && errors.length === 0) {
        message = 'All usernames in the CSV already exist in the database';
      }
      
      return res.status(400).json({
        success: false,
        message: message,
        errors: errors,
        duplicateUsernames: duplicateUsernames.length > 0 ? duplicateUsernames : undefined,
        duplicateEmails: duplicateEmails.length > 0 ? duplicateEmails : undefined,
        totalRows: records.length
      });
    }

    await t.commit();
    
    // Return a success response with information about created faculty and duplicates
    let message = `Successfully created ${createdFaculty.length} faculty members`;
    let totalDuplicates = duplicateUsernames.length + duplicateEmails.length;
    if (totalDuplicates > 0) {
      message += `, skipped ${totalDuplicates} duplicate records`;
    }
    
    res.status(201).json({
      success: true,
      message: message,
      faculty: createdFaculty,
      duplicateUsernames: duplicateUsernames.length > 0 ? duplicateUsernames : undefined,
      duplicateEmails: duplicateEmails.length > 0 ? duplicateEmails : undefined,
      skippedCount: totalDuplicates,
      createdCount: createdFaculty.length,
      totalRows: records.length
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
    
    // Validate course code - must be alphanumeric only and max 10 characters
    if (!/^[a-zA-Z0-9]{1,10}$/.test(req.body.code)) {
      return res.status(400).json({
        success: false,
        message: 'Course code must be alphanumeric and maximum 10 characters'
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
  // Log details about the incoming request for debugging
  console.log("Request body:", req.body);
  console.log("Request files structure:", req.files ? Object.keys(req.files) : "No req.files");
  console.log("Request file structure:", req.file ? "req.file exists" : "No req.file");
  console.log("Content type:", req.headers['content-type']);
  
  // Enhanced file detection logic - check multiple possible field names
  let uploadedFile = null;
  
  // Check for express-fileupload style
  if (req.files) {
    // Try common field names
    const possibleFieldNames = ['file', 'csvFile', 'courseFile', 'csv', 'uploadFile'];
    for (const fieldName of possibleFieldNames) {
      if (req.files[fieldName]) {
        uploadedFile = req.files[fieldName];
        console.log(`Found file with field name: ${fieldName}`);
        break;
      }
    }
    
    // If not found by name, try the first file
    if (!uploadedFile && Object.values(req.files).length > 0) {
      uploadedFile = Object.values(req.files)[0];
      console.log("Using first file in req.files");
    }
  }
  
  // Check for multer style if still not found
  if (!uploadedFile && req.file) {
    uploadedFile = req.file;
    console.log("Using req.file");
  }
  
  // Additional check for single file array in multer
  if (!uploadedFile && req.files && Array.isArray(req.files) && req.files.length > 0) {
    uploadedFile = req.files[0];
    console.log("Using first file from req.files array");
  }
  
  if (!uploadedFile) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a CSV file',
      debug: { 
        hasFiles: !!req.files,
        hasFile: !!req.file,
        filesKeys: req.files ? (typeof req.files === 'object' ? Object.keys(req.files) : 'Array') : [],
        bodyKeys: Object.keys(req.body),
        contentType: req.headers['content-type'],
        hint: "Make sure the file field is named 'file' in your form or check server middleware configuration"
      }
    });
  }

  // Log file information for debugging
  console.log("Processing file:", uploadedFile.name || uploadedFile.originalname || "unnamed file");
  console.log("File size:", uploadedFile.size || uploadedFile.buffer?.length || "unknown", "bytes");
  console.log("File type:", uploadedFile.mimetype || uploadedFile.type || "unknown");

  const t = await db.sequelize.transaction();
  
  try {
    // More robust file data extraction
    let csvData;
    if (uploadedFile.data) {
      // For express-fileupload
      csvData = uploadedFile.data.toString('utf8');
      console.log("Got data from uploadedFile.data");
    } else if (uploadedFile.buffer) {
      // For multer
      csvData = uploadedFile.buffer.toString('utf8');
      console.log("Got data from uploadedFile.buffer");
    } else if (typeof uploadedFile === 'object' && Buffer.isBuffer(uploadedFile)) {
      // Direct buffer
      csvData = uploadedFile.toString('utf8');
      console.log("Used uploadedFile as direct buffer");
    } else if (uploadedFile.path) {
      // Try to read from the file path
      try {
        const fs = require('fs');
        csvData = fs.readFileSync(uploadedFile.path, 'utf8');
        console.log("Read file from uploadedFile.path");
      } catch (readError) {
        console.error("Error reading from file path:", readError);
        throw new Error('Unable to read file content from path');
      }
    } else {
      console.error("Couldn't determine how to get file data:", Object.keys(uploadedFile));
      throw new Error('Unable to extract file data - unrecognized file format');
    }
    
    console.log("CSV Data length:", csvData?.length || 0, "characters");
    if (!csvData || csvData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded CSV file is empty or unreadable',
        fileInfo: {
          name: uploadedFile.name || uploadedFile.originalname || "unnamed",
          size: uploadedFile.size || "unknown",
          type: uploadedFile.mimetype || uploadedFile.type || "unknown"
        }
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
    
    // Create a lookup set of existing course codes for faster checks
    const existingCodesSet = new Set(existingCourses.map(course => course.code.toUpperCase()));
    
    const createdCourses = [];
    const errors = [];
    const duplicateCodes = [];

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

        // Course code validation - must be alphanumeric only and max 10 characters
        if (!/^[a-zA-Z0-9]{1,10}$/.test(code)) {
          throw new Error('Course code must be alphanumeric and maximum 10 characters');
        }

        // Check if this course code already exists in the database
        if (existingCodesSet.has(code.toUpperCase())) {
          duplicateCodes.push(code);
          continue; // Skip this record but continue processing others
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

        // Add this code to the existing codes set to prevent duplicates within the CSV
        existingCodesSet.add(code.toUpperCase());

        createdCourses.push({
          id: course.id,
          code: course.code
        });
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error.message}`); // +2 because row 1 is header
      }
    }

    // Only roll back if no courses were created and there were errors
    if (createdCourses.length === 0 && (errors.length > 0 || duplicateCodes.length > 0)) {
      await t.rollback();
      
      let message = 'No courses were created due to errors';
      if (duplicateCodes.length > 0 && errors.length === 0) {
        message = 'All course codes in the CSV already exist in the database';
      }
      
      return res.status(400).json({
        success: false,
        message: message,
        errors: errors,
        duplicateCodes: duplicateCodes.length > 0 ? duplicateCodes : undefined,
        totalRows: records.length
      });
    }

    await t.commit();
    
    // Return a success response with information about created courses and duplicates
    let message = `Successfully created ${createdCourses.length} courses`;
    if (duplicateCodes.length > 0) {
      message += `, skipped ${duplicateCodes.length} duplicate course codes`;
    }
    
    res.status(201).json({
      success: true,
      message: message,
      courses: createdCourses,
      duplicateCodes: duplicateCodes.length > 0 ? duplicateCodes : undefined,
      skippedCount: duplicateCodes.length,
      createdCount: createdCourses.length,
      totalRows: records.length
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
