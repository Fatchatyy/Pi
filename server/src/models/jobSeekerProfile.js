import { Schema, model } from 'mongoose'

const jobSeekerProfile = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: String,
    school: String,
    diploma_name:String,
    skills: Array,
    projects: Array,
    work_experience: String,
    languages: String,
    hobbies: Array,
    description: String,
    job_type: String,
})

export default model('jobSeekerProfile', jobSeekerProfile)