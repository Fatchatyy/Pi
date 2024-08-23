import { FiMoreHorizontal } from 'react-icons/fi';
import { AiOutlineHeart } from 'react-icons/ai';
import { BsChat, BsBookmark } from 'react-icons/bs';
import { FiSend } from 'react-icons/fi';
import { VscSmiley } from 'react-icons/vsc';
import { useEffect, useState } from 'react';
import { getUser } from '../api/request';
import defaultAvatar from '../assets/img/default_avatar.jpg';
import { useNavigate } from 'react-router-dom';
import { applyForJob } from '../api/request'; 

function App({token, date, content, image, userID, description, requirements, company, location, jobType,jobId}) {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [isApplying, setIsApplying] = useState(false);
    const [applyError, setApplyError] = useState(null);

    const goUser = () => {
        console.log("going to user", user.username);
        navigate(`${user.username}`);
    };
    const handleApply = async () => {
        console.log("applying for a job1", token )
         // Ensure user is logged in
        setIsApplying(true);
        setApplyError(null);
        console.log("applying for a job2",userID)
        try {
            console.log("applying for a job3", jobId)
          await applyForJob(jobId,userID, token, (data) => {
            // Handle success callback if needed
            console.log('Job application response:', data);
            alert('Applied successfully!');
          }, (loading) => {
            // Handle loading callback if needed
            setIsApplying(loading);
          });
        } catch (error) {
          setApplyError('Failed to apply. Please try again later.');
        } finally {
          setIsApplying(false);
        }
      };

    useEffect(() => {
        console.log("Fetching post data", { userID, content, image, date, description, requirements, company, location, jobType });
        getUser({ id: userID }, setUser);
    }, [userID, content, image, date, description, requirements, company, location, jobType]);

    if (user) return (
        <div id='post' className='rounded-[8px] border border-[#DBDBDB] w-full flex flex-col overflow-hidden bg-white mt-4'>
            {/* Top User Information */}
            <div id='top-user-information' className='w-full flex items-center justify-between h-14 px-3 border-b border-[#DBDBDB]'>
                <div className='flex items-center justify-center gap-3'>
                    <img onClick={goUser} src={user.avatar ?? defaultAvatar} className="rounded-full cursor-pointer" width="32" />
                    <span onClick={goUser} className='text-sm font-semibold cursor-pointer'>{user.username}</span>
                </div>
                <FiMoreHorizontal size={20} />
            </div>

            {/* Post Image with Overlayed Div */}
            <div id='post-content' className='w-full h-[470px] relative'>
    <img src={image} className="object-cover w-full h-full" style={{ filter: 'blur(3px)' }} />
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white bg-opacity-70 m-10 rounded-md text-center max-w-md w-full min-h-[400px] flex flex-col items-center p-6">
            <h1 className="text-3xl font-bold mb-2">WE ARE HIRING2</h1>
            <h2 className="text-xl mb-4">JOIN OUR TEAM</h2>
            <span className="text-lg font-semibold mb-4">{jobType}</span>
            <div className="flex flex-col md:flex-row justify-between w-full">
                <div className="flex flex-col w-full md:w-1/2 pr-4 mb-4 md:mb-0">
                    <p className="text-sm mb-4">{description}</p>
                    <p className="text-sm">{requirements}</p>
                </div>
                <div className="flex flex-col w-full md:w-1/2 pl-4">
                    
                    <p className="text-sm mb-4">{company}</p>

                    <p className="text-sm">{location}</p>
                </div>
            </div>
        </div>
    </div>
    <button
        onClick={handleApply}
        disabled={isApplying}
        className='bg-blue-500 text-white py-2 px-4 rounded-md mt-4 mx-3'
      >
        {isApplying ? 'Applying...' : 'Apply for this Job'}
      </button>

      {applyError && <p className='text-red-500 text-center'>{applyError}</p>}
</div>



            {/* User Activity */}
            <div id='user-activity' className='flex w-full justify-between h-[46px] items-center mt-1 px-3 pb-[6px]'>
                <div className='flex items-center justify-between gap-4'>
                    <AiOutlineHeart size={25} />
                    <BsChat size={25} />
                    <FiSend size={25} />
                </div>
                <BsBookmark size={25} />
            </div>

            {/* Likes and Comments */}
            <span className='font-semibold ml-3 text-sm mb-1'>81 likes</span>
            <div className='text-sm ml-3 mb-1'>
                <span className='font-semibold mr-2'>{user.username}</span>
                <span>{content}</span>
            </div>
            <span className='text-[#8E8E8E] text-sm ml-3 font-semibold mb-2'>See all 100 Comments</span>
            <span className='text-xs text-[#BFBFBF] ml-3 w-full mb-2'>4 SAAT ÖNCE</span>

            {/* Make a Comment */}
            <div id="make-comment" className='w-full border-t border-[#DBDBDB] px-3 pb-1 flex items-center'>
                <VscSmiley className='my-2 mr-3' size={28} />
                <input type="text" className='bg-transparent outline-none grow' placeholder='Add Comment...' />
                <span className='text-[#BBE3FC] text-sm'>Share</span>
            </div>
        </div>
    );
}

export default App;
