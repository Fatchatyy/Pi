import instagramText from '../assets/img/instagram-text.png'
import instaJob from '../assets/img/mylogo.png'
import appStore from '../assets/img/appstore.png'
import playStore from '../assets/img/playstore.png'
import { Link, useNavigate } from 'react-router-dom'
import encrypt from '../utils/encrypt'
import { useEffect, useState } from 'react'
import { registerUser } from '../api/request'
import { useDispatch } from 'react-redux'
import { loginStore } from '../store/user'

function App() {

    const [mail, setMail] = useState(null)
    const [name, setName] = useState(null)
    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)
    const [role, setRole] = useState('job_seeker');
    const [errors, setErrors] = useState({});
    const [buttonStyle, setStyle] = useState({
        backgroundColor: '#B2DFFC'
    })

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
    const validateForm = () => {
        const newErrors = {};
        if (!mail || !validateEmail(mail)) newErrors.mail = "Please enter a valid email.";
        if (!name || name.length < 2) newErrors.name = "Name must be at least 2 characters long.";
        if (!username || username.length < 3) newErrors.username = "Username must be at least 3 characters long.";
        if (!password || password.length < 4) newErrors.password = "Password must be at least 6 characters long.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    useEffect(() => {
        if (username && password && name && mail) {
            setStyle({ backgroundColor: '#0095f6' })
        } else {
            setStyle({ backgroundColor: '#B2DFFC' })
        }
    }, [username, password, name, mail])

    const register = async () => {
        if (!validateForm()) return;
        let data = {
            mail,
            name,
            username: encrypt(username),
            password: encrypt(password),
            registerDate: Date.now(),
            role
        }
        registerUser({ data }, response => {
            dispatch(loginStore(response))
            navigate("/")
        })
    }


    return (
        <div className="w-full h-screen relative bg-[#FAFAFA] pb-[130px] mt-16 " >
            <div className="w-full h-full flex items-center justify-center mx-auto  " >

                <div className="w-[350px] min-h-[581px]" >

                    <div className="w-[348px] py-[10px] flex flex-col items-center border border-[#DBDBDB] relative pb-10 rounded-[1px] bg-white " >
                        <img src={instaJob} className='mt-3' width="150" />
                        <span className='font-semibold text-[#8E8E8E] leading-5 mt-7' >Sing up to find  </span>
                        <span className='font-semibold text-[#8E8E8E] leading-5 ' >Professional Opportunities</span>
                        <div className='px-10 w-full relative mt-2 ' >
                            <button className='bg-[#0095F6] py-[5px] rounded-[4px] text-white w-full text-sm font-semibold ' >Login with facebook</button>
                        </div>
                        <div className='flex items-center w-full mt-4  px-10' >
                                <div className='w-full h-[1px] bg-[#DBDBDB]' ></div>
                                <span className='text-[#8E8E8E] font-semibold text-xs w-full text-center ' >YA DA</span>
                                <div className='w-full h-[1px] bg-[#DBDBDB]' ></div>
                        </div>
                        <div className='flex w-full items-center flex-col px-10 mt-3 ' >
                            <input onInput={e => setMail(e.target.value)} type="text" className='w-full pl-2 pt-[9px] pb-[7px]  bg-[#FAFAFA] outline-none placeholder-[#8E8E8E] text-[12px] border border-[#DBDBDB] ' placeholder='E-mail' />
                            {errors.mail && <span className='text-red-500 text-xs'>{errors.mail}</span>}
                            <input onInput={e => setName(e.target.value)} type="text" className='w-full pl-2 pt-[9px] pb-[7px] mt-2 bg-[#FAFAFA] outline-none placeholder-[#8E8E8E] text-[12px] border border-[#DBDBDB] ' placeholder='Name' />
                            {errors.name && <span className='text-red-500 text-xs'>{errors.name}</span>}
                            <input onInput={e => setUsername(e.target.value)} type="text" className='w-full pl-2 pt-[9px] pb-[7px] mt-2 bg-[#FAFAFA] outline-none placeholder-[#8E8E8E] text-[12px] border border-[#DBDBDB] ' placeholder='Username' />
                            {errors.username && <span className='text-red-500 text-xs'>{errors.username}</span>}
                            <input onInput={e => setPassword(e.target.value)} type="password" className='w-full pl-2 pt-[9px] pb-[7px] mt-2 bg-[#FAFAFA] outline-none placeholder-[#8E8E8E] text-[12px] border border-[#DBDBDB] ' placeholder='Password' />
                            {errors.password && <span className='text-red-500 text-xs'>{errors.password}</span>}
                            <select onChange={e => setRole(e.target.value)} className='w-full pl-2 pt-[9px] pb-[7px] mt-2 bg-[#FAFAFA] outline-none placeholder-[#8E8E8E] text-[12px] border border-[#DBDBDB]'>
                            <option value="job_seeker">Job Seeker</option><option value="hr">HR</option></select>
                            <span className='text-[11px] mt-4 text-[#8E8E8E] text-center ' >People who are using our service may collect your <strong>Contact Information</strong> </span>
                            <span className='text-[11px] mt-4 text-[#8E8E8E] text-center ' >By signing up , you agree to our Terms , Privacy Policy and Cookies Policy</span>
                            <button style={buttonStyle} onClick={register} className='w-full flex items-center mt-4 justify-center h-[30px] rounded-[4px] ' >
                                <span className='font-semibold text-white text-sm' >Sign up</span>
                            </button>
                        </div>
                    </div>

                    <div className='w-full border border-[#DBDBDB] rounded-[1px] py-[10px] flex items-center justify-center mt-3 bg-white ' >
                        <div className='flex items-center text-sm justify-center gap-1 h-[41px] ' >
                            <span>Do you have an account?</span>
                            <Link to='/login' className='text-[#3195F6] ' >Login </Link>
                        </div>
                    </div>

                  

                </div>
            </div>

        </div>
    )
}

export default App