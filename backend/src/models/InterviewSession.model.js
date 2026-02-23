import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
    // Store Clerk user ID directly as a string
    userId: {
        type: String,
        required: true,
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true,
    },
    jobRole: {
        type: String,
        required: true,
    },
    experienceLevel: {
        type: String,
        required: true,
    },
    aiSessionId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active',
    },
    qaHistory: [{
        questionNumber: Number,
        question: String,
        answer: String,
        timestamp: Date,
    }],
    startedAt: {
        type: Date,
        default: Date.now,
    },
    endedAt: Date,
}, {
    timestamps: true,
});

export default mongoose.model('InterviewSession', interviewSessionSchema);
