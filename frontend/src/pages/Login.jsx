import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import loginImg from '../assets/login.png';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaChartLine, FaBook, FaTasks } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        if (result.user.userType === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard/courses');
        }
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen w-full flex items-stretch overflow-hidden">
      {/* Left side with image and overlay - expanded */}
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
                  <FaChartLine className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium">Track Academic Progress</h3>
                  <p className="text-white/80 mt-1">Monitor student performance with our comprehensive analytics tools</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mt-1 backdrop-blur-sm">
                  <FaBook className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium">Streamlined Course Management</h3>
                  <p className="text-white/80 mt-1">Efficiently manage courses, assignments, and grading</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mt-1 backdrop-blur-sm">
                  <FaTasks className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium">Unified Platform</h3>
                  <p className="text-white/80 mt-1">All academic tools in one place for students, faculty, and administrators</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side with login form - narrower */}
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-600 mt-2">Sign in to continue to your account</p>
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <motion.button 
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Forgot Password?
                </motion.button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3.5 border border-gray-300 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-700 transition-all"
                >
                  {showPassword ? <FaEye className="h-5 w-5" /> : <FaEyeSlash className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </motion.form>

          

          {/* TRACKit Legacy Version Button */}
          <div className="mt-8 relative">
            <motion.a
              href="https://trackit-v2.example.com" // Replace with actual URL
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden relative z-10 shadow-sm hover:shadow-md transition-all"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-gray-700 transition-colors mr-1">
                <path d="M3 12h4l3-9 4 18 3-9h4"/>
              </svg>
              
              <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                Switch to Legacy Version
              </span>
              
              <div className="flex items-center gap-1 ml-1">
                <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-md font-medium">OLD</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-gray-700 transition-colors">
                  <path d="M7 17l9-9"/>
                  <path d="M8 8h8v8"/>
                </svg>
              </div>
              
              <div className="absolute -right-12 -top-4 w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            </motion.a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
