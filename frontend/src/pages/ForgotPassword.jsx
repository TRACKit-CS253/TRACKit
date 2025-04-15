import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImg from '../assets/login.png';
import { FaUser, FaArrowLeft, FaEnvelope, FaLock, FaKey } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // First verify username exists
      const checkResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      
      const checkData = await checkResponse.json();
      
      if (checkData.success) {
        // Send OTP
        const otpResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: checkData.email }),
        });
        
        const otpData = await otpResponse.json();
        
        if (otpData.success) {
          navigate('/verify-otp', { 
            state: { 
              email: checkData.email 
            }
          });
        } else {
          setError(otpData.message || 'Failed to send OTP');
        }
      } else {
        setError(checkData.message || 'User not found');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-row-reverse items-stretch overflow-hidden">
      {/* Right side - now on the left with form */}
      <motion.div 
        className="hidden lg:flex flex-[2.3] relative bg-gradient-to-br from-blue-600/90 to-purple-800/90"
        initial={{ opacity: 0, x: 50 }}
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
            
            <div className="mt-12 space-y-4">
              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mt-1 backdrop-blur-sm">
                  <FaEnvelope className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium">Reset Your Password</h3>
                  <p className="text-white/80 mt-1">A verification code will be sent to your registered email address</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mt-1 backdrop-blur-sm">
                  <FaKey className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium">Secure Recovery</h3>
                  <p className="text-white/80 mt-1">Our secure process ensures your account remains protected</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Left side - now on the right with form */}
      <motion.div 
        className="flex-1 flex items-center justify-center p-10 bg-white"
        initial={{ opacity: 0, x: -50 }}
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
              Forgot Password
            </h1>
            <p className="text-gray-600 mt-2">Enter your username to reset password</p>
          </motion.div>

          <motion.form 
            className="space-y-6"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {error && (
              <motion.div 
                className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-3 py-3.5 border border-gray-300 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
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
                  <span>Checking...</span>
                </div>
              ) : (
                "Continue"
              )}
            </motion.button>
            
            <div className="pt-4">
              <motion.button 
                type="button"
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 w-full py-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <FaArrowLeft className="text-xs" />
                Back to Login
              </motion.button>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
