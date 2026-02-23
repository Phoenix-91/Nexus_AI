import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../services/transcriptionService';

/**
 * Custom hook for audio recording and transcription using MediaRecorder + Deepgram
 * Replaces the unreliable Web Speech API
 */
export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [error, setError] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    /**
     * Check if browser supports MediaRecorder
     */
    const isSupported = 'mediaDevices' in navigator && 'MediaRecorder' in window;

    /**
     * Monitor audio level for visual feedback
     */
    const monitorAudioLevel = useCallback((stream) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            microphone.connect(analyser);
            analyser.fftSize = 256;

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const updateLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(Math.min(100, (average / 128) * 100));
                animationFrameRef.current = requestAnimationFrame(updateLevel);
            };

            updateLevel();
        } catch (err) {
            console.warn('Audio level monitoring not available:', err);
        }
    }, []);

    /**
     * Start recording audio
     */
    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setTranscript('');
            setRecordingDuration(0);
            audioChunksRef.current = [];

            // Request microphone permission with optimal settings
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000,
                    channelCount: 1
                }
            });

            // Log microphone info for debugging
            const audioTrack = stream.getAudioTracks()[0];
            console.log('🎤 Microphone:', audioTrack.label);
            console.log('🎤 Settings:', JSON.stringify(audioTrack.getSettings()));

            streamRef.current = stream;

            // Determine best MIME type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4';

            console.log('🎙️ Using audio format:', mimeType);

            // Create MediaRecorder with bitrate for better quality
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                audioBitsPerSecond: 128000
            });
            mediaRecorderRef.current = mediaRecorder;

            // Collect audio chunks
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            // Handle recording stop
            mediaRecorder.onstop = async () => {
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Stop audio level monitoring
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
                if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                    audioContextRef.current.close();
                }

                setAudioLevel(0);

                // Create audio blob
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

                // Validate audio blob size
                if (audioBlob.size === 0) {
                    console.error('❌ Audio blob is empty');
                    setError('No audio recorded. Please try again.');
                    return;
                }

                console.log(`✅ Audio recorded: ${(audioBlob.size / 1024).toFixed(2)}KB, format: ${mimeType}, chunks: ${audioChunksRef.current.length}`);

                // Transcribe audio
                await transcribeRecording(audioBlob);
            };

            // Start recording
            mediaRecorder.start(250); // Collect data every 250ms for better chunks
            setIsRecording(true);

            // Start timer
            const startTime = Date.now();
            timerRef.current = setInterval(() => {
                setRecordingDuration((Date.now() - startTime) / 1000);
            }, 100);

            // Monitor audio level
            monitorAudioLevel(stream);

        } catch (err) {
            console.error('Failed to start recording:', err);

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Microphone permission denied. Please enable microphone access in your browser settings.');
            } else if (err.name === 'NotFoundError') {
                setError('No microphone found. Please connect a microphone and try again.');
            } else {
                setError(`Failed to start recording: ${err.message}`);
            }
        }
    }, [monitorAudioLevel]);

    /**
     * Stop recording audio
     */
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Clear timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [isRecording]);

    /**
     * Transcribe recorded audio
     */
    const transcribeRecording = async (audioBlob) => {
        try {
            setIsTranscribing(true);
            setError(null);

            // Send to backend for transcription
            const result = await transcribeAudio(audioBlob);

            if (result.success && result.transcript) {
                setTranscript(result.transcript);
                console.log(`✅ Transcription complete (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
            } else {
                throw new Error('No transcript received');
            }

        } catch (err) {
            console.error('Transcription failed:', err);
            setError(err.message || 'Failed to transcribe audio. You can type your answer manually.');
        } finally {
            setIsTranscribing(false);
        }
    };

    /**
     * Reset transcript
     */
    const resetTranscript = useCallback(() => {
        setTranscript('');
        setError(null);
    }, []);

    /**
     * Update transcript manually
     */
    const updateTranscript = useCallback((text) => {
        setTranscript(text);
    }, []);

    /**
     * Cleanup on unmount
     */
    const cleanup = useCallback(() => {
        if (isRecording) {
            stopRecording();
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
    }, [isRecording, stopRecording]);

    return {
        isRecording,
        isTranscribing,
        transcript,
        recordingDuration,
        audioLevel,
        error,
        isSupported,
        startRecording,
        stopRecording,
        resetTranscript,
        updateTranscript,
        cleanup
    };
};
