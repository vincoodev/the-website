/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VOLUMETRIC LIGHT - Divine God Rays Effect
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Purpose: Creates dramatic light shafts for "divine revelation" moments
 * 
 * Features:
 * - Radial gradient rays emanating from center
 * - Subtle animation (rotation + pulse)
 * - Configurable color (gold for Olympus, white for purity)
 * - Parallax effect on mouse move (optional)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState, memo } from 'react';

const VolumetricLight = memo(({
    color = '#d4af37',  // Olympus gold
    intensity = 0.4,
    rayCount = 12,
    animated = true,
    pulseSpeed = 3000,  // ms per pulse cycle
    className = ''
}) => {
    const canvasRef = useRef(null);
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let startTime = Date.now();

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Parse color to RGB
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 212, g: 175, b: 55 };
        };

        const rgb = hexToRgb(color);

        // Draw rays
        const drawRays = () => {
            const elapsed = Date.now() - startTime;
            const pulsePhase = Math.sin((elapsed / pulseSpeed) * Math.PI * 2) * 0.5 + 0.5;
            const rotationOffset = animated ? (elapsed / 50000) * Math.PI * 2 : 0;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2 + mouseOffset.x * 0.1;
            const centerY = canvas.height / 2 + mouseOffset.y * 0.1;
            const maxRadius = Math.max(canvas.width, canvas.height);

            // Draw each ray
            for (let i = 0; i < rayCount; i++) {
                const angle = (i / rayCount) * Math.PI * 2 + rotationOffset;
                const rayWidth = (Math.PI * 2 / rayCount) * 0.4; // 40% of segment

                // Create gradient for each ray
                const gradient = ctx.createRadialGradient(
                    centerX, centerY, 0,
                    centerX, centerY, maxRadius * 0.8
                );

                const baseOpacity = intensity * (0.7 + pulsePhase * 0.3);

                gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseOpacity})`);
                gradient.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseOpacity * 0.6})`);
                gradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseOpacity * 0.2})`);
                gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, maxRadius, angle - rayWidth / 2, angle + rayWidth / 2);
                ctx.closePath();

                ctx.fillStyle = gradient;
                ctx.fill();
            }

            // Central glow
            const coreGradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, 150
            );
            coreGradient.addColorStop(0, `rgba(255, 255, 255, ${intensity * (0.8 + pulsePhase * 0.2)})`);
            coreGradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${intensity * 0.5})`);
            coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
            ctx.fillStyle = coreGradient;
            ctx.fill();

            if (animated) {
                animationFrameId = requestAnimationFrame(drawRays);
            }
        };

        // Mouse move handler for parallax
        const handleMouseMove = (e) => {
            setMouseOffset({
                x: e.clientX - window.innerWidth / 2,
                y: e.clientY - window.innerHeight / 2
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        drawRays();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [color, intensity, rayCount, animated, pulseSpeed, mouseOffset]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 pointer-events-none ${className}`}
            style={{
                mixBlendMode: 'screen',
            }}
            aria-hidden="true"
        />
    );
});

VolumetricLight.displayName = 'VolumetricLight';

export default VolumetricLight;
