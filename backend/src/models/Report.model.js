import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InterviewSession',
        required: true,
        unique: true,
    },
    overallScore: {
        type: Number,
        required: true,
    },
    categoryScores: {
        technical: Number,
        communication: Number,
        problemSolving: Number,
        projectKnowledge: Number,
        behavioral: Number,
    },
    questionAnalysis: [{
        question: String,
        answer: String,
        score: Number,
        strengths: [String],
        improvements: [String],
        betterAnswer: String,
    }],
    strengths: [String],
    weaknesses: [{
        area: {
            type: String,
            required: true
        },
        description: String,
        tip: {
            type: String,
            required: true
        }
    }],
    percentile: Number,
    actionPlan: {
        week1: [String],
        week2: [String],
        week3: [String],
        week4: [String],
    },
}, {
    timestamps: true,
});

export default mongoose.model('Report', reportSchema);
