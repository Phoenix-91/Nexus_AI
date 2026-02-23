import { createClient } from '@deepgram/sdk';

let deepgramClient = null;

/**
 * Get or create Deepgram client instance (lazy initialization)
 * Uses 30s timeout to handle slow network connections
 */
const getDeepgramClient = () => {
    if (!deepgramClient) {
        const apiKey = process.env.DEEPGRAM_API_KEY;

        if (!apiKey) {
            throw new Error('DEEPGRAM_API_KEY is not configured in environment variables');
        }

        deepgramClient = createClient(apiKey, {
            global: {
                fetch: {
                    options: {
                        timeout: 30000  // 30 second timeout
                    }
                }
            }
        });
        console.log('✅ Deepgram client initialized (timeout: 30s)');
    }

    return deepgramClient;
};

/**
 * Transcribe audio file using Deepgram API
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} mimeType - Audio MIME type (e.g., 'audio/webm')
 * @returns {Promise<Object>} Transcription result with transcript, confidence, and duration
 */
export const transcribeAudio = async (audioBuffer, mimeType = 'audio/webm') => {
    try {
        const deepgram = getDeepgramClient();

        // Configure transcription options
        const options = {
            model: 'nova-2',           // Fastest and most accurate model
            language: 'en',            // English
            smart_format: true,        // Auto punctuation & capitalization
            punctuate: true,           // Add punctuation
            diarize: false,            // Single speaker (interview candidate)
            utterances: false,         // Return full transcript
        };

        // Transcribe audio
        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            audioBuffer,
            options
        );

        if (error) {
            throw new Error(`Deepgram API error: ${error.message}`);
        }

        // Extract transcript and metadata
        const channel = result.results?.channels?.[0];
        const alternative = channel?.alternatives?.[0];

        if (!alternative || !alternative.transcript) {
            // Log full response so we can see what Deepgram actually returned
            console.error('❌ No transcript found. Full Deepgram response:', JSON.stringify(result, null, 2));
            throw new Error('No transcript found in Deepgram response. Audio may be silent or too short.');
        }

        const transcript = alternative.transcript;
        const confidence = alternative.confidence || 0;
        const duration = result.metadata?.duration || 0;

        console.log(`✅ Transcription successful: ${transcript.substring(0, 50)}... (confidence: ${confidence.toFixed(2)})`);

        return {
            success: true,
            transcript: transcript.trim(),
            confidence: parseFloat(confidence.toFixed(4)),
            duration: parseFloat(duration.toFixed(2)),
            words: alternative.words?.length || 0
        };

    } catch (error) {
        console.error('❌ Deepgram transcription error:', error);
        throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
};

/**
 * Generate speech from text using Deepgram Aura (Thalia voice)
 * @param {string} text - Text to convert to speech
 * @returns {Promise<Buffer>} Audio buffer
 */
export const textToSpeech = async (text) => {
    try {
        const deepgram = getDeepgramClient();

        if (!text || text.trim().length === 0) {
            throw new Error('No text provided for speech synthesis');
        }

        console.log(`🎙️ Generating speech with Thalia: "${text.substring(0, 50)}..."`);

        // Generate speech with Stella voice (Deepgram Aura)
        const response = await deepgram.speak.request(
            { text: text },
            {
                model: 'aura-stella-en',  // Stella - warm, professional female voice
            }
        );

        const stream = await response.getStream();

        if (!stream) {
            throw new Error('Failed to get audio stream from Deepgram');
        }

        // Convert stream to buffer
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);

        console.log(`✅ Speech generated: ${(audioBuffer.length / 1024).toFixed(2)}KB`);

        return audioBuffer;

    } catch (error) {
        console.error('❌ Deepgram TTS error:', error);
        throw new Error(`Failed to generate speech: ${error.message}`);
    }
};

/**
 * Validate audio file
 * @param {Object} file - Multer file object
 * @returns {Object} Validation result
 */
export const validateAudioFile = (file) => {
    const allowedMimeTypes = [
        'audio/webm',
        'audio/wav',
        'audio/wave',
        'audio/x-wav',
        'audio/mpeg',
        'audio/mp3',
        'audio/ogg',
        'audio/opus'
    ];

    const maxSize = 25 * 1024 * 1024; // 25MB

    if (!file) {
        return { valid: false, error: 'No audio file provided' };
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return {
            valid: false,
            error: `Unsupported audio format: ${file.mimetype}. Supported formats: webm, wav, mp3, ogg`
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 25MB`
        };
    }

    return { valid: true };
};

export default {
    transcribeAudio,
    textToSpeech,
    validateAudioFile
};
