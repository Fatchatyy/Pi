import { Schema, model } from'mongoose';
import mongoose from'mongoose';

const postSchema = new Schema({
    id: Number,
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
    applicants: [{ type: Schema.Types.ObjectId, ref: 'User' }] 
});

export default model('Post', postSchema);
