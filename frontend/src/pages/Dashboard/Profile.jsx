import React, { useEffect, useState } from 'react';
import texture from '../../assets/textures.jpg';
import { authFetch } from '../../services/auth';
import { PiStudentDuotone } from "react-icons/pi";
import { FaRegUser, FaEnvelope, FaIdCard, FaBuilding, FaGraduationCap, FaBriefcase, FaLock, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { IoMdSchool } from "react-icons/io";

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Get basic user data from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Fetch complete profile data including student/faculty specific information
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (user) {
          // Select the right endpoint based on user type
          const endpoint = user.userType === 'student' 
            ? `/api/student/${user.id}/profile`
            : user.userType === 'faculty' 
              ? `/api/faculty/${user.id}/profile`
              : `/api/users/${user.id}`;
          
          const result = await authFetch(endpoint);
          console.log('Profile API Response:', result);
          
          if (result.success) {
            // Merge the data with what we have in localStorage to ensure we have everything
            setProfileData({...user, ...result.data});
            
            // Update localStorage with more complete data
            localStorage.setItem('user', JSON.stringify({...user, ...result.data}));
          } else {
            setError('Failed to load complete profile data');
          }
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Error loading profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user?.id, user?.userType]);
  
  // Use the combined data or fall back to localStorage data
  const displayData = profileData || user;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Loading and error states */}
        {loading && (
          <div className="flex justify-center items-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && !displayData && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-center text-red-700">
            {error}
          </div>
        )}
        
        {displayData && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Banner and avatar section */}
            <div className="relative">
              <div className="h-60 w-full" style={{ 
                backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.8), rgba(124, 58, 237, 0.7)), url(${texture})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center'
              }}>
              </div>
              
              <div className="absolute -bottom-16 w-full flex justify-center">
                <div className="bg-white rounded-full p-3 shadow-lg border-4 border-white">
                  {displayData?.userType === 'student' ? (
                    <div className="bg-blue-100 rounded-full p-4 flex items-center justify-center">
                      <PiStudentDuotone className="text-blue-600 text-5xl" />
                    </div>
                  ) : (
                    <div className="bg-purple-100 rounded-full p-4 flex items-center justify-center">
                      <FaRegUser className="text-purple-600 text-5xl" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile information */}
            <div className="pt-20 pb-8 px-8">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                  {displayData?.firstName} {displayData?.lastName}
                </h1>
                <p className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm mt-2">
                  {displayData?.userType === 'student' ? (
                    <>
                      <IoMdSchool /> Student
                    </>
                  ) : (
                    <>
                      <FaGraduationCap /> Faculty
                    </>
                  )}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Email information */}
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaEnvelope className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium text-gray-800">{displayData?.email || "Not available"}</p>
                  </div>
                </div>
                
                {/* Username information */}
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaIdCard className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Username</p>
                    <p className="font-medium text-gray-800">{displayData?.username || "Not available"}</p>
                  </div>
                </div>
                
                {/* Student-specific information */}
                {displayData?.userType === 'student' && (
                  <>
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                      <div className="bg-green-100 p-3 rounded-full">
                        <FaIdCard className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Roll Number</p>
                        <p className="font-medium text-gray-800">{displayData.rollNumber || "Not assigned"}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                      <div className="bg-amber-100 p-3 rounded-full">
                        <FaBuilding className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Department</p>
                        <p className="font-medium text-gray-800">{displayData.major || "Not assigned"}</p>
                      </div>
                    </div>
                    
                    {/* {displayData.enrollmentYear && (
                      <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                        <div className="bg-indigo-100 p-3 rounded-full">
                          <FaCalendarAlt className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Enrollment Year</p>
                          <p className="font-medium text-gray-800">{displayData.enrollmentYear}</p>
                        </div>
                      </div>
                    )} */}
                  </>
                )}
                
                {/* Faculty-specific information */}
                {displayData?.userType === 'faculty' && (
                  <>
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                      <div className="bg-green-100 p-3 rounded-full">
                        <FaBuilding className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Department</p>
                        <p className="font-medium text-gray-800">{displayData.department || "Not assigned"}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 border border-gray-100">
                      <div className="bg-amber-100 p-3 rounded-full">
                        <FaBriefcase className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Position</p>
                        <p className="font-medium text-gray-800">{displayData.position || "Not assigned"}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => navigate('/change-password')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:opacity-90"
                >
                  <FaLock />
                  Change Password
                </button>
                
                <button 
                  onClick={() => navigate('/dashboard/contactus')}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg shadow-sm hover:shadow hover:bg-gray-50 transition-all duration-200"
                >
                  Need Help?
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}