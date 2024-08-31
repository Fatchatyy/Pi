import { useEffect } from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import defaultAvatar from '../assets/img/default_avatar.jpg'
import { uploadAvatar, updateUser, removeAvatar, updateJobSeekerProfile } from '../api/request'
import { loginStore, removeAvatarStore } from '../store/user'
import Popupp from './popupp'

function App() {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const user = useSelector(state => state.user)
    const [showAlert, setAlert] = useState(false)
    const [name, setName] = useState(null)
    const [username, setUsername] = useState(null)
    const [biography, setBiography] = useState(null)
    const [mail, setMail] = useState(null)

    // State variables for job seeker profile information
    const [location, setLocation] = useState('');
    const [school, setSchool] = useState('');
    const [diplomaName, setDiplomaName] = useState('');
    const [skills, setSkills] = useState([]);
    const [projects, setProjects] = useState([]);
    const [workExperience, setWorkExperience] = useState('');
    const [languages, setLanguages] = useState('');
    const [hobbies, setHobbies] = useState([]);
    const [description, setDescription] = useState('');
    const [jobType, setJobType] = useState('');

    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleOpenPopup = () => {
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    const removeAvatarManager = () => {
        setAlert(false)
        removeAvatar(
            { data: { id: user.id }, token: user.token },
            dispatch(removeAvatarStore())
        )
    }

    const updateInformation = () => {
        const data = {
            name: name ?? user.name,
            username: username ?? user.username,
            biography: biography ?? user.biography,
            mail: mail ?? user.mail,
            id: user.id
        }
        updateUser(
            { data: data, token: user.token },
            response => {
                dispatch(loginStore(response))
            })
    }

    const changeAvatar = (e) => {
        const data = new FormData()
        data.append("files", e.target.files[0])
        data.append("id", user.id)
        uploadAvatar({ data: data, token: user.token }, response => {
            dispatch(loginStore(response))
            setAlert(false)
        })
    }
    const updateJobSeekerProfileInfo = () => {
        const profileData = {
            location,
            school,
            diploma_name: diplomaName,
            skills,
            projects,
            work_experience: workExperience,
            languages,
            hobbies,
            description,
            job_type: jobType
        };
        const userId = user.id;
        updateJobSeekerProfile(
            { data: profileData, token: user.token, userId },
            response => {
                dispatch(loginStore(response));
            }
        );
    }; const addSkill = () => {
        setSkills([...skills, '']);
    };

    const removeSkill = (index) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const updateSkill = (index, value) => {
        const updatedSkills = skills.map((skill, i) => (i === index ? value : skill));
        setSkills(updatedSkills);
    };
    const addProject = () => {
        setProjects([...projects, { name: '', description: '' }]);
    };

    const removeProject = (index) => {
        setProjects(projects.filter((_, i) => i !== index));
    };

    const updateProject = (index, field, value) => {
        const updatedProjects = projects.map((project, i) =>
            i === index ? { ...project, [field]: value } : project
        );
        setProjects(updatedProjects);
    };
    const addHobby = () => {
        setHobbies([...hobbies, { name: '' }]);
    };

    const removeHobby = (index) => {
        setHobbies(hobbies.filter((_, i) => i !== index));
    };

    const updateHobby = (index, value) => {
        const updatedHobbies = hobbies.map((hobby, i) =>
            i === index ? { ...hobby, name: value } : hobby
        );
        setHobbies(updatedHobbies);
    };

    useEffect(() => {
        if (!user.token) return navigate("/");
    }, [])

    const AlertBox = () => {
        if (showAlert) return (
            <div className='fixed z-30 h-screen w-full flex items-center justify-center animate-box top-0' >
                <div onClick={() => setAlert(!showAlert)} className="h-screen w-full bg-black bg-opacity-60 absolute" ></div>
                <div className='bg-white h-[222px] relative w-[400px] z-30 rounded-xl  flex flex-col items-center overflow-hidden ' >
                    <div className='w-full min-h-[80px] border-b border-[#DBDBDB] flex items-center justify-center' >
                        <span className='font-bold text-lg' >Change Profile Photo</span>
                    </div>
                    <button className=' active:bg-gray-200 w-full h-full flex items-center justify-center border-b border-[#DBDBDB] relative ' >
                        <span className='font-bold text-sm text-[#139DF7] ' >Upload Photo</span>
                        <input
                            onInput={changeAvatar}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className='absolute w-full h-full opacity-0 '
                        />
                    </button>
                    <button onClick={removeAvatarManager} className=' active:bg-gray-200 w-full h-full flex items-center justify-center border-b border-[#DBDBDB]' >
                        <span className='font-bold text-sm text-red-500'>Remove Existing Photo</span>
                    </button>
                    <button className=' active:bg-gray-200 w-full h-full flex items-center justify-center' >
                        <span className='text-sm'>Cancel</span>
                    </button>
                </div>

            </div>
        )
    }

    if (user.token) return (
        <div className="w-full h-screen flex items-center justify-center  " >
            <AlertBox />
            <div className="w-[933px] mx-auto my-auto  bg-white border border-[#DBDBDB] flex " >
                <nav className="h-full flex flex-col border-r grow border-[#DBDBDB] " >
                    <a href="#" className="w-full py-4 leading-5 pl-[30px] pr-4  font-semibold flex items-center justify-start border-l-2 border-black" >Edit Profile</a>
                    <a href="#" className="w-full py-4 leading-5 pl-[30px] pr-4 flex items-center justify-start border-l-2 border-transparent hover:border-gray-200 hover:bg-gray-50 " >
                        Change Password
                    </a>
                    <a href="#" className="w-full py-4 leading-5 pl-[30px] pr-4 flex items-center justify-start border-l-2 border-transparent hover:border-gray-200 hover:bg-gray-50 " >
                        Apps and website
                    </a>
                    <a href="#" className="w-full py-4 leading-5 pl-[30px] pr-4 flex items-center justify-start border-l-2 border-transparent hover:border-gray-200 hover:bg-gray-50 " >
                        Email notification
                    </a>
                    <a href="#" className="w-full py-4 leading-5 pl-[30px] pr-4 flex items-center justify-start border-l-2 border-transparent hover:border-gray-200 hover:bg-gray-50 " >
                        Push notification
                    </a>
                    <a href="#" className="w-full py-4 leading-5 pl-[30px] pr-4 flex items-center justify-start border-l-2 border-transparent hover:border-gray-200 hover:bg-gray-50 " >
                        Manage contacts
                    </a>
                    <a href="#" className="w-full py-4 leading-5 pl-[30px] pr-4 flex items-center justify-start border-l-2 border-transparent hover:border-gray-200 hover:bg-gray-50 " >
                        Privacy and settings
                    </a>
                    <a href="#" className="w-full py-4 leading-5 pl-[30px] pr-4 flex items-center justify-start border-l-2 border-transparent hover:border-gray-200 hover:bg-gray-50 " >
                        Input transactions
                    </a>
                    <a href="#" className="w-full py-4 leading-5 pl-[30px] pr-4 flex items-center justify-start border-l-2 border-transparent hover:border-gray-200 hover:bg-gray-50 " >
                        E-mails from Instagram
                    </a>
                    <a href="#" className="w-full py-4 leading-5 pl-[30px] pr-4 flex items-center justify-start border-l-2 border-transparent hover:border-gray-200 hover:bg-gray-50 " >
                        Help
                    </a>
                </nav>
                <section className="min-w-[696px] h-full flex flex-col items-center " >
                    <div className="mt-8 flex relative items-center gap-7 w-full ml-64 " >
                        <img src={user.avatar ?? defaultAvatar} width="38" className='rounded-full border border-gray-300 ' />
                        <div className='h-full flex flex-col items-start' >
                            <span className='text-lg leading-5' >{user.username} </span>
                            <button onClick={() => setAlert(!showAlert)} className='text-[#139DF7] text-sm font-semibold ' >Change Profile Photo</button>
                        </div>
                    </div>

                    <div className='mt-5 w-full' >
                        <div className='flex items-center h-full' >
                            <div className='min-w-[194px] flex items-start justify-start h-full ' >
                                <span className='font-semibold ml-auto px-8 ' >Name</span>
                            </div>
                            <div className='flex flex-col ' >
                                <input
                                    onInput={e => setName(e.target.value)}
                                    defaultValue={user.name}
                                    type="text"
                                    className='border border-[#DBDBDB] h-[30px] w-[355px] px-[10px] rounded-[3px] outline-none'
                                />
                                
                            </div>
                        </div>
                    </div>

                    <div className='mt-5 w-full' >
                        <div className='flex items-center h-full' >
                            <div className='min-w-[194px] flex items-start justify-start h-full ' >
                                <span className='font-semibold ml-auto px-8 ' >Username</span>
                            </div>
                            <div className='flex flex-col ' >
                                <input
                                    onInput={e => setUsername(e.target.value)}
                                    defaultValue={user.username}
                                    placeholder='Username'
                                    type="text"
                                    className='border border-[#DBDBDB] h-[30px] w-[355px] px-[10px] rounded-[3px] outline-none'
                                />
       
                            </div>
                        </div>
                    </div>

    

                    <div className='mt-5 w-full'  >
                        <div className='flex items-center h-full' >
                            <div className='min-w-[194px] flex items-start justify-start h-full ' >
                                <span className='font-semibold ml-auto px-8 ' >Biography</span>
                            </div>
                            <div className='flex flex-col ' >
                                <textarea
                                    onInput={e => setBiography(e.target.value)}
                                    defaultValue={user.biography}
                                    className='border border-[#DBDBDB] px-[10px] py-[6px] w-[355px] max-h-[60px] min-h-[60px] rounded-[3px] outline-none '
                                    placeholder='Biography'
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className=' w-full mt-7 ' >
                        <div className='flex items-center h-full' >
                            <div className='min-w-[194px] flex items-start justify-start h-full ' >

                            </div>
                            <div className='flex flex-col ' >
                                <span className='text-[#8E8E8E] text-sm font-semibold max-w-[355px]' >Personal information</span>
                                <span className='text-[#8E8E8E] text-xs max-w-[355px] !leading-4 ' >
                                    Even if the account is used for a business, a pet, or something else, individuals should enter their information. These sections will not be visible on their public profile.
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className='mt-3 w-full ' >
                        <div className='flex items-center h-full' >
                            <div className='min-w-[194px] flex items-center justify-start h-full ' >
                                <span className='font-semibold ml-auto px-8 text-center ' >E-mail</span>
                            </div>
                            <div className='flex flex-col ' >
                                <input
                                    onInput={e => setMail(e.target.value)}
                                    defaultValue={user.mail}
                                    placeholder='E-mail'
                                    type="text"
                                    className='border border-[#DBDBDB] h-[30px] w-[355px] px-[10px] rounded-[3px] outline-none '
                                />
                            </div>
                        </div>
                    </div>

                    <div className='mt-5 w-full ' >
                        <div className='flex items-center h-full' >
                            <div className='min-w-[194px] flex items-center justify-start h-full ' >
                                <span className='font-semibold ml-auto px-8 text-center ' >Phone number</span>
                            </div>
                            <div className='flex flex-col ' >
                                <input type="text" className='border border-[#DBDBDB] h-[30px] w-[355px] px-[10px] rounded-[3px] outline-none ' placeholder='Phone Number' />
                            </div>
                        </div>
                    </div>

                    <div className='mt-5 w-full ' >
                        <div className='flex items-center h-full' >
                            <div className='min-w-[194px] flex items-center justify-start h-full ' >
                                <span className='font-semibold ml-auto px-8 text-center ' >Gender</span>
                            </div>
                            <div className='flex flex-col ' >
                                <input type="text" className='border border-[#DBDBDB] h-[30px] w-[355px] px-[10px] rounded-[3px] outline-none ' defaultValue='Male' />
                            </div>
                        </div>
                    </div>
                    <div className='mt-4 w-full ' >
                        <div className='flex items-center h-full' >
                            <div className='min-w-[194px] flex items-center justify-start h-full ' >
                            </div>
                            <div className='min-w-[110px] flex items-center justify-start h-full ' >
                            </div>
                            <div className='flex flex-col ' >
                                <button onClick={updateInformation} className='w-full flex items-center px-3 justify-center bg-[#139DF7] h-[30px] rounded-[4px] ' >
                                    <span className='font-semibold text-white text-sm' >Send</span>
                                </button>
                               
                            </div>
                        </div>
                    </div>

                    {/* Add fields for job seeker profile here */}
                    {user.role === 'job_seeker' && (
                <div>
                    <button
                        onClick={handleOpenPopup}
                        className='bg-[#139DF7] text-white px-4 py-2 rounded-md mt-6 mb-3 mr-6'
                    >
                        Build Your profile
                    </button>

                    <Popupp isOpen={isPopupOpen} onClose={handleClosePopup}>
                        <h2 className='text-2xl font-bold mb-6 border-b-2 border-gray-300 pb-2'>
                            Build Your Profile
                        </h2>
                        {/* The form content */}
                        <div className='mb-4'>
                            {/* Location */}
                            <div className='flex items-center'>
                                <label className='w-40 font-semibold text-gray-700'>Location</label>
                                <input
                                    onInput={e => setLocation(e.target.value)}
                                    value={location}
                                    type="text"
                                    className='flex-1 border border-gray-300 h-10 px-3 rounded-md outline-none'
                                />
                            </div>
                        </div>
                        <div className='mb-4'>
            <div className='flex items-center'>
                <label className='w-40 font-semibold text-gray-700'>School</label>
                <input
                    onInput={e => setSchool(e.target.value)}
                    value={school}
                    type="text"
                    className='flex-1 border border-gray-300 h-10 px-3 rounded-md outline-none'
                />
            </div>
        </div>
        <div className='mb-4'>
            <div className='flex items-center'>
                <label className='w-40 font-semibold text-gray-700'>Diploma Name</label>
                <input
                    onInput={e => setDiplomaName(e.target.value)}
                    value={diplomaName}
                    type="text"
                    className='flex-1 border border-gray-300 h-10 px-3 rounded-md outline-none'
                />
            </div>
        </div>
        <div className='mb-4'>
            <h3 className='text-lg font-semibold mb-2'>Skills</h3>
            {skills.map((skill, index) => (
                <div key={index} className='flex items-center mb-2'>
                    <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        placeholder={`Skill ${index + 1}`}
                        className='flex-1 border border-gray-300 h-10 px-3 rounded-md outline-none'
                    />
                    <button
                        onClick={() => removeSkill(index)}
                        className='ml-2 text-red-600 hover:text-red-800'
                    >
                        Remove
                    </button>
                </div>
            ))}
            <button onClick={addSkill} className='text-blue-500 hover:text-blue-700'>
                Add Skill
            </button>
        </div>

        {/* Projects */}
        <div className='mb-4'>
            <h3 className='text-lg font-semibold mb-2'>Projects</h3>
            {projects.map((project, index) => (
                <div key={index} className='mb-4'>
                    <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                        placeholder={`Project Name ${index + 1}`}
                        className='w-full border border-gray-300 h-10 px-3 rounded-md outline-none mb-2'
                    />
                    <textarea
                        value={project.description}
                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                        placeholder={`Project Description ${index + 1}`}
                        className='w-full border border-gray-300 h-24 px-3 rounded-md outline-none'
                    />
                    <button
                        onClick={() => removeProject(index)}
                        className='mt-2 text-red-600 hover:text-red-800'
                    >
                        Remove
                    </button>
                </div>
            ))}
            <button onClick={addProject} className='text-blue-500 hover:text-blue-700'>
                Add Project
            </button>
        </div>

        {/* Hobbies */}
        <div className='mb-4'>
            <h3 className='text-lg font-semibold mb-2'>Hobbies</h3>
            {hobbies.map((hobby, index) => (
                <div key={index} className='flex items-center mb-2'>
                    <input
                        type="text"
                        value={hobby.name}
                        onChange={(e) => updateHobby(index, e.target.value)}
                        placeholder={`Hobby ${index + 1}`}
                        className='flex-1 border border-gray-300 h-10 px-3 rounded-md outline-none'
                    />
                    <button
                        onClick={() => removeHobby(index)}
                        className='ml-2 text-red-600 hover:text-red-800'
                    >
                        Remove
                    </button>
                </div>
            ))}
            <button onClick={addHobby} className='text-blue-500 hover:text-blue-700'>
                Add Hobby
            </button>
        </div>

        {/* Work Experience */}
        <div className='mb-4'>
            <div className='flex items-center'>
                <label className='w-40 font-semibold text-gray-700'>Work Experience</label>
                <input
                    onInput={e => setWorkExperience(e.target.value)}
                    value={workExperience}
                    type="text"
                    className='flex-1 border border-gray-300 h-10 px-3 rounded-md outline-none'
                />
            </div>
        </div>

        {/* Languages */}
        <div className='mb-4'>
            <div className='flex items-center'>
                <label className='w-40 font-semibold text-gray-700'>Languages</label>
                <input
                    onInput={e => setLanguages(e.target.value)}
                    value={languages}
                    type="text"
                    className='flex-1 border border-gray-300 h-10 px-3 rounded-md outline-none'
                />
            </div>
        </div>

        {/* Description */}
        <div className='mb-4'>
            <div className='flex items-center'>
                <label className='w-40 font-semibold text-gray-700'>Description</label>
                <input
                    onInput={e => setDescription(e.target.value)}
                    value={description}
                    type="text"
                    className='flex-1 border border-gray-300 h-10 px-3 rounded-md outline-none'
                />
            </div>
        </div>

        {/* Job Type */}
        <div className='mb-4'>
            <div className='flex items-center'>
                <label className='w-40 font-semibold text-gray-700'>Job Type</label>
                <input
                    onInput={e => setJobType(e.target.value)}
                    value={jobType}
                    type="text"
                    className='flex-1 border border-gray-300 h-10 px-3 rounded-md outline-none'
                />
            </div>
        </div>
                        {/* Repeat the above structure for other fields */}
                        {/* Skills */}
                        {/* Projects */}
                        {/* Hobbies */}
                        {/* Work Experience */}
                        {/* Languages */}
                        {/* Description */}
                        {/* Job Type */}
                        {/* Update Button */}
                        <div className='mt-8'>
                            <button
                                onClick={updateJobSeekerProfileInfo}
                                className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'
                            >
                                Update Job Seeker Profile
                            </button>
                        </div>
                    </Popupp>
                </div>
            )}
                    

                </section>
            </div>
        </div>
    )
}

export default App