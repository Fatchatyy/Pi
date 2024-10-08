import { Router } from "express";
import multer  from "multer"
import {
    login, 
    register,
    getUser,
    uploadAvatar,
    updateUser,
    followUser,
    unfollowUser,
    removeAvatar,
    removeFollower,
    requestPasswordReset,
    resetPassword,
    updateJobSeekerProfile,
    getJobSeekerProfile,
    storeToken,
    retrieveToken,
    handleUserConnection,
    handleUserDisconnection,
    getUserSocketId
} from '../controllers/user.controller'
import {
    createPost,
    getHome,
    getPosts,
    applyForJob,
    toggleBookmark,
    getBookmarkedPosts,
    generateNotificationsForUser,
    getNotificationsForUser,
    getApplicants,
    updateApplicationStatus,
    scheduleInterview,
    generateAuthUrl,handleAuthCallback,createEvent
} from '../controllers/post.controller'
import auth from '../middleware/auth.js'

const router = Router()
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", (req, res) => {
    res.send("just dev.")
})

router.post("/login", login)
router.post("/register", register)
router.post("/create-post", auth, upload.array('files'), createPost)
router.post("/upload-avatar", auth ,upload.array('files'), uploadAvatar)
router.post("/update-user", auth, updateUser)
router.post("/follow", auth, followUser)
router.post("/unfollow", auth, unfollowUser)
router.post("/remove-avatar", auth, removeAvatar)
router.post("/remove-follower", auth, removeFollower)
router.post('/jobs/apply/:postId/:userID',auth ,applyForJob); 
router.post('/update-job-seeker-profile/:userID',auth, updateJobSeekerProfile);
router.post('/toggle-bookmark/:userId/:postId',auth, toggleBookmark);
router.post('/generate-notification/:userId',auth,generateNotificationsForUser)
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/store-token', storeToken);
router.post('/update-status',updateApplicationStatus)
router.post('/schedule-interview', scheduleInterview);
router.post('/userConnection',handleUserConnection);
router.post('/userDisconnection',handleUserDisconnection);


router.get('/retrieve-token', retrieveToken);
router.get("/home", getHome)
router.get("/user", getUser)
router.get("/get-posts", getPosts)
router.get('/job-seeker-profile/:userId',getJobSeekerProfile);
router.get('/bookmarked-posts/:userID', getBookmarkedPosts);
router.get('/get-notification/:userId',getNotificationsForUser);
router.get('/applicants',auth,getApplicants);
router.get('/getSocketId/:userID',getUserSocketId)
router.get('/auth', generateAuthUrl);
router.get('/auth/callback', handleAuthCallback);
router.post('/create-event', createEvent);

export default router;