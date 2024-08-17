import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import createPostImg from '../assets/img/createpostimg.png';
import defaultAvatar from '../assets/img/default_avatar.jpg';
import { toggleCreatePost } from '../store/user';
import { BiArrowBack } from 'react-icons/bi';
import { createPost } from '../api/request';
import '../assets/css/app.css';
import { useNavigate } from 'react-router-dom';

function App() {
    const [hasFile, setFile] = useState(null);
    const [imgSelected, setSelect] = useState(false);
    const [boxStyle, setStyle] = useState({ width: '39.5%' });
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const nextStep = () => {
        setStyle({ width: '57%' });
        setSelect(true);
    };

    const sendPost = () => {
        const content = document.getElementById('postContent').value;
        const description = document.getElementById('description').value;
        const requirements = document.getElementById('requirements').value;
        const company = document.getElementById('company').value;
        const location = document.getElementById('location').value;
        const jobType = document.getElementById('jobType').value;

        if (!content || !hasFile) return;

        let data = new FormData();
        data.append('files', hasFile);
        data.append('userID', user.id);
        data.append('content', content);
        data.append('date', Date.now());
        data.append('description', description);
        data.append('requirements', requirements);
        data.append('company', company);
        data.append('location', location);
        data.append('jobType', jobType);

        createPost({ data: data, token: user.token }, () => {
            navigate('#');
            dispatch(toggleCreatePost());
            reset();
        });
    };

    const reset = () => {
        setStyle({ width: '39.5%' });
        setFile(null);
        setSelect(null);
        document.getElementById('postContent').value = '';
        document.getElementById('description').value = '';
        document.getElementById('requirements').value = '';
        document.getElementById('company').value = '';
        document.getElementById('location').value = '';
        document.getElementById('jobType').value = 'internship';
    };

    const SelectFileComponent = () => (
        <div className="grow w-full flex items-center justify-center flex-col gap-6">
            {!hasFile ? (
                <>
                    <img src={createPostImg} width="80" />
                    <span className="font-thin text-[22px]">drag photos and videos here</span>
                    <div className="relative">
                        <button className="bg-[#0095f6] w-[125px] text-sm font-semibold rounded-[3px] flex justify-center items-center h-8 text-white">
                            Select from Computer
                        </button>
                        <input
                            onInput={(e) => setFile(e.target.files[0])}
                            type="file"
                            className="absolute top-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </>
            ) : (
                <div className="relative grow w-full mt-11">
                    <img
                        src={URL.createObjectURL(hasFile)}
                        id="imgPreview"
                        className="object-cover w-full h-full"
                    />
                </div>
            )}
        </div>
    );

    const ButtonComponent = () => {
        if (!hasFile && !imgSelected) return null;
        if (hasFile && imgSelected)
            return (
                <button onClick={sendPost} className="text-[#0095f6] text-sm font-semibold">
                    Share
                </button>
            );
        if (hasFile)
            return (
                <button
                    onClick={nextStep}
                    className="text-[#0095f6] absolute text-sm font-semibold right-4"
                >
                    Next
                </button>
            );
    };

    const CreatePost = () => (
        <div className="relative flex items-center justify-center grow w-full">
            <div className="w-full h-full relative flex items-center justify-center">
                <img
                    src={URL.createObjectURL(hasFile)}
                    id="imgPreview"
                    className="object-cover w-full h-full"
                />
            </div>
            <div className="bg-white w-[45%] h-full border-l border-[#DBDBDB] flex flex-col py-4 mt-24">
                <div className="flex items-center justify-start gap-3 w-full ml-4">
                    <img src={user.avatar ?? defaultAvatar} width="28" className="rounded-full" />
                    <span className=" font-bold">{user.username}</span>
                </div>
                <textarea
                    id="postContent"
                    cols="30"
                    rows="2"
                    className="px-4 mt-4 outline-none"
                    placeholder="Write a caption.."
                />
                <textarea
                    id="description"
                    className="px-4 mt-4 outline-none"
                    placeholder="Description"
                    rows="2"
                />
                <textarea
                    id="requirements"
                    className="px-4 mt-4 outline-none"
                    placeholder="Requirements"
                    rows="2"
                />
                <textarea
                    id="company"
                    className="px-4 mt-4 outline-none"
                    placeholder="Company"
                    rows="2"
                />
                <textarea
                    id="location"
                    className="px-4 mt-4 outline-none"
                    placeholder="Location"
                    rows="2"
                />
                <select
                    id="jobType"
                    className="px-4 mt-4 outline-none"
                >
                    <option value="internship">Internship</option>
                    <option value="fulltime">Full-time</option>
                </select>
            </div>
        </div>
    );

    if (user.showCreatePost)
        return (
            <div className="fixed z-30 h-screen w-full flex items-center justify-center animate-box">
                <div onClick={() => dispatch(toggleCreatePost())} className="h-full w-full bg-black bg-opacity-60"></div>
                <div
                    style={boxStyle}
                    className="bg-white h-[82%] absolute z-40 rounded-[10px] flex flex-col items-center justify-center overflow-hidden transition-all"
                >
                    <div className="h-11 flex items-center justify-between bg-white border-b border-[#DBDBDB] w-full px-4 absolute z-50 top-0">
                        <button onClick={reset}>
                            <BiArrowBack size={30} />
                        </button>
                        <span className="font-semibold">Create new post</span>
                        <div></div>
                        <ButtonComponent />
                    </div>
                    {hasFile && imgSelected ? <CreatePost /> : <SelectFileComponent />}
                </div>
            </div>
        );
}

export default App;
