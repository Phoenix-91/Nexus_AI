import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, Send, X, Edit, Clock } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { emailService } from '@/services/emailService';

export default function EmailAutomation() {
    const navigate = useNavigate();
    const [context, setContext] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [autoSendTimer, setAutoSendTimer] = useState(null);

    const handleGenerate = async () => {
        if (!context.trim()) {
            toast.error('Please enter email context');
            return;
        }

        setLoading(true);
        try {
            const emailData = await emailService.generateEmail(context);
            setGeneratedEmail(emailData);

            // Start countdown
            setCountdown(3);
            startCountdown(emailData);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate email');
        } finally {
            setLoading(false);
        }
    };

    const startCountdown = (emailData) => {
        let timeLeft = 3;

        const timer = setInterval(() => {
            timeLeft--;
            setCountdown(timeLeft);

            if (timeLeft === 0) {
                clearInterval(timer);
                sendEmail(emailData);
            }
        }, 1000);

        setAutoSendTimer(timer);
    };

    const stopCountdown = () => {
        if (autoSendTimer) {
            clearInterval(autoSendTimer);
            setAutoSendTimer(null);
        }
        setShowPreview(true);
    };

    const sendEmail = async (emailData = generatedEmail) => {
        try {
            await emailService.sendEmail(
                emailData.recipient,
                emailData.subject,
                emailData.body
            );

            toast.success('✉️ Email sent successfully!');
            setContext('');
            setGeneratedEmail(null);
            setShowPreview(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send email');
        }
    };

    const handleClear = () => {
        setContext('');
        setGeneratedEmail(null);
        setShowPreview(false);
        if (autoSendTimer) {
            clearInterval(autoSendTimer);
            setAutoSendTimer(null);
        }
    };

    useEffect(() => {
        return () => {
            if (autoSendTimer) {
                clearInterval(autoSendTimer);
            }
        };
    }, [autoSendTimer]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            {/* Header */}
            <div className="border-b border-gray-800 bg-black/50 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Dashboard</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
                        <Mail className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2 gradient-text">
                        AI Email Automation
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Let AI compose and send emails on your behalf
                    </p>
                </div>

                <GlassCard className="p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Context
                            </label>
                            <textarea
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder="Example: I won't be coming to college tomorrow. Send an email to teacher@gmail.com explaining I'm sick and will submit assignments by next week."
                                className="w-full h-48 px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all resize-none"
                                disabled={loading}
                            />
                        </div>

                        <div className="flex space-x-4">
                            <Button
                                onClick={handleGenerate}
                                disabled={loading || !context.trim()}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        AI is composing your email...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" />
                                        Generate & Send Email
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleClear}
                                variant="outline"
                                size="lg"
                                disabled={loading}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                </GlassCard>

                {/* Countdown Toast */}
                {generatedEmail && !showPreview && countdown > 0 && (
                    <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
                        <GlassCard className="p-6 w-96 border-2 border-purple-500/50">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-5 h-5 text-purple-400" />
                                    <h3 className="font-semibold">Email Preview</h3>
                                </div>
                                <button
                                    onClick={stopCountdown}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2 mb-4 text-sm">
                                <div>
                                    <span className="text-gray-400">To:</span>{' '}
                                    <span className="text-white">{generatedEmail.recipient}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Subject:</span>{' '}
                                    <span className="text-white">{generatedEmail.subject}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="text-2xl font-bold text-purple-400 text-center mb-2">
                                    Sending in {countdown}...
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={stopCountdown}
                                variant="outline"
                                className="w-full"
                                size="sm"
                            >
                                View Full Preview
                            </Button>
                        </GlassCard>
                    </div>
                )}
            </div>

            {/* Full Preview Modal */}
            {showPreview && generatedEmail && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <GlassCard className="max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold gradient-text">Email Preview</h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="p-4 bg-black/50 rounded-lg">
                                <div className="text-sm text-gray-400 mb-1">To:</div>
                                <div className="text-white">{generatedEmail.recipient}</div>
                            </div>

                            <div className="p-4 bg-black/50 rounded-lg">
                                <div className="text-sm text-gray-400 mb-1">Subject:</div>
                                <div className="text-white">{generatedEmail.subject}</div>
                            </div>

                            <div className="p-4 bg-black/50 rounded-lg">
                                <div className="text-sm text-gray-400 mb-2">Body:</div>
                                <div className="text-white whitespace-pre-wrap">{generatedEmail.body}</div>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <Button
                                onClick={() => sendEmail()}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                                size="lg"
                            >
                                <Send className="w-5 h-5 mr-2" />
                                Send Now
                            </Button>
                            <Button
                                onClick={() => setShowPreview(false)}
                                variant="outline"
                                size="lg"
                            >
                                Cancel
                            </Button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
