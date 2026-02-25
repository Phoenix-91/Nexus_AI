import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
    Brain, ArrowRight, Target, TrendingUp, Sparkles,
    CheckCircle2, Twitter, Github, Linkedin, Mail, ChevronDown,
    MessageSquare, BarChart3, Upload, Star
} from 'lucide-react';
import {
    RadarChart, Radar as RechartsRadar, PolarGrid, PolarAngleAxis,
    ResponsiveContainer
} from 'recharts';

import { AuroraBackground } from '@/components/aceternity/AuroraBackground';
import { TextGenerateEffect } from '@/components/aceternity/TextGenerateEffect';
import { TypewriterEffect } from '@/components/aceternity/TypewriterEffect';
import { MovingBorder } from '@/components/aceternity/MovingBorder';
import { BackgroundGradient } from '@/components/aceternity/BackgroundGradient';
import { SpotlightCard } from '@/components/aceternity/SpotlightCard';
import { InfiniteMovingCards } from '@/components/aceternity/InfiniteMovingCards';
import { SparklesCore } from '@/components/aceternity/SparklesCore';
import { Button } from '@/components/ui/button';
import PricingSection from '@/components/sections/PricingSection';

// ── Animation helpers ──────────────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
};
const staggerContainer = { show: { transition: { staggerChildren: 0.1 } } };

function Section({ children, className = '', id }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.section
            id={id}
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className={`py-28 ${className}`}
        >
            {children}
        </motion.section>
    );
}

