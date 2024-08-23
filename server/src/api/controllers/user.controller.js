import decrypt from '../../utils/decrypt.js'
import User from '../../models/user.js'
import createToken from '../../utils/createToken.js'
import uid from '../../utils/createUID'
import sharp from 'sharp'
import { v4 } from 'uuid'
import fs from 'fs'
import crypto from 'crypto';
import mailgun from 'mailgun-js'; // Mailgun API client
import dotenv from 'dotenv';
import JobSeekerProfile from '../../models/jobSeekerProfile.js';

dotenv.config();
const mg = mailgun({
    apiKey: '813582bf9d1f8bcb6376532f85c0895c-911539ec-ad3798a8', // Replace with your Mailgun API key
    domain: 'sandboxc99600edc0b545439e6875e78cea56ef.mailgun.org' // Replace with your Mailgun domain
});

/* USER ENDPOINTS */

// Generate a password reset token and send it via email
export const requestPasswordReset = async (req, res) => {
    console.log("we got here1");
    //const { email } = req.body;
    const { token, email } = req.body;
    console.log("we got here1", email);
    if (!email) return res.status(400).send("Email is required");
    console.log("we got here2");
    const user = await User.findOne({ mail: email });

    if (!user) return res.status(404).send("User not found");

    const resetToken = crypto.randomBytes(20).toString('hex');
    console.log("we got here4", resetToken);
    user.resetToken = resetToken;
    console.log("we got here4", user.resetToken);
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    console.log("we got here4", user.resetTokenExpires);
    await user.save();
    console.log("we got here4");
    // Send reset token to user via email
    const frontEndUrl = process.env.FRONTEND_URL;
    const mailOptions = {
        from: 'fatchatyy@gmail.com',
        to: user.mail,
        subject: 'Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${frontEndUrl}/reset-password/${resetToken}\n\nIf you did not request this, please ignore this email.\n`
    };

    mg.messages().send(mailOptions, (error, body) => {
        if (error) return console.log("error", error);
        res.send("Password reset link sent to your email");
    });
};

// Reset the password
export const resetPassword = async (req, res) => {
    console.log("req.body is", req.body);
    const { token, EncyptedPassword } = req.body;
    console.log("token", token);
    console.log("newPassword", EncyptedPassword)
    if (!token || !EncyptedPassword) return res.status(400).send("Token and new password are required");

    const user = await User.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).send("Password reset token is invalid or has expired");

    user.password = EncyptedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();
    let NewToken = createToken(user);
    user.token = NewToken;
    user.password = null
    res.send("Password has been updated");
};

// Get user profile information
export const getUser = async (req, res) => {

    const { userID, username } = req.query
    if (!userID && !username) return res.status(400).send("Bad field")

    var searchQurey;
    if (userID) searchQurey = { id: userID }
    else if (username) searchQurey = { username: username }

    const user = await User.findOne(searchQurey)
    if (!user) return res.status(404).send("User not found")
    user.password = null

    res.send(user)
}

// Login with username & password
export const login = async (req, res) => {

    const { username, password } = req.body

    if (!username || !password) return res.status(400).send("Bad field")

    const dUsername = decrypt(username)
    const dPassword = decrypt(password)

    const user = await User.findOne({ mail: dUsername })

    if (!user) return res.status(404).send("User not found")
    if (dPassword !== decrypt(user.password))
        return res.status(401).send('Invalid auth')
    let token = createToken(user)
    user.token = token
    user.password = null
    res.send(user)
}

// Create account
export const register = async (req, res) => {
    const { mail, name, username, password, registerDate, role } = req.body
    if (!mail || !name || !username || !password || !registerDate || !role)
        return res.status(400).send("Bad field.");

    const checkUsername = await User.findOne({ username: decrypt(username) })
    if (checkUsername) return res.status(500).send("Username taken")

    const createID = uid()
    console.log("the role is here", role);
    const user = new User({
        id: createID,
        name,
        username: decrypt(username),
        mail,
        password,
        registerDate,
        role
    })

    await user.save()

    let token = createToken(user)
    user.token = token
    user.password = null
    console.log("user registered successfully");
    res.send(user)
}

