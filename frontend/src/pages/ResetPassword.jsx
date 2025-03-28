import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import loginImg from '../assets/login.png';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', { // Updated URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
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
          <p className='font-semibold text-[28px]'>Reset Password</p>
          <h1 className='text-[20px] mt-2'>Enter your new password</h1>
        </div>

        <form className='flex flex-col items-start gap-3 w-[80%] relative' onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder='Enter New Password'
            className='h-[40px] w-full bg-[#F5F5F5] px-[25px] rounded-lg mt-6'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder='Confirm New Password'
            className='h-[40px] w-full bg-[#F5F5F5] px-[25px] rounded-lg mt-1'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          
          <button 
            type="submit" 
            disabled={isLoading}
            className='bg-black text-white w-full mt-5 h-[40px] rounded-lg transition-all duration-200 hover:scale-95 disabled:opacity-50'
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
          
          {success && <p className="text-green-500 text-sm mt-2 w-full text-center">{success}</p>}
          {error && <p className="text-red-500 text-sm mt-2 w-full text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
