import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from "react-icons/cg";

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
  const [csvFile, setCsvFile] = useState(null);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    // Add logic for manual student addition
    console.log('Manual student data:', studentData);
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    // Add logic for bulk student addition
    console.log('CSV File:', csvFile);
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <nav className="flex justify-between p-5">
        <p className="text-[33px] font-semibold ml-3">TRACKit</p>
        <p className="text-[33px] font-semibold">Welcome System Admin: IIT Kanpur</p>
        <CgProfile className="text-[45px] m-2" />
      </nav>
      
      <div className="flex items-center justify-center mt-8">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
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
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                <input
                  type="password"
                  name="password"
                  value={studentData.password}
                  onChange={handleChange}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Student
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
                  CSV file should contain columns: username, firstName, lastName, email, rollNumber, enrollmentYear, major, password
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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