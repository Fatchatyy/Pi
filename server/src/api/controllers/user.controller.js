import decrypt from '../../utils/decrypt.js'
import User from '../../models/user.js'
import createToken from '../../utils/createToken.js'
import uid from '../../utils/createUID'
import sharp from 'sharp'
import { v4 } from 'uuid'
import fs from 'fs'
import Token from '../../models/token.js';
import crypto from 'crypto';
import mailgun from 'mailgun-js'; // Mailgun API client
import dotenv from 'dotenv';
import JobSeekerProfile from '../../models/jobSeekerProfile.js';

dotenv.config();
const mg = mailgun({
    apiKey: process.env.MAILGUN_APIKEY, 
    domain:  process.env.MAILGUN_DOMAIN
});
let userSocketMap = {}; // In-memory store for user-socket mappings
/* USER ENDPOINTS */


// When a user connects
export const handleUserConnection = async (req, res) => {
  const { userId, socketId } = req.body; // User ID obtained when user logs in

  userSocketMap[userId] = socketId;
  console.log('all the socket id now', userSocketMap);
  res.status(200).send({ success: true });
};
export const getUserSocketId = async (req, res) => {
    const { userID } = req.params;
    const socketId = userSocketMap[userID];
    console.log("reqparams", req.params)
    if (socketId) {
      res.status(200).send({ socketId });
    } else {
      res.status(404).send({ error: 'User not found' });
    }
  };

// When a user disconnects
export const handleUserDisconnection = async (req, res) => {
  const { userId } = req.body;
  
  delete userSocketMap[userId];
  res.status(200).send({ success: true });
};

// Generate a password reset token and send it via email
export const requestPasswordReset = async (req, res) => {
    //const { email } = req.body;
    const { token, email } = req.body;
    if (!email) return res.status(400).send("Email is required");
    const user = await User.findOne({ mail: email });
    if (!user) return res.status(200).send("User not found");
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();
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
    const { token, EncyptedPassword } = req.body;
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

    if (!username || !password) return res.status(200).send("Bad field")

    const dUsername = decrypt(username)
    const dPassword = decrypt(password)

    const user = await User.findOne({ mail: dUsername })

    if (!user) return res.status(200).send("User not found")
    if (dPassword !== decrypt(user.password))
        return res.status(200).send('Incorrect password')
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
        const data = req.body;
        const { userID } = req.params;
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
        // Find the job seeker profile by userId
        let profile = await JobSeekerProfile.findOne({ user_id: userObjectId });
        if (!profile) {
            // If profile does not exist, create a new one
            profile = new JobSeekerProfile({ user_id: userObjectId, ...data });
        } else {
            // Update existing profile with provided data
            for (const key of Object.keys(data)) {
                if (key in profile) {
                    profile[key] = data[key];
                }
            }
        }
        // Save the updated or new profile
        await profile.save();
        // Send a response with the updated profile
        res.send(profile);
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
    await sharp(file.buffer)
        .resize(300, 300)
        .toFile(path + "/" + fileName);
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
        const userId = req.params.userId;
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Use the user's _id for querying the job seeker profile
        const userObjectId = user._id;
        // Fetch the job seeker profile from the database
        const jobSeeker = await JobSeekerProfile.findOne({ user_id: userObjectId }).exec();
        if (!jobSeeker) {
            return res.status(404).json({ message: 'Job seeker not found' });
        }
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
export const storeToken = async (req, res) => {
    const { EncyptedPassword, token } = req.body;
    console.log("userId", EncyptedPassword, "token", token)
    if (!EncyptedPassword || !token) return res.status(400).send("User ID and token are required");
    console.log("bjr",EncyptedPassword.id)
    const user = await User.findOne({ id: EncyptedPassword.id });
    if (!user) {
        return res.status(404).send("User not found");
    }
    // Use the user's _id for querying the job seeker profile
    const userId = user._id;
    console.log("userId ", userId);
    // Find the job seeker profile by userId
    try {
        // Find the user by userId
        const user = await User.findOne({ _id :userId});
        console.log("bjr1")
        if (!user) return res.status(404).send("User not found");
        console.log("bjr2")
        // Upsert token: if a record exists, update it; otherwise, create a new one
        await Token.findOneAndUpdate({ userId }, { token }, { upsert: true, new: true });
        console.log("bjr3")
        res.send("Token stored successfully");
    } catch (error) {
        console.error("Error storing token:", error);
        res.status(500).send("Error storing token");
    }
};
export const retrieveToken = async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).send("User ID is required");

    const user = await User.findOne({ id: userId });
    if (!user) {
        return res.status(404).send("User not found");
    }
    const userobjId = user._id
    try {
        // Find the token for the given userId
        const tokenRecord = await Token.findOne({ userId: userobjId });
        if (!tokenRecord) return res.status(404).send("Token not found");
        res.json({ token: tokenRecord.token });
    } catch (error) {
        console.error("Error retrieving token:", error);
        res.status(500).send("Error retrieving token");
    }
};
