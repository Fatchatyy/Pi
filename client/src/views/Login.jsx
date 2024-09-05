import instagramText from '../assets/img/instagram-text.png'
import instaJob from '../assets/img/mylogo.png'
import appStore from '../assets/img/appstore.png'
import playStore from '../assets/img/playstore.png'
import homeImage from '../assets/img/home.png'
import slider1 from '../assets/img/slider1.png'
import slider2 from '../assets/img/slider2.png'
import slider3 from '../assets/img/slider3.png'
import slider4 from '../assets/img/slider4.png'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '../assets/css/app.css'

import { loginUser } from '../api/request'
import encrypt from '../utils/encrypt'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { loginStore } from '../store/user'


function App() {

    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)
    const [buttonStyle, setStyle] = useState({
        backgroundColor: '#B2DFFC'
    })
    const [slider, setSlider] = useState(slider1)
    
    const dispatch = useDispatch()
    const navigate = useNavigate()


    useEffect(() => {

        const sliderElement = document.getElementById("slider")
        sliderElement.classList.add('img-animate')

        let images = [slider1, slider2, slider3, slider4]
        let current = 0

        setInterval(() => {
            if (current == images.length - 1) current = 0
            else current++
            sliderElement.classList.toggle('img-animate')
            setTimeout(() => {
                setSlider(images[current])
                sliderElement.classList.toggle('img-animate')
            }, 1350);
        }, 5000);

        if (username && password) {
            setStyle({ backgroundColor: '#0095f6' })
        } else {
            setStyle({ backgroundColor: '#B2DFFC' })
        }

    }, [username, password])
    const validateEmail = email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validatePassword = password => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/
        return passwordRegex.test(password)
    }

    const login = async () => {
        if (!username || !password) return;
    
        if (!validateEmail(username)) {
            alert("Please enter a valid email address.");
            return;
        }
    
        if (!validatePassword(password)) {
            alert("Password must contain letters and at least one number.");
            return;
        }
    
        const data = {
            username: encrypt(username),
            password: encrypt(password)
        };
    
        try {
            loginUser({ data }, response => {
                if (response === "Incorrect password") {
                    alert("Incorrect password. Please try again.");
                    return;
                }
    
                if (response === "User not found") {
                    alert("User not found. Please check your email address.");
                    return;
                }
    
                dispatch(loginStore(response));
    
                // Check the role from the response
                if (response.role === 'hr') {
                    // Redirect to /redirect for HR users
                    navigate('/RoleSelection');
                } else {
                    // Redirect to the default route for other users
                    navigate('/');
                }
            });
        } catch (error) {
            console.error("Login error:", error);
            alert("An error occurred during login. Please try again.");
        }
    };


    return (
        <div className="w-full h-screen relative bg-[#FAFAFA] pb-[145px] " >
            <div className="w-full h-full flex items-center justify-center mx-auto mt-8 " >


                <div className='relative' >
                    <img src={homeImage} height='581' className='hidden md:block mt-6 ' alt="" />
                    <img id='slider' src={slider} className='absolute right-[60px] top-[50px] img-animation-in img-animation-out ' />
                </div>

                <div className="w-[350px] min-h-[581px] md:mr-12  mt-28" >

                    <div className="w-[348px] py-[10px] pb-5 flex flex-col items-center border border-[#DBDBDB] relative bg-white rounded-[1px] " >
                        <img src={instaJob} className='mt-5 mb-5' width="175" />
                        <div className='flex w-full items-center flex-col px-10 mt-3 ' >
                            <input 
                                onInput={e => setUsername(e.target.value)} 
                                type="text" 
                                className='w-full pl-2 pt-[9px] pb-[7px] bg-[#FAFAFA] outline-none placeholder-[#8E8E8E] text-[12px] border border-[#DBDBDB] ' 
                                placeholder=' E-mail' />
                            <input 
                                onInput={e => setPassword(e.target.value)} 
                                onKeyUp={e => e.key == 'Enter' ? login() : false}
                                type="password" 
                                className='w-full pl-2 pt-[9px] pb-[7px] mt-2 bg-[#FAFAFA] outline-none placeholder-[#8E8E8E] text-[12px] border border-[#DBDBDB] ' 
                                placeholder='Password' />
                            <button style={buttonStyle} onClick={login} className='w-full flex items-center mt-4 justify-center h-[30px] rounded-[4px] ' >
                                <span className='font-semibold text-white text-sm' >Login</span>
                            </button>
                            <div className='flex items-center w-full mt-4 ' >
                                <div className='w-full h-[1px] bg-[#DBDBDB]' ></div>
                                <span className='text-[#8E8E8E] font-semibold text-xs w-full text-center ' >THROW AWAY</span>
                                <div className='w-full h-[1px] bg-[#DBDBDB]' ></div>
                            </div>
                            <span className='text-[#3E5995] tex-xs font-semibold mt-6 ' >Login with facebook</span>
                            <Link to='/forgot-password'  ><span className='text-xs mt-5 text-[#00376B] ' >Forgot your password?</span></Link>
                        </div>
                    </div>

                    <div className='w-full border border-[#DBDBDB] rounded-[1px] py-[10px] flex items-center justify-center mt-3 bg-white ' >
                        <div className='flex items-center text-sm justify-center gap-1 h-[41px] ' >
                            <span>Don't have an account?</span>
                            <Link to='/register' className='font-semibold text-[#3195F6] ' >Sing up</Link>
                        </div>
                    </div>

                   

                </div>
            </div>

        </div>
    )
}

export default App