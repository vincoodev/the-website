/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CRACK OVERLAY - Animated Screen Fracture Effect
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Purpose: Creates animated cracks appearing on screen during chaos phases
 * 
 * Features:
 * - SVG-based for crisp rendering at any scale
 * - Animated stroke-dashoffset for "spreading" effect
 * - Multiple crack patterns
 * - Glow effect around cracks
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

// Pre-defined crack paths (organic, hand-drawn feel)
const CRACK_PATTERNS = [
    // Center burst
    "M50,50 L45,30 L40,10 M50,50 L60,25 L70,5 M50,50 L75,45 L95,40 M50,50 L70,65 L90,80 M50,50 L55,75 L60,95 M50,50 L35,70 L20,90 M50,50 L25,55 L5,60 M50,50 L30,35 L15,20",
    // Corner cracks
    "M0,0 L15,20 L25,15 L35,30 M100,0 L85,15 L90,30 L75,40 M0,100 L20,85 L15,70 L35,60 M100,100 L80,90 L85,75 L70,65",
    // Horizontal fractures
    "M0,30 L20,32 L35,28 L50,31 L65,27 L80,33 L100,30 M0,70 L25,68 L40,72 L60,69 L75,73 L90,67 L100,70",
    // Diagonal shatter
    "M20,0 L30,25 L25,40 L35,60 L28,80 L40,100 M80,0 L70,20 L78,45 L65,65 L75,85 L60,100",
    // Web pattern
    "M50,50 L30,30 L10,35 M50,50 L70,30 L90,25 M50,50 L70,70 L95,80 M50,50 L30,70 L10,85 M30,30 L70,30 M30,70 L70,70 M30,30 L30,70 M70,30 L70,70",
];

const CrackOverlay = memo(({
    intensity = 0.5,     // 0-1, controls how many cracks show
    animate = true,
    color = '#ffffff',
    glowColor = 'rgba(200, 50, 50, 0.5)',
    duration = 1.5,
    className = ''
}) => {
    // Select cracks based on intensity
    const activeCracks = useMemo(() => {
        const count = Math.ceil(CRACK_PATTERNS.length * intensity);
        return CRACK_PATTERNS.slice(0, count);
    }, [intensity]);

    return (
        <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full"
                style={{
                    filter: `drop-shadow(0 0 3px ${glowColor}) drop-shadow(0 0 6px ${glowColor})`
                }}
            >
                <defs>
                    {/* Glow filter for cracks */}
                    <filter id="crackGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {activeCracks.map((path, index) => (
                    <motion.path
                        key={index}
                        d={path}
                        fill="none"
                        stroke={color}
                        strokeWidth="0.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#crackGlow)"
                        initial={animate ? {
                            pathLength: 0,
                            opacity: 0
                        } : {
                            pathLength: 1,
                            opacity: 0.8
                        }}
                        animate={{
                            pathLength: 1,
                            opacity: 0.8
                        }}
                        transition={{
                            pathLength: {
                                duration: duration,
                                delay: index * 0.2,
                                ease: [0.16, 1, 0.3, 1] // Custom easing for organic feel
                            },
                            opacity: {
                                duration: 0.3,
                                delay: index * 0.2
                            }
                        }}
                        style={{
                            vectorEffect: 'non-scaling-stroke'
                        }}
                    />
                ))}

                {/* Secondary layer for depth */}
                {activeCracks.map((path, index) => (
                    <motion.path
                        key={`secondary-${index}`}
                        d={path}
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: duration * 1.2,
                            delay: index * 0.2 + 0.1,
                            ease: "easeOut"
                        }}
                        style={{
                            vectorEffect: 'non-scaling-stroke',
                            filter: 'blur(1px)'
                        }}
                    />
                ))}
            </svg>
        </div>
    );
});

CrackOverlay.displayName = 'CrackOverlay';

export default CrackOverlay;
