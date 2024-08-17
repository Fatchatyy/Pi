import { AiOutlineHeart } from 'react-icons/ai'
import { BsChat, BsBookmark } from 'react-icons/bs'
import { VscSmiley } from 'react-icons/vsc'
import { FiSend } from 'react-icons/fi'
import { GrClose } from 'react-icons/gr'
import defaultAvatar from '../assets/img/default_avatar.jpg'

function App({ post, user, selectPost }) {
    if (post) return (
        <div className='fixed z-30 h-screen w-full flex items-center justify-center animate-box'>
            <div onClick={() => selectPost(null)} className="h-full w-full bg-black bg-opacity-60"></div>

            <div className="bg-white w-[72%] h-[95%] absolute z-40 rounded-[6px] flex items-center justify-center overflow-hidden transition-all">
                <div className='relative h-full w-[69%] flex items-center justify-center'>
                    <img src={post.image} className='w-full h-full object-cover filter blur-sm' style={{ filter: 'blur(3px)' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white bg-opacity-70 p-12 rounded-md text-center w-full h-full flex flex-col justify-between">
                            {/* Overlay Text */}
                            <div className="mb-12">
                                <h1 className="text-6xl font-bold mb-6">WE ARE HIRING</h1>
                                <h2 className="text-4xl mb-4">JOIN OUR TEAM</h2>
                                <div className="text-3xl font-semibold mb-8">{post.jobType}</div>
                            </div>

                            {/* Job Information */}
                            <div className="flex flex-col md:flex-row justify-between w-full h-full text-left">
                                <div className="flex flex-col w-full md:w-1/2 pr-10 mb-10 md:mb-0">
                                    <span className="text-2xl font-semibold mb-6">Description:</span>
                                    <p className="text-lg">{post.description}</p>
                                    <span className="text-2xl font-semibold mb-6 mt-6">Requirements:</span>
                                    <p className="text-lg">{post.requirements}</p>
                                </div>
                                <div className="flex flex-col w-full md:w-1/2 pl-10">
                                    <span className="text-2xl font-semibold mb-6">Company:</span>
                                    <p className="text-lg">{post.company}</p>
                                    <span className="text-2xl font-semibold mb-6 mt-6">Location:</span>
                                    <p className="text-lg">{post.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='h-full w-[40%] flex flex-col items-center'>
                    <div className='w-full flex items-center px-6 mt-6 gap-4 pb-4 border-b border-[#DBDBDB]'>
                        <img src={user.avatar ?? defaultAvatar} className="rounded-full" width='50' />
                        <span className='font-semibold text-lg'>{user.username}</span>
                        <GrClose size={30} className='absolute right-6 cursor-pointer' onClick={() => selectPost(null)} />
                    </div>

                    <div className='h-full w-full flex items-start px-6 border-b border-[#DBDBDB] mt-6'>
                        {/* Example Comment */}
                        {/* <div className='w-full flex items-center'>
                            <img src={defaultAvatar} width='36' className='rounded-full self-start' />
                            <div className='leading-3 ml-3'>
                                <span className='font-semibold text-lg mr-2'>tariksefa0</span>
                                <span className='text-lg'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Velit nam natus, quas deserunt vel eius quis voluptas cum error enim?</span>
                            </div>
                            <AiOutlineHeart size={50} className='self-start ml-6' />
                        </div> */}
                    </div>

                    <div className='w-full flex flex-col items-center'>
                        <div id='user-activity' className='flex w-full justify-between h-[60px] items-center px-6 pb-[10px]'>
                            <div className='flex items-center justify-between gap-6'>
                                <AiOutlineHeart size={30} />
                                <BsChat size={30} />
                                <FiSend size={30} />
                            </div>
                            <BsBookmark size={30} />
                        </div>
                        <span className='font-bold w-full text-lg block text-start px-6 mb-2'>16,555 beğenme</span>
                        <span className='text-sm text-[#BFBFBF] ml-4 w-full px-4 mb-8'>4 SAAT ÖNCE</span>
                        <div id="make-comment" className='w-full border-t border-[#DBDBDB] px-4 pb-2 flex items-center'>
                            <VscSmiley className='my-3 mr-4' size={36} />
                            <input type="text" className='bg-transparent outline-none grow text-lg' placeholder='Yorum ekle...' />
                            <span className='text-[#BBE3FC] text-lg'>Paylaş</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
