import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function TypewriterEffect({ words = [], className, cursorClassName }) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!words.length) return;
        const word = words[currentWordIndex];
        let timeout;

        if (!isDeleting && currentText === word) {
            // Pause before deleting
            timeout = setTimeout(() => setIsDeleting(true), 1800);
        } else if (isDeleting && currentText === '') {
            // Move to next word
            setIsDeleting(false);
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
        } else {
            const delta = isDeleting ? 60 : 80;
            timeout = setTimeout(() => {
                setCurrentText(prev =>
                    isDeleting ? prev.slice(0, -1) : word.slice(0, prev.length + 1)
                );
            }, delta);
        }

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentWordIndex, words]);

    return (
        <span className={cn('inline-flex items-center', className)}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentText.length === 0 ? 'empty' : currentText[0]}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400"
                >
                    {currentText}
                </motion.span>
            </AnimatePresence>
            <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className={cn('ml-0.5 inline-block w-0.5 h-[1em] bg-purple-400 align-middle', cursorClassName)}
            />
        </span>
    );
}
