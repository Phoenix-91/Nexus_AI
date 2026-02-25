import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Brain, FileText, Briefcase, Zap, CheckCircle, Key, Lightbulb } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const JOB_ROLES = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'UI/UX Designer',
    'Mobile Developer',
    'Machine Learning Engineer',
    'Software Architect',
    'QA Engineer',
    'Cloud Engineer',
    'Cybersecurity Analyst',
    'Blockchain Developer',
    'Data Engineer',
];

export default function ATSUpload() {
    const navigate = useNavigate();
    const [resume, setResume] = useState(null);
    const [jobRole, setJobRole] = useState('');
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file only');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be under 5MB');
            return;
        }
        setResume(file);
        toast.success('Resume uploaded! ✅');
    };

    const handleFileChange = (e) => handleFile(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!resume) { toast.error('Please upload your resume'); return; }
        if (!jobRole) { toast.error('Please select a job role'); return; }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('resume', resume);
            formData.append('jobRole', jobRole);

            const response = await axios.post(`${API_BASE}/ats/analyze`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success('Analysis complete! 🎉');
                navigate(`/tools/ats-checker/report/${response.data.reportId}`);
            }
        } catch (error) {
            console.error('ATS analysis failed:', error);
            toast.error(error.response?.data?.error || 'Failed to analyze resume. Please try again.');
        } finally {
            setUploading(false);
        }
    };

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
                        <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                            ← Back to Dashboard
                        </Link>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 rounded-2xl gradient-purple-blue flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-3">
                        ATS Score Checker
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Upload your resume and discover how well it matches your target role with AI-powered ATS analysis
                    </p>
                </div>

                {/* Upload Form */}
                <div className="glass border border-white/10 rounded-2xl p-8 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Drop Zone */}
                        <div>
                            <label className="block text-white font-semibold mb-3 text-lg">
                                Upload Resume (PDF)
                            </label>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
                                    ${dragOver ? 'border-purple-400 bg-purple-500/10' : 'border-gray-700 hover:border-purple-500 hover:bg-purple-500/5'}`}
                            >
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="resume-upload"
                                />
                                <label htmlFor="resume-upload" className="cursor-pointer">
                                    {resume ? (
                                        <div className="text-green-400">
                                            <CheckCircle className="w-14 h-14 mx-auto mb-3" />
                                            <p className="font-semibold text-lg">{resume.name}</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {(resume.size / 1024).toFixed(1)} KB · Click to change
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-gray-400">
                                            <FileText className="w-14 h-14 mx-auto mb-3 text-gray-600" />
                                            <p className="font-semibold text-lg text-gray-300">
                                                Drag & drop or click to upload
                                            </p>
                                            <p className="text-sm mt-1">PDF only · Max 5MB</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Job Role */}
                        <div>
                            <label className="block text-white font-semibold mb-3 text-lg">
                                Target Job Role
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
                                <select
                                    value={jobRole}
                                    onChange={(e) => setJobRole(e.target.value)}
                                    className="w-full bg-gray-900 text-white rounded-xl pl-12 pr-4 py-4 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none appearance-none transition-all"
                                >
                                    <option value="">Select your target job role...</option>
                                    {JOB_ROLES.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={uploading || !resume || !jobRole}
                            className="w-full py-4 rounded-xl font-bold text-lg text-white gradient-purple-blue hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                                    <span>Analyzing with AI...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-6 h-6" />
                                    <span>Check ATS Score</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        {
                            icon: <CheckCircle className="w-7 h-7 text-green-400" />,
                            title: 'ATS Compatibility',
                            desc: 'See if your resume passes modern ATS systems'
                        },
                        {
                            icon: <Key className="w-7 h-7 text-blue-400" />,
                            title: 'Keyword Analysis',
                            desc: 'Discover missing keywords that recruiters look for'
                        },
                        {
                            icon: <Lightbulb className="w-7 h-7 text-yellow-400" />,
                            title: 'AI Suggestions',
                            desc: 'Get personalized tips to boost your score'
                        },
                    ].map((card) => (
                        <div key={card.title} className="glass border border-white/10 rounded-xl p-5">
                            <div className="mb-3">{card.icon}</div>
                            <h3 className="text-white font-semibold mb-1">{card.title}</h3>
                            <p className="text-gray-400 text-sm">{card.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
