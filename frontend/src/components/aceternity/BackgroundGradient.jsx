import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Aceternity-style BackgroundGradient card wrapper
 * Wraps children in an animated gradient border with glow
 */
export function BackgroundGradient({ children, className, containerClassName }) {
    return (
        <div className={cn('relative p-[2px] rounded-3xl group', containerClassName)}>
            {/* Animated gradient border */}
            <div
                className="absolute inset-0 rounded-3xl z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6, #06b6d4, #6366f1)',
                    backgroundSize: '300% 300%',
                    animation: 'gradientShift 4s ease infinite',
                }}
            />
            {/* Glow effect */}
            <div
                className="absolute inset-0 rounded-3xl z-0 blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)',
                }}
            />
            {/* Content */}
            <div className={cn('relative z-10 rounded-[22px] bg-[#0f0f0f]', className)}>
                {children}
            </div>
            <style>{`
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
}
