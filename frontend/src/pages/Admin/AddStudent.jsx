import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, authFetch } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { GoHome } from 'react-icons/go';
import { FaEyeSlash, FaEye, FaRegUser, FaUserGraduate, FaCloudUploadAlt } from "react-icons/fa";
import { motion } from 'framer-motion';

export default function AddStudent() {
  const [activeTab, setActiveTab] = useState('manual');
  const { logout } = useAuth();
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
      
      if (response.data.success) {
        // Display improved success message with stats
        const message = (
          <div>
            <p>{response.data.message}</p>
            {response.data.skippedCount > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-md text-sm">
                <p className="font-medium text-blue-800 mb-2">Upload Summary:</p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="bg-white p-2 rounded shadow-sm text-center">
                    <span className="block text-xs text-gray-500">Total</span>
                    <span className="block text-base font-semibold text-gray-700">{response.data.totalRows}</span>
                  </div>
                  <div className="bg-green-50 p-2 rounded shadow-sm text-center">
                    <span className="block text-xs text-green-600">Created</span>
                    <span className="block text-base font-semibold text-green-700">{response.data.createdCount}</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded shadow-sm text-center">
                    <span className="block text-xs text-amber-600">Skipped</span>
                    <span className="block text-base font-semibold text-amber-700">{response.data.skippedCount}</span>
                  </div>
                </div>
                
                {response.data.duplicateUsernames && response.data.duplicateUsernames.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-amber-700">Duplicate usernames:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {response.data.duplicateUsernames.map((username, idx) => (
                        <span key={idx} className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-xs">{username}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {response.data.duplicateEmails && response.data.duplicateEmails.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-amber-700">Duplicate emails:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {response.data.duplicateEmails.map((email, idx) => (
                        <span key={idx} className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-xs">{email}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {response.data.duplicateRollNumbers && response.data.duplicateRollNumbers.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-amber-700">Duplicate roll numbers:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {response.data.duplicateRollNumbers.map((rollNumber, idx) => (
                        <span key={idx} className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-xs">{rollNumber}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
        setSuccess(message);
      } else {
        setError(response.data.message);
      }
      
      setCsvFile(null);
      setCsvFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Upload error:', error.response?.data || error);
      const errorMessage = error.response?.data?.message;
      const errorList = error.response?.data?.errors;
      const duplicateUsernames = error.response?.data?.duplicateUsernames;
      const duplicateEmails = error.response?.data?.duplicateEmails;
      const duplicateRollNumbers = error.response?.data?.duplicateRollNumbers;
      
      // Comprehensive error display
      const errorContent = (
        <div>
          <p className="font-medium">{errorMessage || 'Error uploading students'}</p>
          
          {errorList && errorList.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium">Validation errors:</p>
              <ul className="list-disc pl-5 mt-1 text-sm">
                {errorList.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          
          {duplicateUsernames && duplicateUsernames.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium">Duplicate usernames:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {duplicateUsernames.map((username, idx) => (
                  <span key={idx} className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-xs">{username}</span>
                ))}
              </div>
            </div>
          )}
          
          {duplicateEmails && duplicateEmails.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium">Duplicate emails:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {duplicateEmails.map((email, idx) => (
                  <span key={idx} className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-xs">{email}</span>
                ))}
              </div>
            </div>
          )}
          
          {duplicateRollNumbers && duplicateRollNumbers.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium">Duplicate roll numbers:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {duplicateRollNumbers.map((rollNumber, idx) => (
                  <span key={idx} className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-xs">{rollNumber}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
      
      setError(errorContent);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen pb-16">
      {/* Fixed Header - Updated with glass effect */}
      <div className="fixed top-0 left-0 right-0 py-5 px-8 m-auto z-10 backdrop-blur-md bg-white/70 border-b border-gray-100 shadow-sm">
        <div className='flex justify-between items-center'>
          <div className='flex gap-6 items-center'>
            <motion.span
              className="text-4xl font-semibold cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
              onClick={() => navigate("/Admin")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              TRACKit 
            </motion.span>
            <motion.div 
              className='cursor-pointer rounded-full bg-gray-50 hover:bg-gray-100 p-3 shadow-sm'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={()=>{navigate("/Admin")}}
            >
              <GoHome className='text-[1.5rem] text-gray-700'></GoHome>
            </motion.div>
          </div>
          <motion.button 
            className='flex items-center gap-2 border rounded-full px-5 py-2 shadow-sm bg-white hover:bg-red-50 transition-all duration-200'
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
          >
            <span>
              <FaRegUser size={18} className='text-red-500'></FaRegUser>
            </span>
            <span className='font-medium'>Sign Out</span>
          </motion.button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="pt-28 px-4">
        <motion.div 
          className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 py-6 px-6">
            <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-3">
              <FaUserGraduate size={24} />
              <span>Add Students</span>
            </h2>
          </div>
          
          <div className="p-6">
            {/* Show error/success messages */}
            {error && (
              <motion.div 
                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {success}
              </motion.div>
            )}
            
            {/* Tab Navigation */}
            <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
              <button
                className={`flex-1 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${
                  activeTab === 'manual' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('manual')}
              >
                Manual Entry
              </button>
              <button
                className={`flex-1 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${
                  activeTab === 'bulk' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('bulk')}
              >
                Bulk Upload
              </button>
            </div>

            {activeTab === 'manual' ? (
              <form onSubmit={handleManualSubmit}>
                <div className="space-y-5">
                  <div className="relative">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={studentData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter username"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={studentData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="First name"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-gray-700 text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={studentData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={studentData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="student@example.com"
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Roll Number</label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={studentData.rollNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter numeric roll number only (e.g., 12345)"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Roll number must contain only numeric digits (0-9)
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-gray-700 text-sm font-medium mb-2">Enrollment Year</label>
                      <input
                        type="number"
                        name="enrollmentYear"
                        value={studentData.enrollmentYear}
                        onChange={handleChange}
                        required
                        min="2000"
                        max="2099"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="YYYY"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-gray-700 text-sm font-medium mb-2">Major</label>
                      <select
                        name="major"
                        value={studentData.major}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Engineering Branch</option>
                        <option value="Aerospace Engineering">Aerospace Engineering</option>
                        <option value="Biological Sciences and Bioengineering">Biological Sciences and Bioengineering</option>
                        <option value="Chemical Engineering">Chemical Engineering</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Cognitive Science">Cognitive Science</option>
                        <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                        <option value="Earth Science">Earth Science</option>
                        <option value="Economics">Economics</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Environmental Engineering and Management">Environmental Engineering and Management</option>
                        <option value="Humanities and Social Sciences">Humanities and Social Sciences</option>
                        <option value="Industrial and Management Engineering">Industrial and Management Engineering</option>
                        <option value="Laser Technology">Laser Technology</option>
                        <option value="Materials Science Programme">Materials Science Programme</option>
                        <option value="Materials Science and Engineering">Materials Science and Engineering</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Mathematics and Scientific Computing">Mathematics and Scientific Computing</option>
                        <option value="Mathematics and Statistics">Mathematics and Statistics</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Nuclear Engineering and Technology Programme">Nuclear Engineering and Technology Programme</option>
                        <option value="Photonics Science and Engineering">Photonics Science and Engineering</option>
                        <option value="Physics">Physics</option>
                        <option value="Space Science and Astronomy">Space Science and Astronomy</option>
                        <option value="Space, Planetary and Astronomical Sciences and Engineering">Space, Planetary and Astronomical Sciences and Engineering</option>
                        <option value="Statistics">Statistics</option>
                        <option value="Statistics and Data Science">Statistics and Data Science</option>
                        <option value="Sustainable Energy Engineering">Sustainable Energy Engineering</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={studentData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Create password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-all"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Min 8 characters, with uppercase, number & special character
                    </p>
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg focus:outline-none hover:from-blue-700 hover:to-purple-700 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Student
                  </motion.button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBulkSubmit} encType="multipart/form-data">
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-3">Upload CSV File</label>
                    <motion.div 
                      className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg 
                        transition-all duration-200 cursor-pointer hover:bg-blue-50
                        ${csvFile ? 'border-blue-400 bg-blue-50/40' : 'border-gray-300'}`}
                      onClick={() => fileInputRef.current.click()}
                      whileHover={{ scale: 1.01, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="space-y-3 text-center">
                        <motion.div 
                          className="mx-auto h-14 w-14"
                          animate={{ 
                            y: [0, -5, 0],
                            transition: { repeat: Infinity, duration: 2 }
                          }}
                        >
                          <FaCloudUploadAlt size={48} className={`mx-auto ${csvFile ? 'text-blue-600' : 'text-blue-500'}`} />
                        </motion.div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-gray-700">
                            {csvFileName ? (
                              <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="flex items-center justify-center gap-2"
                              >
                                <span className="text-blue-600">{csvFileName}</span>
                              </motion.div>
                            ) : (
                              "Drag and drop a CSV file here"
                            )}
                          </span>
                          <span className="text-xs text-gray-500">
                            or <span className="text-blue-600 font-medium">browse files</span>
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">CSV up to 5MB</p>
                        
                        {/* Hidden file input */}
                        <input
                          id="csv-file-input"
                          name="file"
                          type="file"
                          accept=".csv"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          required
                          className="sr-only"
                        />
                      </div>
                    </motion.div>
                    
                    {fileError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600"
                      >
                        {fileError}
                      </motion.p>
                    )}
                    
                    {csvFile && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex justify-end"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCsvFile(null);
                            setCsvFileName('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-sm text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove file
                        </button>
                      </motion.div>
                    )}
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-700 mb-2">CSV File Requirements</h4>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <b>username</b>: Unique identifier</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <b>firstName</b>: Student's first name</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <b>lastName</b>: Student's last name</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <b>email</b>: Valid email address</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <b>rollNumber</b>: Student's roll number (numeric only)</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <b>enrollmentYear</b>: Year of enrollment</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <b>major</b>: Engineering branch (match from dropdown options)</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <b>password</b>: Initial password</li>
                      </ul>
                      <div className="mt-2 text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                        Ensure your CSV file uses commas as separators and includes a header row.
                      </div>
                    </div>
                    
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={!csvFile}
                    className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none transition-all ${
                      !csvFile 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    }`}
                    whileHover={csvFile ? { scale: 1.02 } : {}}
                    whileTap={csvFile ? { scale: 0.98 } : {}}
                  >
                    Upload and Add Students
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}