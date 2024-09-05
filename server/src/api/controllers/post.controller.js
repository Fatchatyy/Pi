import Post from '../../models/post.js'
import User from '../../models/user.js'
import sharp from 'sharp'
import { v4 } from 'uuid'
import uid from '../../utils/createUID'
import JobSeekerProfile from '../../models/jobSeekerProfile.js';
import interview from '../../models/interview.js'
import user from '../../models/user.js'
import notifications from '../../models/notifications.js'
import oauth2Client from '../middleware/googleAuth.js'
import { google } from 'googleapis';

// Generate the authorization URL
export const generateAuthUrl = (req, res) => {
    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar']
    });
    res.redirect(authorizationUrl);
};

// Handle OAuth2 callback
export const handleAuthCallback = async (req, res) => {
    console.log("here5")
    const { code } = req.query;
    console.log("here6")
    try {
        console.log("here6")
        const { tokens } = await oauth2Client.getToken(code);
        console.log("here7")
        oauth2Client.setCredentials(tokens);

        // Store tokens securely (e.g., in a database)
        console.log('Access Token:', tokens.access_token);
        console.log('Refresh Token:', tokens.refresh_token);

        res.redirect('http://localhost:3001/?token=1723856846737'); // Redirect to your app's dashboard or another page
    } catch (error) {
        console.error('Error exchanging code for tokens:', error);
        res.status(500).send('Error during authentication');
    }
};

export const createEvent = async (interviewData) => {
    console.log("here2");

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    console.log("here3");

    // Convert scheduledDate to ISO string
    const startDateTime = new Date(interviewData.scheduledDate).toISOString();
    const endDateTime = new Date(new Date(interviewData.scheduledDate).getTime() + 30 * 60 * 1000).toISOString(); // 30-minute duration

    const event = {
        summary: `Interview with ${interviewData.jobseekerName}`,
        description: interviewData.notes || 'No additional notes',
        start: {
            dateTime: startDateTime,
            timeZone: 'America/New_York',
        },
        end: {
            dateTime: endDateTime,
            timeZone: 'America/New_York',
        },
        attendees: [
            { email: interviewData.jobseekerEmail },
            { email: interviewData.hrEmail }
        ],
    };

    try {
        console.log("here4");
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });
        console.log('Event created:', response.data.htmlLink);
        return { success: true };
    } catch (error) {
        console.error('Error creating event in Google Calendar:', error);
        // Handle the error appropriately
        throw new Error('Error creating event');
    }
};


/* POST ENDPOINTS */


// Get all posts
export const getHome = async (req, res) => {
    const posts = await Post.find({})
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
    const { userID, content, date, description, requirements, company, location, jobType } = req.body
    if (!userID || !content || !date) return res.status(400).send("Bad field")

    const user = await User.findOne({ id: userID })
    if (!user) return res.status(404).send("User not found")

    const file = req.files[0]
    if (!file) return res.status(400).send("Bad field")

    let path = process.env.FILE_STORAGE

    const fileName = `${v4()}.webp`

    await sharp(file.buffer)
        .resize(500, 500)
        .toFile(path + "/" + fileName);

    const filePath = `http://localhost:3030/images/${fileName}`
    const createUID = uid()

    const post = new Post({
        id: createUID,
        user: userID,
        createdDate: date,
        content: content,
        image: filePath,
        description: description,
        requirements: requirements,
        company: company,
        location: location,
        jobType: jobType
    })

    await post.save()

    res.send(post)
}

