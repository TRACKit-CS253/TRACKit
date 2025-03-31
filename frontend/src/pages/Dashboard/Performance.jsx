import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useCourses } from '../../contexts/CourseContext';
import { Bar } from 'react-chartjs-2';
import { IoIosArrowDropdown } from "react-icons/io";
import 'chart.js/auto';

export default function Performance() {
  const { currentUser } = useAuth();
  // Use the useCourses hook instead of managing courses state directly
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
            initialExpandedState[course.id] = true; // Default to expanded
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
          borderColor: 'rgba(230, 230, 230, 1)',
          borderWidth: 1,
          stack: 'Weightage',
        },
      ],
    };
  };

  // Chart options - same as in Results.jsx
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

  if (coursesLoading || loading) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center'>
        <p className='text-xl'>Loading your performance data...</p>
      </div>
    );
  }

  if (coursesError || error) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center'>
        <p className='text-xl text-red-500'>{coursesError || error}</p>
      </div>
    );
  }

  if (!currentUser || currentUser.userType !== 'student') {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center'>
        <p className='text-xl text-red-500'>This page is only accessible to students.</p>
      </div>
    );
  }

  return (
    <div className='w-full  h-full flex flex-col items-start justify-start'>
      <div className='flex justify-between w-full py-2 px-4 items-center sticky top-0 bg-[#F5F5F5] z-10'>
        <p className='text-[35px] font-bold mt-2 self-start'>Your Performance</p>
        <NavLink to="/dashboard/profile">
          <CgProfile className='text-[40px] cursor-pointer hover:text-blue-500 transition-colors duration-200 hover:scale-95' />
        </NavLink>
      </div>

      <div className='w-full p-3'>
        {/* Overall Performance Summary */}
        <div className="w-full bg-white rounded-lg shadow-md p-4 my-4">
          <h2 className="text-xl font-bold mb-2">Overall Performance</h2>
          <div className="flex flex-wrap gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Courses Enrolled</p>
              <p className="text-xl font-semibold">{courses.length}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Average Performance</p>
              <p className="text-xl font-semibold">
                {courses.length > 0 ? `${calculateOverallPerformance().toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Relative to Median</p>
              <p className="text-xl font-semibold">
                {courses.length > 0 && Object.keys(courseResults).length > 0 ? (
                  calculateMedianPerformance() > 0 ? 
                    <span className="text-green-600">{Math.abs(calculateMedianPerformance()).toFixed(1)}% better than median</span> : 
                    <span className="text-red-600">{Math.abs(calculateMedianPerformance()).toFixed(1)}% below median</span>
                ) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {!courses || courses.length === 0 ? (
          <div className="w-full bg-white rounded-lg shadow-md p-6 my-4 text-center">
            <p className="text-lg">You are not enrolled in any courses yet.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="w-full bg-white rounded-lg shadow-md p-4 px-6 my-3">
              {/* Course Header - Clickable to expand/collapse */}
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => toggleCourseExpand(course.id)}
              >
                <h2 className="text-xl font-semibold">
                  {course.code}: {course.name}
                </h2>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">{course.credits} Credits </span>
                  <span className={`text-blue-500 transform transition-transform duration-500 ease-in-out ${
                    expandedCourses[course.id] ? 'rotate-180' : 'rotate-0'
                  }`}>
                    <IoIosArrowDropdown className='text-[25px]'/>
                  </span>
                </div>
              </div>

              {/* Course Content - With smooth height transition */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedCourses[course.id] 
                    ? 'max-h-[2000px] opacity-100 mt-4' 
                    : 'max-h-0 opacity-0 mt-0'
                }`}
              >
                <div className="mb-4">
                  {/* Results Data */}
                  {(!courseResults[course.id] || courseResults[course.id].length === 0) ? (
                    <p className="text-gray-500 p-4 text-center">Results are not yet released.</p>
                  ) : (
                    <>
                      {/* Graph Section */}
                      <div className="w-full h-80 mb-6">
                        <Bar data={getChartData(course.id)} options={chartOptions} />
                      </div>
                      
                      {/* Table Section */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300">
                          <thead>
                            <tr>
                              <th className="py-2 px-4 border-b text-center">Exam Name</th>
                              <th className="py-2 px-4 border-b text-center">Weightage</th>
                              <th className="py-2 px-4 border-b text-center">Total Marks</th>
                              <th className="py-2 px-4 border-b text-center">Obtained Marks</th>
                              <th className="py-2 px-4 border-b text-center">Mean</th>
                              <th className="py-2 px-4 border-b text-center">Median</th>
                              <th className="py-2 px-4 border-b text-center">Max</th>
                              <th className="py-2 px-4 border-b text-center">Deviation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courseResults[course.id].map((result, index) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                                <td className="py-2 px-4 border-b text-center">
                                  {result.examName}
                                </td>
                                <td className="py-2 px-4 border-b text-center">
                                  {result.weightage}
                                </td>
                                <td className="py-2 px-4 border-b text-center">
                                  {result.totalMarks}
                                </td>
                                <td className="py-2 px-4 border-b text-center">
                                  {result.obtainedMarks !== null ? result.obtainedMarks : 'N/A'}
                                </td>
                                <td className="py-2 px-4 border-b text-center">
                                  {result.mean?.toFixed(1) || 'N/A'}
                                </td>
                                <td className="py-2 px-4 border-b text-center">
                                  {result.median || 'N/A'}
                                </td>
                                <td className="py-2 px-4 border-b text-center">
                                  {result.max || 'N/A'}
                                </td>
                                <td className="py-2 px-4 border-b text-center">
                                  {result.deviation !== null ? result.deviation.toFixed(1) : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
