import React from 'react'
import { BsSend } from "react-icons/bs";
import {useEffect, useState} from 'react';
import { authFetch} from '../../services/auth';

export default function ContactUs({name, email}) {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });
    const [submitStatus, setSubmitStatus] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    const fetchProfileData = async ()=>{
        try{
            if(user){
                const endpoint = user.userType === 'student'
                ? `/api/student/${user.id}/profile`
                : user.userType === 'faculty'
                ? `/api/faculty/${user.id}/profile`
                : `/api/users/${user.id}`;

                const result = await authFetch(endpoint);

                if(result.success){
                    setProfileData({...user, ...result.data});
                    localStorage.setItem('user', JSON.stringify({...user, ...result.data}));
                }
            }
        }catch(err){
            setError('Error loading profile data');
        }
        setLoading(false);
    }

    useEffect(()=>{
        fetchProfileData();
    }, [user?.id, user?.userType]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!formData.subject || !formData.message) {
            setSubmitStatus({
                success: false,
                message: 'Please fill in all required fields',
            });
            return;
        }
    
        try {
            setSubmitStatus({ loading: true });
    
            // Call the backend API to send the email
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contact/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: formData.subject,
                    message: formData.message,
                    userEmail: displayData.email, // User's email
                }),
            });
    
            const result = await response.json();
    
            if (result.success) {
                setSubmitStatus({
                    success: true,
                    message: 'Message sent successfully!',
                });
                setFormData({ subject: '', message: '' });
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (err) {
            setSubmitStatus({
                success: false,
                message: err.message || 'Error sending message. Please try again later.',
            });
        }
    };

    const displayData = profileData || user;    

    return (
        <div className='h-full w-full flex items-center justify-center'>
            <div className='w-[80%] h-[80%] border rounded-xl shadow-lg'>
                <div className='h-[14%] m-auto flex flex-col justify-center items-center text-white text-[18px] bg-blue-500 rounded-4xl'>
                    <p>Phone Numbers During Office Hours (10:00 Hrs.-18:00 Hrs) : 8xxxxxxxxx</p>
                    <p>Email : trackit.CS253@gmail.com</p>
                </div>
                <div className='p-8'>
                    <p className='text-[25px] font-semibold'>Contact Us</p>
                    <div className='flex text-[17px] mt-4'>
                        <p><span className='font-semibold'>Your Name:</span><br></br> {displayData.firstName} {displayData.lastName}</p>
                        <p className='ml-[45%]'><span className='font-semibold'>Your Email Address :</span> <br></br> {displayData.email}</p>
                    </div>

                    {submitStatus?.success && (
                        <div className='mt-4 p-3 bg-green-100 text-green-700 rounded'>
                            {submitStatus.message}
                        </div>
                    )}
                    
                    {submitStatus?.success === false && (
                        <div className='mt-4 p-3 bg-red-100 text-red-700 rounded'>
                            {submitStatus.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className='mt-6'>
                            <label className='font-semibold' htmlFor="subject">Subject <span className='text-red-500'>*</span></label> <br></br>
                            <input 
                                type="text" 
                                placeholder='Subject' 
                                id='subject' 
                                value={formData.subject}
                                onChange={handleChange}
                                className='mt-1 w-full px-6 rounded-lg h-[40px]' 
                                required 
                                minLength={5}
                            />
                        </div>
                        <div className='mt-4'>
                            <label htmlFor="message" className='font-semibold'>Message <span className='text-red-500'>*</span></label> <br></br>
                            <textarea 
                                placeholder='Your Query' 
                                id='message' 
                                value={formData.message}
                                onChange={handleChange}
                                className='mt-1 w-full px-6 py-2 rounded-lg h-[160px]' 
                                required 
                                minLength={15}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={submitStatus?.loading} 
                            className='bg-blue-500 shadow-xl text-white py-2 px-4 mt-4 flex justify-center items-center gap-2 hover:bg-green-600 hover:scale-95 transition-all duration-200 rounded'
                        >
                            <BsSend></BsSend>
                            <p>{submitStatus?.loading ? 'Sending...' : 'Send Message'}</p>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
