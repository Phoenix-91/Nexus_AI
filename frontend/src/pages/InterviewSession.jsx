import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Brain, Volume2, VolumeX, X, Edit3, Send, Mic, Square } from 'lucide-react';
import { MovingBorder } from '@/components/aceternity/MovingBorder';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader, LoadingDots } from '@/components/common/Loader';
import { useConversationalRecorder, INTERVIEW_STATE } from '@/hooks/useConversationalRecorder';
import { useThaliaSpeech } from '@/hooks/useThaliaSpeech';
import { interviewService } from '@/services/interviewService';
import { useInterviewStore } from '@/store/useInterviewStore';
import { QUESTION_COUNT } from '@/utils/constants';

export default function InterviewSession() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const hasLoadedRef = useRef(false);

    const { jobRole, experienceLevel, addMessage, messages, questionCount } = useInterviewStore();

    const {
        interviewState,
        transcript,
        error: recordingError,
        audioLevel,
        silenceCountdown,
        startListening,
        stopListening,
        resetTranscript,
        setTranscriptManually,
        cleanup,
        isListening,
        isProcessing,
    } = useConversationalRecorder();

    const { speak, stop: stopSpeaking, isSpeaking, cleanup: cleanupSpeech } = useThaliaSpeech();

    const [loading, setLoading] = useState(true);
    const [aiThinking, setAiThinking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isEditingTranscript, setIsEditingTranscript] = useState(false);

    // ── After transcript arrives, auto-submit ─────────────────────────────────
    const transcriptRef = useRef('');
    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    // When processing finishes (transcript ready), auto-send after a short pause
    useEffect(() => {
        if (interviewState === INTERVIEW_STATE.IDLE && transcript && !isEditingTranscript) {
            // Small pause so user can see the transcript before it submits
            const timer = setTimeout(() => {
                if (transcriptRef.current) {
                    handleSendAnswer(transcriptRef.current);
                }
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [interviewState, transcript]);

    // ── When AI finishes speaking → auto-start listening ──────────────────────
    const startAutoListen = useCallback(async () => {
        if (isMuted) return;
        setTimeout(async () => {
            await startListening();
        }, 600); // 600ms delay after AI stops
    }, [isMuted, startListening]);

    // ── Speak a question and then auto-listen ─────────────────────────────────
    const speakAndListen = useCallback(async (text) => {
        if (isMuted) {
            // Muted: jump straight to listening
            await startListening();
            return;
        }
        await speak(text); // awaits until audio finishes
        await startAutoListen();
    }, [isMuted, speak, startAutoListen, startListening]);

    // ── Initial question ──────────────────────────────────────────────────────
    useEffect(() => {
        loadInitialQuestion();
        return () => {
            cleanup();
            cleanupSpeech();
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadInitialQuestion = async () => {
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;
        try {
            const firstQuestion = "Hello! Let's begin the interview. Can you start by telling me about yourself and your background?";
            addMessage({ type: 'ai', text: firstQuestion, timestamp: new Date() });
            setLoading(false);
            await speakAndListen(firstQuestion);
        } catch (error) {
            console.error('Failed to load question:', error);
            setLoading(false);
        }
    };

    // ── Send answer + get next question ───────────────────────────────────────
    const handleSendAnswer = async (answerText) => {
        const text = answerText || transcript;
        if (!text?.trim()) return;

        addMessage({ type: 'user', text: text.trim(), timestamp: new Date() });
        resetTranscript();
        setIsEditingTranscript(false);
        setAiThinking(true);

        try {
            const response = await interviewService.sendMessage(sessionId, text.trim());
            if (response.shouldEnd || questionCount >= QUESTION_COUNT) {
                await interviewService.endInterview(sessionId);
                navigate(`/report/${sessionId}`);
            } else {
                addMessage({ type: 'ai', text: response.question, timestamp: new Date() });
                await speakAndListen(response.question);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            addMessage({
                type: 'ai',
                text: "I apologize, there was an error. Could you please repeat your answer?",
                timestamp: new Date(),
            });
            // Restart listening after error
            await startListening();
        } finally {
            setAiThinking(false);
        }
    };

    const handleEndInterview = async () => {
        if (window.confirm('Are you sure you want to end the interview?')) {
            try {
                stopListening();
                await interviewService.endInterview(sessionId);
                navigate(`/report/${sessionId}`);
            } catch (error) {
                console.error('Failed to end interview:', error);
            }
        }
    };

    const toggleMute = () => {
        if (isSpeaking) stopSpeaking();
        setIsMuted(!isMuted);
    };

    // ── Idle state: derive status label ───────────────────────────────────────
    const getStatusLabel = () => {
        if (loading) return null;
        if (aiThinking) return { text: 'AI is thinking...', color: 'text-gray-400', pulse: true };
        if (isSpeaking) return { text: 'Interviewer is speaking...', color: 'text-blue-400', pulse: true };
        if (isListening) {
            if (silenceCountdown !== null) {
                return { text: `Finishing in ${silenceCountdown}...`, color: 'text-yellow-400', pulse: false };
            }
            return { text: 'Listening — speak your answer', color: 'text-green-400', pulse: true };
        }
        if (isProcessing) return { text: 'Transcribing your answer...', color: 'text-purple-400', pulse: true };
        if (transcript) return { text: 'Answer ready — submitting...', color: 'text-blue-400', pulse: false };
        return { text: 'Preparing...', color: 'text-gray-500', pulse: false };
    };

    const statusInfo = getStatusLabel();
    const progress = (questionCount / QUESTION_COUNT) * 100;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Navbar */}
            <nav className="glass border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full gradient-purple-blue flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">NEXUS.AI</span>
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{jobRole}</h2>
                            <p className="text-gray-400">{experienceLevel} Level</p>
                        </div>
                        <Button variant="outline" onClick={handleEndInterview}>
                            <X className="w-4 h-4 mr-2" /> End Interview
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>Question {questionCount} of {QUESTION_COUNT}</span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>
                        <Progress value={progress} />
                    </div>
                </div>

                {/* Interview Container */}
                <MovingBorder>
                    <GlassCard className="p-8">
                        {/* Messages */}
                        <div className="h-[380px] overflow-y-auto mb-6 space-y-4 pr-2">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl ${msg.type === 'user' ? 'gradient-purple-blue text-white' : 'glass text-white'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}

                            {aiThinking && (
                                <div className="flex justify-start">
                                    <div className="glass p-4 rounded-2xl">
                                        <LoadingDots />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Status + Controls */}
                        <div className="space-y-5">

                            {/* Error banner */}
                            {recordingError && (
                                <div className="glass p-4 rounded-xl border border-red-500/50 bg-red-500/10">
                                    <p className="text-sm text-red-400">{recordingError}</p>
                                    <p className="text-xs text-gray-400 mt-1">You can type your answer below.</p>
                                </div>
                            )}

                            {/* Live audio visualizer (while listening) */}
                            {isListening && (
                                <div className="flex flex-col items-center gap-3">
                                    {/* Waveform bars */}
                                    <div className="flex items-end gap-1 h-10">
                                        {Array.from({ length: 20 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1.5 rounded-full transition-all duration-75"
                                                style={{
                                                    height: `${Math.max(4, (audioLevel / 100) * 40 * (0.5 + Math.random() * 0.5))}px`,
                                                    backgroundColor: silenceCountdown !== null ? '#facc15' : '#a855f7',
                                                    opacity: 0.7 + Math.random() * 0.3,
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Will auto-stop after {silenceCountdown !== null ? `${silenceCountdown}s` : '4s'} of silence
                                    </p>
                                </div>
                            )}

                            {/* Transcript display / edit */}
                            {(transcript || isEditingTranscript) && (
                                <div className="glass p-4 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm text-gray-400">Your answer:</p>
                                        <button
                                            onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                            {isEditingTranscript ? 'Done' : 'Edit'}
                                        </button>
                                    </div>
                                    {isEditingTranscript ? (
                                        <textarea
                                            value={transcript}
                                            onChange={(e) => setTranscriptManually(e.target.value)}
                                            className="w-full bg-black/30 text-white p-3 rounded-lg border border-white/10 focus:border-purple-500 focus:outline-none resize-none"
                                            rows={4}
                                            placeholder="Type your answer here..."
                                        />
                                    ) : (
                                        <p className="text-white text-sm">{transcript}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-gray-500">{transcript.split(' ').filter(Boolean).length} words</p>
                                        {transcript && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleSendAnswer(transcript)}
                                                disabled={aiThinking || !transcript.trim()}
                                                className="gradient-purple-blue"
                                            >
                                                <Send className="w-3 h-3 mr-1" />
                                                Submit
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Central status + controls row */}
                            <div className="flex items-center justify-between">
                                {/* Left: status */}
                                <div className="flex-1 min-w-0">
                                    {statusInfo && (
                                        <p className={`text-sm font-medium ${statusInfo.color} ${statusInfo.pulse ? 'animate-pulse' : ''} truncate`}>
                                            {statusInfo.text}
                                        </p>
                                    )}
                                </div>

                                {/* Right: utility buttons */}
                                <div className="flex items-center gap-3 ml-4">
                                    {/* Mute toggle */}
                                    <button
                                        onClick={toggleMute}
                                        title={isMuted ? 'Unmute voice' : 'Mute voice'}
                                        className="w-10 h-10 rounded-full glass hover:bg-white/10 flex items-center justify-center transition-all"
                                    >
                                        {isMuted ? (
                                            <VolumeX className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <Volume2 className="w-5 h-5 text-purple-400" />
                                        )}
                                    </button>

                                    {/* Force stop (while listening) */}
                                    {isListening && (
                                        <button
                                            onClick={stopListening}
                                            title="Stop recording now"
                                            className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/50 hover:bg-red-500/40 flex items-center justify-center transition-all"
                                        >
                                            <Square className="w-4 h-4 text-red-400 fill-red-400" />
                                        </button>
                                    )}

                                    {/* Manual listen (when idle + not currently running) */}
                                    {!isListening && !isProcessing && !aiThinking && !isSpeaking && (
                                        <button
                                            onClick={startListening}
                                            title="Start recording manually"
                                            className="w-10 h-10 rounded-full glass hover:bg-white/10 flex items-center justify-center transition-all"
                                        >
                                            <Mic className="w-5 h-5 text-blue-400" />
                                        </button>
                                    )}

                                    {/* Type answer manually */}
                                    <button
                                        onClick={() => setIsEditingTranscript(true)}
                                        title="Type answer manually"
                                        className="w-10 h-10 rounded-full glass hover:bg-white/10 flex items-center justify-center transition-all"
                                    >
                                        <Edit3 className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Listening pulse indicator */}
                            {isListening && (
                                <div className="flex justify-center">
                                    <div className={`w-3 h-3 rounded-full ${silenceCountdown !== null ? 'bg-yellow-400' : 'bg-green-400'} animate-ping`} />
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </MovingBorder>
            </div>
        </div>
    );
}
