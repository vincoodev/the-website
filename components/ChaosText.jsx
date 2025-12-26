'use client';

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ChaosText - Premium Environmental Presence Text
 * 
 * A living text component that renders behind Ω with:
 * - Per-character independent opacity oscillation
 * - Micro blur for depth perception
 * - Staggered, non-synchronized timings
 * - Cross-fade transitions between text changes
 * 
 * Philosophy: "Omega tidak berbicara pada user. Omega berbicara pada ruang."
 */

// Character animation variants - each character breathes independently
const getCharacterVariants = (index, totalLength) => {
    // Create unique timing for each character based on position
    const baseDelay = (index / totalLength) * 2;
    const duration = 3 + (index % 3); // 3-5 seconds variation

    return {
        initial: {
            opacity: 0,
            filter: 'blur(2px)',
        },
        animate: {
            opacity: [0.08, 0.25, 0.12, 0.3, 0.1],
            filter: ['blur(1px)', 'blur(0.5px)', 'blur(1.2px)', 'blur(0.3px)', 'blur(1px)'],
            transition: {
                opacity: {
                    duration,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: baseDelay,
                },
                filter: {
                    duration: duration * 1.3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: baseDelay + 0.5,
                },
            },
        },
        exit: {
            opacity: 0,
            filter: 'blur(3px)',
            transition: { duration: 1.5, ease: 'easeOut' },
        },
    };
};

// Container variants for smooth cross-fade
const containerVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            duration: 2,
            ease: [0.16, 1, 0.3, 1], // ease-out-expo
            staggerChildren: 0.08,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 1.5,
            ease: 'easeOut',
        },
    },
};

// Individual character component - memoized for performance
const ChaosCharacter = memo(function ChaosCharacter({ char, index, total, level }) {
    const variants = useMemo(() => getCharacterVariants(index, total), [index, total]);

    // Higher levels = slightly more visible but still subtle
    const levelOpacityMultiplier = 1 + (level * 0.05); // Max 1.25x at level 5

    if (char === ' ') {
        return <span className="inline-block w-[0.3em]">&nbsp;</span>;
    }

    return (
        <motion.span
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="inline-block"
            style={{
                willChange: 'opacity, filter',
                transform: 'translateZ(0)', // GPU acceleration
            }}
        >
            {char}
        </motion.span>
    );
});

/**
 * Main ChaosText Component
 * 
 * @param {string} text - The text to render
 * @param {number} level - Inactivity level (0-5)
 * @param {string} className - Additional CSS classes
 */
function ChaosText({ text = '', level = 0, className = '' }) {
    // Split text into characters for individual animation
    const characters = useMemo(() => text.split(''), [text]);

    // Don't render if no text or level 0
    if (!text || level === 0) return null;

    // Level-based opacity for professional escalation feel
    // Higher levels = slightly more visible but still atmospheric
    const levelOpacity = 0.25 + (level * 0.08); // 0.33 at L1, up to 0.65 at L5

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={text} // Key change triggers cross-fade
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={`
                    font-mono uppercase tracking-[0.25em] select-none pointer-events-none
                    text-center whitespace-nowrap
                    ${className}
                `}
                style={{
                    fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, monospace",
                    fontWeight: 300,
                    letterSpacing: '0.3em',
                    color: `rgba(255, 255, 255, ${levelOpacity})`,
                    textShadow: `
                        0 0 40px rgba(255, 255, 255, 0.15),
                        0 0 80px rgba(200, 180, 150, 0.08)
                    `,
                    filter: `blur(${Math.max(0, 1 - level * 0.15)}px)`, // Less blur at higher levels
                }}
                aria-hidden="true" // Screen readers should ignore this decorative element
            >
                {characters.map((char, index) => (
                    <ChaosCharacter
                        key={`${text}-${index}`}
                        char={char}
                        index={index}
                        total={characters.length}
                        level={level}
                    />
                ))}
            </motion.div>
        </AnimatePresence>
    );
}

export default memo(ChaosText);
