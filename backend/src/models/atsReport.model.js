import mongoose from 'mongoose';

const ATSReportSchema = new mongoose.Schema({
    jobRole: {
        type: String,
        required: true
    },
    atsScore: {
        type: Number,
        required: true
    },
    verdict: String,
    keywordScore: Number,
    formatScore: Number,
    experienceScore: Number,
    skillsScore: Number,
    missingKeywords: [String],
    foundKeywords: [String],
    skillsAnalysis: [{
        name: String,
        score: Number
    }],
    suggestions: [{
        icon: String,
        title: String,
        description: String
    }],
    detailedAnalysis: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('ATSReport', ATSReportSchema);
