import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import loginImg from '../assets/login.png';
import { FaArrowLeft, FaEnvelope, FaLock, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const VerifyOTP = () => {
  const [otp, setOTP] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setOTP(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (data.success) {
        navigate('/change-password', { 
          state: { 
            userId: data.userId,
            token: data.token,
            fromOTP: true 
          }
        });
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-row-reverse items-stretch overflow-hidden">
      {/* Right side with branding */}
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
                  <FaShieldAlt className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium">OTP Verification</h3>
                  <p className="text-white/80 mt-1">Enter the 4-digit code sent to your email address</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mt-1 backdrop-blur-sm">
                  <FaEnvelope className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium">Check Your Email</h3>
                  <p className="text-white/80 mt-1">We've sent a verification code to {email ? email.substring(0, 3) + "***" + email.substring(email.indexOf('@')) : "your registered email"}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Left side with OTP form */}
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
              Verify OTP
            </h1>
            <p className="text-gray-600 mt-2">Enter the verification code sent to your email</p>
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
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="relative">
                {/* Hidden actual input field - captures keystrokes */}
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={handleOTPChange}
                  maxLength="4"
                  required
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  className="opacity-0 absolute inset-0 w-full h-full z-10"
                  aria-hidden={false}
                />
                
                {/* Visual OTP boxes */}
                <div className="flex items-center justify-center gap-4 w-full h-[60px]">
                  {[0, 1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className={`w-12 h-14 flex items-center justify-center border ${
                        i < otp.length 
                          ? 'border-blue-500' 
                          : 'border-gray-300'
                      } rounded-lg bg-gray-50/60 transition-all duration-200 ${
                        i === otp.length ? 'border-blue-400 border-2' : ''
                      }`}
                      onClick={() => document.getElementById('otp').focus()}
                    >
                      {i < otp.length ? (
                        <span className="text-2xl font-semibold text-gray-700">{otp[i]}</span>
                      ) : (
                        <span className="text-gray-300 text-2xl">·</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-gray-500 text-center mt-2">
                The code will expire in 10 minutes
              </p>
            </div>

            <motion.button 
              type="submit" 
              disabled={isLoading || otp.length !== 4}
              className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify & Continue"
              )}
            </motion.button>
            
            <div className="pt-4">
              <motion.button 
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="flex items-center justify-center gap-2 w-full py-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <FaArrowLeft className="text-xs" />
                Back to Forgot Password
              </motion.button>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
