import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
    // Store Clerk user ID directly as a string
    userId: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    filepath: {
        type: String,
        required: true,
    },
    structuredData: {
        name: String,
        email: String,
        skills: [String],
        experience: [{
            company: String,
            role: String,
            duration: String,
            responsibilities: [String],
        }],
        projects: [{
            name: String,
            description: String,
            technologies: [String],
            highlights: [String],
        }],
        education: [{
            institution: String,
            degree: String,
            year: String,
        }],
    },
}, {
    timestamps: true,
});

export default mongoose.model('Resume', resumeSchema);
