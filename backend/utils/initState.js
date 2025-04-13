const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.User;
const Admin = db.Admin;
const Faculty = db.Faculty;
const Student = db.Student;
const Course = db.Course;
const Announcement = db.Announcement;
const CourseDescriptionEntry = db.CourseDescriptionEntry;

// Helper function to ensure tables exist
async function ensureTablesExist() {
  try {
    // Check if tables exist by querying them
    await User.findOne();
    await Admin.findOne();
    await Faculty.findOne();
    await Student.findOne();
    await Course.findOne();
    await Announcement.findOne();
    await CourseDescriptionEntry.findOne();

        // Add these additional checks for tables used in createLectures
    await db.Heading.findOne();
    await db.Subheading.findOne();
    await db.Lecture.findOne();
    console.log('All database tables verified.');
    return true;
  } catch (error) {
    console.error('Error checking tables:', error.message);
    return false;
  }
}

module.exports = async function initState() {
  try {
    console.log('Initializing database with demo data...');
    
    // First ensure all tables are created
    console.log('Verifying database tables...');
    const tablesExist = await ensureTablesExist();
    
    if (!tablesExist) {
      console.log('Waiting for tables to be fully created...');
      // Add a small delay to ensure tables are created
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 1. Create admin user
    const adminUser = await createAdmin();
    
    // 2. Create courses
    const courses = await createCourses();
    
    // 3. Create faculty users and assign to courses
    const facultyUsers = await createFaculty(courses);
    
    // 4. Create student users and assign to courses
    const studentUsers = await createStudents(courses);
    
    // 5. Create announcements for each course
    await createAnnouncements(courses, facultyUsers);
    
    // 6. Create course description entries for each course
    await createCourseDescriptionEntries(courses, facultyUsers);
    
    // 7. Print user login information
    printUserLoginInfo([adminUser, ...facultyUsers, ...studentUsers]);
    
    // 8. Print course enrollments
    await printCourseEnrollments(courses);
    
    // 9. Create lectures for each course
    await createLectures(courses);
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

// Create admin user
async function createAdmin() {
  // Check if admin already exists
  const adminExists = await User.findOne({
    where: { username: 'admin' }
  });

  if (adminExists) {
    console.log('Admin user already exists, skipping creation');
    return adminExists;
  }

  // Create default admin user
  const hashedPassword = bcrypt.hashSync('admin123', 8);
  
  const admin = await User.create({
    username: 'admin',
    email: 'admin@trackit.com',
    password: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    userType: 'admin'
  });

  await Admin.create({
    userId: admin.id
  });
  
  return admin;
}

// Create courses
async function createCourses() {
  const courses = [
    {
      code: 'EE321',
      name: 'Communication Systems',
      description: 'Introduction to signals and systems, discrete-time signals, linear time-invariant systems, z-transforms, Fourier analysis, and other aspects of communication systems.',
      credits: 11,
      semester: 'Fall 2025'
    },
    {
      code: 'CS253',
      name: 'Software Development',
      description: 'Software development methodologies, design patterns, testing strategies, version control systems, and project management.',
      credits: 12,
      semester: 'Fall 2025'
    },
    {
      code: 'EE360',
      name: 'Power Electronics',
      description: 'Exploration of consciousness, intentionality, mental causation, and the relationship between mind and brain.',
      credits: 9,
      semester: 'Fall 2025'
    },
    {
      code: 'EE340',
      name: 'Digital Electronics',
      description: 'Introduction to digital logic, Boolean algebra, combinational and sequential circuits, and digital system design.',
      credits: 4,
      semester: 'Fall 2023'
    },
    {
      code: 'EE381',
      name: 'Electrical Engineering Lab II',
      description: 'Fundamentals of electric circuits, network theorems, transient and steady-state analysis of RLC circuits.',
      credits: 12,
      semester: 'Fall 2025'
    },
    {
      code: 'CS771',
      name: 'Machine Learning',
      description: 'Introduction to microeconomics and macroeconomics, supply and demand, market structures, and economic policy.',
      credits: 9,
      semester: 'Fall 2025'
    }
  ];
  
  const createdCourses = [];
  
  for (const course of courses) {
    const existingCourse = await Course.findOne({ where: { code: course.code } });
    
    if (existingCourse) {
      console.log(`Course ${course.code} already exists, skipping creation`);
      createdCourses.push(existingCourse);
    } else {
      const newCourse = await Course.create(course);
      createdCourses.push(newCourse);
    }
  }
  
  return createdCourses;
}

// Create faculty users and assign to courses
async function createFaculty(courses) {
  const facultyData = [
    {
      username: 'faculty1',
      password: 'faculty123',
      email: 'faculty1@trackit.com',
      firstName: 'John',
      lastName: 'Doe',
      department: 'Electrical Engineering',
      position: 'Associate Professor',
      courseIndex: 0 // EE321
    },
    {
      username: 'faculty2',
      password: 'faculty123',
      email: 'faculty2@trackit.com',
      firstName: 'Jane',
      lastName: 'Smith',
      department: 'Computer Science',
      position: 'Assistant Professor',
      courseIndex: 1 // CS253
    },
    {
      username: 'faculty3',
      password: 'faculty123',
      email: 'faculty3@trackit.com',
      firstName: 'Michael',
      lastName: 'Chen',
      department: 'Philosophy',
      position: 'Professor',
      courseIndex: 2 // PHI452
    },
    {
      username: 'faculty4',
      password: 'faculty123',
      email: 'faculty4@trackit.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      department: 'Electrical Engineering',
      position: 'Associate Professor',
      courseIndex: 3 // EE210
    },
    {
      username: 'faculty5',
      password: 'faculty123',
      email: 'faculty5@trackit.com',
      firstName: 'Robert',
      lastName: 'Wilson',
      department: 'Electrical Engineering',
      position: 'Professor',
      courseIndex: 4 // EE200
    },
    {
      username: 'faculty6',
      password: 'faculty123',
      email: 'faculty6@trackit.com',
      firstName: 'Emily',
      lastName: 'Garcia',
      department: 'Economics',
      position: 'Assistant Professor',
      courseIndex: 5 // ECO111
    }
  ];
  
  const createdFaculty = [];
  
  for (const data of facultyData) {
    // Check if faculty already exists
    let faculty = await User.findOne({ where: { username: data.username } });
    
    if (!faculty) {
      // Create faculty user
      const hashedPassword = bcrypt.hashSync(data.password, 8);
      
      faculty = await User.create({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: 'faculty'
      });
    }
    
    // Create faculty profile or get existing one
    let facultyProfile = await Faculty.findByPk(faculty.id);
    if (!facultyProfile) {
      facultyProfile = await Faculty.create({
        userId: faculty.id,
        department: data.department,
        position: data.position
      });
    }
    
    // Assign faculty to course
    const course = courses[data.courseIndex];
    await course.addFaculty(facultyProfile.userId); // Pass the userId, not the User object or Faculty object
    
    createdFaculty.push(faculty);
  }
  
  return createdFaculty;
}

// Create student users and assign to courses
async function createStudents(courses) {
  const studentData = [
    {
      username: 'ved226',
      password: 'Ved@80090',
      email: 'vedprakash22@iitk.ac.in',
      firstName: 'Ved',
      lastName: 'Prakash',
      rollNumber: '221180',
      enrollmentYear: 2022,
      major: 'Electrical Engineering',
      courseIndices: [0, 1, 2, 3, 4, 5] // All courses
    },
    {
      username: 'vdhruv22',
      password: 'Dhr@12345',
      email: 'vdhruv22@iitk.ac.in',  
      firstName: 'Dhruv',
      lastName: 'Varshney',
      rollNumber: '220366',
      enrollmentYear: 2022,
      major: 'Electrical Engineering',
      courseIndices: [0, 1, 2, 3, 4, 5] // All courses
    },
    {
      username: 'student3',
      password: 'student123',
      email: 'student3@trackit.com',
      firstName: 'Charlie',
      lastName: 'Brown',
      rollNumber: 'EE21B003',
      enrollmentYear: 2021,
      major: 'Electrical Engineering',
      courseIndices: [0, 1, 2, 3, 4, 5] // All courses
    },
    {
      username: 'student4',
      password: 'student123',
      email: 'student4@trackit.com',
      firstName: 'Diana',
      lastName: 'Miller',
      rollNumber: 'CS19B004',
      enrollmentYear: 2019,
      major: 'Computer Science',
      courseIndices: [0, 1, 2, 3, 4, 5] // All courses
    },
    {
      username: 'student5',
      password: 'student123',
      email: 'student5@trackit.com',
      firstName: 'Ethan',
      lastName: 'Davis',
      rollNumber: 'EE20B005',
      enrollmentYear: 2020,
      major: 'Electrical Engineering',
      courseIndices: [0, 1, 2, 3, 4, 5] // All courses
    }
  ];
  
  const createdStudents = [];
  
  for (const data of studentData) {
    // Check if student already exists
    let student = await User.findOne({ where: { username: data.username } });
    
    if (!student) {
      // Create student user
      const hashedPassword = bcrypt.hashSync(data.password, 8);
      
      student = await User.create({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: 'student'
      });
    }
    
    // Create student profile or get existing one
    let studentProfile = await Student.findByPk(student.id);
    if (!studentProfile) {
      studentProfile = await Student.create({
        userId: student.id,
        rollNumber: data.rollNumber,
        enrollmentYear: data.enrollmentYear,
        major: data.major
      });
    }
    
    // Assign student to courses
    for (const index of data.courseIndices) {
      await courses[index].addStudent(studentProfile.userId); // Pass the userId, not the User object or Student object
    }
    
    createdStudents.push(student);
  }
  
  return createdStudents;
}

// Create announcements for each course
async function createAnnouncements(courses, facultyUsers) {
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const faculty = facultyUsers[i];
    
    try {
      // Verify the faculty record exists in the faculty table
      const facultyProfile = await db.Faculty.findByPk(faculty.id);
      if (!facultyProfile) {
        console.log(`Faculty profile for ${faculty.username} not found, skipping announcements`);
        continue;
      }
      //console.log(typeof facultyProfile);
      //console.log(`Facultyprofile for ${facultyProfile.firstName} found`);
      //console.log(`Faculty profile for ${faculty.id} found`);
      // Create 4 announcements for this course
      for (let j = 1; j <= 4; j++) {
        await Announcement.create({
          courseId: course.id,
          facultyId: facultyProfile.userId, // Use the verified facultyId
          announcementHeading: `Announcement ${j} for ${course.code}`,
          announcementBody: `This is the ${j}${getSuffix(j)} announcement for the course ${course.code}. ${getRandomAnnouncementContent()}`
        });
      }
      console.log(`Created announcements for ${course.code}`);
    } catch (error) {
      console.error(`Error creating announcements for course ${course.code}:`, error.message);
    }
  }
}

// Create course description entries for each course
async function createCourseDescriptionEntries(courses, facultyUsers) {
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const faculty = facultyUsers[i];
    
    try {
      // Verify the faculty record exists
      const facultyProfile = await Faculty.findByPk(faculty.id);
      if (!facultyProfile) {
        console.log(`Faculty profile for ${faculty.username} not found, skipping course descriptions`);
        continue;
      }
      
      // Create 4 description entries for this course
      for (let j = 1; j <= 4; j++) {
        await CourseDescriptionEntry.create({
          courseId: course.id,
          facultyId: facultyProfile.userId, // Use the verified facultyId
          courseDescriptionEntryHeading: `Topic ${j} for ${course.code}`,
          courseDescriptionEntryBody: `This is the ${j}${getSuffix(j)} topic description for the course ${course.code}. ${getRandomDescriptionContent()}`
        });
      }
      console.log(`Created course descriptions for ${course.code}`);
    } catch (error) {
      console.error(`Error creating course descriptions for course ${course.code}:`, error.message);
    }
  }
}

// Create lectures for each course
async function createLectures(courses) {
  if (!db.Heading || !db.Subheading || !db.Lecture) {
    console.error('Required models for lecture creation are not defined.');
    console.error('Make sure Heading, Subheading, and Lecture models are defined in your models directory.');
    return;
  }
  for (const course of courses) {
    for (let week = 1; week <= 12; week++) {
      // Create a heading for the week
      const heading = await db.Heading.create({
        courseId: course.id,
        title: `Week ${week}`
      });

      // Create subheadings (titles) under the heading
      const subheading = await db.Subheading.create({
        headingId: heading.id,
        title: `Topic for Week ${week}`
      });

      // Create a lecture under the subheading
      await db.Lecture.create({
        courseId: course.id,
        subheadingId: subheading.id,
        lectureTitle: `Lecture ${week} for ${course.code}`,
        lectureDescription: `This is the description for Lecture ${week} of the course ${course.code}.`
      });
    }
    console.log(`Created lectures for ${course.code}`);
  }
}

// Print login details for all users
function printUserLoginInfo(users) {
  console.log('\n====== USER LOGIN INFORMATION ======');
  users.forEach(user => {
    console.log(`\nUser: ${user.firstName} ${user.lastName} (${user.userType})`);
    console.log(`Username: ${user.username}`);
    console.log(`Password: ${user.username === 'admin' ? 'admin123' : user.username.includes('faculty') ? 'faculty123' : 'student123'}`);
  });
}

// Print faculty and students for each course
async function printCourseEnrollments(courses) {
  console.log('\n====== COURSE ENROLLMENTS ======');
  
  for (const course of courses) {
    // Fetch course with related faculty and students
    const courseWithEnrollments = await Course.findByPk(course.id, {
      include: [
        { 
          model: Faculty, 
          as: 'faculty',
          include: [{
            model: User,
            attributes: ['firstName', 'lastName', 'username']
          }]
        },
        { 
          model: Student, 
          as: 'students',
          include: [{
            model: User,
            attributes: ['firstName', 'lastName', 'username']
          }]
        }
      ]
    });
    
    console.log(`\nCourse: ${course.code} - ${course.name}`);
    
    // Print faculty
    console.log('\nFaculty:');
    if (courseWithEnrollments.faculty && courseWithEnrollments.faculty.length > 0) {
      courseWithEnrollments.faculty.forEach(faculty => {
        // FIX: Add null check before accessing user properties
        if (faculty.user) {
          console.log(`- ${faculty.user.firstName} ${faculty.user.lastName} (${faculty.user.username})`);
        }
      });
    } else {
      console.log('No faculty assigned');
    }
    
    // Print students
    console.log('\nStudents:');
    if (courseWithEnrollments.students && courseWithEnrollments.students.length > 0) {
      courseWithEnrollments.students.forEach(student => {
        // FIX: Add null check before accessing user properties
        if (student.user) {
          console.log(`- ${student.user.firstName} ${student.user.lastName} (${student.user.username})`);
        }
      });
    } else {
      console.log('No students enrolled');
    }
  }
}

// Helper function to get ordinal suffix
function getSuffix(num) {
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
}

// Helper function to get random content for announcements
function getRandomAnnouncementContent() {
  const contents = [
    "Please make sure to submit your assignments by the due date.",
    "The upcoming lecture will cover important topics for the mid-term exam.",
    "Office hours have been changed for next week. Check the course portal for details.",
    "The tutorial session has been rescheduled due to a faculty meeting.",
    "Some additional reading materials have been uploaded to the course resources."
  ];
  return contents[Math.floor(Math.random() * contents.length)];
}

// Helper function to get random content for course descriptions
function getRandomDescriptionContent() {
  const contents = [
    "This topic covers fundamental concepts that form the basis for advanced study.",
    "Students will learn practical applications through hands-on exercises and projects.",
    "The material includes detailed explanations of theoretical principles and real-world examples.",
    "This section introduces critical thinking approaches to problem-solving in the field.",
    "By the end of this module, students will be able to apply these concepts independently."
  ];
  return contents[Math.floor(Math.random() * contents.length)];
}
