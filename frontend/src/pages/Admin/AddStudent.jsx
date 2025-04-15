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
    const { name, value } = e.target;
    
    // Name validation - allow only alphabets and spaces
    if ((name === 'firstName' || name === 'lastName') && value !== '') {
      // Allow only alphabets and spaces
      if (!/^[A-Za-z\s]+$/.test(value)) {
        return; // Don't update state if invalid input
      }
    }
    
    setStudentData({
      ...studentData,
      [name]: value
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

    // Validate name fields - only alphabets and spaces
    if (!/^[A-Za-z\s]+$/.test(studentData.firstName)) {
      setError('First name should contain only alphabets and spaces');
      return;
    }
    
    if (studentData.lastName && !/^[A-Za-z\s]+$/.test(studentData.lastName)) {
      setError('Last name should contain only alphabets and spaces');
      return;
    }

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
        // Simplified success message without detailed failure reasons
        const successMessage = (
          <div>
            <p className="mb-2">{response.data.message}</p>
            <div className="p-2 bg-blue-50 rounded text-sm">
              <div className="mb-1"><span className="font-medium">Total records in CSV:</span> {response.data.totalRows || 'N/A'}</div>
              <div className="mb-1 text-green-700"><span className="font-medium">Successfully added:</span> {response.data.createdCount || response.data.userIds?.length || 0}</div>
              <div className="text-amber-700"><span className="font-medium">Not added:</span> {
                (response.data.totalRows && response.data.createdCount) 
                  ? (response.data.totalRows - response.data.createdCount) 
                  : (response.data.skippedCount || 'Unknown')
              } 
                <span className="text-xs ml-1">(duplicates or validation errors)</span>
              </div>
            </div>
          </div>
        );
        
        setSuccess(successMessage);
        
        setCsvFile(null);
        setCsvFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Upload error:', error.response?.data || error);
      
      // Simplified error message
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred while uploading students';
      setError(errorMessage);
    }
  };

  const engineeringBranches = [
    "Aerospace Engineering",
    "Biological Sciences and Bioengineering",
    "Chemical Engineering",
    "Chemistry",
    "Civil Engineering",
    "Cognitive Science",
    "Computer Science and Engineering",
    "Dean Of Academic Affairs",
    "Dean Of Research & Development",
    "Dean Of Resource & Alumni",
    "Design",
    "Earth Science",
    "Economics",
    "Electrical Engineering",
    "Environmental Engineering and Management",
    "Humanities and Social Sciences",
    "Industrial and Management Engineering",
    "Laser Technology",
    "Materials Science Programme",
    "Materials Science and Engineering",
    "Mathematics",
    "Mathematics and Scientific Computing",
    "Mathematics and Statistics",
    "Mechanical Engineering",
    "Nuclear Engineering and Technology Programme",
    "Photonics Science and Engineering",
    "Physics",
    "Space Science and Astronomy",
    "Space, Planetary and Astronomical Sciences and Engineering",
    "Statistics",
    "Statistics and Data Science",
    "Sustainable Energy Engineering"
  ];

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
                      placeholder="Enter roll number"
                    />
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
                      <div className="relative">
                        <select
                          name="major"
                          value={studentData.major}
                          onChange={handleChange}
                          required
                          className="w-full appearance-none px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 pr-10"
                        >
                          <option value="" disabled>Select Department</option>
                          {engineeringBranches.map((branch, index) => (
                            <option key={index} value={branch} className="py-2">{branch}</option>
                          ))}
                        </select>
                        
                        {/* Custom dropdown arrow */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 transition-transform duration-200 ease-in-out" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        
                        {/* Highlight effect on focus */}
                        <div 
                          className={`absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-200 ${
                            studentData.major ? 'opacity-100 border-2 border-blue-100' : 'opacity-0'
                          }`} 
                          aria-hidden="true"
                        />
                      </div>
                      
                      {/* Selected department badge - shows when a department is selected */}
                      {studentData.major && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{studentData.major}</span>
                        </motion.div>
                      )}
                      
                      {/* Department count */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        className="absolute right-0 top-0 text-xs text-gray-500"
                      >
                        {engineeringBranches.length} departments
                      </motion.div>
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
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-700 mb-2">CSV File Requirements</h4>
                    <ul className="space-y-1 text-xs text-gray-700">
                      <li className="flex items-start"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span> <b>username</b>: Unique identifier</li>
                      <li className="flex items-start"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span> <b>firstName</b>: Student's first name (should be in alphabets only)</li>
                      <li className="flex items-start"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span> <b>lastName</b>: Student's last name (should be in alphabets only)</li>
                      <li className="flex items-start"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span> <b>email</b>: Valid email address</li>
                      <li className="flex items-start"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span> <b>rollNumber</b>: Student's roll number (should be in numeric only)</li>
                      <li className="flex items-start"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span> <b>enrollmentYear</b>: Year of enrollment</li>
                      <li className="flex items-start"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span> <b>major</b>: Student's major</li>
                      <li className="flex items-start"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1.5"></span> <b>password</b>: Min 8 characters, with uppercase, number & special 
                        character</li>
                    </ul>
                    <div className="mt-2 text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                      <p>Ensure your CSV file uses commas as separators and includes a header row.</p>
                      <p className="mt-1">Note: Records with invalid names or passwords will be skipped, but valid records will still be processed.</p>
                      <p className="mt-1">Note: Maximum of 2000 students could be added at a time.</p>
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