import { NavLink } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCourse } from '../../contexts/CourseContext';
import axios from 'axios';
import { Bar,Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function Results() {
  const { currentUser } = useAuth();
  const { courseDetails, loading: courseLoading, error: courseError } = useCourse();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Faculty-specific state variables
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [examDetails, setExamDetails] = useState(null);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingExamDetails, setLoadingExamDetails] = useState(false);
  

  const [examSummaries, setExamSummaries] = useState([]);
  const [loadingExamSummaries, setLoadingExamSummaries] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showModifyConfirm, setShowModifyConfirm] = useState(false);
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [modifyExam, setModifyExam] = useState({
    examName: '',
    totalMarks: '',
    weightage: '',
    results: []
  });
  const [updatingResults, setUpdatingResults] = useState(false);

  // Add Result form state variables
  const [showAddResultForm, setShowAddResultForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [newExam, setNewExam] = useState({
    examName: '',
    totalMarks: '',
    weightage: '',
    results: []
  });
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (currentUser.userType === 'student' && courseDetails?.id) {
      const fetchResults = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/result/student/${currentUser.id}/course/${courseDetails.id}`
          );
          setResults(response.data);
        } catch (err) {
          console.error('Error fetching results:', err);
          setError('Failed to fetch results. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchResults();
    }
    else if (currentUser.userType === 'faculty' && courseDetails?.id) {
      const fetchExams = async () => {
        setLoadingExams(true);
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/result/course/${courseDetails.id}/exams`
          );
          setExams(response.data || []);
        } catch (err) {
          console.error('Error fetching exams:', err);
          setError('Failed to fetch exams. Please try again later.');
        } finally {
          setLoadingExams(false);
          setLoading(false);
        }
      };

      fetchExams();
    }
  }, [currentUser.id, currentUser.userType, courseDetails?.id]);

  //useEffect to fetch exam summaries
  useEffect(() => {
    if (currentUser.userType === 'faculty' && courseDetails?.id) {
      const fetchExamSummaries = async () => {
        setLoadingExamSummaries(true);
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/result/course/${courseDetails.id}/exams/details`
          );
          setExamSummaries(response.data || []);
        } catch (err) {
          console.error('Error fetching exam summaries:', err);
        } finally {
          setLoadingExamSummaries(false);
        }
      };

      fetchExamSummaries();
    }
  }, [currentUser.userType, courseDetails?.id]);

  // Fetch exam details when an exam is selected
  useEffect(() => {
    if (selectedExamId && courseDetails?.id) {
      const fetchExamDetails = async () => {
        setLoadingExamDetails(true);
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/result/course/${courseDetails.id}/exam/${selectedExamId}`
          );
          setExamDetails(response.data);
        } catch (err) {
          console.error('Error fetching exam details:', err);
          setError('Failed to fetch exam details. Please try again later.');
        } finally {
          setLoadingExamDetails(false);
        }
      };

      fetchExamDetails();
    }
  }, [selectedExamId, courseDetails?.id]);

  const handleExamChange = (e) => {
    setSelectedExamId(e.target.value);
  };
  
  // Add Result form functions
  const handleShowAddResultForm = async () => {
    setShowAddResultForm(true);
    setLoadingStudents(true);
    setValidationErrors({});
    
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/result/course/${courseDetails.id}/students`
      );
      const studentList = response.data;
      setStudents(studentList);
      
      // Initialize results array with student data
      setNewExam(prev => ({
        ...prev,
        results: studentList.map(student => ({
          userId: student.userId,
          obtainedMarks: ''
        }))
      }));
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students. Please try again later.');
    } finally {
      setLoadingStudents(false);
    }
  };
  
  const handleCancelAddResult = () => {
    setShowAddResultForm(false);
    setNewExam({
      examName: '',
      totalMarks: '',
      weightage: '',
      results: []
    });
    setValidationErrors({});
  };
  
  const handleExamInputChange = (e) => {
    const { name, value } = e.target;
    setNewExam(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field if exists
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleExportData = () => {
    if (!examDetails) return;
    
    // Prepare header row with exam details
    const examInfo = [
      ['Exam Name:', examDetails.examName],
      ['Total Marks:', examDetails.totalMarks],
      ['Weightage:', `${examDetails.weightage}%`],
      ['Mean:', examDetails.mean?.toFixed(1) || 'N/A'],
      ['Median:', examDetails.median || 'N/A'],
      ['Maximum:', examDetails.max || 'N/A'],
      ['Standard Deviation:', examDetails.deviation?.toFixed(1) || 'N/A'],
      [], // Empty row to separate headers from data
      ['Roll Number', 'Name', 'Marks'] // Column headers for student data
    ];
    
    // Add student results
    const studentData = examDetails.results.map(result => [
      result.rollNumber,
      result.name,
      result.obtainedMarks !== null ? result.obtainedMarks : 'N/A'
    ]);
    
    // Combine all data
    const exportData = [...examInfo, ...studentData];
    
    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    
    // Create workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Exam Results');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Save to file
    const fileName = `${examDetails.examName.replace(/\s+/g, '_')}_Results`;
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    
    const blob = new Blob([excelBuffer], { type: fileType });
    saveAs(blob, fileName + '.xlsx');
  };
  
  const handleStudentMarkChange = (userId, value) => {
    setNewExam(prev => ({
      ...prev,
      results: prev.results.map(result => 
        result.userId === userId 
          ? { ...result, obtainedMarks: value } 
          : result
      )
    }));
    
    // Clear validation error for this student if exists
    if (validationErrors[`student-${userId}`]) {
      setValidationErrors(prev => ({
        ...prev,
        [`student-${userId}`]: null
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    const totalMarksNum = parseFloat(newExam.totalMarks);
    
    // Validate exam details
    if (!newExam.examName.trim()) {
      errors.examName = 'Exam name is required';
    }
    
    if (!newExam.totalMarks) {
      errors.totalMarks = 'Total marks is required';
    } else if (isNaN(totalMarksNum) || totalMarksNum <= 0) {
      errors.totalMarks = 'Total marks must be a positive number';
    }
    
    if (!newExam.weightage) {
      errors.weightage = 'Weightage is required';
    } else if (isNaN(parseFloat(newExam.weightage)) || parseFloat(newExam.weightage) <= 0 || parseFloat(newExam.weightage) > 100) {
      errors.weightage = 'Weightage must be a positive number between 1 and 100';
    }
    
    // Validate student marks
    newExam.results.forEach(result => {
      if (result.obtainedMarks === '') {
        errors[`student-${result.userId}`] = 'Mark is required';
      } else {
        const markNum = parseFloat(result.obtainedMarks);
        if (isNaN(markNum)) {
          errors[`student-${result.userId}`] = 'Must be a number';
        } else if (markNum < 0) {
          errors[`student-${result.userId}`] = 'Cannot be negative';
        } else if (markNum > totalMarksNum) {
          errors[`student-${result.userId}`] = `Max is ${totalMarksNum}`;
        }
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // DELETE handlers
  const handleShowDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  
    const handleConfirmDelete = async () => {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/result/exam/${selectedExamId}/delete`
        );
        
        // Show success message
        setSuccessMessage(`Results for ${examDetails?.examName} deleted successfully`);
        setShowSuccess(true);
        setShowDeleteConfirm(false);
        
        // Reset UI immediately
        setSelectedExamId(null);
        setExamDetails(null);
        
        // Reload the page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } catch (err) {
        console.error('Error deleting exam:', err);
        setError('Failed to delete exam. Please try again later.');
        setShowDeleteConfirm(false);
      }
    };

  // MODIFY handlers
  const handleShowModifyConfirm = () => {
    setShowModifyConfirm(true);
  };

  const handleCancelModifyConfirm = () => {
    setShowModifyConfirm(false);
  };

  const handleConfirmModify = () => {
    // Prepare the form with existing data
    setModifyExam({
      examName: examDetails.examName,
      totalMarks: examDetails.totalMarks,
      weightage: examDetails.weightage,
      results: examDetails.results.map(result => ({
        userId: result.userId,
        obtainedMarks: result.obtainedMarks,
        rollNumber: result.rollNumber,
        name: result.name
      }))
    });
    
    setShowModifyConfirm(false);
    setShowModifyForm(true);
  };

  const handleCancelModify = () => {
    setShowModifyForm(false);
    setModifyExam({
      examName: '',
      totalMarks: '',
      weightage: '',
      results: []
    });
    setValidationErrors({});
  };

  const handleModifyExamInputChange = (e) => {
    const { name, value } = e.target;
    setModifyExam(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field if it exists
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleModifyStudentMarkChange = (userId, value) => {
    setModifyExam(prev => ({
      ...prev,
      results: prev.results.map(result => 
        result.userId === userId 
          ? { ...result, obtainedMarks: value } 
          : result
      )
    }));
    
    // Clear validation error for this student if it exists
    if (validationErrors[`student-${userId}`]) {
      setValidationErrors(prev => ({
        ...prev,
        [`student-${userId}`]: null
      }));
    }
  };

  const validateModifyForm = () => {
    const errors = {};
    const totalMarksNum = parseFloat(modifyExam.totalMarks);
    
    // Validate exam details
    if (!modifyExam.examName.trim()) {
      errors.examName = 'Exam name is required';
    }
    
    if (!modifyExam.totalMarks) {
      errors.totalMarks = 'Total marks is required';
    } else if (isNaN(totalMarksNum) || totalMarksNum <= 0) {
      errors.totalMarks = 'Total marks must be a positive number';
    }
    
    if (!modifyExam.weightage) {
      errors.weightage = 'Weightage is required';
    } else if (isNaN(parseFloat(modifyExam.weightage)) || parseFloat(modifyExam.weightage) <= 0 || parseFloat(modifyExam.weightage) > 100) {
      errors.weightage = 'Weightage must be a positive number between 1 and 100';
    }
    
    // Validate student marks
    modifyExam.results.forEach(result => {
      if (result.obtainedMarks === '') {
        errors[`student-${result.userId}`] = 'Mark is required';
      } else {
        const markNum = parseFloat(result.obtainedMarks);
        if (isNaN(markNum)) {
          errors[`student-${result.userId}`] = 'Must be a number';
        } else if (markNum < 0) {
          errors[`student-${result.userId}`] = 'Cannot be negative';
        } else if (markNum > totalMarksNum) {
          errors[`student-${result.userId}`] = `Max is ${totalMarksNum}`;
        }
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Replace your handleUpdateResults function with this:
  const handleUpdateResults = async () => {
    if (!validateModifyForm()) {
      return;
    }
    
    setUpdatingResults(true);
    try {
      // Format the data for the API
      const formattedData = {
        examName: modifyExam.examName,
        weightage: parseFloat(modifyExam.weightage),
        totalMarks: parseFloat(modifyExam.totalMarks),
        results: modifyExam.results.map(result => ({
          userId: result.userId,
          obtainedMarks: parseFloat(result.obtainedMarks)
        }))
      };
      
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/result/exam/${selectedExamId}/modify`,
        formattedData
      );
      
      // Show success message
      setSuccessMessage(`Results for ${modifyExam.examName} updated successfully`);
      setShowSuccess(true);
      setShowModifyForm(false);
      
      // Reset form
      setModifyExam({
        examName: '',
        totalMarks: '',
        weightage: '',
        results: []
      });
      
      // Reload the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      console.error('Error updating results:', err);
      setError('Failed to update results. Please try again later.');
    } finally {
      setUpdatingResults(false);
    }
  };

  const handlePublishResults = async () => {
    if (!validateForm()) {
      return;
    }
    
    setPublishing(true);
    try {
      // Format the data as expected by the API
      const formattedData = {
        examName: newExam.examName,
        weightage: parseFloat(newExam.weightage),
        totalMarks: parseFloat(newExam.totalMarks),
        results: newExam.results.map(result => ({
          userId: result.userId,
          obtainedMarks: parseFloat(result.obtainedMarks)
        }))
      };
      
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/result/course/${courseDetails.id}/publish`,
        formattedData
      );
      
      // Show success message
      setSuccessMessage(`Results for ${newExam.examName} published successfully`);
      setShowSuccess(true);
      
      // Reset form
      setShowAddResultForm(false);
      setNewExam({
        examName: '',
        totalMarks: '',
        weightage: '',
        results: []
      });
      setError(null);
      
      // Reload the page after 2 seconds (same as in other functions)
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      console.error('Error publishing results:', err);
      setError('Failed to publish results. Please try again later.');
    } finally {
      setPublishing(false);
    }
  };

  // Faculty View
  if (currentUser.userType === 'faculty') {
    if (courseLoading || !courseDetails) {
      return <div className="w-full min-h-screen bg-gray-50 p-6 flex items-center justify-center">Loading course details...</div>;
    }
    return (
      <div className="w-full min-h-screen bg-gray-50 pb-12">
        {/* Sticky header with consistent styling */}
        <div className="sticky top-0 z-50 bg-white  shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Results</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded">{courseDetails?.code || 'Loading...'}</span>
                    <span className="text-gray-500 text-sm">{courseDetails?.credits || ''} Credits • {courseDetails?.semester || ''}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {currentUser?.userType === 'faculty' && !showAddResultForm && (
                  <button
                    onClick={handleShowAddResultForm}
                    disabled={loadingExams}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg transition-colors hover:from-blue-700 hover:to-blue-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Result
                  </button>
                )}
                
                <NavLink 
                  to="/dashboard/profile"
                  className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center"
                  title="View Profile"
                >
                  <CgProfile className="text-xl text-gray-700" />
                </NavLink>
              </div>
            </div>
          </div>
        </div>

      <div className="p-6 overflow-y-auto">  
        
        {showSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 shadow-md animate-fade-in" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete the results for {examDetails?.examName}? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showModifyConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Modify</h3>
            <p className="mb-6">Are you sure you want to modify the results for {examDetails?.examName}?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelModifyConfirm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModify}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Exam Selection Controls */}
        <div className="flex flex-col md:flex-row md:items-end mb-6 gap-4">
          <div className="flex-grow">
            <label className="block mb-2 font-semibold">Select Exam to view details:</label>
            <select
              className="p-2 border border-gray-300 rounded w-full"
              onChange={handleExamChange}
              value={selectedExamId || ""}
              disabled={loadingExams || showAddResultForm}
            >
              <option value="">-- Select an exam --</option>
              {exams && exams.length > 0 ? (
                exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.examName}</option>
                ))
              ) : (
                !loadingExams && <option value="" disabled>No exams available</option>
              )}
            </select>
          </div>
          
          {/* {!showAddResultForm && (
            <button
              onClick={handleShowAddResultForm}
              disabled={loadingExams}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Add Result
            </button>
          )} */}
        </div>

        {/* Loading State */}
        {(loadingExams || loadingExamDetails) && !showAddResultForm && (
          <div className="text-center py-4">Loading...</div>
        )}

        {/* No Exams Message */}
        {!loadingExams && exams.length === 0 && !showAddResultForm && (
          <div className="text-center py-4 text-gray-500">
            No results available yet. Use Add result button to create one.
          </div>
        )}

        {/* Exam Summary Table - Modern Design */}
{!showAddResultForm && !showModifyForm && !selectedExamId && examSummaries.length > 0 && (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl font-semibold text-gray-800">Course Results</h2>
      {/* {examSummaries.length > 0 && (
        <button className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export All
        </button>
      )} */}
    </div>
    
    {loadingExamSummaries ? (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading exam summaries...</p>
        </div>
      </div>
    ) : examSummaries.length > 0 ? (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Exam Name
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Marks
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Weightage
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mean
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Median
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Max
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Std Dev
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {examSummaries.map((exam, index) => (
                <tr 
                  key={exam.id} 
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedExamId(exam.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-9 w-9 flex-shrink-0 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{exam.examName}</div>
                        <div className="text-xs text-gray-500">Click to view details</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1.5 inline-flex text-sm font-medium bg-gray-100 text-gray-800 rounded-md">
                      {exam.totalMarks}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1.5 inline-flex text-sm font-medium bg-blue-100 text-blue-800 rounded-md">
                      {exam.weightage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-gray-700">
                    {exam.mean?.toFixed(1) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-gray-700">
                    {exam.median || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1.5 inline-flex text-sm font-medium bg-green-100 text-green-800 rounded-md">
                      {exam.max || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-gray-700">
                    {exam.deviation?.toFixed(1) || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Click on any row to view detailed results and statistics</span>
          </div>
        </div>
      </div>
    ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-blue-50 p-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">No results available yet</h3>
          <p className="text-gray-500 mb-6 max-w-md">No result have been added to this course yet. Use the "Add Result" button to create one.</p>
          <button
            onClick={handleShowAddResultForm}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Result
          </button>
        </div>
      </div>
    )}
  </div>
)}

        {/* Add Result Form */}
        {/* Add Result Form - Modern Design */}
{showAddResultForm && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Exam Result
        </h2>
        <p className="text-sm text-gray-600 mt-1 ml-7">Enter exam details and student marks</p>
      </div>
      <button
        onClick={handleCancelAddResult}
        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-all"
        disabled={publishing}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <div className="p-6">
      {/* Exam Details Section */}
      <div className="bg-gray-50/70 rounded-xl p-6 mb-8">
        <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Exam Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <input
                type="text"
                name="examName"
                value={newExam.examName}
                onChange={handleExamInputChange}
                className={`w-full pl-10 pr-3 py-2.5 border ${validationErrors.examName ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                placeholder="e.g., Midterm Exam"
                disabled={publishing}
              />
              {validationErrors.examName && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {validationErrors.examName}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="number"
                name="totalMarks"
                value={newExam.totalMarks}
                onChange={handleExamInputChange}
                className={`w-full pl-10 pr-3 py-2.5 border ${validationErrors.totalMarks ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                placeholder="e.g., 100"
                min="0"
                step="any"
                disabled={publishing}
              />
              {validationErrors.totalMarks && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {validationErrors.totalMarks}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weightage (%)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <input
                type="number"
                name="weightage"
                value={newExam.weightage}
                onChange={handleExamInputChange}
                className={`w-full pl-10 pr-3 py-2.5 border ${validationErrors.weightage ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                placeholder="e.g., 20"
                min="0"
                max="100"
                step="any"
                disabled={publishing}
              />
              {validationErrors.weightage && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {validationErrors.weightage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading Students */}
      {loadingStudents && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading enrolled students...</p>
        </div>
      )}
      
      {/* Student Marks Section */}
      {!loadingStudents && students.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5-9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
            Student Marks ({students.length} students)
          </h3>
          
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full bg-white">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll Number</th>
                    <th className="py-3.5 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="py-3.5 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student, index) => (
                    <tr key={student.userId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 transition-colors'}>
                      <td className="py-4 px-6 text-sm text-gray-700">{student.rollNumber}</td>
                      <td className="py-4 px-6 text-sm text-gray-800 font-medium">{`${student.user.firstName} ${student.user.lastName}`}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        <div className="w-full max-w-xs mx-auto">
                          <div className="relative rounded-md">
                            <input
                              type="number"
                              value={newExam.results.find(r => r.userId === student.userId)?.obtainedMarks || ''}
                              onChange={(e) => handleStudentMarkChange(student.userId, e.target.value)}
                              className={`w-full text-center py-2.5 px-3 rounded-lg border ${validationErrors[`student-${student.userId}`] ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm`}
                              placeholder={`out of ${newExam.totalMarks || '?'}`}
                              min="0"
                              step="any"
                              disabled={publishing}
                            />
                            {validationErrors[`student-${student.userId}`] && (
                              <div className="absolute -bottom-5 left-0 right-0 text-center">
                                <p className="text-red-500 text-xs">{validationErrors[`student-${student.userId}`]}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* No Students Message */}
      {!loadingStudents && students.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h4 className="text-lg font-medium text-gray-700 mb-2">No students found</h4>
          <p className="text-gray-500 mb-4">There are currently no students enrolled in this course.</p>
          <button
            onClick={handleCancelAddResult}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Go Back
          </button>
        </div>
      )}
      
      {/* Action Buttons */}
      {!loadingStudents && students.length > 0 && (
        <div className="flex justify-end gap-3 mt-8 border-t border-gray-100 pt-6">
          <button
            onClick={handleCancelAddResult}
            disabled={publishing}
            className="px-4 py-2.5 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
          <button
            onClick={handlePublishResults}
            disabled={publishing}
            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {publishing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Publish Results</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  </div>
)}

        {/* Modify Result Form */}
      {showModifyForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Modify Exam Results</h2>
          
          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block mb-1 font-medium">Exam Name</label>
              <input
                type="text"
                name="examName"
                value={modifyExam.examName}
                onChange={handleModifyExamInputChange}
                className={`w-full p-2 border ${validationErrors.examName ? 'border-red-500' : 'border-gray-300'} rounded`}
                placeholder="e.g., Midterm Exam"
                disabled={updatingResults}
              />
              {validationErrors.examName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.examName}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Total Marks</label>
              <input
                type="number"
                name="totalMarks"
                value={modifyExam.totalMarks}
                onChange={handleModifyExamInputChange}
                className={`w-full p-2 border ${validationErrors.totalMarks ? 'border-red-500' : 'border-gray-300'} rounded`}
                placeholder="e.g., 100"
                min="0"
                step="any"
                disabled={updatingResults}
              />
              {validationErrors.totalMarks && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.totalMarks}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Weightage (%)</label>
              <input
                type="number"
                name="weightage"
                value={modifyExam.weightage}
                onChange={handleModifyExamInputChange}
                className={`w-full p-2 border ${validationErrors.weightage ? 'border-red-500' : 'border-gray-300'} rounded`}
                placeholder="e.g., 20"
                min="0"
                max="100"
                step="any"
                disabled={updatingResults}
              />
              {validationErrors.weightage && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.weightage}</p>
              )}
            </div>
          </div>
          
          {/* Student Marks Table */}
          <h3 className="text-lg font-semibold mb-2">Student Marks</h3>
          <div className="overflow-x-auto max-h-96 overflow-y-auto mb-4">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Roll Number</th>
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-center">Marks</th>
                </tr>
              </thead>
              <tbody>
                {modifyExam.results.map((result, index) => (
                  <tr key={result.userId} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-4 border-b">{result.rollNumber}</td>
                    <td className="py-2 px-4 border-b">{result.name}</td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="number"
                        value={result.obtainedMarks || ''}
                        onChange={(e) => handleModifyStudentMarkChange(result.userId, e.target.value)}
                        className={`w-full p-1 border ${validationErrors[`student-${result.userId}`] ? 'border-red-500' : 'border-gray-300'} rounded text-center`}
                        placeholder="0"
                        min="0"
                        step="any"
                        disabled={updatingResults}
                      />
                      {validationErrors[`student-${result.userId}`] && (
                        <p className="text-red-500 text-sm">{validationErrors[`student-${result.userId}`]}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleCancelModify}
              disabled={updatingResults}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateResults}
              disabled={updatingResults}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {updatingResults ? 'Updating...' : 'Update Results'}
            </button>
          </div>
        </div>
      )}
        {/* Exam Details and Results */}
        {selectedExamId && examDetails && !loadingExamDetails && !showAddResultForm && !showModifyForm && (
        <div>
          {/* Exam Actions */}
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">{examDetails.examName}</h2>
            <div className="flex gap-2">
            <button
              onClick={handleExportData}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
              <button
                onClick={handleShowModifyConfirm}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modify Result
              </button>
              <button
                onClick={handleShowDeleteConfirm}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Result
              </button>
            </div>
          </div>
          
          {/* Exam Statistics */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm text-gray-500">Total Marks</p>
                <p className="text-xl font-semibold">{examDetails.totalMarks}</p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <p className="text-sm text-gray-500">Weightage</p>
                <p className="text-xl font-semibold">{examDetails.weightage}%</p>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <p className="text-sm text-gray-500">Mean</p>
                <p className="text-xl font-semibold">{examDetails.mean?.toFixed(1) || 'N/A'}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded">
                <p className="text-sm text-gray-500">Median</p>
                <p className="text-xl font-semibold">{examDetails.median || 'N/A'}</p>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <p className="text-sm text-gray-500">Maximum</p>
                <p className="text-xl font-semibold">{examDetails.max || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">Standard Deviation</p>
                <p className="text-xl font-semibold">{examDetails.deviation?.toFixed(1) || 'N/A'}</p>
              </div>
            </div>
          </div>
         

{ /* Performance Visualization - Single centered chart */ }
<div className="bg-white p-4 rounded-lg shadow mb-6">
  <h3 className="text-lg font-bold mb-4 text-center">Class Performance</h3>
  
  {/* Centered Score Distribution Chart */}
  <div className="max-w-3xl mx-auto mb-6">
    <div className="bg-gray-50 p-5 rounded-lg">
      <h4 className="text-md font-medium mb-3 text-center text-gray-700">Score Distribution</h4>
      <div className="h-72">
        <Bar
          data={(() => {
            // Define grade ranges with improved colors
            const ranges = [
              { min: 0, max: 20, label: '0-20%', color: 'rgba(255, 99, 132, 0.7)' },
              { min: 20, max: 40, label: '20-40%', color: 'rgba(255, 159, 64, 0.7)' },
              { min: 40, max: 60, label: '40-60%', color: 'rgba(255, 205, 86, 0.7)' },
              { min: 60, max: 80, label: '60-80%', color: 'rgba(75, 192, 192, 0.7)' },
              { min: 80, max: 100, label: '80-100%', color: 'rgba(54, 162, 235, 0.7)' }
            ];

            // Calculate percentages for each student
            const percentages = examDetails.results
              .map(r => (r.obtainedMarks / examDetails.totalMarks) * 100)
              .filter(p => !isNaN(p));
            
            // Initialize counts with all zeros
            const rangeCounts = ranges.map(range => ({
              range: range.label,
              count: 0,
              color: range.color
            }));

            // Place each student in exactly one range
            percentages.forEach(p => {
              if (p === 100) {
                // Handle 100% exactly
                rangeCounts[4].count++;
              } else {
                const rangeIndex = Math.floor(p / 20);
                if (rangeIndex >= 0 && rangeIndex < 5) {
                  rangeCounts[rangeIndex].count++;
                }
              }
            });

            return {
              labels: rangeCounts.map(c => c.range),
              datasets: [
                {
                  label: 'Number of Students',
                  data: rangeCounts.map(c => c.count),
                  backgroundColor: rangeCounts.map(c => c.color),
                  borderColor: rangeCounts.map(c => c.color.replace('0.7', '1')),
                  borderWidth: 1,
                  borderRadius: 5,
                }
              ]
            };
          })()}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.raw} students (${(context.raw / examDetails.results.length * 100).toFixed(1)}%)`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: { display: true, text: 'Score Range' }
              },
              y: {
                title: { display: true, text: 'Number of Students' },
                beginAtZero: true,
                ticks: { precision: 0 }
              }
            }
          }}
        />
      </div>
    </div>
  </div>
</div>

            {/* Student Results Table */}
            <h3 className="text-lg font-semibold mb-2">Student Results</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Roll Number</th>
                    <th className="py-2 px-4 border-b text-left">Name</th>
                    <th className="py-2 px-4 border-b text-center">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {examDetails.results.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-4 px-4 text-center text-gray-500">
                        No student results available
                      </td>
                    </tr>
                  ) : (
                    examDetails.results.map((result, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-4 border-b">{result.rollNumber}</td>
                        <td className="py-2 px-4 border-b">{result.name}</td>
                        <td className="py-2 px-4 border-b text-center">
                          {result.obtainedMarks !== null ? result.obtainedMarks : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-red-500 py-2">{error}</div>
        )}
      </div>
      </div>
    );
  }

  // Student View - Loading and Error States
  if (loading) {
    return <div>Loading results...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Prepare data for the graph
  const examNames = results.map((result) => result.examName);
  const obtainedMarks = results.map((result) => result.obtainedMarks || 0);
  const unobtainedMarks = results.map(
    (result) => (result.totalMarks || 0) - (result.obtainedMarks || 0)
  );
  const totalWeightage = results.map((result) => result.weightage || 0);
  const obtainedWeightage = results.map(
    (result) => (result.obtainedMarks * result.weightage) / result.totalMarks || 0
  );
  const unobtainedWeightage = totalWeightage.map(
    (total, index) => total - obtainedWeightage[index]
  );

  const chartData = {
    labels: examNames,
    datasets: [
      {
        label: 'Obtained Marks',
        data: obtainedMarks,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        stack: 'Marks',
      },
      {
        label: 'Remaining Marks',
        data: unobtainedMarks,
        backgroundColor: 'rgba(200, 200, 200, 0.6)',
        borderColor: 'rgba(200, 200, 200, 1)',
        borderWidth: 1,
        stack: 'Marks',
      },
      {
        label: 'Obtained Weightage',
        data: obtainedWeightage,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        stack: 'Weightage',
      },
      {
        label: 'Remaining Weightage',
        data: unobtainedWeightage,
        backgroundColor: 'rgba(230, 230, 230, 0.6)',
        borderColor: 'rgba(229, 231, 235, 1)',
        borderWidth: 1,
        stack: 'Weightage',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          filter: (legendItem) =>
            legendItem.text !== 'Remaining Marks' && legendItem.text !== 'Remaining Weightage',
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Exams',
        },
        stacked: true,
      },
      y: {
        title: {
          display: true,
          text: 'Marks / Weightage',
        },
        beginAtZero: true,
        stacked: true,
      },
    },
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-12">
    {/* Sticky header with consistent styling */}
    <div className="sticky top-0 z-50 bg-white bg-opacity-95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Results</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded">{courseDetails?.code || 'Loading...'}</span>
                <span className="text-gray-500 text-sm">{courseDetails?.credits || ''} Credits • {courseDetails?.semester || ''}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser?.userType === 'faculty' && !showAddResultForm && (
              <button
                onClick={handleShowAddResultForm}
                disabled={loadingExams}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg transition-colors hover:from-blue-700 hover:to-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Result
              </button>
            )}
            
            <NavLink 
              to="/dashboard/profile"
              className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center"
              title="View Profile"
            >
              <CgProfile className="text-xl text-gray-700" />
            </NavLink>
          </div>
        </div>
      </div>
    </div>

    {/* Content container */}
      <div className="p-6 lg:p-8">  {/* Added padding container */}

        {/* Results Overview Panel - Only shown when results exist */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
            {/* Panel Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Results Overview
              </h2>
              <p className="text-sm text-gray-600 mt-1 ml-7">Visual representation of your performance across exams</p>
            </div>

            {/* Performance Graph */}
            <div className="p-6">
              <div className="w-full h-80 lg:h-96">
                <Bar 
                  data={{
                    labels: examNames,
                    datasets: [
                      {
                        label: 'Obtained Marks',
                        data: obtainedMarks,
                        backgroundColor: 'rgba(59, 130, 246, 0.75)', // Modern blue
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1,
                        borderRadius: 6,
                        stack: 'Marks',
                      },
                      {
                        label: 'Remaining Marks',
                        data: unobtainedMarks,
                        backgroundColor: 'rgba(229, 231, 235, 0.5)', // Light gray
                        borderColor: 'rgba(209, 213, 219, 1)',
                        borderWidth: 1,
                        borderRadius: 6,
                        stack: 'Marks',
                      },
                      {
                        label: 'Obtained Weightage',
                        data: obtainedWeightage,
                        backgroundColor: 'rgba(124, 58, 237, 0.75)', // Modern purple
                        borderColor: 'rgba(124, 58, 237, 1)',
                        borderWidth: 1,
                        borderRadius: 6,
                        stack: 'Weightage',
                      },
                      {
                        label: 'Remaining Weightage',
                        data: unobtainedWeightage,
                        backgroundColor: 'rgba(243, 244, 246, 0.5)', // Very light gray
                        borderColor: 'rgba(229, 231, 235, 1)',
                        borderWidth: 1,
                        borderRadius: 6,
                        stack: 'Weightage',
                      },
                    ],
                  }} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                    plugins: {
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#1f2937',
                        bodyColor: '#4b5563',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        cornerRadius: 8,
                        boxPadding: 4,
                        usePointStyle: true,
                        callbacks: {
                          labelPointStyle: (context) => {
                            return {
                              pointStyle: 'rectRounded',
                              rotation: 0
                            };
                          }
                        }
                      },
                      legend: {
                        position: 'top',
                        labels: {
                          boxWidth: 15,
                          boxHeight: 15,
                          usePointStyle: true,
                          pointStyle: 'rectRounded',
                          padding: 20,
                          filter: (legendItem) =>
                            legendItem.text !== 'Remaining Marks' && legendItem.text !== 'Remaining Weightage',
                          color: '#4b5563',
                          font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                            size: 12,
                          }
                        },
                      },
                      title: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Exams',
                          color: '#6b7280',
                          font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                            size: 13,
                            weight: '500',
                          },
                        },
                        stacked: true,
                        grid: {
                          display: false,
                        },
                        ticks: {
                          color: '#4b5563',
                          font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                          },
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Marks / Weightage',
                          color: '#6b7280',
                          font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                            size: 13,
                            weight: '500',
                          },
                        },
                        beginAtZero: true,
                        stacked: true,
                        grid: {
                          color: '#f3f4f6',
                          borderDash: [3, 3],
                        },
                        ticks: {
                          color: '#4b5563',
                          font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                          },
                          padding: 10,
                        },
                      },
                    },
                    animation: {
                      duration: 1000,
                      easing: 'easeOutQuad',
                    },
                  }}
                />
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-700 font-medium mb-1">Average Score</div>
                    <div className="text-xl font-bold text-blue-800">
                      {(() => {
                        const validResults = results.filter(r => r.obtainedMarks !== null && r.totalMarks > 0);
                        if (validResults.length === 0) return 'N/A';
                        
                        const avgPercent = validResults.reduce((sum, result) => 
                          sum + (result.obtainedMarks / result.totalMarks * 100), 0) / validResults.length;
                        
                        return `${avgPercent.toFixed(1)}%`;
                      })()}
                    </div>
                    <div className="absolute top-3 right-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="text-xs text-purple-700 font-medium mb-1">Best Performance</div>
                    <div className="text-xl font-bold text-purple-800">
                      {(() => {
                        const validResults = results.filter(r => r.obtainedMarks !== null && r.totalMarks > 0);
                        if (validResults.length === 0) return 'N/A';
                        
                        const bestPercentage = Math.max(...validResults.map(r => 
                          (r.obtainedMarks / r.totalMarks * 100)));
                        
                        return `${bestPercentage.toFixed(1)}%`;
                      })()}
                    </div>
                    <div className="absolute top-3 right-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="relative bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="text-xs text-green-700 font-medium mb-1">Overall Progress</div>
                    <div className="text-xl font-bold text-green-800">
                      {(() => {
                        const totalWeightage = results.reduce((sum, result) => sum + (result.weightage || 0), 0);
                        return `${Math.min(totalWeightage, 100)}%`;
                      })()}
                    </div>
                    <div className="absolute top-3 right-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                    <div className="text-xs text-amber-700 font-medium mb-1">Completed Exams</div>
                    <div className="text-xl font-bold text-amber-800">
                      {results.filter(r => r.obtainedMarks !== null).length} / {results.length}
                    </div>
                    <div className="absolute top-3 right-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Table Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Detailed Results</h2>
              <p className="text-sm text-gray-600 mt-1">{results.length > 0 ? `${results.length} exams found` : 'No results available yet'}</p>
            </div>
            
            {/* {results.length > 0 && (
              <button className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            )} */}
          </div>

          {/* Table Section with modern styling */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3.5 text-left text-gray-600 font-semibold">Exam Name</th>
                  <th className="px-5 py-3.5 text-center text-gray-600 font-semibold">Weightage</th>
                  <th className="px-5 py-3.5 text-center text-gray-600 font-semibold">Total Marks</th>
                  <th className="px-5 py-3.5 text-center text-gray-600 font-semibold">Obtained Marks</th>
                  <th className="px-5 py-3.5 text-center text-gray-600 font-semibold">Mean</th>
                  <th className="px-5 py-3.5 text-center text-gray-600 font-semibold">Median</th>
                  <th className="px-5 py-3.5 text-center text-gray-600 font-semibold">Max</th>
                  <th className="px-5 py-3.5 text-center text-gray-600 font-semibold">Deviation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="rounded-full bg-blue-50 p-3 mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No results available yet</p>
                        <p className="text-gray-400 text-sm mt-1">Results will appear here once published by the faculty</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  results.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-5 py-4 text-left">
                        <span className="font-medium text-gray-900">{result.examName}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-sm">
                          {result.weightage}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-gray-600">
                        {result.totalMarks}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {result.obtainedMarks !== null ? (
                          <span className="font-medium text-gray-900">{result.obtainedMarks}</span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center text-gray-600">
                        {result.mean ? result.mean.toFixed(1) : 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-center text-gray-600">
                        {result.median || 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-center text-gray-600">
                        {result.max || 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {result.deviation !== null ? (
                          <span className="text-gray-600">{result.deviation.toFixed(1)}</span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer with stats - only when results exist */}
          {results.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">Overall Progress</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {(() => {
                      const totalWeightage = results.reduce((sum, result) => sum + (result.weightage || 0), 0);
                      return `${Math.min(totalWeightage, 100)}%`;
                    })()}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">Average Score</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {(() => {
                      const validResults = results.filter(r => r.obtainedMarks !== null && r.totalMarks > 0);
                      if (validResults.length === 0) return 'N/A';
                      
                      const avgPercent = validResults.reduce((sum, result) => 
                        sum + (result.obtainedMarks / result.totalMarks * 100), 0) / validResults.length;
                      
                      return `${avgPercent.toFixed(1)}%`;
                    })()}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">Best Performance</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {(() => {
                      const validResults = results.filter(r => r.obtainedMarks !== null && r.totalMarks > 0);
                      if (validResults.length === 0) return 'N/A';
                      
                      const bestPercentage = Math.max(...validResults.map(r => 
                        (r.obtainedMarks / r.totalMarks * 100)));
                      
                      return `${bestPercentage.toFixed(1)}%`;
                    })()}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">Completed Exams</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {results.filter(r => r.obtainedMarks !== null).length} / {results.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}