function FadeUp({ children, delay = 0, className = '' }) {
    return (
        <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease: 'easeOut', delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ── Data ──────────────────────────────────────────────────────────────────
const TYPEWRITER_WORDS = [
    'Resume-Aware Questions',
    'Real-Time Voice AI',
    'Instant ATS Scoring',
    '30-Day Action Plans',
];

const STATS = [
    '⚡ 10,000+ Interviews Conducted',
    '🎯 92% Offer Rate Improvement',
    '💼 50+ Job Roles Supported',
    '🤖 Powered by Llama 3.3 & Claude',
    '🎙️ Deepgram Voice Engine',
    '📊 Real-Time Analytics',
    '🔐 Clerk Authentication',
    '🌍 Available 24/7',
];

const FEATURES = [
    {
        icon: '🎙️',
        color: 'from-purple-500 to-violet-600',
        title: 'Conversational Voice AI',
        description: 'Deepgram STT + TTS (Stella voice). Fully hands-free — speak your answers naturally like a real interview.',
    },
    {
        icon: '🤖',
        color: 'from-blue-500 to-indigo-600',
        title: 'Resume-Aware Questions',
        description: 'AI reads your CV and tailors every single question to your actual skills and experience — no generic prompts.',
    },
    {
        icon: '📊',
        color: 'from-green-500 to-emerald-600',
        title: 'Smart Analytics',
        description: 'Scored across Technical, Communication, and Problem-Solving axes with a breakdown per question.',
    },
    {
        icon: '📋',
        color: 'from-orange-500 to-red-500',
        title: 'ATS Score Checker',
        description: 'Upload resume + pick a job role → AI scores keyword gaps, format, and matches. Download a full PDF report.',
    },
    {
        icon: '📄',
        color: 'from-pink-500 to-rose-600',
        title: '30-Day Action Plan',
        description: 'Auto-generated week-by-week improvement roadmap with specific resources and milestones.',
    },
    {
        icon: '🧬',
        color: 'from-cyan-500 to-teal-600',
        title: 'Multi-LLM Backend',
        description: 'Groq Llama 3.3 70B, Claude, and Gemini — the best model for each task automatically selected.',
    },
];

const HOW_IT_WORKS = [
    { step: '01', icon: <Upload className="w-7 h-7" />, title: 'Sign Up & Upload Resume', description: 'Create your free account and upload your PDF resume. AI extracts your skills and experience instantly.' },
    { step: '02', icon: <Target className="w-7 h-7" />, title: 'Select Your Target Role', description: 'Choose from 50+ job roles — Frontend, Backend, Data Science, DevOps, Product, and more.' },
    { step: '03', icon: <MessageSquare className="w-7 h-7" />, title: 'Start Voice Interview', description: 'Speak your answers naturally. Silence detection auto-stops recording — zero button clicks needed.' },
    { step: '04', icon: <BarChart3 className="w-7 h-7" />, title: 'Get Your Report', description: 'Receive a full analytics report with scores, strengths, weaknesses, and an AI-generated action plan.' },
    { step: '05', icon: <TrendingUp className="w-7 h-7" />, title: 'Track & Improve', description: 'Run multiple sessions and watch your scores improve. Your ATS report shows whether your CV matches the role.' },
];

const ATS_RADAR_DATA = [
    { subject: 'Keywords', A: 72 },
    { subject: 'Format', A: 88 },
    { subject: 'Experience', A: 65 },
    { subject: 'Skills', A: 80 },
    { subject: 'Impact', A: 58 },
];

const TESTIMONIALS = [
    { name: 'Aanya Sharma', role: 'SDE Intern @ Google', avatar: '🧑‍💻', quote: 'NEXUS.AI gave me questions I actually got asked at Google. The voice interview felt so real — I went in 10x more confident.' },
    { name: 'Rohan Mehta', role: 'Frontend Dev @ Flipkart', avatar: '👨‍🎨', quote: 'The ATS checker showed me exactly which keywords my resume was missing. Got 3 interview calls the week after fixing it.' },
    { name: 'Priya Nair', role: 'Data Scientist @ Microsoft', avatar: '👩‍🔬', quote: 'The analytics report was brutally honest and incredibly useful. The 30-day plan helped me go from 60% to 87% in technical.' },
    { name: 'Dev Kapoor', role: 'ML Engineer @ Swiggy', avatar: '🧑‍🚀', quote: 'I used NEXUS.AI for 2 weeks before my ML interviews. The multi-turn voice conversation is indistinguishable from a real HR call.' },
    { name: 'Sneha Gupta', role: 'Full Stack @ Zomato', avatar: '👩‍💻', quote: 'The resume-aware questions feature blew my mind. It asked me about a specific project from my CV with follow-ups I didn\'t expect!' },
    { name: 'Arjun Verma', role: 'DevOps @ Razorpay', avatar: '🧑‍🔧', quote: 'Groq Llama 3.3 is incredibly fast. No awkward pauses — the conversation flows like talking to a real senior engineer.' },
];

const FAQS = [
    { q: 'What browsers support the voice interview?', a: 'Chrome 90+ and Edge 90+ give the best experience with full Deepgram STT/TTS support. Firefox and Safari have partial support.' },
    { q: 'What resume formats are accepted?', a: 'PDF only, up to 5MB. We use PyPDF2 on the Python backend for reliable text extraction from all PDF generators.' },
    { q: 'Which AI model powers the interviews?', a: 'Groq Llama 3.3 70B is the primary LLM for speed and quality. Claude and Gemini are used for specialized tasks like report generation.' },
    { q: 'How accurate is the ATS Score Checker?', a: 'The checker combines rule-based keyword matching against 10 job role profiles with Groq AI analysis. It\'s directionally accurate — treat scores as a strong signal, not an absolute guarantee.' },
    { q: 'Is my resume data private?', a: 'Yes. Uploaded resumes are processed in memory and deleted immediately after analysis. We never store raw PDF files beyond the session.' },
    { q: 'Can I practice multiple interview rounds?', a: 'Absolutely. Each session is tracked independently. You can run as many sessions as you like and compare your analytics over time.' },
    { q: 'Is NEXUS.AI free to use?', a: 'The free tier gives you access to core interview and ATS features. Pro ($9/mo) unlocks unlimited sessions and advanced analytics.' },
    { q: 'How is NEXUS.AI different from ChatGPT for interview prep?', a: 'NEXUS.AI integrates voice I/O, reads your actual resume, tracks scores, generates PDF reports, and checks your CV against ATS systems — all in one flow.' },
];

// ── FAQ Accordion ──────────────────────────────────────────────────────────
function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            className="border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/40 transition-colors duration-300 cursor-pointer"
            onClick={() => setOpen(!open)}
        >
            <div className="flex items-center justify-between px-6 py-5 text-white font-medium">
                <span>{q}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="w-5 h-5 text-purple-400 flex-shrink-0 ml-4" />
                </motion.div>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                            {a}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Count-up hook ─────────────────────────────────────────────────────────
function useCountUp(target, duration = 1800, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const step = (ts) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);
    return count;
}

// ── Scroll-reveal hook (IntersectionObserver, no deps) ──────────────────
function useScrollReveal() {
    useEffect(() => {
        const elements = document.querySelectorAll('[data-reveal]');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '-40px 0px' }
        );
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Landing() {
    const { isSignedIn } = useUser();
    const navigate = useNavigate();
    const heroRef = useRef(null);
    const statsInView = useInView(heroRef, { once: true });
    const [spotlight, setSpotlight] = useState({ x: -999, y: -999 });

    useScrollReveal();

    const handleMouseMove = useCallback((e) => {
        const rect = heroRef.current?.getBoundingClientRect();
        if (!rect) return;
        setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }, []);

    const count1 = useCountUp(10000, 2000, statsInView);
    const count2 = useCountUp(92, 1800, statsInView);

    const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    return (
        <AuroraBackground>
            {/* ── Navbar ───────────────────────────────────────────────────── */}
            <nav className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full gradient-purple-blue flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">NEXUS.AI</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-6 text-sm text-gray-400">
                        {[['features', 'Features'], ['how-it-works', 'How it Works'], ['ats-section', 'ATS Checker'], ['pricing', 'Pricing'], ['faq', 'FAQ']].map(([id, label]) => (
                            <button key={id} onClick={() => scrollTo(id)} className="hover:text-white transition-colors">
                                {label}
                            </button>
                        ))}
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

            {/* Shimmer keyframe */}
            <style>{`
                @keyframes shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                .text-shimmer {
                    background: linear-gradient(90deg, #8b5cf6 0%, #c4b5fd 40%, #ffffff 50%, #c4b5fd 60%, #6366f1 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer 3s linear infinite;
                }
            `}</style>

            {/* ── 1. HERO ──────────────────────────────────────────────────── */}
            <section
                ref={heroRef}
                onMouseMove={handleMouseMove}
                className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 pt-16 pb-8 overflow-hidden"
            >
                {/* Cursor spotlight */}
                <div
                    className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(400px circle at ${spotlight.x}px ${spotlight.y}px, rgba(139,92,246,0.10), transparent 60%)`,
                    }}
                />

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="relative z-10 max-w-5xl mx-auto space-y-7"
                >
                    {/* Badge */}
                    <FadeUp delay={0}>
                        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-purple-400 border border-purple-500/30">
                            <Sparkles className="w-4 h-4" />
                            AI-Powered Interview Platform · v2.1
                        </div>
                    </FadeUp>

                    {/* Headline — two lines, tight leading, NO gap */}
                    <FadeUp delay={0.1}>
                        <h1
                            className="font-bold text-white tracking-tight"
                            style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 1.08 }}
                        >
                            {/* Line 1: blur-in words */}
                            <TextGenerateEffect words="Ace Every Interview." />
                            {/* Line 2: shimmer gradient — display:block keeps it on its own line
                                but because both are inline/span children of h1 with line-height
                                1.08 there is no extra block margin */}
                            <span
                                className="text-shimmer block"
                                style={{ lineHeight: 'inherit' }}
                            >
                                Powered by AI.
                            </span>
                        </h1>
                    </FadeUp>

                    {/* Typewriter */}
                    <FadeUp delay={0.25}>
                        <p className="text-xl md:text-2xl text-gray-400">
                            Master{' '}
                            <TypewriterEffect
                                words={TYPEWRITER_WORDS}
                                className="text-xl md:text-2xl font-semibold"
                            />
                        </p>
                    </FadeUp>

                    {/* CTAs */}
                    <FadeUp delay={0.35}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
                            {isSignedIn ? (
                                <Link to="/dashboard">
                                    <MovingBorder>
                                        <button className="px-8 py-3 text-white font-semibold flex items-center gap-2 text-lg">
                                            Go to Dashboard <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </MovingBorder>
                                </Link>
                            ) : (
                                <SignUpButton mode="modal">
                                    <MovingBorder>
                                        <button className="px-8 py-3 text-white font-semibold flex items-center gap-2 text-lg">
                                            Start Free Interview <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </MovingBorder>
                                </SignUpButton>
                            )}
                            <button
                                onClick={() => scrollTo('ats-section')}
                                className="px-8 py-3 rounded-2xl border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-all text-lg font-medium"
                            >
                                Check ATS Score
                            </button>
                        </div>
                    </FadeUp>

                    {/* Stats row — animated count-up */}
                    <FadeUp delay={0.45}>
                        <div className="flex items-center justify-center gap-10 pt-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold gradient-text tabular-nums">
                                    {statsInView ? (count1 >= 10000 ? '10K+' : `${(count1 / 1000).toFixed(1)}K`) : '0'}
                                </div>
                                <div className="text-gray-500 text-xs mt-1">Interviews</div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center">
                                <div className="text-3xl font-bold gradient-text tabular-nums">
                                    {statsInView ? `${count2}%` : '0%'}
                                </div>
                                <div className="text-gray-500 text-xs mt-1">Offer Rate</div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center">
                                <div className="text-3xl font-bold gradient-text">4.9★</div>
                                <div className="text-gray-500 text-xs mt-1">Rating</div>
                            </div>
                        </div>
                    </FadeUp>

                    {/* Mock card preview */}
                    <FadeUp delay={0.5}>
                        <motion.div
                            whileHover={{ y: -6, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="max-w-2xl mx-auto"
                        >
                            <BackgroundGradient containerClassName="rounded-2xl" className="p-5 rounded-2xl">
                                <div className="glass rounded-xl p-5 text-left space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <span className="text-gray-500 text-xs ml-auto">NEXUS.AI Interview Session</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">AI</div>
                                            <div className="glass rounded-xl rounded-tl-none px-4 py-2 text-sm text-gray-200">
                                                Tell me about a challenging project from your resume — the React dashboard you built. How did you handle state management at scale?
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 flex-row-reverse">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-xs font-bold flex-shrink-0">You</div>
                                            <div className="bg-purple-600/30 border border-purple-500/30 rounded-xl rounded-tr-none px-4 py-2 text-sm text-gray-200">
                                                I used Zustand for global state and React Query for server state, keeping them completely separate...
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-1">
                                        <motion.div
                                            animate={{ scale: [1, 1.3, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="w-2 h-2 rounded-full bg-green-400"
                                        />
                                        <span className="text-green-400 text-xs">Recording... Speak your answer</span>
                                    </div>
                                </div>
                            </BackgroundGradient>
                        </motion.div>
                    </FadeUp>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600 cursor-pointer z-10"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    onClick={() => scrollTo('features')}
                >
                    <span className="text-xs tracking-widest uppercase">Scroll</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </motion.div>
            </section>

            {/* ── 2. STATS TICKER ─────────────────────────────────────────── */}
            <div className="py-8 border-y border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-purple-900/20 pointer-events-none" />
                <InfiniteMovingCards
                    items={STATS}
                    speed="normal"
                    pauseOnHover
                    itemClassName="mx-3"
                    renderItem={(item) => (
                        <div className="glass border border-purple-500/20 rounded-full px-6 py-2 text-sm font-medium text-white/80 whitespace-nowrap hover:border-purple-500/50 hover:text-white transition-all">
                            {item}
                        </div>
                    )}
                />
            </div>

            <div className="max-w-7xl mx-auto px-6">

                {/* ── 3. FEATURES ──────────────────────────────────────────── */}
                <Section id="features">
                    <div data-reveal className="text-center mb-16">
                        <div className="inline-block glass px-4 py-2 rounded-full text-sm text-purple-400 border border-purple-500/20 mb-4">Why NEXUS.AI?</div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">Six powerful tools — voice AI, smart analytics, ATS checking — all in one platform.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {FEATURES.map((f, i) => (
                            <div key={i} data-reveal data-reveal-delay={String((i % 3) * 100)}>
                                <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                                    <SpotlightCard>
                                        <div className="h-full p-7 glass rounded-2xl border border-white/10 group relative overflow-hidden">
                                            {/* Gradient bottom border */}
                                            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                                className="text-4xl mb-4"
                                            >
                                                {f.icon}
                                            </motion.div>
                                            <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                                            <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
                                        </div>
                                    </SpotlightCard>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* ── 4. HOW IT WORKS ──────────────────────────────────────── */}
                <Section id="how-it-works">
                    <div data-reveal className="text-center mb-16">
                        <div className="inline-block glass px-4 py-2 rounded-full text-sm text-purple-400 border border-purple-500/20 mb-4">Simple Process</div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Land Your Dream Job in 5 Steps</h2>
                        <p className="text-lg text-gray-400">From upload to offer — the complete journey.</p>
                    </div>

                    <div className="relative max-w-3xl mx-auto">
                        {/* Vertical line */}
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-blue-500 to-transparent hidden md:block" />

                        <div className="space-y-6">
                            {HOW_IT_WORKS.map((step, i) => (
                                <div key={i} data-reveal="left" data-reveal-delay={String(i * 100)}>
                                    <motion.div
                                        whileHover={{ x: 6 }}
                                        className="flex items-start gap-6 md:pl-4"
                                    >
                                        {/* Step circle */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-16 h-16 rounded-full glass border border-purple-500/40 flex items-center justify-center text-purple-400 z-10 relative">
                                                {step.icon}
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                                {i + 1}
                                            </div>
                                        </div>
                                        {/* Content */}
                                        <div className="glass border border-white/10 rounded-2xl px-6 py-5 flex-1 hover:border-purple-500/30 transition-colors">
                                            <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                                            <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* ── 5. ATS HIGHLIGHT ─────────────────────────────────────── */}
                <Section id="ats-section">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left — animated ATS card */}
                        <div data-reveal="left">
                            <motion.div
                                initial={{ y: 0 }}
                                animate={{ y: [-8, 8, -8] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <BackgroundGradient containerClassName="rounded-3xl" className="p-6 rounded-3xl">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">ATS REPORT</div>
                                                <div className="text-white font-bold text-lg">Frontend Developer</div>
                                            </div>
                                            <div className="w-16 h-16 rounded-full glass border-4 border-purple-500 flex items-center justify-center">
                                                <span className="text-xl font-bold text-purple-400">78</span>
                                            </div>
                                        </div>

                                        {/* Mini radar chart */}
                                        <div className="h-44">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart data={ATS_RADAR_DATA}>
                                                    <PolarGrid stroke="#ffffff15" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                                    <RechartsRadar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="space-y-2">
                                            {[['Missing', 'TypeScript, Next.js, Redux', 'text-red-400'], ['Found', 'React, JavaScript, CSS', 'text-green-400']].map(([label, val, color]) => (
                                                <div key={label} className="flex items-start gap-2 text-sm">
                                                    <span className="text-gray-500">{label}:</span>
                                                    <span className={color}>{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </BackgroundGradient>
                            </motion.div>
                        </div>

                        {/* Right — copy */}
                        <div data-reveal="right">
                            <div className="space-y-6">
                                <div className="inline-block glass px-4 py-2 rounded-full text-sm text-orange-400 border border-orange-500/20">ATS Score Checker</div>
                                <h2 className="text-4xl md:text-5xl font-bold text-white">Is Your Resume <br /><span className="gradient-text">ATS-Ready?</span></h2>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    Most resumes get rejected before a human even reads them. Our AI-powered checker tells you exactly why — and how to fix it.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        'Keyword gap analysis against 10+ job role profiles',
                                        'Format & structure scoring (headers, bullets, length)',
                                        'Skills match with must-have vs. nice-to-have breakdown',
                                        'AI-written suggestions with specific action steps',
                                        'Full PDF report download in one click',
                                    ].map((point, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1, duration: 0.4 }}
                                            className="flex items-start gap-3 text-gray-300"
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            {point}
                                        </motion.li>
                                    ))}
                                </ul>
                                {isSignedIn ? (
                                    <button
                                        onClick={() => navigate('/tools/ats-checker')}
                                        className="mt-2 px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold flex items-center gap-2 transition-all"
                                    >
                                        Check My Resume <ArrowRight className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <SignUpButton mode="modal">
                                        <button className="mt-2 px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold flex items-center gap-2 transition-all">
                                            Check My Resume <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </SignUpButton>
                                )}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ── 6. TESTIMONIALS ──────────────────────────────────────── */}
                <Section>
                    <div data-reveal="scale" className="text-center mb-14">
                        <div className="inline-block glass px-4 py-2 rounded-full text-sm text-yellow-400 border border-yellow-500/20 mb-4">Loved by Developers</div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Real Results, Real People</h2>
                        <div className="flex justify-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                        </div>
                        <p className="text-gray-500 text-sm">4.9 / 5.0 average from 10,000+ users</p>
                    </div>
                    <InfiniteMovingCards
                        items={TESTIMONIALS}
                        speed="slow"
                        pauseOnHover
                        itemClassName="mx-3"
                        renderItem={(t) => (
                            <div className="w-80 glass border border-white/10 rounded-2xl p-6 space-y-4 hover:border-purple-500/30 transition-colors">
                                <p className="text-gray-300 text-sm leading-relaxed italic">"{t.quote}"</p>
                                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-semibold">{t.name}</div>
                                        <div className="text-purple-400 text-xs">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                </Section>

                {/* ── 7. PRICING ───────────────────────────────────────────── */}
                <div id="pricing">
                    <PricingSection isSignedIn={isSignedIn} />
                </div>

                {/* ── 8. FAQ ───────────────────────────────────────────────── */}
                <Section id="faq">
                    <div data-reveal className="text-center mb-14">
                        <div className="inline-block glass px-4 py-2 rounded-full text-sm text-blue-400 border border-blue-500/20 mb-4">Got Questions?</div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Frequently Asked</h2>
                    </div>
                    <div className="max-w-3xl mx-auto space-y-3">
                        {FAQS.map((item, i) => (
                            <div key={i} data-reveal data-reveal-delay={String(Math.min(i * 100, 500))}>
                                <FAQItem q={item.q} a={item.a} />
                            </div>
                        ))}
                    </div>
                </Section>

            </div>

            {/* ── 9. FINAL CTA ─────────────────────────────────────────────── */}
            <section className="relative py-32 overflow-hidden">
                <SparklesCore
                    particleColor="#8b5cf6"
                    particleDensity={50}
                    particleSpeed={0.25}
                    className="opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent pointer-events-none" />

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8"
                >
                    <FadeUp>
                        <div className="inline-block glass px-4 py-2 rounded-full text-sm text-green-400 border border-green-500/20 mb-2">Free to Start</div>
                        <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                            Your Next Offer<br />
                            <span className="gradient-text">Starts Here.</span>
                        </h2>
                    </FadeUp>
                    <FadeUp delay={0.1}>
                        <p className="text-xl text-gray-400 max-w-xl mx-auto">
                            Join 10,000+ developers who leveled up their interview game with NEXUS.AI. No credit card required.
                        </p>
                    </FadeUp>
                    <FadeUp delay={0.2}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {isSignedIn ? (
                                <Link to="/dashboard">
                                    <MovingBorder duration={2500}>
                                        <button className="px-10 py-4 text-white font-bold text-xl flex items-center gap-2">
                                            Go to Dashboard <ArrowRight className="w-6 h-6" />
                                        </button>
                                    </MovingBorder>
                                </Link>
                            ) : (
                                <SignUpButton mode="modal">
                                    <MovingBorder duration={2500}>
                                        <button className="px-10 py-4 text-white font-bold text-xl flex items-center gap-2">
                                            Start for Free <ArrowRight className="w-6 h-6" />
                                        </button>
                                    </MovingBorder>
                                </SignUpButton>
                            )}
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
                            {['No credit card', 'Free tier forever', 'Cancel anytime'].map((t) => (
                                <span key={t} className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />{t}
                                </span>
                            ))}
                        </div>
                    </FadeUp>
                </motion.div>
            </section>

            {/* ── 10. FOOTER ───────────────────────────────────────────────── */}
            <footer className="glass border-t border-white/10 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
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
                            <p className="text-gray-500 text-sm leading-relaxed mb-5">
                                AI-powered mock interviews to help you land your dream job. Practice smarter, not harder.
                            </p>
                            <div className="flex items-center gap-3">
                                {[['https://twitter.com', <Twitter className="w-4 h-4" />], ['https://github.com', <Github className="w-4 h-4" />], ['https://linkedin.com', <Linkedin className="w-4 h-4" />], ['mailto:hello@nexus.ai', <Mail className="w-4 h-4" />]].map(([href, icon], i) => (
                                    <a key={i} href={href} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                        {icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
                            <ul className="space-y-3">
                                {['Features', 'How it Works', 'ATS Checker', 'Pricing', 'Changelog'].map(l => (
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

                    <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-600 text-sm">© 2026 NEXUS.AI. All rights reserved.</p>
                        <p className="text-gray-600 text-sm">Built with ❤️ for ambitious developers everywhere</p>
                    </div>
                </div>
            </footer>
        </AuroraBackground>
    );
}
