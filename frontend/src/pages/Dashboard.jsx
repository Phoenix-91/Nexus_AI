import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Brain, Plus, Clock, Award, TrendingUp, Wrench, Mail, ChevronDown } from 'lucide-react';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/common/Loader';
import { interviewService } from '@/services/interviewService';

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showToolsMenu, setShowToolsMenu] = useState(false);

    useEffect(() => {
        if (isLoaded && user) {
            loadInterviews();
        }
    }, [isLoaded, user]);

    const loadInterviews = async () => {
        try {
            const data = await interviewService.getHistory();
            setInterviews(data);
        } catch (error) {
            console.error('Failed to load interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded || loading) {
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
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full gradient-purple-blue flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">NEXUS.AI</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        {/* Tools Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowToolsMenu(!showToolsMenu)}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-purple-600/20 border border-gray-700 hover:border-purple-500 transition-all"
                            >
                                <Wrench className="w-4 h-4 text-purple-400" />
                                <span className="text-gray-300">Tools</span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showToolsMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showToolsMenu && (
                                <div className="absolute right-0 mt-2 w-56 glass border border-gray-700 rounded-lg shadow-xl z-50 animate-fade-in">
                                    <button
                                        onClick={() => {
                                            navigate('/tools/email-automation');
                                            setShowToolsMenu(false);
                                        }}
                                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-purple-600/20 transition-colors rounded-lg"
                                    >
                                        <Mail className="w-5 h-5 text-purple-400" />
                                        <div className="text-left">
                                            <div className="text-white font-medium">Email Automation</div>
                                            <div className="text-xs text-gray-400">AI-powered email composer</div>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        <span className="text-gray-300">Welcome, {user?.firstName}!</span>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Welcome back, {user?.firstName}! 👋
                    </h1>
                    <p className="text-xl text-gray-400">
                        Ready to ace your next interview? Let's get started.
                    </p>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Start New Interview */}
                    <GlassCard hover onClick={() => navigate('/interview/setup')} className="cursor-pointer">
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 rounded-2xl gradient-purple-blue flex items-center justify-center flex-shrink-0">
                                <Plus className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold text-white mb-2">
                                    Start New Interview
                                </h3>
                                <p className="text-gray-400">
                                    Upload your resume and begin a voice-based AI interview session
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Stats Card */}
                    <GlassCard>
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-8 h-8 text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold text-white mb-2">
                                    Your Progress
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Total Interviews</span>
                                        <span className="text-white font-semibold">{interviews.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Avg Score</span>
                                        <span className="text-white font-semibold">
                                            {interviews.length > 0
                                                ? Math.round(interviews.reduce((acc, i) => acc + (i.score || 0), 0) / interviews.length)
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Recent Interviews */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-6">Recent Interviews</h2>

                    {interviews.length === 0 ? (
                        <GlassCard className="text-center py-12">
                            <div className="w-20 h-20 rounded-full glass mx-auto mb-4 flex items-center justify-center">
                                <Clock className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                No interviews yet
                            </h3>
                            <p className="text-gray-400 mb-6">
                                Start your first interview to see your history here
                            </p>
                            <Button onClick={() => navigate('/interview/setup')}>
                                Start First Interview
                            </Button>
                        </GlassCard>
                    ) : (
                        <div className="space-y-4">
                            {interviews.map((interview) => (
                                <GlassCard
                                    key={interview._id}
                                    hover
                                    onClick={() => navigate(`/report/${interview._id}`)}
                                    className="cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                                                <Award className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-white">
                                                    {interview.jobRole}
                                                </h4>
                                                <p className="text-sm text-gray-400">
                                                    {interview.experienceLevel} • {new Date(interview.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold gradient-text">
                                                {interview.score || 'N/A'}
                                            </div>
                                            <div className="text-xs text-gray-400">Score</div>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
