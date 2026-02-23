import { textToSpeech } from '../services/deepgramService.js';

/**
 * Generate speech from text using Deepgram Aura (Stella voice)
 * POST /api/speak
 */
export const speakText = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No text provided for speech synthesis'
            });
        }

        console.log(`🎙️ TTS request: "${text.substring(0, 50)}..."`);

        // Generate speech with Stella voice
        const audioBuffer = await textToSpeech(text);

        // Send audio back to frontend
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
            'Cache-Control': 'no-cache'
        });

        res.send(audioBuffer);

    } catch (error) {
        console.error('❌ TTS controller error:', error.message);
        console.error('❌ TTS full error:', JSON.stringify(error, null, 2));

        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate speech. Please try again.'
        });
    }
};

export default {
    speakText
};
