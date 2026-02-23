import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Transcribe audio file using Deepgram API via backend
 * @param {Blob} audioBlob - Audio blob from MediaRecorder
 * @param {string} filename - Optional filename
 * @returns {Promise<Object>} Transcription result
 */
export const transcribeAudio = async (audioBlob, filename = 'recording.webm') => {
    try {
        // Create FormData
        const formData = new FormData();
        formData.append('audio', audioBlob, filename);

        // Send to backend
        const response = await axios.post(`${API_URL}/transcribe-audio`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000, // 60 second timeout
        });

        return response.data;
    } catch (error) {
        console.error('Transcription error:', error);

        if (error.response) {
            // Server responded with error
            throw new Error(error.response.data.error || 'Transcription failed');
        } else if (error.request) {
            // Request made but no response
            throw new Error('Network error. Please check your connection.');
        } else {
            // Something else went wrong
            throw new Error(error.message || 'Failed to transcribe audio');
        }
    }
};

export default {
    transcribeAudio
};
