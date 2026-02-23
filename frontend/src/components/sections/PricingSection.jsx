import { useState } from 'react';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { BackgroundGradient } from '@/components/aceternity/BackgroundGradient';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { SignUpButton } from '@clerk/clerk-react';

const FREE_FEATURES = [
    '3 mock interviews / month',
    'Basic AI feedback report',
    '1 job role selection',
    'Standard question bank',
    'Email support',
];

const BETA_FEATURES = [
    'Unlimited interviews',
    'Advanced AI scoring',
    'Multiple job roles',
    'Full question bank access',
    'Priority support',
    'Early access to new features',
];

const PRO_FEATURES = [
    'Everything in Beta',
    'GPT-4 / Claude / Gemini models',
    'Custom interview personas',
    'Detailed analytics dashboard',
    'Resume deep analysis',
    'API access',
];

function FeatureItem({ text }) {
    return (
        <li className="flex items-center gap-3 text-sm text-gray-300">
            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            {text}
        </li>
    );
}

export default function PricingSection({ isSignedIn }) {
    const [yearly, setYearly] = useState(false);

    return (
        <section id="pricing" className="mt-32">
            {/* Heading */}
            <div className="text-center mb-4">
                <h2 className="text-5xl font-bold text-white mb-3">
                    Simple, Transparent{' '}
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Pricing
                    </span>
                </h2>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                    Start free, upgrade when you're ready. No hidden fees.
                </p>
            </div>

            {/* Monthly / Yearly toggle */}
            <div className="flex items-center justify-center gap-4 mb-14">
                <span className={`text-sm font-medium ${!yearly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
                <button
                    onClick={() => setYearly(!yearly)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${yearly ? 'bg-purple-600' : 'bg-white/10'}`}
                >
                    <span
                        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${yearly ? 'left-8' : 'left-1'}`}
                    />
                </button>
                <span className={`text-sm font-medium flex items-center gap-2 ${yearly ? 'text-white' : 'text-gray-500'}`}>
                    Yearly
                    <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                        Save 20%
                    </span>
                </span>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

                {/* ── FREE ── */}
                <GlassCard className="p-7 rounded-2xl border border-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-gray-300">
                                Get Started
                            </span>
                            <h3 className="text-2xl font-bold text-white mt-3">Free</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-gray-400" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <span className="text-4xl font-bold text-white">$0</span>
                        <span className="text-gray-500 ml-1">/month</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                        {FREE_FEATURES.map((f) => <FeatureItem key={f} text={f} />)}
                    </ul>

                    {isSignedIn ? (
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                            Current Plan
                        </Button>
                    ) : (
                        <SignUpButton mode="modal">
                            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                                Start Free
                            </Button>
                        </SignUpButton>
                    )}
                </GlassCard>

                {/* ── BETA (FEATURED) ── */}
                <div className="-mt-4 md:-mt-6">
                    <BackgroundGradient containerClassName="w-full">
                        <div className="p-7">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        🚧 Under Development
                                    </span>
                                    <h3 className="text-2xl font-bold text-white mt-3">Beta</h3>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-purple-400" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">$0</span>
                                <span className="text-gray-400 ml-1">/month</span>
                                <p className="text-xs text-purple-400 mt-1">Free while in beta — limited spots</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {BETA_FEATURES.map((f) => <FeatureItem key={f} text={f} />)}
                            </ul>

                            {isSignedIn ? (
                                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-purple-900/40">
                                    You're In Beta 🎉
                                </Button>
                            ) : (
                                <SignUpButton mode="modal">
                                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-purple-900/40">
                                        Join Beta
                                    </Button>
                                </SignUpButton>
                            )}
                        </div>
                    </BackgroundGradient>
                </div>

                {/* ── PRO ── */}
                <GlassCard className="p-7 rounded-2xl border border-purple-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-800/30 transition-all duration-300"
                    style={{ boxShadow: '0 0 30px rgba(139,92,246,0.08)' }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Most Powerful
                            </span>
                            <h3 className="text-2xl font-bold text-white mt-3">Pro</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-600/10 flex items-center justify-center">
                            <Crown className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <span className="text-4xl font-bold text-white">
                            ${yearly ? '8' : '10'}
                        </span>
                        <span className="text-gray-500 ml-1">/month</span>
                        {yearly && (
                            <span className="ml-2 text-xs text-green-400 line-through text-gray-500">$10</span>
                        )}
                    </div>

                    <ul className="space-y-3 mb-8">
                        {PRO_FEATURES.map((f) => <FeatureItem key={f} text={f} />)}
                    </ul>

                    <Button className="w-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors">
                        Unlock Pro
                    </Button>
                </GlassCard>
            </div>

            {/* Trust line */}
            <p className="text-center text-gray-500 text-sm mt-8">
                No credit card required for free tier &bull; Cancel anytime &bull; Instant access
            </p>
        </section>
    );
}
