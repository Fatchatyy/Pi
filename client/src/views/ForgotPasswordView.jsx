import React, { useState } from 'react';
import { requestPasswordReset } from '../api/request';
import instagramText from '../assets/img/instagram-text.png';
import instaJob from '../assets/img/mylogo.png'
import { Link, useNavigate } from 'react-router-dom';

const ForgotPasswordView = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const isValidEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async () => {
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        setError(''); // Clear any previous errors

        try {
           const response=  await requestPasswordReset(email);
           
           if (response === "User not found") {
            setError('User not found');
            return;
            }
            alert('Password reset link sent to your email');
    
        } catch (error) {
            console.error('Error details:', error.message);  // Log the error message
            console.error('Stack trace:', error.stack);       // Log the stack trace if available
            alert('Error sending password reset link');
        }
    };

    return (
        <div className="w-full h-screen relative bg-[#FAFAFA] pb-[130px] flex items-center justify-center">
            <div className="w-[350px] min-h-[400px]">
                <div className="w-[348px] py-[10px] flex flex-col items-center border border-[#DBDBDB] relative pb-10 rounded-[1px] bg-white">
                    <img src={instaJob} className='mt-7 mb-7' width="175" />
                    <span className='font-semibold text-[#8E8E8E] leading-5'>Forgot Your Password?</span>
                    <div className='w-full px-10 mt-4'>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full pl-2 pt-[9px] pb-[7px] bg-[#FAFAFA] outline-none placeholder-[#8E8E8E] text-[12px] border border-[#DBDBDB]'
                        />
                        {error && <p className='text-red-500 text-xs mt-2'>{error}</p>}
                        <button
                            onClick={handleSubmit}
                            className='w-full flex items-center mt-4 justify-center h-[30px] rounded-[4px] bg-[#0095F6] text-white font-semibold text-sm'
                        >
                            Request Password Reset
                        </button>
                    </div>
                    <div className='w-full border border-[#DBDBDB] rounded-[1px] py-[10px] flex items-center justify-center mt-3 bg-white'>
                        <div className='flex items-center text-sm justify-center gap-1 h-[41px]'>
                            <span>Remember your password?</span>
                            <Link to='/login' className='text-[#3195F6]'>Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordView;
