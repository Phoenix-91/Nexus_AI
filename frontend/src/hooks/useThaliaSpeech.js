import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for Deepgram Aura Stella voice (replaces Web Speech API)
 * Provides warm, professional female voice for interview questions
 * NO fallback to Web Speech API - only Deepgram Stella
 */
export const useThaliaSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState(null);
    const audioRef = useRef(null);

    /**
     * Speak text using Stella voice
     * @param {string} text - Text to speak
     */
    const speak = useCallback(async (text) => {
        if (!text || text.trim().length === 0) {
            console.warn('No text provided for speech');
            return;
        }

        try {
            setError(null);
            setIsSpeaking(true);

            // Stop any currently playing audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            // Cancel any browser speech that may be running (prevent duplicates)
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }

            console.log(`🎙️ Speaking with Stella: "${text.substring(0, 50)}..."`);

            // Request speech from backend (35s timeout to match backend 30s)
            const response = await axios.post(
                'http://localhost:5000/api/speak',
                { text: text },
                {
                    responseType: 'blob',
                    timeout: 35000
                }
            );

            // Create audio from blob
            const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            // Return a Promise that resolves when audio FINISHES (not just starts)
            // This is critical for the conversational auto-flow: await speak() then startListening()
            await new Promise((resolve, reject) => {
                audio.onplay = () => {
                    console.log('✅ Stella started speaking');
                    setIsSpeaking(true);
                };

                audio.onended = () => {
                    console.log('✅ Stella finished speaking');
                    setIsSpeaking(false);
                    URL.revokeObjectURL(audioUrl);
                    audioRef.current = null;
                    resolve();
                };

                audio.onerror = (err) => {
                    console.error('❌ Audio playback error:', err);
                    setError('Failed to play audio');
                    setIsSpeaking(false);
                    URL.revokeObjectURL(audioUrl);
                    audioRef.current = null;
                    reject(err);
                };

                audio.play().catch(reject);
            });

        } catch (err) {
            console.error('❌ Stella TTS error:', err);
            setError(err.response?.data?.error || err.message || 'Failed to generate speech');
            setIsSpeaking(false);
            // NO Web Speech API fallback - prevents duplicate voices
        }
    }, []);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        // Also stop any browser speech
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsSpeaking(false);
        }
    }, []);

    const resume = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsSpeaking(true);
        }
    }, []);

    const cleanup = useCallback(() => {
        stop();
    }, [stop]);

    return {
        speak,
        stop,
        pause,
        resume,
        isSpeaking,
        error,
        isSupported: true,
        cleanup
    };
};
