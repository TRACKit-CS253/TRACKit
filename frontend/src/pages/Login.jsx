import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Replace useHistory with useNavigate
import loginImg from '../assets/login.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Replace useHistory with useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', { username, password });//API USED FROM BACKEND
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user)); // Store user information
      if (user.userType === 'admin') {
        navigate(`/admin`); // Navigate to admin page if userType is admin
      } else { 
        navigate(`/dashboard`); // Navigate to dashboard otherwise
      }
      window.location.reload();//as the entire react app needs  to be refreshed
    } catch (err) {
      setError('Invalid credentials');
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
                />
                <input
                  type="password"
                  placeholder='Enter Your Password'
                  className='h-[40px] w-full bg-[#F5F5F5] px-[25px] rounded-lg mt-1'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <a href="#" className='text-blue-500 text-[13px] absolute right-0 bottom-[52px] hover:scale-105 duration-200 transition-all'>Forgot Password</a>
                <button className='bg-black text-white w-full mt-5 h-[40px] rounded-lg transition-all duration-200 hover:scale-95'>Continue</button>
                {error && <p>{error}</p>}
            </form>
        </div>
    </div>
  )
};

export default Login;