// Apply for a job offer
export const applyForJob = async (req, res) => {
    const { postId, userID } = req.params; // Assuming the user is authenticated and userID is available
    try {
        // Find the job seeker profile
        const User = await user.findOne({ id: userID });
        if (!User) {
            return res.status(404).send("Job seeker profile not found");
        }
        const post = await Post.findOne({ id: postId });
        if (!post) {
            return res.status(404).send("Post not found");
        }
        const hasApplied = post.applicants.some(applicant => applicant.user.equals(User._id));
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
        // Optionally, update the job seeker's profile to reflect the applied job
        await user.findOneAndUpdate(
            { id: userID },
            {
                $addToSet: {
                    applications: { post: post._id, status: 'on hold' } // Tracking status on user side as well
                }
            }
        );
        res.status(200).json({ message: 'Applied successfully', post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const toggleBookmark = async (req, res) => {
    try {
        const { userId, postId } = req.params; // Get userId and postId from request
        // Find the user
        const user = await User.findOne({ id: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if the post is already bookmarked
        const isBookmarked = user.bookmarks.includes(postId);
        if (isBookmarked) {
            // If already bookmarked, remove it
            user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId);
        } else {
            // Otherwise, add the bookmark
            user.bookmarks.push(postId);
        }
        // Save the user with updated bookmarks
        await user.save();
        return res.status(200).json({ message: isBookmarked ? 'Bookmark removed' : 'Bookmark added', bookmarks: user.bookmarks });
    } catch (error) {
        return res.status(500).json({ message: 'Error handling bookmark', error });
    }
};
export const getBookmarkedPosts = async (req, res) => {
    try {
        const { userID } = req.params; // Get userId from request params
        // Find the user
        const user = await User.findOne({ id: userID }).populate('bookmarks');
        if (!user) return res.status(404).json({ message: 'User not found' });
        // Get the bookmarked posts from the user
        const postIds = user.bookmarks; // Assuming `bookmarks` is an array of post IDs
        const bookmarkedPosts = await Post.find({ 'id': { $in: postIds } });
        if (!bookmarkedPosts || bookmarkedPosts.length === 0) {
            return res.status(404).json({ message: 'No bookmarked posts found' });
        }
        // Return the bookmarked posts
        return res.status(200).json(bookmarkedPosts);
    } catch (error) {
        console.error('Error fetching bookmarked posts:', error);
        return res.status(500).json({ message: 'Error fetching bookmarked posts', error });
    }
};
export const generateNotificationsForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        // Find the user and their skills
        const user = await User.findOne({ id: userId });
        if (!user) throw new Error('User not found');

        const userObjectId = user._id;
        let jobseeker = await JobSeekerProfile.findOne({ user_id: userObjectId }).populate('skills');

        // Fetch job offers and their requirements
        const jobOffers = await Post.find({});

        // Filter job offers that match user's skills
        const notificationsToSave = [];
        for (const jobOffer of jobOffers) {
            const requirementsArray = jobOffer.requirements.split(',').map(req => req.trim());
            console.log("requirmeent array",requirementsArray)
            const matches = jobseeker.skills.some(skill => requirementsArray.includes(skill));
            console.log("matches or no", matches);
            if (matches) {
                // Check if the notification already exists
                const existingNotification = await notifications.findOne({
                    userID: userId,
                    jobOfferID: jobOffer._id,
                    message: `Your skill matches the requirements for the job offer titled: ${jobOffer.title}`
                });
                console.log("exits notif or no? ", existingNotification)
                // If it doesn't exist, add it to the array to be saved
                if (!existingNotification) {
                    notificationsToSave.push({
                        userID: userId,
                        message: `Your skill matches the requirements for the job offer titled: ${jobOffer.title}`,
                        jobOfferID: jobOffer._id
                    });
                }
                console.log('not existing this notif has been added ', existingNotification)
            }
        }

        // Save new notifications if any
        if (notificationsToSave.length > 0) {
            await notifications.insertMany(notificationsToSave);
        }

        return notificationsToSave;
    } catch (error) {
        console.error('Error generating notifications:', error);
        throw error;
    }
};
export const getNotificationsForUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const userID = userId;
        console.log("the user idis", userID);
        const notificationss = await notifications.find({ userID }).populate('jobOfferID');
        console.log("notifications found", notificationss)
        if (!notificationss.length) return res.status(404).json({ message: 'No notifications found' });
        return res.status(200).json(notificationss);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ message: 'Error fetching notifications', error });
    }
};
{/* export const getApplicants = async (req, res) => {
    try {
        const { userId } = req.query;
        console.log('req user is', userId);
        const user = await User.findOne({ id: userId });
        
        if (!user) {
            return res.status(404).send("User not found");
        }
        const userobjId = user._id
        console.log("retrieving2",userobjId)
        // Find posts created by the HR user
        const posts = await Post.find({ user: userId }).populate({
            path: 'applicants.user',
            select: 'name username mail',
            populate: {
                path: 'jobSeekerProfile', // Populate the jobSeekerProfile
                select: 'location school diploma_name skills projects work_experience languages hobbies description job_type',
            }
        }).exec();
        console.log("retrieving3",posts)
        // Transform posts to include applicant info and job seeker profile
        const postsWithApplicants = posts.map(post => ({
            ...post._doc,
            applicants: post.applicants.map(app => ({
                user: {
                    name: app.user.name,
                    username: app.user.username,
                    mail: app.user.mail,
                    profile: app.user.jobSeekerProfile // Including profile details
                },
                status: app.status
            }))
        }));
        console.log('the posts with applicantsssssssss', postsWithApplicants)

        res.json(postsWithApplicants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}; */}
