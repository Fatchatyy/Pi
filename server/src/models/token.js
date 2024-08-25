import { Schema, model } from 'mongoose';

// Token Schema
const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  token: {
    headers: {
      Authorization: { type: String, required: true } // Expecting the Authorization token as a string
    }
  }
}, {
  timestamps: true, // Optional: Adds createdAt and updatedAt fields
});

// Create and export the Token model
const Token = model('Token', tokenSchema);
export default Token;
