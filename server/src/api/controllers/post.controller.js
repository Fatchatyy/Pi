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
    console.log("we r here");
    const { postId, userID } = req.params; // Assuming the user is authenticated and userID is available
    
    try {
        // Find the job seeker profile
        const User = await user.findOne({ id: userID });
        console.log("we r here1",User);
        if (!User) {
            return res.status(404).send("Job seeker profile not found");
        }
        console.log("we r here2");
        const post = await Post.findOne({ id: postId });
        console.log("we r here3", post);
        if (!post) {
            return res.status(404).send("Post not found");
        }
        console.log("we r here3,1");
        const hasApplied = post.applicants.some(applicant => applicant.user.equals(User._id));
        console.log("has applied or not", hasApplied);
        if (hasApplied) {
            return res.status(200).json({ message: "You have already applied for this job." });
        }
        // Add the job seeker to the post's applicants list with a default status of "on hold"
        await Post.findOneAndUpdate(
            { id: postId }, 
            { 
                $addToSet: { 
                    applicants: { user: User._id, status: 'on hold' } // Adding user with "on hold" status
                }
            }, 
            { new: true }
        );

        console.log("we r here4");

        // Optionally, update the job seeker's profile to reflect the applied job
        await user.findOneAndUpdate(
            { id: userID },
            { 
                $addToSet: { 
                    applications: { post: post._id, status: 'on hold' } // Tracking status on user side as well
                }
            }
        );
        console.log("we r here5");
        res.status(200).json({ message: 'Applied successfully', post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const toggleBookmark = async (req, res) => {
    try {
        const { userId, postId } = req.params; // Get userId and postId from request
        console.log("got the params", userId, postId);
        // Find the user
        const user = await User.findOne({ id: userId });
        console.log("got the user", user);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if the post is already bookmarked
        const isBookmarked = user.bookmarks.includes(postId);
        console.log("isbookmarked", isBookmarked);
        if (isBookmarked) {
            // If already bookmarked, remove it
            user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId);
            console.log("here");
        } else {
            // Otherwise, add the bookmark
            user.bookmarks.push(postId);
            console.log("here1")
        }

        // Save the user with updated bookmarks
        await user.save();
        console.log("finally")
        return res.status(200).json({ message: isBookmarked ? 'Bookmark removed' : 'Bookmark added', bookmarks: user.bookmarks });
    } catch (error) {
        return res.status(500).json({ message: 'Error handling bookmark', error });
    }
};
export const getBookmarkedPosts = async (req, res) => {
    try {
        console.log("pls tell me we r here");
        const { userID }= req.params; // Get userId from request params
        console.log("Fetching bookmarked posts for user:", userID);

        // Find the user
        const user = await User.findOne({ id: userID }).populate('bookmarks');
        console.log("Found user:", user);

        if (!user) return res.status(404).json({ message: 'User not found' });
        console.log("bonjour1");
        // Get the bookmarked posts from the user
        const postIds = user.bookmarks; // Assuming `bookmarks` is an array of post IDs
        console.log("bonjour2",postIds);
        const bookmarkedPosts = await Post.find({ 'id': { $in: postIds } });
        if (!bookmarkedPosts || bookmarkedPosts.length === 0) {
            return res.status(404).json({ message: 'No bookmarked posts found' });
        }
        console.log("bonjour3",bookmarkedPosts);
        // Return the bookmarked posts
        return res.status(200).json( bookmarkedPosts );
    } catch (error) {
        console.error('Error fetching bookmarked posts:', error);
        return res.status(500).json({ message: 'Error fetching bookmarked posts', error });
    }
};