export const getApplicants = async (req, res) => {
    try {
        const { userId } = req.query;
        console.log('Request user ID:', userId);

        // Find posts created by the user and populate applicant details
        const posts = await Post.find({ user: userId })
            .populate({
                path: 'applicants.user', // Populate user details for each applicant
                select: 'name username mail phone_number avatar' // Select only the fields needed
            })
            .exec();


        // Check if posts were found
        if (!posts.length) {
            return res.status(404).json({ message: 'No posts found for this user' });
        }

        // Extract user IDs from applicants
        const userIds = posts.flatMap(post => post.applicants.map(app => app.user._id));

        // Fetch profiles for these users
        const profiles = await JobSeekerProfile.find({ user_id: { $in: userIds } })
            .exec();

        // Create a map of user profiles
        const profilesMap = profiles.reduce((map, profile) => {
            map[profile.user_id.toString()] = profile;
            return map;
        }, {});

        // Transform posts to include detailed applicant info
        const postsWithApplicants = posts.map(post => ({
            ...post._doc,
            applicants: post.applicants.map(app => ({
                user: {
                    name: app.user.name,
                    username: app.user.username,
                    mail: app.user.mail,
                    phone_number: app.user.phone_number, // Include phone number
                    avatar: app.user.avatar,
                    profile: profilesMap[app.user._id.toString()] || {} // Include profile details if available
                },
                status: app.status,
            })),
        }));



        // Send the posts with applicants as the response
        res.json(postsWithApplicants);
    } catch (error) {
        console.error('Error retrieving posts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const updateApplicationStatus = async (req, res) => {
    try {
        console.log('bonjour', req.body)
        const { applicantsId, newStatus } = req.body;
        console.log('bonjour', applicantsId, newStatus)
        // Validate the newStatus
        const validStatuses = ['on hold', 'accepted', 'declined'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        console.log('bonjour', !validStatuses.includes(newStatus))
        // Find the post containing the application
        const post = await Post.findOne({ 'applicants.user': applicantsId });
        console.log('bonjour2', post)
        if (!post) {
            return res.status(404).json({ message: 'Post or application not found' });
        }
        console.log('bonjour3')
        // Find the index of the application to update
        const application = post.applicants.find(app => app.user.toString() === applicantsId);
        console.log('bonjour4', application)
        if (!application) {
            return res.status(404).json({ message: 'Application not found in the post' });
        }

        // Update the status of the application
        application.status = newStatus;
        console.log("applicationnew status", application.status)
        // Save the updated post
        await post.save();

        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const scheduleInterview = async (req, res) => {
    try {

        const { postId, jobSeekerId, hrId, interviewDate, notes } = req.body;
        // Check if the jobseeker has been accepted for the job application
        console.log(postId, jobSeekerId, hrId, interviewDate, notes);
        const post = await Post.findById(postId)
            .populate('applicants.user', 'status')
            .exec();

        console.log("we found the posts", post)
        const user = await User.findOne({ id: hrId });
        if (!user) {
            return res.status(404).send("User not found");
        }
        const userobjId = user._id
        console.log("user ?", user)
        const existingInterview = await interview.findOne({
            jobseeker: jobSeekerId,
            post: postId,
        });
        console.log("existing interview1 ?", existingInterview)
        if (existingInterview) {
            return res.status(200).json({
                message: 'Interview already scheduled for this job seeker and post.'
            });
        }
        console.log("existing interview ?", existingInterview);

        // Create a new interview
        const newInterview = new interview({
            hr: userobjId,
            jobseeker: jobSeekerId,
            post: postId,
            scheduledDate: interviewDate,
            notes
        });
        console.log('new interview', newInterview)
        const userJS = await User.findOne({ _id: jobSeekerId });
        if (!userJS) {
            return res.status(404).send("User not found");
        }
        console.log("name and email",userJS.name, userJS.mail );
        
        // Create a Google Calendar event
        const interviewData = {
            jobseekerName: userJS.name, // Replace with actual jobseeker name
            jobseekerEmail:userJS.mail, // Replace with actual jobseeker email
            hrEmail: user.mail, // Replace with actual HR email
            scheduledDate: interviewDate,
            notes
        };
        console.log('creating event');
        createEvent(interviewData)
    .then(response => {
        console.log('Event creation response:', response);
    })
    .catch(error => {
        console.error('Error creating event:', error);
    });

        console.log('creating event ended');
        // Save the interview to the database
        const savedInterview = await newInterview.save();
        console.log("saved interview", savedInterview)
        return res.status(201).json({
            message: 'Interview scheduled successfully',
            interview: savedInterview
        });
    } catch (error) {
        console.error('Error scheduling interview:', error);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
};