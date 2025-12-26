/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SMOKE PARTICLES - Atmospheric Depth Effect
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Purpose: Creates organic smoke/mist particles for atmospheric depth
 * 
 * Features:
 * - Soft, billowing particle motion
 * - Velocity-based movement with turbulence
 * - Configurable density and color
 * - Rising or descending motion
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, memo } from 'react';

const SmokeParticles = memo(({
    color = 'rgba(100, 100, 100, 0.3)',
    particleCount = 50,
    direction = 'up',  // 'up' or 'down'
    speed = 1,
    turbulence = 0.5,
    opacity = 0.6,
    className = ''
}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Initialize particles
        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: direction === 'up'
                        ? canvas.height + Math.random() * 200
                        : -Math.random() * 200,
                    size: Math.random() * 80 + 40,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (direction === 'up' ? -1 : 1) * (Math.random() * 0.5 + 0.3) * speed,
                    opacity: Math.random() * 0.5 + 0.2,
                    turbulenceOffset: Math.random() * Math.PI * 2,
                    turbulenceSpeed: Math.random() * 0.02 + 0.01,
                });
            }
        };

        initParticles();

        // Draw a single soft smoke particle
        const drawSmokeParticle = (p) => {
            const gradient = ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, p.size
            );

            // Parse the color and apply particle-specific opacity
            gradient.addColorStop(0, `rgba(150, 150, 150, ${p.opacity * 0.8})`);
            gradient.addColorStop(0.4, `rgba(120, 120, 120, ${p.opacity * 0.4})`);
            gradient.addColorStop(0.7, `rgba(100, 100, 100, ${p.opacity * 0.1})`);
            gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                // Update turbulence
                p.turbulenceOffset += p.turbulenceSpeed;

                // Apply turbulence to horizontal movement
                const turbulenceX = Math.sin(p.turbulenceOffset) * turbulence;

                // Update position
                p.x += p.speedX + turbulenceX;
                p.y += p.speedY;

                // Wrap around screen
                if (direction === 'up' && p.y < -p.size) {
                    p.y = canvas.height + p.size;
                    p.x = Math.random() * canvas.width;
                } else if (direction === 'down' && p.y > canvas.height + p.size) {
                    p.y = -p.size;
                    p.x = Math.random() * canvas.width;
                }

                // Horizontal wrap
                if (p.x < -p.size) p.x = canvas.width + p.size;
                if (p.x > canvas.width + p.size) p.x = -p.size;

                drawSmokeParticle(p);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [particleCount, direction, speed, turbulence, color]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 pointer-events-none ${className}`}
            style={{ opacity }}
            aria-hidden="true"
        />
    );
});

SmokeParticles.displayName = 'SmokeParticles';

export default SmokeParticles;
