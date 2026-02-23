import { aiEmailService } from '../services/claudeService.js';
import { emailService } from '../services/emailService.js';

// Rate limiting: Store user email counts (in production, use Redis)
const emailCounts = new Map();
const RATE_LIMIT = 10; // Max 10 emails per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(userId) {
    const now = Date.now();
    const userRecord = emailCounts.get(userId) || { count: 0, resetAt: now + RATE_WINDOW };

    // Reset if window expired
    if (now > userRecord.resetAt) {
        userRecord.count = 0;
        userRecord.resetAt = now + RATE_WINDOW;
    }

    if (userRecord.count >= RATE_LIMIT) {
        return false;
    }

    userRecord.count++;
    emailCounts.set(userId, userRecord);
    return true;
}

export const generateEmail = async (req, res) => {
    try {
        const { context } = req.body;

        if (!context || context.trim().length === 0) {
            return res.status(400).json({ message: 'Context is required' });
        }

        // Check rate limit
        if (!checkRateLimit(req.userId)) {
            return res.status(429).json({
                message: 'Rate limit exceeded. Maximum 10 emails per hour.'
            });
        }

        // Generate email using Groq AI
        const emailData = await aiEmailService.generateEmail(context);

        res.json({
            recipient: emailData.recipient,
            subject: emailData.subject,
            body: emailData.body
        });
    } catch (error) {
        console.error('Generate email error:', error);
        res.status(500).json({
            message: 'Failed to generate email',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const sendEmail = async (req, res) => {
    try {
        const { recipient, subject, body } = req.body;

        if (!recipient || !subject || !body) {
            return res.status(400).json({
                message: 'Recipient, subject, and body are required'
            });
        }

        // Send email
        const result = await emailService.sendEmail(recipient, subject, body);

        res.json({
            success: true,
            sentAt: result.sentAt,
            messageId: result.messageId
        });
    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({
            message: 'Failed to send email',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
