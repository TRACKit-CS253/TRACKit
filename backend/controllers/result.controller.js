const db = require('../models');
const Result = db.Result;
const Exam = db.Exam;
const Course = db.Course;
const Student = db.Student;
const User = db.User;
const {
  calculateMean,
  calculateMedian,
  calculateMax,
  calculateStandardDeviation
} = require('../utils/statistics');

// Modify an exam and associated results
//http://localhost:3001/api/result/exam/1/modify
exports.modifyExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { examName, weightage, totalMarks, results } = req.body;

    // Find the exam
    const exam = await Exam.findByPk(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Update exam details
    await exam.update({ examName, weightage, totalMarks });

    // Update results for each student
    const obtainedMarksArray = [];
    for (const result of results) {
      const existingResult = await Result.findOne({ where: { examId, userId: result.userId } });
      if (existingResult) {
        await existingResult.update({ obtainedMarks: result.obtainedMarks });
      } else {
        await Result.create({ obtainedMarks: result.obtainedMarks, examId, userId: result.userId });
      }
      obtainedMarksArray.push(result.obtainedMarks);
    }

    // Calculate statistics
    const mean = calculateMean(obtainedMarksArray);
    const median = calculateMedian(obtainedMarksArray);
    const max = calculateMax(obtainedMarksArray);
    const deviation = calculateStandardDeviation(obtainedMarksArray, mean);

    // Update exam with calculated statistics
    await exam.update({ mean, median, max, deviation });

    res.status(200).json({ message: 'Exam and results modified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an exam and all associated results
//http://localhost:3001/api/result/exam/2/delete
exports.deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;

    // Find the exam
    const exam = await Exam.findByPk(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Delete all associated results
    await Result.destroy({ where: { examId } });

    // Delete the exam
    await exam.destroy();

    res.status(200).json({ message: 'Exam and associated results deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Publish exam results for a course
// only give results for those students who are enrolled in the course***********
//http://localhost:3001/api/result/course/1/publish
exports.publishExamResults = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { examName, weightage, totalMarks, results } = req.body;

    // Verify that the course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Verify that all userIds exist
    for (const result of results) {
      const user = await User.findByPk(result.userId);
      if (!user) {
        return res.status(404).json({ message: `User with id ${result.userId} not found` });
      }
    }

    // Create a new exam
    const exam = await Exam.create({
      examName,
      weightage,
      totalMarks,
      courseId
    });

    // Create results for each student
    const obtainedMarksArray = [];
    for (const result of results) {
      await Result.create({
        obtainedMarks: result.obtainedMarks,
        examId: exam.id,
        userId: result.userId
      });
      obtainedMarksArray.push(result.obtainedMarks);
    }

    // Calculate statistics
    const mean = calculateMean(obtainedMarksArray);
    const median = calculateMedian(obtainedMarksArray);
    const max = calculateMax(obtainedMarksArray);
    const deviation = calculateStandardDeviation(obtainedMarksArray, mean);

    // Update exam with calculated statistics
    await exam.update({
      mean,
      median,
      max,
      deviation
    });

    res.status(201).json({ message: 'Exam and results published successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Fetch student details for a course 
//http://localhost:3001/api/result/course/1/students
exports.getStudentsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByPk(courseId, {
      include: [{
        model: Student,
        as: 'students',
        attributes: ['userId', 'rollNumber'],
        include: [{
          model: User,
          attributes: ['firstName', 'lastName']
        }]
      }]
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const students = course.students;

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//used by faculty to get previous results for an exam and its details
// Get exam details and student results for an exam in a course
// http://localhost:3001/api/result/course/1/exam/1
exports.getExamDetailsAndResults = async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const exam = await Exam.findOne({
      where: { id: examId, courseId },
      include: [{
        model: Result,
        as: 'results', // Specify the alias here
        include: [{
          model: Student,
          attributes: ['userId', 'rollNumber'],
          include: [{
            model: User,
            attributes: ['firstName', 'lastName']
          }]
        }]
      }]
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Fetch students enrolled in the course
    const course = await Course.findByPk(courseId, {
      include: [{
        model: Student,
        as: 'students',
        attributes: ['userId', 'rollNumber'],
        include: [{
          model: User,
          attributes: ['firstName', 'lastName']
        }]
      }]
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const examDetails = {
      examName: exam.examName,
      totalMarks: exam.totalMarks,
      weightage: exam.weightage,
      mean: exam.mean,
      median: exam.median,
      max: exam.max,
      deviation: exam.deviation,
      results: course.students.map(student => {
        const result = exam.results.find(r => r.userId === student.userId);
        return {
          userId: student.userId,
          rollNumber: student.rollNumber,
          name: `${student.user.firstName} ${student.user.lastName}`,
          obtainedMarks: result ? result.obtainedMarks : null
        };
      })
    };

    res.status(200).json(examDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all exams with complete details for a course
// http://localhost:3001/api/result/course/1/exams/details
exports.getExamsWithDetailsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByPk(courseId, {
      include: [{
        model: Exam,
        as: 'exams',
        attributes: ['id', 'examName', 'totalMarks', 'weightage', 'mean', 'median', 'max', 'deviation']
      }]
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const exams = course.exams.length > 0 ? course.exams : null;

    res.status(200).json(exams);
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//used by faculty to get exam
// Get exam names and IDs for a course
//http://localhost:3001/api/result/course/1/exams

exports.getExamsForCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const course = await Course.findByPk(courseId, {
        include: [{
          model: Exam,
          as: 'exams',
          attributes: ['id', 'examName']
        }]
      });
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      const exams = course.exams.length > 0 ? course.exams : null;
  
      res.status(200).json(exams);
    }
    catch (error) {
      res.status(500).json({ message: error.message });
    }
};

//used by student to get results
// Get results for a student in a course
// http://localhost:3001/api/result/student/4/course/1
exports.getStudentResults = async (req, res) => {
    try {
      const { userId, courseId } = req.params;
      const course = await Course.findByPk(courseId, {
        include: [{
          model: Exam,
          as: 'exams',
          include: [{
          model: Result,
          as: 'results', // Specify the alias here
          where: { userId },
          required: false // Include exams even if there are no results for the student
        }]
      }]
    });
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      const exams = course.exams.map(exam => {
        const result = exam.results.length > 0 ? exam.results[0] : null;
        return {
          examName: exam.examName,
          weightage: exam.weightage,
          totalMarks: exam.totalMarks,
          mean: exam.mean,
          median: exam.median,
          max: exam.max,
          deviation: exam.deviation,
          obtainedMarks: result ? result.obtainedMarks : null
        };
      });
  
      res.status(200).json(exams);
    } 
    catch (error) {
      res.status(500).json({ message: error.message });
    }
};