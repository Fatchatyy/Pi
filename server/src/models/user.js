import { Schema, model } from 'mongoose'

const userSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    name: String,
    username: String,
    mail: String,
    phone_number:String,
    password: String,
    biography: String,
    registerDate: Date,
    role:{
        type:String,
        enum:['job_seeker','hr'],
        required:true
    },
    avatar: String,
    token: String,
    followers: Array,
    following: Array,
    bookmarks: Array,
    resetToken: String,
    resetTokenExpires: Date,
})

export default model('User', userSchema)