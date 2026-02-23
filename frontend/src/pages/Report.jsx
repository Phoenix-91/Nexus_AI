import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import {
    Brain, Download, TrendingUp, TrendingDown, Award,
    Target, MessageCircle, Code, Users, ChevronDown, ChevronUp,
    Calendar, CheckCircle
} from 'lucide-react';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader } from '@/components/common/Loader';
import { reportService } from '@/services/interviewService';

export default function Report() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedQuestions, setExpandedQuestions] = useState(new Set());

    useEffect(() => {
        loadReport();
    }, [sessionId]);

    const loadReport = async () => {
        try {
            const data = await reportService.getReport(sessionId);
            setReport(data);
        } catch (error) {
            console.error('Failed to load report:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleQuestion = (index) => {
        const newExpanded = new Set(expandedQuestions);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedQuestions(newExpanded);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <GlassCard className="p-8 text-center">
                    <p className="text-white text-xl">Report not found</p>
                    <Button onClick={() => navigate('/dashboard')} className="mt-4">
                        Back to Dashboard
                    </Button>
                </GlassCard>
            </div>
        );
    }

    const categories = [
        { name: 'Technical', icon: <Code className="w-5 h-5" />, score: report.categoryScores?.technical || 0 },
        { name: 'Communication', icon: <MessageCircle className="w-5 h-5" />, score: report.categoryScores?.communication || 0 },
        { name: 'Problem Solving', icon: <Target className="w-5 h-5" />, score: report.categoryScores?.problemSolving || 0 },
        { name: 'Project Knowledge', icon: <Award className="w-5 h-5" />, score: report.categoryScores?.projectKnowledge || 0 },
        { name: 'Behavioral', icon: <Users className="w-5 h-5" />, score: report.categoryScores?.behavioral || 0 },
    ];

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
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Interview Report</h1>
                        <p className="text-gray-400">Detailed analysis of your performance</p>
                    </div>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                </div>

                {/* Overall Score */}
                <GlassCard className="p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-white mb-2">Overall Score</h2>
                            <p className="text-gray-400 mb-4">Your comprehensive interview performance</p>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-6xl font-bold gradient-text">{report.overallScore || 0}</span>
                                <span className="text-2xl text-gray-400">/100</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                                Top {report.percentile || 0}% of candidates
                            </p>
                        </div>
                        <div className="w-48 h-48 relative">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="16"
                                    fill="none"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    stroke="url(#gradient)"
                                    strokeWidth="16"
                                    fill="none"
                                    strokeDasharray={`${(report.overallScore / 100) * 502.4} 502.4`}
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </GlassCard>

                {/* Category Breakdown */}
                <GlassCard className="p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">Category Breakdown</h2>
                    <div className="space-y-6">
                        {categories.map((category, idx) => (
                            <div key={idx}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2 text-white">
                                        <span className="text-purple-400">{category.icon}</span>
                                        <span className="font-medium">{category.name}</span>
                                    </div>
                                    <span className="text-white font-semibold">{category.score}/100</span>
                                </div>
                                <Progress value={category.score} />
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Strengths */}
                    <GlassCard className="p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                            <h3 className="text-xl font-semibold text-white">Strengths</h3>
                        </div>
                        <ul className="space-y-3">
                            {(report.strengths || []).slice(0, 5).map((strength, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-300 text-sm">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    {/* Weaknesses */}
                    <GlassCard className="p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <TrendingDown className="w-6 h-6 text-orange-400" />
                            <h3 className="text-xl font-semibold text-white">Areas for Improvement</h3>
                        </div>
                        <ul className="space-y-3">
                            {(report.weaknesses || []).slice(0, 5).map((weakness, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                    <Target className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-gray-300 text-sm">
                                        <p className="font-medium">{typeof weakness === 'string' ? weakness : weakness.area}</p>
                                        {typeof weakness === 'object' && weakness.tip && (
                                            <p className="text-gray-400 text-xs mt-1">{weakness.tip}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                </div>

                {/* Question Analysis */}
                <GlassCard className="p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">Question-by-Question Analysis</h2>
                    <div className="space-y-4">
                        {(report.questionAnalysis || []).map((qa, idx) => (
                            <div key={idx} className="glass rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleQuestion(idx)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-lg gradient-purple-blue flex items-center justify-center font-semibold">
                                            {idx + 1}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-white font-medium">Question {idx + 1}</p>
                                            <p className="text-sm text-gray-400">Score: {qa.score || 0}/10</p>
                                        </div>
                                    </div>
                                    {expandedQuestions.has(idx) ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>

                                {expandedQuestions.has(idx) && (
                                    <div className="p-4 border-t border-white/10 space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">Question:</p>
                                            <p className="text-white">{qa.question}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">Your Answer:</p>
                                            <p className="text-gray-300">{qa.answer}</p>
                                        </div>
                                        {qa.strengths && qa.strengths.length > 0 && (
                                            <div>
                                                <p className="text-sm text-green-400 mb-1">What went well:</p>
                                                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                                                    {qa.strengths.map((s, i) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {qa.improvements && qa.improvements.length > 0 && (
                                            <div>
                                                <p className="text-sm text-orange-400 mb-1">Room for improvement:</p>
                                                <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                                                    {qa.improvements.map((i, idx) => (
                                                        <li key={idx}>{i}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* 30-Day Action Plan */}
                <GlassCard className="p-8">
                    <div className="flex items-center space-x-2 mb-6">
                        <Calendar className="w-6 h-6 text-purple-400" />
                        <h2 className="text-2xl font-semibold text-white">30-Day Action Plan</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(report.actionPlan || {}).map(([week, tasks]) => (
                            <div key={week} className="glass rounded-xl p-4">
                                <h4 className="text-lg font-semibold text-white mb-3 capitalize">
                                    {week.replace(/([A-Z])/g, ' $1').trim()}
                                </h4>
                                <ul className="space-y-2">
                                    {tasks.map((task, idx) => (
                                        <li key={idx} className="flex items-start space-x-2">
                                            <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300 text-sm">{task}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Actions */}
                <div className="flex justify-center space-x-4 mt-8">
                    <Button onClick={() => navigate('/dashboard')} variant="outline" size="lg">
                        Back to Dashboard
                    </Button>
                    <Button onClick={() => navigate('/interview/setup')} size="lg">
                        Start New Interview
                    </Button>
                </div>
            </div>
        </div>
    );
}
