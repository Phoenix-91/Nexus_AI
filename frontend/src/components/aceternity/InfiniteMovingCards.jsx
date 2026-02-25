import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * InfiniteMovingCards — horizontally auto-scrolling ticker using pure CSS animation.
 * Items are duplicated so the loop appears seamless.
 */
export function InfiniteMovingCards({
    items = [],
    direction = 'left',
    speed = 'normal',
    pauseOnHover = true,
    className,
    itemClassName,
    renderItem,
}) {
    const containerRef = useRef(null);
    const scrollerRef = useRef(null);

    useEffect(() => {
        if (!scrollerRef.current) return;
        // Clone items for seamless loop
        const scroller = scrollerRef.current;
        const children = Array.from(scroller.children);
        children.forEach((child) => {
            const clone = child.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            scroller.appendChild(clone);
        });
    }, []);

    const speedMap = { fast: '20s', normal: '40s', slow: '60s' };
    const duration = speedMap[speed] ?? '40s';
    const animDirection = direction === 'right' ? 'reverse' : 'normal';

    return (
        <div
            ref={containerRef}
            className={cn('relative overflow-hidden', className)}
            style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            }}
        >
            <style>{`
                @keyframes infiniteScroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .infinite-scroll-track {
                    animation: infiniteScroll var(--scroll-duration, 40s) linear infinite;
                    animation-direction: var(--scroll-direction, normal);
                }
                .infinite-scroll-pause:hover .infinite-scroll-track {
                    animation-play-state: paused;
                }
            `}</style>

            <div className={pauseOnHover ? 'infinite-scroll-pause' : ''}>
                <div
                    ref={scrollerRef}
                    className="infinite-scroll-track flex gap-4 w-max"
                    style={{
                        '--scroll-duration': duration,
                        '--scroll-direction': animDirection,
                    }}
                >
                    {items.map((item, idx) => (
                        <div key={idx} className={cn('flex-shrink-0', itemClassName)}>
                            {renderItem ? renderItem(item, idx) : (
                                <div className="glass border border-white/10 rounded-xl px-6 py-3 text-sm text-white/80 whitespace-nowrap">
                                    {item}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
