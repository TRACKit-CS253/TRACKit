import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImg from '../assets/login.png';
import { checkUsername } from '../services/auth.service';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    
    try {
      const data = await checkUsername(username);
      
      if (data.success) {
        try {
          console.log('Sending reset email to:', data.email);
          const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: data.email })
          });

          const result = await response.json();
          console.log('Reset email response:', result);

          if (result.success) {
            setMessage(`Password reset instructions have been sent to ${data.email}. Please check your email inbox.`);
            setError('');
          } else {
            throw new Error(result.message || 'Failed to send reset email');
          }
        } catch (emailError) {
          console.error('Email error:', emailError);
          setError('Failed to send reset email. Please try again.');
        }
      } else {
        setError(data.message || 'No such user exists');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please try again.');
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
          <p className='font-semibold text-[28px]'>Forgot Password</p>
          <h1 className='text-[20px] mt-2'>Enter your username to reset password</h1>
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
          
          <button 
            type="submit" 
            disabled={isLoading}
            className='bg-black text-white w-full mt-5 h-[40px] rounded-lg transition-all duration-200 hover:scale-95 disabled:opacity-50'
          >
            {isLoading ? 'Checking...' : 'Continue'}
          </button>
          
          {message && <p className="text-green-500 text-sm mt-2 w-full text-center">{message}</p>}
          {error && <p className="text-red-500 text-sm mt-2 w-full text-center">{error}</p>}
          
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className='text-blue-500 text-sm mt-2 w-full text-center hover:underline'
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
