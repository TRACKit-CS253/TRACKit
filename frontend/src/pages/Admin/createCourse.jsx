import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    // Log form data for development purposes
    console.log('Course Data:', courseData);
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    // Log CSV file for development purposes
    console.log('CSV File:', csvFile);
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <nav className="flex justify-between p-5 sticky top-0 bg-[#F5F5F5] z-10 shadow-md">
        <p className="text-[33px] font-semibold ml-3 cursor-pointer" onClick={()=>{navigate('/')}}>TRACKit</p>
        <p className="text-[33px] font-semibold">Welcome System Admin: IIT Kanpur</p>
        <CgProfile className="cursor-pointer text-[45px] m-2 hover:text-blue-500 duration-200 transition-colors" onClick={()=>{navigate('/')}}/>
      </nav>
      
      <div className="flex items-center justify-center mt-8">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Course</h2>
          
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
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Create Course
              </button>
            </form>
          ) : (
            <form onSubmit={handleBulkSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Upload CSV File:</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <p className="text-sm text-gray-500 mt-2">
                  CSV file should contain columns: code, name, description, credits, semester
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Upload and Create Courses
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
