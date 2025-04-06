import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import loginImg from '../assets/login.png';
import { FaArrowLeft, FaLock, FaKey, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passStrength, setPassStrength] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const isOTPVerified = location.state?.fromOTP;
  const userId = location.state?.userId || user?.id;

  const strengthCheck = (pass) => {
    if (pass.length < 8) {
      setPassStrength('Password is too short');
      return false;
    }

    if (!/[A-Z]/.test(pass)) {
      setPassStrength('Password must contain at least one uppercase letter');
      return false;
    }

    if (!/[0-9]/.test(pass)) {
      setPassStrength('Password must contain at least one number');
      return false;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) {
      setPassStrength('Password must contain at least one special character');
      return false;
    }

    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (!strengthCheck(newPassword)) {
      setError(passStrength);
      return;
    }

    setIsLoading(true);

    try {
      let response;
      
      if (isOTPVerified) {
        // Handle password reset after OTP verification
        response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            token: location.state?.token,  // Include the reset token
            newPassword: newPassword
          })
        });
      } else {
        // Handle normal password change
        const token = localStorage.getItem('token');
        response = await fetch(`/users/${userId}/change-password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            oldPassword: currentPassword,
            newPassword: newPassword
          })
        });
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          navigate(isOTPVerified ? '/login' : '/dashboard/profile');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-stretch overflow-hidden">
      {/* Left side with image and overlay */}
      <motion.div 
        className="hidden lg:flex flex-[2.3] relative bg-gradient-to-br from-blue-600/90 to-purple-800/90"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img 
          src={loginImg} 
          alt="Login Background" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
        />
        
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-800/30" />
        
        <div className="absolute inset-0 flex flex-col justify-center px-16 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-6xl font-bold text-white mb-4">TRACKit</h1>
            <p className="text-xl text-white/90 max-w-md">
              Testing Reporting Academic Comprehensive Kit
            </p>
            
            <div className="mt-12 space-y-6">
              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mt-1 backdrop-blur-sm">
                  <FaShieldAlt className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium">Secure Password</h3>
                  <p className="text-white/80 mt-1">Create a strong password to keep your account secure</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mt-1 backdrop-blur-sm">
                  <FaKey className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium">Password Requirements</h3>
                  <p className="text-white/80 mt-1">Must include uppercase, number, special character and be at least 8 characters long</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side with password change form */}
      <motion.div 
        className="flex-1 flex items-center justify-center p-10 bg-white"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center mb-10"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100/80 p-3.5 rounded-full">
                <FaLock className="text-blue-600 text-2xl" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isOTPVerified ? 'Set New Password' : 'Change Password'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isOTPVerified 
                ? 'Create a new password for your account' 
                : 'Update your account password'}
            </p>
          </motion.div>

          <motion.form 
            className="space-y-6"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {success && (
              <motion.div 
                className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg text-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {success}
              </motion.div>
            )}
            
            {error && (
              <motion.div 
                className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {error}
              </motion.div>
            )}
            
            {/* Only show current password field if not OTP verified */}
            {!isOTPVerified && (
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-10 py-3.5 border border-gray-300 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required={!isOTPVerified}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-700 transition-all"
                  >
                    {showCurrentPassword ? <FaEye className="h-5 w-5" /> : <FaEyeSlash className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FaKey className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-10 py-3.5 border border-gray-300 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-700 transition-all"
                >
                  {showNewPassword ? <FaEye className="h-5 w-5" /> : <FaEyeSlash className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-10 py-3.5 border border-gray-300 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-700 transition-all"
                >
                  {showConfirmPassword ? <FaEye className="h-5 w-5" /> : <FaEyeSlash className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                isOTPVerified ? "Set New Password" : "Change Password"
              )}
            </motion.button>
            
            <div className="pt-4">
              <motion.button 
                type="button"
                onClick={() => navigate(isOTPVerified ? '/login' : '/dashboard/profile')}
                className="flex items-center justify-center gap-2 w-full py-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <FaArrowLeft className="text-xs" />
                {isOTPVerified ? 'Back to Login' : 'Back to Profile'}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
