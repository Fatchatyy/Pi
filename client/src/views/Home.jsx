import me from '../assets/img/me.jpg'
import defaultAvatar from '../assets/img/default_avatar.jpg'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import '../assets/css/app.css'
import Post from '../components/Post'
import { getHome } from '../api/request'
import { useState } from 'react'
import { useSocket } from '../components/SocketContext';
import { handleUserConnection } from '../api/request';
function App() {
  const socket = useSocket();
  const [posts, setHome] = useState([])
  const user = useSelector(state => state.user)
  const navigate = useNavigate()
  const path = useLocation()
  const sendingsocketId = async () => {
    console.log("user logged in whats his socket id", socket.id)
    await handleUserConnection(user.id, socket.id);
  }
  useEffect(() => {
    if (!user.token) return navigate("/login")
    setHome([])
    getHome(setHome)
    sendingsocketId();
  }, [path])

  if (user.token) return (
    <main className='md:mx-auto md:w-[821px] flex items-center justify-center md:items-start md:justify-start ' >

      <section className='w-[470px] md:mr-8 h-screen' >
        <div className='h-[85px] ' ></div>
        <div id='stories' className='w-[470px] h-[117px] py-4 rounded-[8px] border border-[#DBDBDB] flex items-center px-6 gap-4 bg-white ' >

          <div className='flex items-center flex-col mt-2 ' >
            <img src={me} width='52' className='rounded-full' />
            <span className='text-xs mt-3 ' >story</span>
          </div>

          <div className='flex items-center flex-col mt-2 ' >
            <img src={me} width='52' className='rounded-full' />
            <span className='text-xs mt-3 ' >story</span>
          </div>

          <div className='flex items-center flex-col mt-2 ' >
            <img src={me} width='52' className='rounded-full' />
            <span className='text-xs mt-3 ' >story</span>
          </div>

          <div className='flex items-center flex-col mt-2 ' >
            <img src={me} width='52' className='rounded-full' />
            <span className='text-xs mt-3 ' >story</span>
          </div>

          <div className='flex items-center flex-col mt-2 ' >
            <img src={me} width='52' className='rounded-full' />
            <span className='text-xs mt-3 ' >story</span>
          </div>

          <div className='flex items-center flex-col mt-2 ' >
            <img src={me} width='52' className='rounded-full' />
            <span className='text-xs mt-3 ' >story</span>
          </div>


        </div>
        <div id='posts-section' className='mt-5 w-full pb-5' >
          {
            posts.map((post, index) => {
              return <Post key={index} token={user.token} userI={post.user} date={post.data} content={post.content} image={post.image} userID={user.id} role={user.role}description={post.description} requirements={post.requirements} company={post.company} location={post.location} jobType={post.jobType} jobId={post.id} />
            })
          }
        </div>
      </section>

      <section className='w-[319px] relative md:mr-4 hidden md:flex flex-col items-center' >
        <div className='h-[95px]' ></div>

        <div className='w-[319px] flex items-center justify-between' >
          <div className='flex items-center justify-center gap-4' >
            <img src={user.avatar ?? defaultAvatar} width="56" className='rounded-full' />
            <div className='flex flex-col items-start ' >
              <span className='text-sm font-semibold' > {user.username} </span>
              <span className='text-sm text-[#A2A2A2] ' > {user.name} </span>
            </div>
          </div>
          <button className='text-[#139DF7] text-xs font-semibold'  >Switch</button>
        </div>

        <div className='w-full flex items-center justify-between mt-4' >
          <span className='text-[#ACACAC] font-semibold text-sm' >Suggestions for you</span>
          <span className='text-xs  font-semibold' >See All</span>
        </div>

        <div className='flex items-center flex-col w-[340px] mt-1' >

          <div className='flex items-center justify-between px-4 py-2 w-full' >
            <div className='flex items-center justify-center gap-4' >
              <img src={me} className='rounded-full' width="32" />
              <div className='flex flex-col items-start' >
                <span className='text-sm font-semibold' >Fat7i</span>
                <span className='text-xs  text-[#A2A2A2]' >is following you</span>
              </div>
            </div>
            <span className='text-[#139DF7] text-xs font-semibold mr-3' >Follow</span>
          </div>

          <div className='flex items-center justify-between px-4 py-2 w-full' >
            <div className='flex items-center justify-center gap-4' >
              <img src={me} className='rounded-full' width="32" />
              <div className='flex flex-col items-start' >
                <span className='text-sm font-semibold' >tarik</span>
                <span className='text-xs  text-[#A2A2A2]' >is following you</span>
              </div>
            </div>
            <span className='text-[#139DF7] text-xs font-semibold mr-3' > Follow</span>
          </div>

          <div className='flex items-center justify-between px-4 py-2 w-full' >
            <div className='flex items-center justify-center gap-4' >
              <img src={me} className='rounded-full' width="32" />
              <div className='flex flex-col items-start' >
                <span className='text-sm font-semibold' >tarik</span>
                <span className='text-xs  text-[#A2A2A2]' >is following you</span>
              </div>
            </div>
            <span className='text-[#139DF7] text-xs font-semibold mr-3' > Follow</span>
          </div>

          <div className='flex items-center justify-between px-4 py-2 w-full' >
            <div className='flex items-center justify-center gap-4' >
              <img src={me} className='rounded-full' width="32" />
              <div className='flex flex-col items-start' >
                <span className='text-sm font-semibold' >tarik</span>
                <span className='text-xs  text-[#A2A2A2]' >is following you</span>
              </div>
            </div>
            <span className='text-[#139DF7] text-xs font-semibold mr-3' >Follow</span>
          </div>

        </div>


      </section>


    </main>
  )
}

export default App