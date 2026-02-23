import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Brain, Upload, Briefcase, Award, ArrowRight, ArrowLeft } from 'lucide-react';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { FileUpload } from '@/components/common/FileUpload';
import { Loader } from '@/components/common/Loader';
import { resumeService, interviewService } from '@/services/interviewService';
import { useInterviewStore } from '@/store/useInterviewStore';
import { JOB_ROLES, EXPERIENCE_LEVELS } from '@/utils/constants';

export default function InterviewSetup() {
    const navigate = useNavigate();
    const { setSessionId, setResumeId, setJobRole, setExperienceLevel } = useInterviewStore();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [resumeFile, setResumeFile] = useState(null);
    const [uploadedResumeId, setUploadedResumeId] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');

    const handleResumeUpload = async () => {
        if (!resumeFile) {
            setError('Please select a resume file');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await resumeService.upload(resumeFile);
            setUploadedResumeId(response.resumeId);
            setResumeId(response.resumeId);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload resume');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelection = () => {
        if (!selectedRole) {
            setError('Please select a job role');
            return;
        }
        setJobRole(selectedRole);
        setError('');
        setStep(3);
    };

    const handleStartInterview = async () => {
        if (!selectedLevel) {
            setError('Please select an experience level');
            return;
        }

        setLoading(true);
        setError('');

        try {
            setExperienceLevel(selectedLevel);
            const response = await interviewService.start(
                uploadedResumeId,
                selectedRole,
                selectedLevel
            );

            setSessionId(response.sessionId);
            navigate(`/interview/${response.sessionId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start interview');
            setLoading(false);
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
                    <UserButton afterSignOutUrl="/" />
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Progress Indicator */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${s <= step
                                            ? 'gradient-purple-blue text-white'
                                            : 'glass text-gray-400'
                                        }`}
                                >
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 rounded transition-all ${s < step ? 'gradient-purple-blue' : 'glass'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Upload Resume</span>
                        <span>Select Role</span>
                        <span>Experience Level</span>
                    </div>
                </div>

                {/* Step Content */}
                <GlassCard className="p-8">
                    {/* Step 1: Upload Resume */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-full gradient-purple-blue mx-auto mb-4 flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Upload Your Resume
                                </h2>
                                <p className="text-gray-400">
                                    We'll analyze your resume to ask relevant questions
                                </p>
                            </div>

                            <FileUpload onFileSelect={setResumeFile} />

                            {error && (
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    onClick={handleResumeUpload}
                                    disabled={!resumeFile || loading}
                                    size="lg"
                                >
                                    {loading ? <Loader size="sm" /> : (
                                        <>
                                            Next <ArrowRight className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Job Role */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-full gradient-purple-blue mx-auto mb-4 flex items-center justify-center">
                                    <Briefcase className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Select Job Role
                                </h2>
                                <p className="text-gray-400">
                                    Choose the role you're interviewing for
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Job Role
                                </label>
                                <Select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                >
                                    <option value="">Select a role...</option>
                                    {JOB_ROLES.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            )}

                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    size="lg"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                                </Button>
                                <Button
                                    onClick={handleRoleSelection}
                                    disabled={!selectedRole}
                                    size="lg"
                                >
                                    Next <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Select Experience Level */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-full gradient-purple-blue mx-auto mb-4 flex items-center justify-center">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Experience Level
                                </h2>
                                <p className="text-gray-400">
                                    Select your experience level for tailored questions
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Experience Level
                                </label>
                                <Select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                >
                                    <option value="">Select experience level...</option>
                                    {EXPERIENCE_LEVELS.map((level) => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            )}

                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(2)}
                                    size="lg"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                                </Button>
                                <Button
                                    onClick={handleStartInterview}
                                    disabled={!selectedLevel || loading}
                                    size="lg"
                                    className="animate-glow"
                                >
                                    {loading ? <Loader size="sm" /> : 'Start Interview'}
                                </Button>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
}
