import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
    userID: {
        type: Number, // Assuming userID is of type Number based on your User model
        required: true,
        ref: 'User' // Reference to the User model
    },
    message: {
        type: String,
        required: true
    },
    jobOfferID: {
        type: Schema.Types.ObjectId,
        ref: 'Post', // Optional reference to the JobOffer model
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

export default model('Notification', notificationSchema);