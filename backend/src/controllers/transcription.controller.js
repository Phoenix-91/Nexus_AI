import fs from 'fs';
import { transcribeAudio, validateAudioFile } from '../services/deepgramService.js';

/**
 * Transcribe audio file to text
 * POST /api/transcribe-audio
 */
export const transcribeAudioFile = async (req, res) => {
    let filePath = null;

    try {
        // Check if file was uploaded 
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No audio file uploaded. Please provide an audio file.'
            });
        }

        filePath = req.file.path;

        // Validate audio file
        const validation = validateAudioFile(req.file);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        console.log(`📝 Transcribing: ${req.file.originalname} | size: ${(req.file.size / 1024).toFixed(2)}KB | type: ${req.file.mimetype}`);

        // Read audio file
        const audioBuffer = fs.readFileSync(filePath);

        // Log first bytes to verify audio format header
        console.log(`🔍 Audio header (hex): ${audioBuffer.slice(0, 16).toString('hex')}`);

        // Transcribe with Deepgram
        const result = await transcribeAudio(audioBuffer, req.file.mimetype);

        // Clean up uploaded file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Return transcript
        return res.status(200).json(result);

    } catch (error) {
        console.error('❌ Transcription controller error:', error);

        // Clean up file on error
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (cleanupError) {
                console.error('Failed to clean up file:', cleanupError);
            }
        }

        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to transcribe audio. Please try again.'
        });
    }
};

export default {
    transcribeAudioFile
};
