import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import loginImg from '../assets/login.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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

  return (
    <div className='w-full h-screen relative flex justify-around items-center'>
      <img src={loginImg} className='absolute h-full w-full z-[-100]' alt="Login Background" />
      <div className='h-full absolute w-[40%] left-[100px]'>
        <h1 className='text-[62px] font-[800] top-[60px] absolute'>TRACKit</h1>
        <p className='absolute top-[140px] w-full font-semibold'>Testing Reporting Academic Comprehensive Kit</p>
      </div>

      <div className='bg-white w-[30%] rounded-xl h-[97%] flex flex-col justify-center items-center absolute right-5 shadow-3xl'>
        <div className='w-[80%]'>
          <p className='font-semibold text-[28px]'>Welcome to TRACKit</p>
          <h1 className='text-[30px] mt-2'>Sign In</h1>
        </div>
      
        <form className='flex flex-col items-start gap-3 w-[80%] relative' onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder='Enter Your Username'
            className=' h-[40px] w-full bg-[#F5F5F5] px-[25px] rounded-lg mt-6'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder='Enter Your Password'
            className='h-[40px] w-full bg-[#F5F5F5] px-[25px] rounded-lg mt-1'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
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
            className='bg-black text-white w-full mt-5 h-[40px] rounded-lg transition-all duration-200 hover:scale-95 disabled:opacity-50'
          >
            {isLoading ? 'Signing in...' : 'Continue'}
          </button>
        </form>
          {error && <p className="text-red-500 text-sm mt-2 w-full text-center">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
