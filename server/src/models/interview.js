import { Schema, model } from 'mongoose';

const interviewSchema = new Schema({
    hr: { type: Schema.Types.ObjectId, ref: 'User', required: true },  
    jobseeker: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true }, 
    scheduledDate: Date, 
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'completed', 'cancelled'],  
        default: 'pending',
    },
    notes: { type: String },  // Additional notes or comments regarding the interview
}, { timestamps: true });

export default model('Interview', interviewSchema);