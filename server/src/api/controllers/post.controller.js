import Post from '../../models/post.js'
import User from '../../models/user.js'
import sharp  from 'sharp'
import { v4 }  from 'uuid'
import uid from '../../utils/createUID'
import JobSeekerProfile from '../../models/jobSeekerProfile.js';
import user from '../../models/user.js'


/* POST ENDPOINTS */


// Get all posts
export const getHome = async (req, res) => {
    const posts = await Post.find({})
    console.log("did you find any posts?", posts);
    res.send(posts.reverse())
}

// Get specific user posts.
export const getPosts = async (req, res) => {
    const { id } = req.query
    if (!id) return res.status(400).send("Bad field")

    const posts = await Post.find({ user: id })
    if (!posts || posts.length < 0) return res.status(404).send("Posts not found")

    res.send(posts)
}

// Create post with image and content text
export const createPost = async (req, res) => {
    const {  userID, content, date,description,requirements,company,location,jobType } = req.body
    console.log("data??????????????????????",userID, content, date,description,requirements,company,location,jobType );
    if (!userID || !content || !date) return res.status(400).send("Bad field")
    
    const user = await User.findOne({ id: userID })
    if (!user) return res.status(404).send("User not found")
    
    const file = req.files[0]
    if (!file) return res.status(400).send("Bad field")

    let path = process.env.FILE_STORAGE

    const fileName = `${v4()}.webp`

    await sharp(file.buffer)
        .resize(500, 500)
        .toFile(path +"/"+ fileName);
    
    console.log("path w filename", path+ "/"+fileName)
    const filePath = `http://localhost:3030/images/${fileName}`
    const createUID = uid()

    const post = new Post({
        id: createUID,
        user: userID,
        createdDate: date,
        content: content,
        image: filePath,
        description: description,
    requirements:requirements,
    company: company,
    location: location, 
    jobType:jobType
    })

    await post.save()

    res.send(post)
}

// Apply for a job offer
export const applyForJob = async (req, res) => {
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    const { postId } = req.params;
   
    const { userID } = req.params; // Assuming the user is authenticated and user ID is available
    console.log("applying for a job", userID ,"and post id", postId);
    try {
        // Find the job seeker profile (if needed for other logic)
        const User = await user.findOne({ id: userID });
        console.log("did we find the user? " ,User);
        if (!User) {
            return res.status(404).send("Job seeker profile not found");
        }
        console.log("now looking for the post");
        // Add the job seeker to the post's applicants list
        const post = await Post.findOneAndUpdate(postId, {
            $addToSet: { applicants: User._id }
        }, { new: true });
        console.log("did we find the post ", post );

        if (!post) {
            return res.status(404).send("Post not found");
        }
        console.log("now we are here");

        // Optionally, update the job seeker's profile to reflect the applied job
        await user.findOneAndUpdate(
            { id: userID },
            { $addToSet: { applications: post._id } }
        );
        console.log('now we are here finally ')
        res.status(200).json({ message: 'Applied successfully', post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}