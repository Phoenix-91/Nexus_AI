import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * SparklesCore — Canvas-based floating particle/sparkle effect.
 * Lightweight and self-contained, no extra dependencies.
 */
export function SparklesCore({
    id = 'sparkles',
    className,
    background = 'transparent',
    minSize = 0.8,
    maxSize = 1.8,
    particleDensity = 80,
    particleColor = '#8b5cf6',
    particleSpeed = 0.3,
}) {
    const canvasRef = useRef(null);
    const animRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            initParticles();
        };

        function initParticles() {
            particles = [];
            const count = Math.floor((canvas.width * canvas.height) / (10000 / particleDensity));
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * (maxSize - minSize) + minSize,
                    speedX: (Math.random() - 0.5) * particleSpeed,
                    speedY: (Math.random() - 0.5) * particleSpeed,
                    opacity: Math.random(),
                    opacityDir: Math.random() > 0.5 ? 0.005 : -0.005,
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.opacity += p.opacityDir;

                if (p.opacity <= 0 || p.opacity >= 1) p.opacityDir *= -1;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `${particleColor}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`;
                ctx.fill();
            });
            animRef.current = requestAnimationFrame(draw);
        }

        resize();
        draw();
        window.addEventListener('resize', resize);

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener('resize', resize);
        };
    }, [minSize, maxSize, particleDensity, particleColor, particleSpeed]);

    return (
        <canvas
            id={id}
            ref={canvasRef}
            className={cn('absolute inset-0 w-full h-full', className)}
            style={{ background }}
        />
    );
}
