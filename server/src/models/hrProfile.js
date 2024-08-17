import { Schema, model } from 'mongoose'

const hrProfile = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hr_name:String,
    organisation_name: String,
    industry: String,
    description:String,
    location: String,
})

export default model('hrProfile', hrProfile)