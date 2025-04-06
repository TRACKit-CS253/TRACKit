import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";
import axios from 'axios';
import { API_URL, authFetch } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { GoHome } from 'react-icons/go';
import { FaEyeSlash, FaEye } from "react-icons/fa";

export default function AddStudent() {
  const [activeTab, setActiveTab] = useState('manual');
  const [studentData, setStudentData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    rollNumber: '',
    enrollmentYear: '',
    major: '',
    userType: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fileError, setFileError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFileChange = (e) => {
    setFileError('');
    const file = e.target.files[0];
    
    if (!file) {
      setCsvFile(null);
      setCsvFileName('');
      return;
    }

    // More lenient file type checking
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

    // Validate file size (5MB max)
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

  // Create an axios instance that always includes the auth token
  const getAxiosConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password strength
    const password = studentData.password;
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if(!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    if(!/[0-9]/.test(password)){
      setError('Password must contain at least one number');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('Password must contain at least one special character');
      return;
    }
    
    try {

      const response = await axios.post(
        `${API_URL}/api/admin/student`, // Updated endpoint to use admin's addStudent
        studentData, 
        getAxiosConfig()
      );
      
      // console.log('API Response:', response);
      setSuccess('Student added successfully!');
      setStudentData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        rollNumber: '',
        enrollmentYear: '',
        major: '',
        userType: 'student'
      });
      navigate('/Admin')
    } catch (error) {
      console.error('Error adding student:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'Error adding student';
      setError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    // Validate file type
    if (!csvFile.type && !csvFile.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/admin/bulk-students`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Bulk upload response:', response);
      
      setSuccess(response.data.message);
      setCsvFile(null);
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error.response?.data || error);
      const errorMessage = error.response?.data?.message;
      const errorList = error.response?.data?.errors;
      
      if (errorList && Array.isArray(errorList)) {
        setError(
          <div>
            <p>{errorMessage}</p>
            <ul className="list-disc pl-5 mt-2">
              {errorList.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        );
      } else {
        setError(errorMessage || 'Error uploading students');
      }
    }
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-8">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white py-7 px-8 shadow-lg z-10 flex justify-between items-center">
        <div className='flex gap-6 items-center'>
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
        <h1 className="text-2xl font-semibold text-gray-700">Add Student</h1>
      </div>
      
      {/* Main Content */}
      <div className="pt-32 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          {/* Show error/success messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}
          
          <h2 className="text-2xl font-bold mb-6 text-center">Add Students</h2>
          
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
                <label className="block text-gray-700 text-sm font-bold mb-2">Username:</label>
                <input
                  type="text"
                  name="username"
                  value={studentData.username}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={studentData.firstName}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={studentData.lastName}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={studentData.email}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Roll Number:</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={studentData.rollNumber}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Enrollment Year:</label>
                <input
                  type="number"
                  name="enrollmentYear"
                  value={studentData.enrollmentYear}
                  onChange={handleChange}
                  required
                  min="2000"
                  max="2099"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Major:</label>
                <input
                  type="text"
                  name="major"
                  value={studentData.major}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6 relative">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={studentData.password}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <div onClick={togglePasswordVisibility} className='absolute right-3 top-[2.45rem]'>
                  {showPassword?(<FaEye></FaEye>):(<FaEyeSlash></FaEyeSlash>)}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline
                hover:scale-95 transition-all duration-200"
              >
                Add Student
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
                    <li><span className="font-medium">username</span>: Unique username (required)</li>
                    <li><span className="font-medium">firstName</span>: Student's first name (required)</li>
                    <li><span className="font-medium">lastName</span>: Student's last name (required)</li>
                    <li><span className="font-medium">email</span>: Valid email address (required)</li>
                    <li><span className="font-medium">rollNumber</span>: Student's roll number (required)</li>
                    <li><span className="font-medium">enrollmentYear</span>: Year of enrollment (required)</li>
                    <li><span className="font-medium">major</span>: Student's major (required)</li>
                    <li><span className="font-medium">password</span>: Initial password (required)</li>
                  </ul>
                  <p className="mt-2 text-amber-600 font-medium">Important: Make sure your CSV file uses commas (,) as separators and includes a header row.</p>
                </div>
              </div>
              <button
                type="submit"
                disabled={!csvFile}
                className={`w-full ${!csvFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 cursor-pointer'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline
                hover:scale-95 transition-all duration-200`}
              >
                Upload and Add Students
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}