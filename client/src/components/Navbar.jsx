import { BsSearch, BsPlusSquare, BsBell } from 'react-icons/bs'
import { MdHomeFilled } from 'react-icons/md'
import { RiMessengerLine } from 'react-icons/ri'
import { IoCompassOutline } from 'react-icons/io5'
import instagramText from '../assets/img/instagram-text.png'
import instaJob from '../assets/img/mylogo.png'
import { AiOutlineHeart } from 'react-icons/ai'
import { useState, useEffect } from 'react'
import { useLocation, Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import defaultAvatar from '../assets/img/default_avatar.jpg'
import { getUserNotifications, generateNotifications } from '../api/request';
import { toggleCreatePost } from '../store/user'
import { getUser } from '../api/request';
import LandingPost from '../components/LandingPost'

function App() {

  const route = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.user)
  const [user1, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh]= useState(false);
  const [selectedPost, setSelectedPost] = useState(null); // For handling the selected post
  const [postUser, setPostUser] = useState(null); 
  const logout = () => {
    location.reload()
  }

  const goUser = (username) => {
    if (!username) return;
    navigate(`/${username}`)
  }
  useEffect(() => {
    console.log('bjrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
    if (user.token) {
      console.log('bjrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
      if(user.role === 'job_seeker'){
      // Fetch user notifications
      const fetchNotifications = async () => {
        try {
          
          getUserNotifications(user.id, setNotifications,setLoading);
         
         
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setLoading(false);
        }
      };

      

      // Generate notifications (optional, depending on your use case)
      const generateUserNotifications = async () => {
        try {
          console.log("generating notif")
          await generateNotifications(user.id, user.token);
          // Optionally, refetch notifications after generating
         
          
        } catch (error) {
          console.error('Error generating notifications:', error);
        }
      };

      // Call to generate notifications, if needed
      generateUserNotifications();
      fetchNotifications();
    }
  }
  }, [user, user.token ,refresh]);
  const handleNotificationClick = async (jobOfferId) => {
    try {
      setLoading(true);
     
      setSelectedPost(jobOfferId); // Set the post
      getUser({ id: jobOfferId.user }, setUser);
    } catch (error) {
      console.error('Error fetching job offer details:', error);
    } finally {
      setLoading(false);
    }
  }
  const handleHomeClick = () => {
    setRefresh(prev => !prev); // Toggle refresh state
    navigate('/'); // Navigate to the home page
  };


  const blockRenderPaths = [
    "/login",
    "/register"
  ]
  if (blockRenderPaths.includes(route.pathname)) return null;

  if (user.token) return (
    <>
    <nav className='w-full h-[60px] border-b border-[#DBDBDB] flex items-center justify-center fixed bg-white z-10' >
      <div className='flex items-center justify-between w-[975px] px-5  ' >
        <Link className='mt-2' to="/" >
          <img src={instaJob} width="103" />
        </Link>
        <div className='w-[268px] h-9 rounded-[8px] bg-[#EFEFEF] relative md:flex items-center justify-center px-4 ml-[162px] hidden  ' >
          <BsSearch color='#9A9A9A' />
          <input onKeyUp={e => e.key === 'Enter' ? goUser(e.target.value) : false} type="text" className='bg-transparent outline-none grow h-full ml-3 ' placeholder='Ara' />
        </div>
        <div className='flex items-center justify-center gap-5' >
        <div className="cursor-pointer" onClick={handleHomeClick}>
          <MdHomeFilled size={28} />
        </div>
          <RiMessengerLine size={28} />
          {user.role === 'hr' && (
            <BsPlusSquare onClick={() => dispatch(toggleCreatePost())} className='cursor-pointer' size={28} />
          )}
          <IoCompassOutline size={28} />
          <AiOutlineHeart size={28} />
          {/* Notifications Icon and Dropdown */}
         
          {user.role === 'job_seeker' && (
  <div className='relative'>
    <BsBell
      size={28}
      className='cursor-pointer'
      onClick={() => setShowNotifications(prev => !prev)
        
      }
    />
    {showNotifications && (
  <div className='absolute right-0 top-8 bg-white border border-gray-200 shadow-lg rounded w-[250px] py-2 max-h-80 overflow-y-auto'>
    {loading ? (
      <div className='px-4 py-2'>
        <span>Loading...</span>
      </div>
    ) : notifications.length > 0 ? (
      notifications.map(notification => (
        <div
          key={notification.id}
          className='px-4 py-2 border-b last:border-b-0 cursor-pointer'
          onClick={() => handleNotificationClick(notification.jobOfferID)}
        >
          <span>Your skills match this Job Offer</span>
        </div>
      ))
    ) : (
      <div className='px-4 py-2'>
        <span>No notifications</span>
      </div>
    )}
  </div>
)}

  </div>
)}

          <button className='relative group' >
            <img src={user.avatar ?? defaultAvatar} width="24" className='rounded-full cursor-pointer border border-gray-300 ' />
            <div className='w-[230px] h-[198px] hidden group-focus-within:flex bg-white z-10 shadow-lg rounded py-2 absolute -right-5 top-8 flex-col  ' >
              <Link to={user.username} className='w-full flex items-center justify-start px-4 transition-all hover:bg-gray-100 h-12 cursor-pointer ' >
                <span className='text-sm' >Profil</span>
              </Link>
              <div className='w-full flex items-center justify-start px-4 transition-all hover:bg-gray-100 h-12 cursor-pointer ' >
                <span className='text-sm' >Saved</span>
              </div>
              <div className='w-full flex items-center justify-start px-4 transition-all hover:bg-gray-100 h-12 cursor-pointer ' >
                <span className='text-sm' >Settings</span>
              </div>
              <div className='w-full flex items-center justify-start px-4 transition-all hover:bg-gray-100 h-12 cursor-pointer ' >
                <span className='text-sm' >Switch Account</span>
              </div>
              <div onClick={logout} className='w-full flex items-center justify-start px-4 transition-all hover:bg-gray-100 h-12 cursor-pointer ' >
                <span className='text-sm' >Sign Out</span>
              </div>
            </div>
          </button>

        </div>
      </div>
    </nav>
     {/* Show post in a modal */}
     {selectedPost && user1 && (
      <LandingPost post={selectedPost} user={user1} selectPost={setSelectedPost} />
    )} 
</>
  )
}

export default App
