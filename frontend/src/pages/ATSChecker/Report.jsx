import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Brain, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import axios from 'axios';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const COLORS = ['#8b5cf6', '#1e1b4b'];

const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
};

const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (score >= 40) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
};

export default function ATSReport() {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReport();
    }, [reportId]);

    const loadReport = async () => {
        try {
            const response = await axios.get(`${API_BASE}/ats/report/${reportId}`);
            setReport(response.data.report);
        } catch (error) {
            console.error('Failed to load report:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async () => {
        try {
            const response = await axios.get(`${API_BASE}/ats/download/${reportId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ATS_Report_${reportId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4" />
                    <p className="text-white text-xl font-semibold">Generating your report...</p>
                    <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl text-white font-bold mb-2">Report Not Found</h2>
                    <p className="text-gray-400 mb-6">We couldn't find this report.</p>
                    <button
                        onClick={() => navigate('/tools/ats-checker')}
                        className="text-purple-400 hover:text-purple-300 underline"
                    >
                        Try another resume →
                    </button>
                </div>
            </div>
        );
    }

    const gaugeData = [
        { name: 'Score', value: report.atsScore },
        { name: 'Remaining', value: 100 - report.atsScore }
    ];

    const categoryData = [
        { category: 'Keywords', score: report.keywordScore || 0 },
        { category: 'Format', score: report.formatScore || 0 },
        { category: 'Experience', score: report.experienceScore || 0 },
        { category: 'Skills', score: report.skillsScore || 0 },
    ];

    const radarData = (report.skillsAnalysis || []).map(s => ({
        skill: s.name,
        score: s.score,
        fullMark: 100
    }));

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
                    <div className="flex items-center space-x-4">
                        <Link to="/tools/ats-checker" className="text-gray-400 hover:text-white transition-colors text-sm">
                            ← New Analysis
                        </Link>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* Report Header */}
                <div className="glass border border-white/10 rounded-2xl p-8 mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">ATS Analysis Report</h1>
                        <p className="text-gray-400">
                            <span className="text-purple-400 font-medium">{report.jobRole}</span>
                            {' · '}
                            {new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={downloadReport}
                        className="flex items-center gap-2 px-6 py-3 gradient-purple-blue text-white rounded-xl font-semibold hover:opacity-90 transition-all flex-shrink-0"
                    >
                        <Download className="w-5 h-5" />
                        Download PDF
                    </button>
                </div>

                {/* Score + Category */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Gauge */}
                    <div className="glass border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-2">Overall ATS Score</h2>
                        <div className="relative">
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={gaugeData}
                                        cx="50%"
                                        cy="50%"
                                        startAngle={90}
                                        endAngle={-270}
                                        innerRadius={72}
                                        outerRadius={100}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {gaugeData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className={`text-6xl font-bold ${getScoreColor(report.atsScore)}`}>
                                    {report.atsScore}
                                </div>
                                <div className="text-gray-400 text-sm">out of 100</div>
                            </div>
                        </div>
                        <div className="mt-2 text-center">
                            <span className={`inline-block px-5 py-2 rounded-full font-semibold border ${getScoreBg(report.atsScore)}`}>
                                {report.verdict}
                            </span>
                        </div>
                    </div>

                    {/* Category Bar Chart */}
                    <div className="glass border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Category Breakdown</h2>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={categoryData} barSize={36}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                <XAxis dataKey="category" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} />
                                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 100]} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '10px', color: '#fff' }}
                                    cursor={{ fill: 'rgba(139,92,246,0.08)' }}
                                />
                                <Bar dataKey="score" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skills Radar */}
                {radarData.length > 0 && (
                    <div className="glass border border-white/10 rounded-2xl p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Skills Match Radar</h2>
                        <ResponsiveContainer width="100%" height={360}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#1f2937" />
                                <PolarAngleAxis dataKey="skill" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                <Radar
                                    name="Match %"
                                    dataKey="score"
                                    stroke="#8b5cf6"
                                    fill="#8b5cf6"
                                    fillOpacity={0.5}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Keywords Row */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Missing */}
                    <div className="glass border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-2">🔴 Missing Keywords</h2>
                        <p className="text-gray-400 text-sm mb-4">Add these to improve your score:</p>
                        <div className="flex flex-wrap gap-2">
                            {(report.missingKeywords || []).map((kw, i) => (
                                <span key={i} className="px-3 py-1.5 bg-red-500/15 text-red-400 border border-red-500/30 rounded-full text-sm font-medium">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Found */}
                    <div className="glass border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-2">🟢 Found Keywords</h2>
                        <p className="text-gray-400 text-sm mb-4">Great — these are already in your resume:</p>
                        <div className="flex flex-wrap gap-2">
                            {(report.foundKeywords || []).map((kw, i) => (
                                <span key={i} className="px-3 py-1.5 bg-green-500/15 text-green-400 border border-green-500/30 rounded-full text-sm font-medium">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Suggestions */}
                <div className="glass border border-white/10 rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">💡 AI-Powered Suggestions</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {(report.suggestions || []).map((s, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                <span className="text-2xl flex-shrink-0">{s.icon}</span>
                                <div>
                                    <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{s.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Analysis */}
                <div className="glass border border-white/10 rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">📊 Detailed Analysis</h2>
                    <p className="text-gray-300 leading-relaxed text-[15px]">{report.detailedAnalysis}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate('/tools/ats-checker')}
                        className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 rounded-xl font-semibold transition-all"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Analyze Another Resume
                    </button>
                    <button
                        onClick={downloadReport}
                        className="flex-1 flex items-center justify-center gap-2 gradient-purple-blue text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all"
                    >
                        <Download className="w-5 h-5" />
                        Download PDF Report
                    </button>
                </div>
            </div>
        </div>
    );
}
