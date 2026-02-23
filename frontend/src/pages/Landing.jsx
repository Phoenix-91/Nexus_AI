import { Link } from 'react-router-dom';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import {
    Sparkles, Brain, Target, TrendingUp, Mic, FileText, Upload, MessageSquare,
    BarChart3, CheckCircle2, ArrowRight, Zap, Shield, Clock, Twitter, Github, Linkedin, Mail
} from 'lucide-react';
import { AuroraBackground } from '@/components/aceternity/AuroraBackground';
import { TextGenerateEffect } from '@/components/aceternity/TextGenerateEffect';
import { SpotlightCard } from '@/components/aceternity/SpotlightCard';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import PricingSection from '@/components/sections/PricingSection';

export default function Landing() {
    const { isSignedIn } = useUser();

    const features = [
        { icon: <Mic className="w-8 h-8" />, title: "Real-Time Voice Interviews", description: "Conduct interviews using natural voice conversation, just like a real interview" },
        { icon: <Brain className="w-8 h-8" />, title: "AI-Powered Questions", description: "Adaptive questioning based on your resume, role, and experience level" },
        { icon: <FileText className="w-8 h-8" />, title: "Resume Analysis", description: "Intelligent PDF parsing to understand your skills and experience" },
        { icon: <Target className="w-8 h-8" />, title: "Role-Specific Prep", description: "Tailored questions for Frontend, Backend, Full Stack, ML, and more" },
        { icon: <TrendingUp className="w-8 h-8" />, title: "Performance Analytics", description: "Detailed scoring across technical, communication, and problem-solving" },
        { icon: <Sparkles className="w-8 h-8" />, title: "Action Plans", description: "30-day improvement roadmap with week-by-week guidance" },
    ];

    const howItWorks = [
        { step: "01", icon: <Upload className="w-10 h-10" />, title: "Upload Your Resume", description: "Simply upload your PDF resume. Our AI analyzes your skills, experience, and projects to personalize your interview." },
        { step: "02", icon: <Target className="w-10 h-10" />, title: "Select Role & Level", description: "Choose your target job role (Frontend, Backend, ML, etc.) and experience level for tailored questions." },
        { step: "03", icon: <MessageSquare className="w-10 h-10" />, title: "Start Voice Interview", description: "Engage in a natural conversation with our AI interviewer. Answer questions using your voice, just like a real interview." },
        { step: "04", icon: <BarChart3 className="w-10 h-10" />, title: "Get Detailed Feedback", description: "Receive comprehensive analytics, scores, strengths, weaknesses, and a personalized 30-day improvement plan." },
    ];

    const benefits = [
        { icon: <Zap className="w-6 h-6" />, title: "Instant Feedback", description: "Get immediate insights after each interview session" },
        { icon: <Shield className="w-6 h-6" />, title: "Safe Practice Environment", description: "Practice without the pressure of real interviews" },
        { icon: <Clock className="w-6 h-6" />, title: "24/7 Availability", description: "Practice anytime, anywhere at your convenience" },
        { icon: <TrendingUp className="w-6 h-6" />, title: "Track Progress", description: "Monitor your improvement over multiple sessions" },
    ];

    const scrollToPricing = (e) => {
        e.preventDefault();
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <AuroraBackground>
            {/* ── Navbar ── */}
            <nav className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full gradient-purple-blue flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">NEXUS.AI</span>
                    </div>

                    {/* Nav links */}
                    <div className="hidden md:flex items-center space-x-6 text-sm text-gray-400">
                        <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">Features</a>
                        <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white transition-colors cursor-pointer">How it works</a>
                        <a href="#pricing" onClick={scrollToPricing} className="hover:text-white transition-colors cursor-pointer">Pricing</a>
                    </div>

                    <div className="flex items-center space-x-3">
                        {isSignedIn ? (
                            <>
                                <Link to="/dashboard">
                                    <Button variant="ghost">Dashboard</Button>
                                </Link>
                                <UserButton afterSignOutUrl="/" />
                            </>
                        ) : (
                            <>
                                <SignInButton mode="modal">
                                    <Button variant="ghost">Sign In</Button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <Button>Get Started</Button>
                                </SignUpButton>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── Main content ── */}
            <div className="max-w-7xl mx-auto px-6 py-20">

                {/* Hero */}
                <div className="text-center space-y-8">
                    <div className="inline-block animate-fade-in">
                        <div className="glass px-4 py-2 rounded-full text-sm text-purple-400 mb-6">
                            <Sparkles className="w-4 h-4 inline mr-2" />
                            AI-Powered Interview Preparation
                        </div>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
                        <TextGenerateEffect words="Master Your Next Interview with AI" className="text-6xl md:text-7xl font-bold" />
                    </h1>

                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Practice real-time voice interviews powered by advanced AI. Get personalized feedback,
                        detailed analytics, and actionable improvement plans.
                    </p>

                    <div className="flex items-center justify-center space-x-4 pt-4">
                        {isSignedIn ? (
                            <Link to="/dashboard">
                                <Button size="lg" className="text-lg px-10 animate-glow">
                                    Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        ) : (
                            <SignUpButton mode="modal">
                                <Button size="lg" className="text-lg px-10 animate-glow">
                                    Start Practicing Free <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </SignUpButton>
                        )}
                        <button onClick={scrollToPricing} className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4">
                            View Pricing
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
                        <div className="text-center"><div className="text-4xl font-bold gradient-text">10K+</div><div className="text-gray-400 text-sm mt-1">Interviews Conducted</div></div>
                        <div className="text-center"><div className="text-4xl font-bold gradient-text">95%</div><div className="text-gray-400 text-sm mt-1">Success Rate</div></div>
                        <div className="text-center"><div className="text-4xl font-bold gradient-text">4.9/5</div><div className="text-gray-400 text-sm mt-1">User Rating</div></div>
                    </div>
                </div>

                {/* How It Works */}
                <div id="how-it-works" className="mt-32">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Get started in 4 simple steps and ace your next interview</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {howItWorks.map((item, index) => (
                            <div key={index} className="relative">
                                <SpotlightCard>
                                    <GlassCard hover className="h-full p-8 text-center">
                                        <div className="text-6xl font-bold gradient-text mb-4 opacity-20">{item.step}</div>
                                        <div className="text-purple-400 mb-4 flex justify-center">{item.icon}</div>
                                        <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                                    </GlassCard>
                                </SpotlightCard>
                                {index < howItWorks.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                                        <ArrowRight className="w-6 h-6 text-purple-400/50" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features Grid */}
                <div id="features" className="mt-32">
                    <h2 className="text-5xl font-bold text-center text-white mb-4">Everything You Need to Succeed</h2>
                    <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">Comprehensive tools and features designed to help you excel in your interviews</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <SpotlightCard key={index}>
                                <GlassCard hover className="h-full p-8 group transition-all duration-300">
                                    <div className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                                </GlassCard>
                            </SpotlightCard>
                        ))}
                    </div>
                </div>

                {/* Benefits */}
                <div className="mt-32">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold text-white mb-4">Why Choose NEXUS.AI?</h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">The smartest way to prepare for your dream job interview</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, index) => (
                            <GlassCard key={index} hover className="p-6 text-center group">
                                <div className="w-14 h-14 rounded-full gradient-purple-blue flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <div className="text-white">{benefit.icon}</div>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                                <p className="text-gray-400 text-sm">{benefit.description}</p>
                            </GlassCard>
                        ))}
                    </div>
                </div>

                {/* ── PRICING SECTION ── */}
                <PricingSection isSignedIn={isSignedIn} />

                {/* CTA */}
                <div className="mt-32 text-center">
                    <GlassCard className="max-w-4xl mx-auto p-12 border-2 border-purple-500/30">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Ace Your Interview?</h2>
                        <p className="text-xl text-gray-300 mb-8">Join thousands of candidates who improved their interview skills with NEXUS.AI</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                            <div className="flex items-center text-gray-300"><CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />No credit card required</div>
                            <div className="flex items-center text-gray-300"><CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />Free to start</div>
                            <div className="flex items-center text-gray-300"><CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />Instant access</div>
                        </div>
                        {!isSignedIn && (
                            <SignUpButton mode="modal">
                                <Button size="lg" className="text-lg px-10 animate-glow">
                                    Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </SignUpButton>
                        )}
                    </GlassCard>
                </div>
            </div>

            {/* ── Footer ── */}
            <footer className="glass border-t border-white/10 mt-20">
                <div className="max-w-7xl mx-auto px-6 py-14">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
                        {/* Brand */}
                        <div className="md:col-span-1">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-9 h-9 rounded-full gradient-purple-blue flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold gradient-text">NEXUS.AI</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                AI-powered mock interviews to help you land your dream job. Practice smarter, not harder.
                            </p>
                            <div className="flex items-center gap-3 mt-5">
                                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                    <Twitter className="w-4 h-4" />
                                </a>
                                <a href="https://github.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                    <Github className="w-4 h-4" />
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                    <Linkedin className="w-4 h-4" />
                                </a>
                                <a href="mailto:hello@nexus.ai" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
                            <ul className="space-y-3">
                                {['Features', 'How it Works', 'Pricing', 'Changelog'].map(l => (
                                    <li key={l}><a href="#" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
                            <ul className="space-y-3">
                                {['About', 'Blog', 'Careers', 'Contact'].map(l => (
                                    <li key={l}><a href="#" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
                            <ul className="space-y-3">
                                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map(l => (
                                    <li key={l}><a href="#" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-600 text-sm">© 2026 NEXUS.AI. All rights reserved.</p>
                        <p className="text-gray-600 text-sm">
                            Built with ❤️ for ambitious developers everywhere
                        </p>
                    </div>
                </div>
            </footer>
        </AuroraBackground>
    );
}
