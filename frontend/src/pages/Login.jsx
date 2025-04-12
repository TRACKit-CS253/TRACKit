import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import loginImg from '../assets/login.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa6';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        // Redirect based on user type
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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='w-full h-screen relative flex justify-around items-center'>
      <img src={loginImg} className='absolute h-full w-full z-[-100] object-cover' alt="Login Background" />
      
      {/* Left side content - Hidden on small screens */}
      <div className='h-full absolute w-[40%] left-[100px] md:block hidden'>
        <h1 className='text-[62px] font-[800] top-[60px] absolute'>TRACKit</h1>
        <p className='absolute top-[140px] w-full font-semibold'>Testing Reporting Academic Comprehensive Kit</p>
      </div>

      {/* Login form container - Full width on small screens */}
      <div className='bg-white md:w-[30%] w-[90%] mx-auto rounded-xl h-[97%] flex flex-col justify-center items-center md:absolute md:right-5 relative shadow-3xl'>
        {/* Small screen only branding */}
        <div className='md:hidden w-[80%] mb-8'>
          <h1 className='text-[42px] font-[800] text-center'>TRACKit</h1>
          <p className='text-center font-semibold text-sm'>Testing Reporting Academic Comprehensive Kit</p>
        </div>
        
        <div className='w-[80%]'>
          <p className='font-semibold text-[28px]'>Welcome to TRACKit</p>
          <h1 className='text-[30px] mt-2'>Sign In</h1>
        </div>
      
        <form className='flex flex-col items-start gap-3 w-[80%] relative' onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder='Enter Your Username'
            className='h-[40px] w-full bg-[#F5F5F5] px-[25px] rounded-lg mt-6'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder='Enter Your Password'
              className='h-[40px] w-full bg-[#F5F5F5] px-[25px] rounded-lg mt-1 pr-[45px]'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
            </button>
          </div>
          <button 
            type="button"
            onClick={() => navigate('/forgot-password')}
            className='text-blue-500 text-[13px] absolute right-0 bottom-[52px] hover:scale-105 duration-200 transition-all'
          >
            Forgot Password
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className='bg-black text-white font-semibold w-full mt-5 h-[40px] rounded-lg transition-all shadow duration-200 hover:bg-gray-800 hover:scale-[97%] disabled:opacity-50'
          >
            {isLoading ? 'Signing in...' : 'Continue'}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2 w-full text-center">{error}</p>}
        
        {/* TRACKit 2.0 Button - Modern Clean Design */}
        <div className="w-[80%] mt-14">
          <button 
            onClick={() => window.open('http://trackit-v2.example.com')}
            className="w-full group transition-all duration-300 hover:translate-y-[-2px]"
          >
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center p-4">
                <div className="flex-shrink-0 bg-gray-50 p-3 rounded-lg mr-3 border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-500">
                    <path d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                    <path d="M5.26 17.242a.75.75 0 10-.897-1.203 5.243 5.243 0 00-2.05 5.022.75.75 0 00.625.627 5.243 5.243 0 005.022-2.051.75.75 0 10-1.202-.897 3.744 3.744 0 01-3.008 1.51c0-1.23.592-2.323 1.51-3.008z" />
                  </svg>
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-base font-semibold text-gray-900">TRACKit 2.0</h3>
                  <p className="text-xs text-gray-500 mt-1">Try our latest version with improved features</p>
                </div>
                
                <div className="flex-shrink-0 ml-4">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-100 group-hover:bg-blue-600 transition-colors duration-300">
                    <svg className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
