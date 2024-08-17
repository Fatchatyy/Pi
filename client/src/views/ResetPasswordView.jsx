import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resetPassword } from '../api/request';
import encrypt from '../utils/encrypt'
import instagramText from '../assets/img/instagram-text.png';

const ResetPasswordView = () => {
    const { token } = useParams(); // Use useParams to get the token from the URL
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = async () => {
        try {
            console.log("PASSWORD BEFORE ENCRYPTION", newPassword);
            const encryptedPassword = encrypt(newPassword);
            console.log("THE ENCRYPTED PASSWORD", encryptedPassword);
            await resetPassword(token, encryptedPassword);
            console.log("token", token);
            alert('Password has been updated');
        } catch (error) {
            console.error('Error details:', error.message);  // Log the error message
            console.error('Stack trace:', error.stack);       // Log the stack trace if available
            alert('Error updating password');
        }
    };

    return (
        <div className="w-full h-screen relative bg-[#FAFAFA] pb-[130px] flex items-center justify-center">
            <div className="w-[350px] min-h-[400px]">
                <div className="w-[348px] py-[10px] flex flex-col items-center border border-[#DBDBDB] relative pb-10 rounded-[1px] bg-white">
                    <img src={instagramText} className='mt-3' width="175" />
                    <span className='font-semibold text-[#8E8E8E] leading-5'>Reset Your Password</span>
                    <div className='w-full px-10 mt-4'>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className='w-full pl-2 pt-[9px] pb-[7px] bg-[#FAFAFA] outline-none placeholder-[#8E8E8E] text-[12px] border border-[#DBDBDB]'
                        />
                        <button
                            onClick={handleSubmit}
                            className='w-full flex items-center mt-4 justify-center h-[30px] rounded-[4px] bg-[#0095F6] text-white font-semibold text-sm'
                        >
                            Reset Password
                        </button>
                    </div>
                    <div className='w-full border border-[#DBDBDB] rounded-[1px] py-[10px] flex items-center justify-center mt-3 bg-white'>
                        <div className='flex items-center text-sm justify-center gap-1 h-[41px]'>
                            <span>Remembered your password?</span>
                            <Link to='/login' className='text-[#3195F6]'>Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordView;
