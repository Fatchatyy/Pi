import React, { useState, useEffect, useRef } from 'react'
import { useSocket } from '../components/SocketContext';
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { IoIosMore } from 'react-icons/io'
import { FaUserCheck } from 'react-icons/fa'
import { BsGearWide } from 'react-icons/bs'
import { getPosts, getUser, followUser, getBookmarkedPosts, unfollowUser, getJobSeekerProfile, getUserSocketId } from '../api/request'
import { updateFollowing } from '../store/user'
import defaultAvatar from '../assets/img/default_avatar.jpg'
import FollowManager from '../components/FollowManager'
import LandingPost from '../components/LandingPost'
import Popup from './Popup';


function Profile() {

    const [selfMode, setSelf] = useState(false)
    const [user, setUser] = useState(null)
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [post, selectPost] = useState(null)
    const [showAlertBox, setAlert] = useState(false)
    const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
    const [jobSeekerProfile, setJobSeekerProfile] = useState(null)
    const [showFollowersBox, setFollowersBox] = useState(false)
    const [showFollowingBox, setFollowingBox] = useState(false)
    const [viewMode, setViewMode] = useState('info');
    const [CallerUser, setCallerUser] = useState();
    const [callAccepted, setcallAccepted] = useState(true);
    const currentUser = useSelector(state => state.user)
    const path = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const socket = useSocket();
    const [targetId, setTargetId] = useState('');
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [incomingCall, setIncomingCall] = useState(false);
    const [callerId, setCallerId] = useState('');
    const peerConnectionRef = useRef(null);
    const iceCandidatesQueue = useRef([]);
    const [callDeclined, setCallDeclined] = useState(false);
    const [showCallingPopup, setShowCallingPopup] = useState(false);
    const [showIncomingCallPopup, setShowIncomingCallPopup] = useState(false);
    const [isPopupOpen, setPopupOpen] = useState(false);
    const handleOpenPopup = () => setPopupOpen(true);
    const handleClosePopup = () => setPopupOpen(false);
    const getSocketId = async (userId) => {
        console.log("getting user socket id with the userId: ", userId)
        const response = await getUserSocketId(userId);
        console.log("do we have the target socket id ", response.socketId)
        setTargetId(response.socketId);
    }
    const initializePeerConnection = async () => {
        if (peerConnectionRef.current) return;

        peerConnectionRef.current = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('signal', { targetId, signalData: { candidate: event.candidate } });
            }
        };

        peerConnectionRef.current.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);

        stream.getTracks().forEach((track) => {
            peerConnectionRef.current.addTrack(track, stream);
        });
    };
    useEffect(() => {
        if (socket) {
            socket.on('signal', async (data) => {
                const { signalData, fromId, called } = data;

                try {
                    if (signalData.type === 'offer') {
                        setIncomingCall(true);
                        setCallerId(fromId);
                        setCallerUser(called);
                        console.log('from?', fromId, "the signalDaata does it contain anything we need ?", called);
                        await initializePeerConnection();
                        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
                        setShowIncomingCallPopup(true);
                        console.log("showIncomingCallPopup", showIncomingCallPopup)
                    } else if (signalData.type === 'answer') {
                        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signalData));

                        while (iceCandidatesQueue.current.length > 0) {
                            const candidate = iceCandidatesQueue.current.shift();
                            await peerConnectionRef.current.addIceCandidate(candidate);
                        }
                    } else if (signalData.type === 'decline') {
                        console.log('callingpopup value initially', callDeclined)

                        console.log("correct one arrived2", fromId, "callerId is", callerId)

                        console.log("correct one arrived3", fromId, "callerId is", callerId)

                        setCallDeclined(true);
                        //setShowCallingPopup(false);
                        console.log('callingpopup value after', callDeclined)

                    } else if (signalData.candidate) {
                        const candidate = new RTCIceCandidate(signalData.candidate);
                        if (peerConnectionRef.current.remoteDescription) {
                            await peerConnectionRef.current.addIceCandidate(candidate);
                        } else {
                            iceCandidatesQueue.current.push(candidate);
                        }
                    }
                } catch (error) {
                    console.error('Error handling signal data:', error);
                }
            });


        }

        return () => {
            socket?.off('signal');
            socket?.off('callDeclined');
        };
    }, [socket, callerId]);
    const startCall = async () => {
        setShowCallingPopup(true);
        setCallDeclined(null);

        await initializePeerConnection();

        console.log("calldeclined or no", callAccepted)

        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socket.emit('signal', { targetId, signalData: offer, called: currentUser });
    };
    const acceptCall = async () => {
        //setShowIncomingCallPopup(false);
        setcallAccepted(false)
        console.log("calldeclined or no", callAccepted)
        try {
            if (peerConnectionRef.current.signalingState === 'have-remote-offer') {
                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);
                socket.emit('signal', { targetId: callerId, signalData: answer });

                while (iceCandidatesQueue.current.length > 0) {
                    const candidate = iceCandidatesQueue.current.shift();
                    await peerConnectionRef.current.addIceCandidate(candidate);
                }

                //setShowCallingPopup(true);
                setRemoteStream(localStream); // To display remote stream if needed
            } else {
                console.error('No remote offer to answer.');
            }
        } catch (error) {
            console.error('Error accepting the call:', error);
        }
    };
    const declineCall = () => {
        setShowIncomingCallPopup(false);
        console.log("calldeclined or no", callAccepted)
        setcallAccepted(true);
        console.log('declining call from callerId', callerId);
        socket.emit('signal', { targetId: callerId, signalData: { type: 'decline' } });
    };
    const unfollowManager = () => {
        setAlert(false)
        const data = {
            userID: currentUser.id,
            followToID: user.id
        }
        unfollowUser({ data: data, token: currentUser.token }, response => {
            setFollowers(response.followTo)
            dispatch(updateFollowing(response.user))
        })
    }

    const followManager = () => {
        const data = {
            userID: currentUser.id,
            followToID: user.id
        }
        followUser({ data: data, token: currentUser.token }, response => {
            setFollowers(response.followTo)
            dispatch(updateFollowing(response.user))
        })
    }

    const userManager = async () => {
        let response = await getUser({ username: path.username }, response => {
            setUser(response)

            console.log("who is this user", response);

            setFollowers(response.followers)
            setFollowing(response.following)
        })
        if (!response) return navigate("/")
        const socketId = await getSocketId(response.id);
        if (response.role === 'hr') {
            getPosts(response.id, setPosts, setLoading)
        }
        if (response.role === 'job_seeker') {
            getPosts(response.id, setPosts, setLoading)
            getJobSeekerProfile(response.id, setJobSeekerProfile, setLoading)
            getBookmarkedPosts(response.id, setBookmarkedPosts, setLoading);

        }
    }

    const UnfollowAlertBox = () => {
        if (showAlertBox) return (
            <div className='fixed z-30 h-screen w-full flex items-center justify-center animate-box top-0' >
                <div onClick={() => setAlert(false)} className="h-screen w-full bg-black bg-opacity-60 absolute" ></div>
                <div className='bg-white h-[290px] relative w-[400px] z-30 rounded-xl  flex flex-col items-center overflow-hidden ' >
                    <img src={user.avatar ?? defaultAvatar} width='90' className='rounded-full mt-7 ' />
                    <div className='w-full min-h-[80px] border-b border-[#DBDBDB] flex items-center justify-center' >
                        <span className='text-sm' >Leave @{user.username}? </span>
                    </div>
                    <button onClick={unfollowManager} className=' active:bg-gray-200 w-full h-full flex items-center justify-center border-b border-[#DBDBDB]' >
                        <span className='font-bold text-sm text-red-500'>Unfollow</span>
                    </button>
                    <button onClick={() => setAlert(false)} className=' active:bg-gray-200 w-full h-full flex items-center justify-center' >
                        <span className='text-sm'>Cancel</span>
                    </button>
                </div>
            </div>
        )
    }

    const UserComponent = () => {
        if (selfMode) return (
            <div className='flex items-center gap-3' >
                <span className='text-3xl font-thin' >{user.username}</span>
                <Link to="/edit" className='border border-[#DBDBDB] rounded px-[9px] py-[2px] ' >
                    <span className='font-semibold text-sm'  >Edit Profile</span>
                </Link>
                <BsGearWide size={25} />

            </div>
        )

        if (!selfMode && followers.includes(currentUser.id)) {
            return (
                <div className='flex items-center gap-3' >
                    <span className='text-3xl font-thin' >{user.username}</span>
                    <button className='border border-[#DBDBDB] rounded px-[9px] py-[2px] ' >
                        <span className='font-semibold text-sm'  >Send Message</span>
                    </button>
                    <button onClick={() => setAlert(true)} className='border border-[#DBDBDB] rounded px-[25px] py-[5px]' >
                        <FaUserCheck />
                    </button>

                    <IoIosMore size={25} />
                </div>
            )
        }

        if (!selfMode) {
            return (
                <div className='flex items-center gap-3' >
                    <span className='text-3xl font-thin' >{user.username}</span>
                    <button onClick={followManager} className='bg-[#139DF7] text-white rounded px-[20px] py-[2px] ' >
                        <span className='font-semibold text-sm'  >Follow</span>
                    </button>
                    <IoIosMore size={25} />
                </div>
            )
        }
    }

    useEffect(() => {
        if (!currentUser.token) return navigate("/login")

        if (path.username == currentUser.username) {
            setSelf(true)
            setUser(currentUser)
            setFollowers(currentUser.followers)
            setFollowing(currentUser.following)
            if (currentUser.role === 'hr') {
                getPosts(currentUser.id, setPosts, setLoading)
            }
            if (currentUser.role === 'job_seeker') {
                getJobSeekerProfile(currentUser.id, setJobSeekerProfile, setLoading);
                getBookmarkedPosts(currentUser.id, setBookmarkedPosts, setLoading);


            }
        } else {
            setSelf(false)
            userManager()
        }
    }, [path])
    const toggleView = (mode) => {
        setViewMode(mode);
    }

    if (user) return (
        <div className='bg-[#FAFAFA] h-screen ' >
            <LandingPost
                post={post}
                user={user}
                selectPost={selectPost}
            />
            <UnfollowAlertBox />
            <FollowManager
                showFollowersBox={showFollowersBox}
                setFollowersBox={setFollowersBox}
                followers={selfMode ? currentUser.followers : followers}
                self={selfMode}
            />
            <FollowManager
                showFollowingBox={showFollowingBox}
                setFollowingBox={setFollowingBox}
                following={selfMode ? currentUser.following : following}
                self={selfMode}
            />

            <div className='h-[60px] w-3' ></div>
            <main className='md:pt-[30px]' >

                <div className='md:w-[975px] mx-auto flex items-center flex-col justify-center px-5 mt-3 ' >

                    <section id='user-information' className='w-full h-[150px] relative flex items-start gap-5 md:gap-0 md:justify-between overflow-hidden' >

                        <div className='flex items-center justify-center md:min-w-[328px] ' >
                            <img src={user.avatar ?? defaultAvatar} className="rounded-full md:mr-[30px] w-[77px] md:w-[150px]  " />
                        </div>


                        <div className='h-full md:grow md:w-full flex items-start flex-col' >
                            <UserComponent />
                            <div className='mt-7 flex items-center justify-start w-full gap-8 ' >
                                <div className='flex items-center justify-center' >
                                    <span className='font-semibold mr-1 ' > {posts.length}</span>
                                    <span>Posts</span>
                                </div>
                                <button onClick={() => setFollowersBox(true)} className='flex items-center justify-center' >
                                    <span className='font-semibold mr-1 ' > {selfMode ? currentUser.followers.length : followers.length} </span>
                                    <span>followers</span>
                                </button>
                                <div onClick={() => setFollowingBox(true)} className='flex items-center justify-center cursor-pointer' >
                                    <span className='font-semibold mr-1 ' > {selfMode ? currentUser.following.length : following.length} </span>
                                    <span>following</span>
                                </div>
                            </div>
                            <span className='font-semibold mt-4' > {user.name} </span>
                            <span>{user.biography}</span>

                        </div>
                    </section>
                    <div className="p-4 space-y-4">
                        <button
                            onClick={startCall}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Start Call
                        </button>
                        {showCallingPopup && (
                            <Popup isOpen={showCallingPopup} onClose={() => setShowCallingPopup(false)}>
                                <div className="flex flex-col items-center space-y-4 p-6">
                                    <img
                                        src={user.avatar ?? defaultAvatar}
                                        alt="Calling..."
                                        className="w-24 h-24 rounded-full shadow-lg"
                                    />
                                    <h2>Calling {user.username}</h2>
                                    {callDeclined && (
                                        <p className="text-red-500">Call declined.</p>
                                    )}
                                    <div className="space-y-2 w-full">
                                        <h3 className="text-lg font-medium">Preview</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <video
                                                className="rounded"
                                                autoPlay
                                                muted
                                                playsInline
                                                ref={(video) =>
                                                    video && localStream && (video.srcObject = localStream)
                                                }
                                            />
                                            {!callDeclined && (<video
                                                className="rounded"
                                                autoPlay
                                                playsInline
                                                ref={(video) =>
                                                    video && remoteStream && (video.srcObject = remoteStream)
                                                }
                                            />)}
                                        </div>
                                    </div>


                                    <button
                                        onClick={() => setShowCallingPopup(false)}
                                        className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        Cancel Call
                                    </button>
                                </div>
                            </Popup>
                        )}

                        {showIncomingCallPopup && (
                            <Popup isOpen={showIncomingCallPopup} onClose={() => setShowIncomingCallPopup(false)}>
                                <div className="flex flex-col items-center space-y-4 p-6">
                                    <img
                                        src={CallerUser.avatar ?? defaultAvatar}
                                        alt="Incoming Call"
                                        className="w-24 h-24 rounded-full shadow-lg"
                                    />
                                    {callAccepted && (<h2>Incoming call from {CallerUser.username}</h2>)}

                                    <div className="space-y-2 w-full">
                                        <h3 className="text-lg font-medium">Preview</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <video
                                                className="rounded"
                                                autoPlay
                                                muted
                                                playsInline
                                                ref={(video) =>
                                                    video && localStream && (video.srcObject = localStream)
                                                }
                                            />
                                            <video
                                                className="rounded"
                                                autoPlay
                                                playsInline
                                                ref={(video) =>
                                                    video && remoteStream && (video.srcObject = remoteStream)
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center space-y-4 p-6">
                                        {callAccepted && (

                                            <button
                                                onClick={acceptCall}
                                                className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                                            >
                                                Accept
                                            </button>)}
                                        <button
                                            onClick={declineCall}
                                            className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        )}
                    </div>


                    {user.role === 'hr' && (
                        <section className='w-full border-t border-[#DBDBDB] mt-14 flex items-center justify-center gap-20 ' >
                            <span className=' text-sm font-semibold border-t border-black py-4 cursor-pointer ' >Posts</span>
                            <span className=' text-sm text-[#928E9F] py-4 cursor-pointer ' >Saved</span>
                            <span className=' text-sm text-[#928E9F] py-4 cursor-pointer ' >Tagged</span>
                        </section>
                    )}
                    {user.role === 'job_seeker' && (
                        <section className='w-full border-t border-[#DBDBDB] mt-14 flex items-center justify-center gap-20 ' >
                            <span className=' text-sm text-[#928E9F] py-4 cursor-pointer ' ><button onClick={() => toggleView('info')}>Profile information</button></span>
                            <span className=' text-sm text-[#928E9F] py-4 cursor-pointer ' ><button onClick={() => toggleView('bookmarked')}>Favourites</button></span>
                        </section>
                    )}
                    {user.role === 'job_Seeker' && (
                        <section className='w-full border-t border-[#DBDBDB] mt-14 flex items-center justify-center gap-20 ' >
                            <span className=' text-sm font-semibold border-t border-black py-4 cursor-pointer ' >Personal Information</span>
                        </section>
                    )}
                    {loading ? (
                        <div className='flex items-center justify-center w-full h-[200px]' >
                            <div className='w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin'></div>
                        </div>
                    ) : (
                        user.role === 'hr' && (
                            <section className='w-full flex flex-wrap gap-7 items-center justify-center md:justify-start mb-5'>
                                {posts.map((post, index) => (
                                    <div key={index} onClick={() => selectPost(post)} className='w-[293px] h-[293px] cursor-pointer relative'>
                                        <img src={post.image} className="object-cover w-full h-full filter blur-sm" style={{ filter: 'blur(3px)' }} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-white bg-opacity-70 p-6 rounded-md text-center w-full h-full flex flex-col justify-between">
                                                {/* Overlay Text */}
                                                <div className="mb-4">
                                                    <h1 className="text-lg font-bold mb-2">WE ARE HIRING1</h1>
                                                    <h2 className="text-md">JOIN OUR TEAM</h2>
                                                </div>

                                                {/* Job Information */}
                                                <div className="flex flex-col md:flex-row justify-between w-full h-full">
                                                    <div className="flex flex-col w-full md:w-1/2 pr-4 mb-4 md:mb-0">
                                                        <span className="text-sm font-semibold mb-2">Description:</span>
                                                        <p className="text-xs">{post.description}</p>
                                                        <span className="text-sm font-semibold mb-2">Requirements:</span>
                                                        <p className="text-xs">{post.requirements}</p>
                                                    </div>
                                                    <div className="flex flex-col w-full md:w-1/2 pl-4">
                                                        <span className="text-sm font-semibold mb-2">Company:</span>
                                                        <p className="text-xs">{post.company}</p>
                                                        <span className="text-sm font-semibold mb-2">Location:</span>
                                                        <p className="text-xs">{post.location}</p>
                                                        <span className="text-sm font-semibold mt-2">Job Type:</span>
                                                        <p className="text-xs">{post.jobType}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        )
                    )}
                    {/*  <button onClick={() => toggleView('info')}>Profile information</button>
                    <button onClick={() => toggleView('bookmarked')}>Favourites</button> */}
                    {user.role === 'job_seeker' && jobSeekerProfile && viewMode === 'info' && (
                        <div>
                            <div className='mt-7 w-full p-6 border border-gray-300 rounded-lg shadow-lg bg-white'>
                                <h2 className='text-xl font-bold mb-6 border-b-2 border-gray-300 pb-2'>{jobSeekerProfile.description}</h2>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    {/* Column 1 */}
                                    <div className='space-y-4'>
                                        <div className='bg-gray-50 p-4 rounded-lg'>
                                            <h3 className='text-xl font-semibold mb-2'>Looking for</h3>
                                            <p className='text-gray-700'>{jobSeekerProfile.job_type}</p>
                                        </div>

                                        <div className='bg-gray-50 p-4 rounded-lg'>
                                            <h3 className='text-xl font-semibold mb-2'>Education</h3>
                                            <p className='text-gray-700'><strong>Diploma:</strong> {jobSeekerProfile.diploma_name}</p>
                                            <p className='text-gray-700'><strong>School:</strong> {jobSeekerProfile.school}</p>
                                        </div>
                                        <div className='bg-gray-50 p-4 rounded-lg'>
                                            <h3 className='text-xl font-semibold mb-2'>Languages</h3>
                                            <p className='text-gray-700'>{jobSeekerProfile.languages}</p>
                                        </div>
                                        <div className='bg-gray-50 p-4 rounded-lg'>
                                            <h3 className='text-xl font-semibold mb-2'>Location</h3>
                                            <p className='text-gray-700'>{jobSeekerProfile.location}</p>
                                        </div>
                                        <div className='bg-gray-50 p-4 rounded-lg'>
                                            <h3 className='text-xl font-semibold mb-2'>Hobbies</h3>
                                            <p className='text-gray-700'>{jobSeekerProfile.hobbies.map(hobby => hobby.name).join(', ')}</p>
                                        </div>
                                    </div>

                                    {/* Column 2 */}
                                    <div className='space-y-4'>
                                        <div className='bg-gray-50 p-4 rounded-lg'>
                                            <h3 className='text-xl font-semibold mb-2'>Projects</h3>
                                            {jobSeekerProfile.projects.map((project, index) => (
                                                <div key={index} className='mb-2'>
                                                    <p className='font-semibold'>{project.name}</p>
                                                    <p className='text-gray-700'>{project.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className='bg-gray-50 p-4 rounded-lg'>
                                            <h3 className='text-xl font-semibold mb-2'>Skills</h3>
                                            <p className='text-gray-700'>{jobSeekerProfile.skills.join(', ')}</p>
                                        </div>
                                        <div className='bg-gray-50 p-4 rounded-lg'>
                                            <h3 className='text-xl font-semibold mb-2'>Experience</h3>
                                            <p className='text-gray-700'>{jobSeekerProfile.work_experience}</p>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                    {user.role === 'job_seeker' && viewMode === 'bookmarked' && (
                        <section className='w-full flex flex-wrap gap-7 items-center justify-center md:justify-start mb-5'>
                            {bookmarkedPosts.map((post, index) => (
                                <div key={index} onClick={() => selectPost(post)} className='w-[293px] h-[293px] cursor-pointer relative'>
                                    <img src={post.image} className="object-cover w-full h-full filter blur-sm" style={{ filter: 'blur(3px)' }} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white bg-opacity-70 p-6 rounded-md text-center w-full h-full flex flex-col justify-between">
                                            {/* Overlay Text */}
                                            <div className="mb-4">
                                                <h1 className="text-lg font-bold mb-2">WE ARE HIRING1</h1>
                                                <h2 className="text-md">JOIN OUR TEAM</h2>
                                            </div>

                                            {/* Job Information */}
                                            <div className="flex flex-col md:flex-row justify-between w-full h-full">
                                                <div className="flex flex-col w-full md:w-1/2 pr-4 mb-4 md:mb-0">
                                                    <span className="text-sm font-semibold mb-2">Description:</span>
                                                    <p className="text-xs">{post.description}</p>
                                                    <span className="text-sm font-semibold mb-2">Requirements:</span>
                                                    <p className="text-xs">{post.requirements}</p>
                                                </div>
                                                <div className="flex flex-col w-full md:w-1/2 pl-4">
                                                    <span className="text-sm font-semibold mb-2">Company:</span>
                                                    <p className="text-xs">{post.company}</p>
                                                    <span className="text-sm font-semibold mb-2">Location:</span>
                                                    <p className="text-xs">{post.location}</p>
                                                    <span className="text-sm font-semibold mt-2">Job Type:</span>
                                                    <p className="text-xs">{post.jobType}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}
                </div>
            </main>
        </div>
    )

    return <div>Loading...</div>
}

export default Profile
