import { Schema, model } from'mongoose';
import mongoose from'mongoose';

const applicationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['on hold', 'accepted', 'declined'],
        default: 'on hold'
    },
});
const postSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    user: { type: String, ref: 'User' },
    createdDate: Date,
    content: String,
    image: String,
    likes: Array, 
    description: String,
    requirements:String,
    company: String,
    location: String, 
    jobType:String,
    applicants: [applicationSchema],
});

export default model('Post', postSchema);
