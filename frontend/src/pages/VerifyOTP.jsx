import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import loginImg from '../assets/login.png';

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
    <div className='w-full h-screen relative flex justify-around items-center'>
      <img src={loginImg} className='absolute h-full w-full z-[-100]' alt="Login Background" />
      
      <div className='bg-white w-[30%] rounded-xl h-[97%] flex flex-col justify-center items-center absolute right-5 shadow-3xl'>
        <div className='w-[80%]'>
          <p className='font-semibold text-[28px]'>Verify OTP</p>
          <h1 className='text-[20px] mt-2'>Enter the OTP sent to your email</h1>
        </div>

        <form className='flex flex-col items-start gap-3 w-[80%] relative' onSubmit={handleSubmit}>
          <div className="w-full">
            <input
              type="text"
              inputMode="numeric"
              placeholder="○○○○"
              className="h-[50px] w-full bg-[#F5F5F5] rounded-lg mt-6 text-center text-3xl tracking-[1rem] font-bold"
              value={otp}
              onChange={handleOTPChange}
              maxLength="4"
              required
              disabled={isLoading}
              style={{
                letterSpacing: '1rem',
                paddingLeft: '1.5rem' 
              }}
            />
            <p className="text-sm text-gray-500 mt-2 text-center">
              Enter the 4-digit code sent to your email
            </p>
          </div>
          
          {error && <p className="text-red-500 text-sm mt-2 w-full text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={isLoading}
            className='bg-black text-white w-full mt-5 h-[40px] rounded-lg transition-all duration-200 hover:scale-95 disabled:opacity-50'
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/forgot-password')}
            className='text-blue-500 text-sm mt-2 w-full text-center hover:underline'
          >
            Back to Forgot Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
