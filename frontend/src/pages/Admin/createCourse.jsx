import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosInstance'; // Use the enhanced axios instance
import { 
  validateCSVFile, 
  createFileUploadFormData, 
  getFileUploadConfig 
} from '../../utils/fileUpload';

import { GoHome } from "react-icons/go";

export default function CreateCourse() {
  const [activeTab, setActiveTab] = useState('manual');
  const [courseData, setCourseData] = useState({
    code: '',
    name: '',
    description: '',
    credits: 9,
    semester: ''
  });
  const [csvFile, setCsvFile] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { token } = useAuth(); // Get token from auth context
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [fileError, setFileError] = useState('');

  const handleChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFileError('');
    const file = e.target.files[0];
    
    if (!file) {
      setCsvFile(null);
      setCsvFileName('');
      return;
    }

    const validExtensions = ['.csv', '.txt'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension) && 
        file.type !== 'text/csv' && 
        file.type !== 'text/plain' &&
        file.type !== 'application/vnd.ms-excel') {
      setFileError(`Please select a valid CSV file. Received file of type: ${file.type}`);
      setCsvFile(null);
      setCsvFileName('');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size too large. Maximum size is 5MB.');
      setCsvFile(null);
      setCsvFileName('');
      return;
    }

    setCsvFile(file);
    setCsvFileName(file.name);
    console.log("Selected file:", file.name, "Size:", file.size, "Type:", file.type);
  };

  const resetForm = () => {
    setCourseData({
      code: '',
      name: '',
      description: '',
      credits: 9,
      semester: ''
    });
    setCsvFile(null);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const requiredFields = ['code', 'name', 'credits', 'semester'];
      const missingFields = requiredFields.filter(field => !courseData[field]);
      
      if (missingFields.length > 0) {
        setMessage({ 
          text: `Missing required fields: ${missingFields.join(', ')}`, 
          type: 'error' 
        });
        setLoading(false);
        return;
      }
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const authToken = token || 
                        localStorage.getItem('token') || 
                        userData.token || 
                        localStorage.getItem('accessToken');
      
      console.log("User data from localStorage:", userData);
      console.log("Token being used:", authToken);
      
      if (!authToken) {
        setMessage({ text: 'Authentication required. Please log in again.', type: 'error' });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await axiosInstance.post(
        '/api/admin/course',
        courseData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.data.success) {
        setMessage({ text: 'Course created successfully!', type: 'success' });
        resetForm();
      }
    } catch (error) {
      console.error("Full error object:", error);
      
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        console.error("Response data:", error.response.data);
      }
      
      let errorMessage = 'Error creating course';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Validation error. Check course details.';
          if (error.response.data.message.includes('already exists')) {
            errorMessage = 'This course code already exists. Please use a different code.';
          }
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = 'Authentication error. Please log in again.';
          setTimeout(() => navigate('/login'), 2000);
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
      }
      
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setMessage({ text: 'Please select a CSV file', type: 'error' });
      return;
    }

    const validation = validateCSVFile(csvFile);
    if (!validation.isValid) {
      setMessage({ text: validation.message, type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: 'Uploading file... Please wait.', type: 'info' });

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const authToken = token || 
                        localStorage.getItem('token') || 
                        userData.token || 
                        localStorage.getItem('accessToken');
      
      if (!authToken) {
        setMessage({ text: 'Authentication required. Please log in again.', type: 'error' });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const formData = new FormData();
      formData.append('file', csvFile);
      
      console.log("Making bulk upload request with:");
      console.log("- File name:", csvFile.name);
      console.log("- File size:", csvFile.size);
      console.log("- Content type:", csvFile.type);

      const response = await axiosInstance.post(
        '/api/admin/bulk-courses',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setMessage({ text: `Uploading: ${percent}% complete`, type: 'info' });
          }
        }
      );

      console.log("Response received:", response.data);
      
      if (response.data.success) {
        setMessage({ 
          text: `${response.data.message || 'Courses uploaded successfully!'}`, 
          type: 'success' 
        });
        resetForm();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setCsvFileName('');
      }
    } catch (error) {
      console.error('Error object:', error);
      
      let errorMessage = 'Error uploading courses';
      let errorDetails = [];
      let duplicateCodes = [];
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
        
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          errorDetails = error.response.data.errors;
        }
        
        if (error.response.data.duplicateCodes && error.response.data.duplicateCodes.length > 0) {
          duplicateCodes = error.response.data.duplicateCodes;
          errorMessage = 'These course codes already exist. Please use a different CSV file.';
        }
      }
      
      setMessage({ 
        text: errorMessage, 
        type: 'error',
        details: errorDetails.length > 0 ? errorDetails : null,
        duplicateCodes: duplicateCodes.length > 0 ? duplicateCodes : null
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <div className="fixed top-0 left-0 right-0 bg-white py-7 px-8 shadow-lg z-10 flex justify-between items-center">
        <div className='flex gap-6'>
          <span
            className="text-4xl font-semibold cursor-pointer"
            onClick={() => navigate("/Admin")}
            >
            TRACKit
          </span>
          <div className='cursor-pointer hover:scale-95 duration-200 transition-all rounded-full hover:bg-gray-100 p-2'>
            <GoHome className='text-[1.9rem]' onClick={()=>{navigate("/Admin")}}></GoHome>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-700">Create Course</h1>
      </div>
      
      <div className="pt-32 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Course</h2>
          
          {message.text && (
            <div className={`p-3 mb-4 rounded text-sm ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 
              message.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}
          
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 ${activeTab === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('manual')}
            >
              Manual Entry
            </button>
            <button
              className={`flex-1 py-2 ${activeTab === 'bulk' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveTab('bulk')}
            >
              Bulk Upload
            </button>
          </div>

          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Course Code:</label>
                <input
                  type="text"
                  name="code"
                  value={courseData.code}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Course Name:</label>
                <input
                  type="text"
                  name="name"
                  value={courseData.name}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleChange}
                  rows="3"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Credits:</label>
                <input
                  type="number"
                  name="credits"
                  value={courseData.credits}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Semester:</label>
                <select
                  name="semester"
                  value={courseData.semester}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Select Semester</option>
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline
                hover:scale-95 transition-all duration-200`}
              >
                {loading ? "Creating..." : "Create Course"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleBulkSubmit} encType="multipart/form-data">
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Upload CSV File:</label>
                <div className="flex items-center">
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    required
                    className="hidden"
                    id="csv-file-input"
                  />
                  <label 
                    htmlFor="csv-file-input"
                    className="cursor-pointer bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded flex-grow text-center"
                  >
                    {csvFileName || "Choose a CSV file"}
                  </label>
                  {csvFileName && (
                    <button
                      type="button"
                      onClick={() => {
                        setCsvFile(null);
                        setCsvFileName('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {fileError && (
                  <p className="text-red-500 text-xs mt-1">{fileError}</p>
                )}
                <div className="text-sm text-gray-500 mt-2">
                  <p className="font-bold">CSV file must include these columns:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li><span className="font-medium">course code</span>: Course code (required)</li>
                    <li><span className="font-medium">course name</span>: Course name (required)</li>
                    <li><span className="font-medium">credits</span>: Course credits (required, 2-14)</li>
                    <li><span className="font-medium">semester</span>: Fall/Spring/Summer (required)</li>
                    <li><span className="font-medium">description</span>: Course description (optional)</li>
                  </ul>
                  <p className="mt-2 text-amber-600 font-medium">Important: Make sure your CSV file uses commas (,) as separators and includes a header row.</p>
                </div>
                
              </div>
              
              {message.type === 'error' && message.details && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-bold text-red-700 mb-2">Error details:</p>
                  <ul className="text-xs text-red-600 ml-2 list-disc pl-3">
                    {message.details.map((detail, index) => (
                      <li key={index} className="mb-1">{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {message.type === 'error' && message.duplicateCodes && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-bold text-red-700 mb-2">Duplicate course codes:</p>
                  <div className="text-xs text-red-600 flex flex-wrap gap-1">
                    {message.duplicateCodes.map((code, index) => (
                      <span key={index} className="bg-red-100 px-1 py-0.5 rounded">{code}</span>
                    ))}
                  </div>
                  <p className="text-xs mt-2 text-red-600">
                    Please remove these courses from your CSV file or use different course codes.
                  </p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading || !csvFile}
                className={`w-full ${loading || !csvFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 cursor-pointer'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline
                hover:scale-95 transition-all duration-200`}
              >
                {loading ? "Uploading..." : "Upload and Create Courses"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
