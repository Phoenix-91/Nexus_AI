import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../services/transcriptionService';

/**
 * Interview states
 */
export const INTERVIEW_STATE = {
    IDLE: 'idle',
    AI_SPEAKING: 'ai-speaking',
    LISTENING: 'listening',
    PROCESSING: 'processing',
};

/**
 * Silence detection config
 */
const CONFIG = {
    silenceDuration: 4000,      // 4s silence → auto-stop
    speechThreshold: 12,        // audio level above this = speaking
    minSpeakingTime: 1500,      // must speak ≥1.5s before silence check activates
    noSpeechTimeout: 12000,     // 12s with no speech at all → prompt user
    autoStartDelay: 600,        // ms to wait after AI finishes before listening
};

/**
 * useConversationalRecorder
 *
 * Manages the full auto-flow:
 *   AI speaks → auto-start mic → user speaks → silence detected → auto-stop → transcribe
 *
 * Usage:
 *   const { interviewState, transcript, audioLevel, silenceCountdown,
 *           startListening, stopListening, resetTranscript, error } = useConversationalRecorder();
 */
export const useConversationalRecorder = () => {
    const [interviewState, setInterviewState] = useState(INTERVIEW_STATE.IDLE);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const [silenceCountdown, setSilenceCountdown] = useState(null); // 3..2..1 countdown

    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const animationFrameRef = useRef(null);
    const noSpeechTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const chunksRef = useRef([]);

    // ─── Stop all monitoring (does NOT stop MediaRecorder) ───────────────────
    const stopMonitoring = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (noSpeechTimerRef.current) {
            clearTimeout(noSpeechTimerRef.current);
            noSpeechTimerRef.current = null;
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
        setAudioLevel(0);
        setSilenceCountdown(null);
    }, []);

    // ─── Transcribe blob and set transcript ──────────────────────────────────
    const processAudioBlob = useCallback(async (blob) => {
        setInterviewState(INTERVIEW_STATE.PROCESSING);
        setError(null);
        try {
            const result = await transcribeAudio(blob);
            if (result?.success && result.transcript?.trim()) {
                setTranscript(result.transcript.trim());
                console.log('✅ Transcript:', result.transcript);
            } else {
                setError('Could not understand your answer. Please try again or type it below.');
            }
        } catch (err) {
            console.error('❌ Transcription failed:', err);
            setError(err.message || 'Transcription failed. Please type your answer below.');
        } finally {
            setInterviewState(INTERVIEW_STATE.IDLE);
        }
    }, []);

    // ─── Start silence detection on the live stream ───────────────────────────
    const startSilenceDetection = useCallback((stream, mediaRecorder) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);

            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;
            source.connect(analyser);
            audioContextRef.current = audioContext;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            let silenceStart = null;   // when silence began
            let hasSpoken = false;     // user actually spoke at least once
            let countingDown = false;

            // No-speech timeout: if nobody speaks within 12s, prompt them
            noSpeechTimerRef.current = setTimeout(() => {
                if (!hasSpoken && mediaRecorder.state === 'recording') {
                    console.warn('⚠️ No speech detected. Prompting user.');
                    setError('No speech detected. Please speak your answer or type it below.');
                }
            }, CONFIG.noSpeechTimeout);

            const check = () => {
                if (mediaRecorder.state !== 'recording') return;

                analyser.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setAudioLevel(Math.min(100, (avg / 128) * 100));

                const isSpeaking = avg > CONFIG.speechThreshold;

                if (isSpeaking) {
                    if (!hasSpoken) {
                        console.log('🗣️ User started speaking');
                        hasSpoken = true;
                        // Cancel the no-speech timeout
                        if (noSpeechTimerRef.current) {
                            clearTimeout(noSpeechTimerRef.current);
                            noSpeechTimerRef.current = null;
                        }
                    }
                    silenceStart = null;
                    countingDown = false;
                    setSilenceCountdown(null);
                    if (countdownIntervalRef.current) {
                        clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                    }
                } else if (hasSpoken) {
                    // User has spoken before and now it's silent
                    if (!silenceStart) silenceStart = Date.now();
                    const silentFor = Date.now() - silenceStart;

                    // Show countdown in last 3s of silence window
                    const remaining = CONFIG.silenceDuration - silentFor;
                    if (remaining <= 3000 && !countingDown) {
                        countingDown = true;
                        let count = Math.ceil(remaining / 1000);
                        setSilenceCountdown(count);
                        countdownIntervalRef.current = setInterval(() => {
                            count -= 1;
                            if (count <= 0) {
                                clearInterval(countdownIntervalRef.current);
                                countdownIntervalRef.current = null;
                                setSilenceCountdown(null);
                            } else {
                                setSilenceCountdown(count);
                            }
                        }, 1000);
                    }

                    // Auto-stop after full silence duration
                    if (silentFor >= CONFIG.silenceDuration) {
                        console.log('🛑 Silence detected — auto-stopping recording');
                        stopMonitoring();
                        if (mediaRecorder.state === 'recording') {
                            mediaRecorder.stop();
                        }
                        return;
                    }
                }

                animationFrameRef.current = requestAnimationFrame(check);
            };

            animationFrameRef.current = requestAnimationFrame(check);
        } catch (err) {
            console.error('Silence detection setup error:', err);
        }
    }, [stopMonitoring]);

    // ─── Public: start listening (called after AI finishes speaking) ──────────
    const startListening = useCallback(async () => {
        try {
            setError(null);
            setTranscript('');
            chunksRef.current = [];
            setInterviewState(INTERVIEW_STATE.LISTENING);

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000,
                    channelCount: 1,
                },
            });
            streamRef.current = stream;

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4';

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                audioBitsPerSecond: 128000,
            });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                stopMonitoring();

                const blob = new Blob(chunksRef.current, { type: mimeType });
                if (blob.size < 500) {
                    setError('Recording too short. Please try again.');
                    setInterviewState(INTERVIEW_STATE.IDLE);
                    return;
                }
                console.log(`✅ Recorded: ${(blob.size / 1024).toFixed(1)}KB`);
                await processAudioBlob(blob);
            };

            mediaRecorder.start(250);
            console.log('🎤 Auto-listening started');

            startSilenceDetection(stream, mediaRecorder);
        } catch (err) {
            console.error('❌ Failed to start listening:', err);
            if (err.name === 'NotAllowedError') {
                setError('Microphone permission denied. Please enable it and try again.');
            } else {
                setError(`Microphone error: ${err.message}`);
            }
            setInterviewState(INTERVIEW_STATE.IDLE);
        }
    }, [stopMonitoring, processAudioBlob, startSilenceDetection]);

    // ─── Public: force-stop (manual override) ────────────────────────────────
    const stopListening = useCallback(() => {
        stopMonitoring();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        console.log('🛑 Manually stopped listening');
    }, [stopMonitoring]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setError(null);
    }, []);

    const setTranscriptManually = useCallback((text) => {
        setTranscript(text);
    }, []);

    // ─── Cleanup on unmount ───────────────────────────────────────────────────
    const cleanup = useCallback(() => {
        stopListening();
        stopMonitoring();
    }, [stopListening, stopMonitoring]);

    return {
        interviewState,
        transcript,
        error,
        audioLevel,
        silenceCountdown,
        startListening,
        stopListening,
        resetTranscript,
        setTranscriptManually,
        cleanup,
        isListening: interviewState === INTERVIEW_STATE.LISTENING,
        isProcessing: interviewState === INTERVIEW_STATE.PROCESSING,
    };
};
