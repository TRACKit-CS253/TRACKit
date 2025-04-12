import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import { 
  validateCSVFile, 
  createFileUploadFormData, 
  getFileUploadConfig 
} from '../../utils/fileUpload';
import { GoHome } from "react-icons/go";
import { FaRegUser, FaCloudUploadAlt, FaBook } from "react-icons/fa";
import { motion } from 'framer-motion';

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
  const { token, logout } = useAuth();
  
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

      // Validate course code
      const alphanumericRegex = /^[a-zA-Z0-9]+$/;
      if (!alphanumericRegex.test(courseData.code)) {
        setMessage({ 
          text: 'Course code must be alphanumeric only.', 
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
        // Calculate the values
        const totalRows = response.data.totalRows || response.data.courses?.length || 0;
        const createdCount = response.data.createdCount || response.data.courses?.length || 0;
        const notAddedCount = totalRows - createdCount;
        
        // Very simple success message matching AddStudent component format
        const successMessage = (
          <div>
            <p className="mb-2">{response.data.message || 'Courses uploaded successfully!'}</p>
            <div className="p-2 bg-blue-50 rounded text-sm">
              <div className="mb-1"><span className="font-medium">Total records in CSV:</span> {totalRows}</div>
              <div className="mb-1 text-green-700"><span className="font-medium">Successfully added:</span> {createdCount}</div>
              {notAddedCount > 0 && (
                <div className="text-amber-700"><span className="font-medium">Not added:</span> {notAddedCount}
                  <span className="text-xs ml-1">(duplicates or validation errors)</span>
                </div>
              )}
            </div>
          </div>
        );
        
        setMessage({ 
          text: successMessage, 
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
            whileHover={{ scale: 1.05 }}
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
              <FaBook size={24} />
              <span>Create Course</span>
            </h2>
          </div>
          
          <div className="p-6">
            {/* Show error/success/info messages */}
            {message.text && (
              <motion.div 
                className={`mb-6 p-4 rounded-md ${
                  message.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-700' : 
                  message.type === 'info' ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700' : 
                  'bg-red-50 border-l-4 border-red-500 text-red-700'
                }`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {message.text}
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
                    <label className="block text-gray-700 text-sm font-medium mb-2">Course Code</label>
                    <input
                      type="text"
                      name="code"
                      value={courseData.code}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="e.g., CS101"
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Course Name</label>
                    <input
                      type="text"
                      name="name"
                      value={courseData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="e.g., Introduction to Computer Science"
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      value={courseData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Course description (optional)"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-gray-700 text-sm font-medium mb-2">Credits</label>
                      <input
                        type="number"
                        name="credits"
                        value={courseData.credits}
                        onChange={handleChange}
                        min="1"
                        max="20"
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="9"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-gray-700 text-sm font-medium mb-2">Semester</label>
                      <select
                        name="semester"
                        value={courseData.semester}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="">Select Semester</option>
                        <option value="Fall">Fall</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                      </select>
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg focus:outline-none transition-all duration-200 ${
                      loading ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'
                    }`}
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? "Creating..." : "Create Course"}
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
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <b>course code</b>: Course code (required)</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <b>course name</b>: Course name (required)</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <b>credits</b>: Course credits (required, 2-14)</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <b>semester</b>: Fall/Spring/Summer (required)</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> <b>description</b>: Course description (optional)</li>
                      </ul>
                      <div className="mt-2 text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                        Ensure your CSV file uses commas as separators and includes a header row.
                      </div>
                    </div>
                  </div>
                  
                  {message.type === 'error' && message.details && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-sm font-medium text-red-700 mb-2">Error details:</p>
                      <ul className="text-xs text-red-600 ml-2 list-disc pl-3">
                        {message.details.map((detail, index) => (
                          <li key={index} className="mb-1">{detail}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                  
                  {message.type === 'error' && message.duplicateCodes && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-sm font-medium text-red-700 mb-2">Duplicate course codes:</p>
                      <div className="text-xs text-red-600 flex flex-wrap gap-1">
                        {message.duplicateCodes.map((code, index) => (
                          <span key={index} className="bg-red-100 px-1.5 py-0.5 rounded">{code}</span>
                        ))}
                      </div>
                      <p className="text-xs mt-2 text-red-600">
                        Please remove these courses from your CSV file or use different course codes.
                      </p>
                    </motion.div>
                  )}
                  
                  <motion.button
                    type="submit"
                    disabled={loading || !csvFile}
                    className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none transition-all duration-200 ${
                      loading || !csvFile 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    }`}
                    whileHover={!loading && csvFile ? { scale: 1.02 } : {}}
                    whileTap={!loading && csvFile ? { scale: 0.98 } : {}}
                  >
                    {loading ? "Uploading..." : "Upload and Create Courses"}
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
