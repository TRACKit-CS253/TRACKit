import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useCourses } from '../../contexts/CourseContext';
import { Bar } from 'react-chartjs-2';
import { IoIosArrowDropdown } from "react-icons/io";
import { IoStatsChart, IoWarning, IoSchool } from "react-icons/io5";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FaChartLine, FaRegChartBar, FaBookOpen } from "react-icons/fa";
import 'chart.js/auto';

export default function Performance() {
  const { currentUser } = useAuth();
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const [courseResults, setCourseResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});

  useEffect(() => {
    // Only fetch data if the user is a student and we have courses
    if (currentUser && currentUser.userType === 'student' && courses.length > 0 && !coursesLoading) {
      const fetchResults = async () => {
        try {
          // Initialize expanded state for each course
          const initialExpandedState = {};
          courses.forEach(course => {
            initialExpandedState[course.id] = false; // Default to collapsed
          });
          setExpandedCourses(initialExpandedState);

          // Fetch results for each enrolled course
          const resultsPromises = courses.map(course => 
            axios.get(`${process.env.REACT_APP_API_URL}/api/result/student/${currentUser.id}/course/${course.id}`)
              .then(res => ({ courseId: course.id, results: res.data }))
              .catch(err => {
                console.error(`Error fetching results for course ${course.code}:`, err);
                return { courseId: course.id, results: [] };
              })
          );

          const allResults = await Promise.all(resultsPromises);
          
          // Convert array of results to object with courseId as key
          const resultsObject = {};
          allResults.forEach(item => {
            resultsObject[item.courseId] = item.results;
          });
          
          setCourseResults(resultsObject);
        } catch (err) {
          console.error('Error fetching results:', err);
          setError('Failed to fetch your performance data. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchResults();
    } else if (!coursesLoading) {
      setLoading(false);
      if (currentUser && currentUser.userType !== 'student') {
        setError('This page is only accessible to students.');
      }
    }
  }, [currentUser, courses, coursesLoading]);

  const toggleCourseExpand = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  // Prepare chart data for a specific course
  const getChartData = (courseId) => {
    const results = courseResults[courseId] || [];
    
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

    return {
      labels: examNames,
      datasets: [
        {
          label: 'Obtained Marks',
          data: obtainedMarks,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          stack: 'Marks',
        },
        {
          label: 'Remaining Marks',
          data: unobtainedMarks,
          backgroundColor: 'rgba(229, 231, 235, 0.6)',
          borderColor: 'rgba(229, 231, 235, 1)',
          borderWidth: 1,
          stack: 'Marks',
        },
        {
          label: 'Obtained Weightage',
          data: obtainedWeightage,
          backgroundColor: 'rgba(139, 92, 246, 0.6)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 1,
          stack: 'Weightage',
        },
        {
          label: 'Remaining Weightage',
          data: unobtainedWeightage,
          backgroundColor: 'rgba(243, 244, 246, 0.6)',
          borderColor: 'rgba(243, 244, 246, 1)',
          borderWidth: 1,
          stack: 'Weightage',
        },
      ],
    };
  };

  // Modern chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            size: 12
          },
          filter: (legendItem) =>
            legendItem.text !== 'Remaining Marks' && legendItem.text !== 'Remaining Weightage',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Exams',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        stacked: true,
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Marks / Weightage',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        beginAtZero: true,
        stacked: true,
        grid: {
          color: 'rgba(243, 244, 246, 0.8)',
          borderDash: [3, 3]
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
    },
    elements: {
      bar: {
        borderRadius: 4
      }
    }
  };

  // Calculate overall course performance
  const calculateOverallPerformance = () => {
    let totalWeightedMarks = 0;
    let totalWeightage = 0;
    
    Object.entries(courseResults).forEach(([courseId, results]) => {
      results.forEach(result => {
        if (result.obtainedMarks !== null && result.totalMarks > 0) {
          const weightedMark = (result.obtainedMarks / result.totalMarks) * result.weightage;
          totalWeightedMarks += weightedMark;
          totalWeightage += result.weightage;
        }
      });
    });
    
    if (totalWeightage === 0) return 0;
    return (totalWeightedMarks / totalWeightage) * 100;
  };

  // Calculate performance relative to median
  const calculateMedianPerformance = () => {
    let totalWeightedDiff = 0;
    let totalWeightage = 0;
    
    Object.entries(courseResults).forEach(([courseId, results]) => {
      results.forEach(result => {
        if (result.obtainedMarks !== null && result.totalMarks > 0 && result.median !== null) {
          // Calculate the percentage difference from the median
          const studentPercent = (result.obtainedMarks / result.totalMarks) * 100;
          const medianPercent = (result.median / result.totalMarks) * 100;
          const percentDiff = studentPercent - medianPercent;
          
          // Weight by the exam's weightage
          const weightedDiff = percentDiff * result.weightage;
          totalWeightedDiff += weightedDiff;
          totalWeightage += result.weightage;
        }
      });
    });
    
    if (totalWeightage === 0) return 0;
    return totalWeightedDiff / totalWeightage;
  };

  // Get a performance grade based on overall performance
  const getPerformanceGrade = () => {
    // Check if there are any results at all
    const hasAnyResults = Object.values(courseResults).some(results => results.length > 0);
    
    if (!hasAnyResults) {
      return { grade: 'N/A', color: 'text-gray-500' };
    }
    
    const score = calculateOverallPerformance();
    
    if (score >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (score >= 80) return { grade: 'A', color: 'text-green-500' };
    if (score >= 70) return { grade: 'B+', color: 'text-blue-600' };
    if (score >= 60) return { grade: 'B', color: 'text-blue-500' };
    if (score >= 50) return { grade: 'C', color: 'text-yellow-600' };
    if (score >= 40) return { grade: 'D', color: 'text-orange-500' };
    return { grade: 'F', color: 'text-red-500' };
  };

  if (coursesLoading || loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-4'>
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className='text-xl font-medium text-gray-700'>Loading your performance data...</p>
        </div>
      </div>
    );
  }

  if (coursesError || error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-4'>
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center h-[70vh]">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md w-full text-center">
            <IoWarning className="text-red-500 text-5xl mx-auto mb-4" />
            <p className='text-xl font-medium text-red-700 mb-2'>Error</p>
            <p className="text-red-600">{coursesError || error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.userType !== 'student') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-4'>
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center h-[70vh]">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-md w-full text-center">
            <IoWarning className="text-amber-500 text-5xl mx-auto mb-4" />
            <p className='text-xl font-medium text-amber-700 mb-2'>Access Restricted</p>
            <p className="text-amber-600">This page is only accessible to students.</p>
          </div>
        </div>
      </div>
    );
  }

  const performanceGrade = getPerformanceGrade();

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-4'>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800'>Academic Performance</h1>
            <p className="text-gray-600 mt-1">Track your progress across all courses</p>
          </div>
          
          <NavLink 
            to="/dashboard/profile"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            <CgProfile className='text-blue-600 text-xl' />
            <span className="text-sm font-medium">View Profile</span>
          </NavLink>
        </div>

        {/* Performance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Overall Grade Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Overall Grade</p>
                <p className={`text-4xl font-bold ${performanceGrade.color}`}>
                  {performanceGrade.grade}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <IoStatsChart className="text-blue-600 text-xl" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {performanceGrade.grade === 'N/A' 
                ? 'No results have been released yet' 
                : `${calculateOverallPerformance().toFixed(1)}% average across all subjects`}
            </p>
          </div>
          
          {/* Course Enrollment Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Courses Enrolled</p>
                <p className="text-4xl font-bold text-gray-800">{courses.length}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <FaBookOpen className="text-purple-600 text-xl" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {courses.length === 1 ? '1 active course' : `${courses.length} active courses`} this semester
            </p>
          </div>
          
          {/* Relative Performance Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Relative Performance</p>
                {performanceGrade.grade === 'N/A' ? (
                  <p className="text-4xl font-bold text-gray-500">N/A</p>
                ) : (
                  <p className={`text-4xl font-bold ${calculateMedianPerformance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(calculateMedianPerformance()).toFixed(1)}%
                  </p>
                )}
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <FaChartLine className="text-green-600 text-xl" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {performanceGrade.grade === 'N/A' 
                ? 'No results have been released yet' 
                : (calculateMedianPerformance() >= 0 
                    ? 'Above class median' 
                    : 'Below class median')}
            </p>
          </div>
          
          {/* Completed Assessments Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Assessments</p>
                <p className="text-4xl font-bold text-gray-800">
                  {Object.values(courseResults).reduce((acc, results) => acc + results.length, 0)}
                </p>
              </div>
              <div className="bg-amber-50 p-3 rounded-full">
                <HiOutlineDocumentReport className="text-amber-600 text-xl" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Total assessments across all courses
            </p>
          </div>
        </div>

        {/* Course Performance Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <IoSchool className="text-blue-600" />
          Course Performance
        </h2>

        {!courses || courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 my-4 text-center border border-gray-100">
            <div className="bg-blue-50 p-4 rounded-full inline-block mb-4">
              <FaBookOpen className="text-blue-500 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Courses Found</h3>
            <p className="text-gray-600">You are not enrolled in any courses yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                {/* Course Header - Clickable to expand/collapse */}
                <div 
                  className="p-6 flex justify-between items-center cursor-pointer border-b border-gray-100" 
                  onClick={() => toggleCourseExpand(course.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${expandedCourses[course.id] ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'} transition-all duration-300`}>
                      <FaRegChartBar className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {course.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {course.code} • {course.credits} Credits
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {courseResults[course.id] && courseResults[course.id].length > 0 && (
                      <span className={`mr-4 px-3 py-1 rounded-full text-sm ${
                        calculateCourseScore(course.id) >= 70 ? 'bg-green-50 text-green-700' : 
                        calculateCourseScore(course.id) >= 50 ? 'bg-yellow-50 text-yellow-700' : 
                        'bg-red-50 text-red-700'
                      }`}>
                        {calculateCourseScore(course.id).toFixed(1)}%
                      </span>
                    )}
                    <span className={`text-blue-500 transform transition-transform duration-300 ${
                      expandedCourses[course.id] ? 'rotate-180' : 'rotate-0'
                    }`}>
                      <IoIosArrowDropdown className='text-2xl'/>
                    </span>
                  </div>
                </div>

                {/* Course Content - With smooth height transition */}
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    expandedCourses[course.id] 
                      ? 'max-h-[2000px] opacity-100' 
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6">
                    {/* Results Data */}
                    {(!courseResults[course.id] || courseResults[course.id].length === 0) ? (
                      <div className="text-center py-8">
                        <div className="bg-gray-50 p-4 rounded-full inline-block mb-3">
                          <HiOutlineDocumentReport className="text-gray-400 text-3xl" />
                        </div>
                        <p className="text-gray-600 font-medium">No results have been released yet.</p>
                        <p className="text-sm text-gray-500 mt-1">Check back later for assessment data.</p>
                      </div>
                    ) : (
                      <>
                        {/* Graph Section */}
                        <div className="w-full h-80 mb-6 bg-white p-4 rounded-xl border border-gray-100">
                          <Bar data={getChartData(course.id)} options={chartOptions} />
                        </div>
                        
                        {/* Table Section */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                  Assessment
                                </th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                  Weightage
                                </th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                  Total
                                </th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                  Score
                                </th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                  Mean
                                </th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                  Median
                                </th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                  Max
                                </th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                  SD
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {courseResults[course.id].map((result, index) => {
                                // Calculate percentage for highlighting
                                const percentage = result.obtainedMarks !== null ? 
                                  (result.obtainedMarks / result.totalMarks) * 100 : null;
                                
                                let scoreColor = 'text-gray-800';
                                if (percentage !== null) {
                                  if (percentage >= 80) scoreColor = 'text-green-600 font-medium';
                                  else if (percentage >= 60) scoreColor = 'text-blue-600';
                                  else if (percentage >= 40) scoreColor = 'text-yellow-600';
                                  else scoreColor = 'text-red-600';
                                }
                                
                                return (
                                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                      {result.examName}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700 text-center">
                                      {result.weightage}%
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700 text-center">
                                      {result.totalMarks}
                                    </td>
                                    <td className={`py-3 px-4 text-sm text-center ${scoreColor}`}>
                                      {result.obtainedMarks !== null ? 
                                        `${result.obtainedMarks} (${percentage.toFixed(1)}%)` : 
                                        'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700 text-center">
                                      {result.mean?.toFixed(1) || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700 text-center">
                                      {result.median !== null && result.median !== undefined ? result.median : 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700 text-center">
                                      {result.max !== null && result.max !== undefined ? result.max : 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700 text-center">
                                      {result.deviation !== null && result.deviation !== undefined ? 
                                        result.deviation.toFixed(1) : 'N/A'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  
  // Helper function to calculate score for a specific course
  function calculateCourseScore(courseId) {
    const results = courseResults[courseId] || [];
    let totalWeightedMarks = 0;
    let totalWeightage = 0;
    
    results.forEach(result => {
      if (result.obtainedMarks !== null && result.totalMarks > 0) {
        const weightedMark = (result.obtainedMarks / result.totalMarks) * result.weightage;
        totalWeightedMarks += weightedMark;
        totalWeightage += result.weightage;
      }
    });
    
    if (totalWeightage === 0) return 0;
    return (totalWeightedMarks / totalWeightage) * 100;
  }
}
