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
    const {token , email} = req.body;
     console.log("we got here1",email);
    if (!email) return res.status(400).send("Email is required");
    console.log("we got here2");
    const user = await User.findOne({ mail: email });

    if (!user) return res.status(404).send("User not found");
    
    const resetToken = crypto.randomBytes(20).toString('hex');
    console.log("we got here4",resetToken);
    user.resetToken = resetToken;
    console.log("we got here4",user.resetToken);
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    console.log("we got here4",user.resetTokenExpires);
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
        if (error) return console.log("error",error);
        res.send("Password reset link sent to your email");
    });
};

// Reset the password
export const resetPassword = async (req, res) => {
    console.log("req.body is",req.body);
    const { token, EncyptedPassword } = req.body;
    console.log("token",token);
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
    console.log("did we come here ? fatma??");
    const { userID, username } = req.query
    console.log("did we come here ? fatma??",userID, username);
    if (!userID && !username) return res.status(400).send("Bad field")

    var searchQurey;
    if (userID) searchQurey = { id: userID }
    else if (username) searchQurey = { username: username }
    console.log("did we come here ? fatma??",searchQurey);
    const user = await User.findOne(searchQurey)
    console.log("did we come here ? fatma??",user);
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
        .toFile(path +"/"+ fileName);
        console.log("the file name and the path is ",path+"/"+fileName );
    const avatarPath = `http://localhost:3030/images/${fileName}`

    user.avatar = avatarPath
    await user.save()

    setTimeout(() => {
        user.password = null
        res.send(user)
    }, 50);

}

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