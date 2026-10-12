'use client';

import { useEffect, useRef, useMemo } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
}

export function Starfield() {
  const containerRef = useRef<HTMLDivElement>(null);

  const stars = useMemo(() => {
    const count = 80;
    const result: Star[] = [];
    for (let i = 0; i < count; i++) {
      result.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
      });
    }
    return result;
  }, []);

  useEffect(() => {
    // Pause animation when tab is hidden
    const handleVisibility = () => {
      if (containerRef.current) {
        containerRef.current.style.animationPlayState =
          document.hidden ? 'paused' : 'running';
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div ref={containerRef} className="starfield" aria-hidden="true">
      {stars.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            '--max-opacity': star.opacity,
            '--duration': `${star.duration}s`,
            animationDelay: prefersReducedMotion ? '0s' : `${star.delay}s`,
            opacity: prefersReducedMotion ? star.opacity * 0.5 : undefined,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
