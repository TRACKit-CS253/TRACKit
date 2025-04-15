import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserProfile } from '../services/auth';

export default function UserProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        let result;

        // Fetch profile data based on user type
        if (currentUser.userType === 'student') {
          result = await fetchUserProfile('student', currentUser.id, token);
        } else if (currentUser.userType === 'faculty') {
          result = await fetchUserProfile('faculty', currentUser.id, token);
        } else {
          result = await fetchUserProfile('users', currentUser.id, token);
        }

        if (result.success) {
          setProfileData(result.data);
        } else {
          setError(result.message || 'Failed to load profile data');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('An error occurred while loading your profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  if (!profileData) {
    return <div className="text-center py-8">No profile data available</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
        <div className="bg-blue-100 text-blue-800 uppercase px-3 py-1 rounded-full text-xs font-bold">
          {profileData.userType}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{profileData.firstName} {profileData.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium">{profileData.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{profileData.email}</p>
            </div>
          </div>
        </div>

        <div>
          {/* Student-specific information */}
          {profileData.userType === 'student' && (
            <>
              <h3 className="font-semibold text-gray-700 mb-2">Student Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Roll Number</p>
                  <p className="font-medium">{profileData.rollNumber || profileData.specificInfo?.rollNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department/Major</p>
                  <p className="font-medium">{profileData.major || profileData.specificInfo?.major}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Enrollment Year</p>
                  <p className="font-medium">{profileData.enrollmentYear || profileData.specificInfo?.enrollmentYear}</p>
                </div>
              </div>
            </>
          )}

          {/* Faculty-specific information */}
          {profileData.userType === 'faculty' && (
            <>
              <h3 className="font-semibold text-gray-700 mb-2">Faculty Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{profileData.department || profileData.specificInfo?.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Position/Role</p>
                  <p className="font-medium">{profileData.position || profileData.specificInfo?.position}</p>
                </div>
              </div>
            </>
          )}

          {/* Admin-specific information if needed */}
          {profileData.userType === 'admin' && (
            <>
              <h3 className="font-semibold text-gray-700 mb-2">Admin Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">System Administrator</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