// Update user information
export const updateUser = async (req, res) => {
    const data = req.body
    if (!data) return res.status(400).send("Bad field.");

    const user = await User.findOne({ id: data.id })
    if (!user) return res.status(404).send("User not found");


    for (const el of Object.keys(data)) {
        user[el] = data[el]
    }

    user.save()

    setTimeout(() => {
        user.password = null
        res.send(user)
    }, 50);
}
export const updateJobSeekerProfile = async (req, res) => {
    try {
        console.log('reqbody', req.body);
        const  data = req.body;
        const { userID } = req.params;

        console.log("data and token and userID2", data)
        console.log("data and token and userID3", userID)
        if (!userID) {
            return res.status(400).send("User ID is required");
        }
        // Find the User document by userID
        const user = await User.findOne({ id: userID });
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Use the user's _id for querying the job seeker profile
        const userObjectId = user._id;
        console.log('we have userid')

        // Find the job seeker profile by userId
        let profile = await JobSeekerProfile.findOne({ user_id: userObjectId });
        console.log("we have profile", profile)
        if (!profile) {
            console.log('we dont have profile')
            // If profile does not exist, create a new one
            profile = new JobSeekerProfile({ user_id: userObjectId, ...data });
            console.log('added profile')
        } else {
            // Update existing profile with provided data
            console.log('here')
            for (const key of Object.keys(data)) {
                console.log('here1',key)
                if (key in profile) {
                    console.log('here2',key)
                    profile[key] = data[key];
                }
            }
        }
        console.log('here3')
        // Save the updated or new profile
        await profile.save();
        console.log('here4')
        // Send a response with the updated profile
        res.send(profile);
        console.log('here5')
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};
// Upload profile picture (if have old avatar delete this)
export const uploadAvatar = async (req, res) => {
    const { id } = req.body
    if (!id) return res.status(400).send("Bad field.");

    const file = req.files[0]
    if (!file) return res.status(400).send("Bad field.");

    const user = await User.findOne({ id: id })
    if (!user) return res.status(404).send("User not found")

    let path = process.env.FILE_STORAGE

    try {
        let isHasPhoto = user.avatar
        if (isHasPhoto) {
            const oldPhotoFileName = isHasPhoto.split("/").pop()
            fs.unlinkSync(path + oldPhotoFileName);
        }
    } catch (error) {
        console.log("Old photo could not be deleted")
    }

    const fileName = `${v4()}.webp`
    console.log("the file name is", fileName)
    await sharp(file.buffer)
        .resize(300, 300)
        .toFile(path + "/" + fileName);
    console.log("the file name and the path is ", path + "/" + fileName);
    const avatarPath = `http://localhost:3030/images/${fileName}`

    user.avatar = avatarPath
    await user.save()

    setTimeout(() => {
        user.password = null
        res.send(user)
    }, 50);

}

export const getJobSeekerProfile = async (req, res) => {
    try {
        console.log("fetching job seeker");
        const userId = req.params.userId;
        console.log("fetching job seeker1",userId);
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Use the user's _id for querying the job seeker profile
        const userObjectId = user._id;
        // Fetch the job seeker profile from the database
        const jobSeeker = await JobSeekerProfile.findOne({ user_id: userObjectId } ).exec();
        console.log("fetching job seeker2",jobSeeker);
        if (!jobSeeker) {
            return res.status(404).json({ message: 'Job seeker not found' });
        }
        console.log("fetching job seeker3");
        // Send the job seeker profile data as a response
        res.status(200).json(jobSeeker);
    } catch (error) {
        console.error('Error fetching job seeker profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Follow a user
export const followUser = async (req, res) => {
    const { userID, followToID } = req.body
    if (!userID || !followToID) return res.status(400).send("Bad field.");

    const user = await User.findOne({ id: userID })
    if (!user) return res.status(404).send("User not found")

    const followTo = await User.findOne({ id: followToID })
    if (!followTo) return res.status(404).send("User not found")

    followTo.followers.push(userID)
    user.following.push(followToID)
    followTo.save()
    user.save()

    res.send({
        user: user.following,
        followTo: followTo.followers
    })
}

// Unfollow a user
export const unfollowUser = async (req, res) => {
    const { userID, followToID } = req.body
    if (!userID || !followToID) return res.status(400).send("Bad field.");

    const user = await User.findOne({ id: userID })
    if (!user) return res.status(404).send("User not found")

    const followTo = await User.findOne({ id: followToID })
    if (!followTo) return res.status(404).send("User not found")

    followTo.followers = followTo.followers.filter(id => id !== userID)
    user.following = user.following.filter(id => id !== followToID)
    followTo.save()
    user.save()

    res.send({
        user: user.following,
        followTo: followTo.followers
    })
}

// Delete current profile picture
export const removeAvatar = async (req, res) => {
    const { id } = req.body
    if (!id) return res.status(400).send("Bad field.");

    const user = await User.findOne({ id: id })
    if (!user) return res.status(404).send("User not found");

    try {
        let isHasPhoto = user.avatar
        if (isHasPhoto) {
            const oldPhotoFileName = isHasPhoto.split("/").pop()
            fs.unlinkSync(process.env.FILE_STORAGE + oldPhotoFileName);
            user.avatar = null
            user.save()
        }
    } catch (error) {
        console.log("Avatar could not be deleted.")
    }

    res.send("OK")
}

// Delete user follower
export const removeFollower = async (req, res) => {
    const { id, removeID } = req.body
    if (!id) return res.status(400).send("Bad field.");

    const user = await User.findOne({ id: id })
    if (!user) return res.status(404).send("User not found");

    const removeUser = await User.findOne({ id: removeID })
    if (!removeUser) return res.status(404).send("User not found");

    user.followers = user.followers.filter(i => i !== removeID)
    removeUser.following = removeUser.following.filter(i => i !== id)
    user.save()
    removeUser.save()

    res.send({
        user: user.followers,
        removeUser: removeUser.following
    })
}