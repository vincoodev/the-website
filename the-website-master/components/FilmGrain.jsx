/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FILM GRAIN - Hyperrealistic Organic Texture Overlay
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Purpose: Adds cinematic film grain to eliminate the "digital/AI" look
 * 
 * Features:
 * - Animated noise that shifts every frame
 * - Configurable intensity (subtle for normal, heavier for chaos)
 * - Performance optimized with requestAnimationFrame
 * - Respects prefers-reduced-motion
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, memo } from 'react';

const FilmGrain = memo(({
    opacity = 0.03,      // Very subtle by default
    speed = 4,           // Frames to skip (higher = slower, better perf)
    blendMode = 'overlay',
    className = ''
}) => {
    const canvasRef = useRef(null);
    const frameCountRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        let animationFrameId;
        let isRunning = true;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Set canvas size
        const resizeCanvas = () => {
            // Use device pixel ratio for crisp grain on retina displays
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Generate noise frame
        const generateNoise = () => {
            const width = canvas.width;
            const height = canvas.height;
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;

            // Generate random grayscale noise
            for (let i = 0; i < data.length; i += 4) {
                // Random grayscale value with slight variation
                const value = Math.random() * 255;

                // Add slight color variation for more organic feel
                const colorShift = (Math.random() - 0.5) * 10;

                data[i] = value + colorShift;     // R
                data[i + 1] = value;               // G
                data[i + 2] = value - colorShift;  // B
                data[i + 3] = 255;                 // A (will be controlled by canvas opacity)
            }

            ctx.putImageData(imageData, 0, 0);
        };

        // Animation loop
        const animate = () => {
            if (!isRunning) return;

            frameCountRef.current++;

            // Skip frames for performance (only update every N frames)
            if (frameCountRef.current % speed === 0) {
                generateNoise();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        // If reduced motion, generate once and stop
        if (prefersReducedMotion) {
            generateNoise();
        } else {
            animate();
        }

        return () => {
            isRunning = false;
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [speed]);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none z-[100] ${className}`}
            style={{
                opacity,
                mixBlendMode: blendMode,
            }}
            aria-hidden="true"
        />
    );
});

FilmGrain.displayName = 'FilmGrain';

export default FilmGrain;
