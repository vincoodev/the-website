/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OLYMPUS ENIGMA - PUZZLE 3: TEMPLE CODE LOCK (DESIGN UPGRADE)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Theme: Ancient Temple
 * Challenge: 4-digit code (3729)
 * 
 * Design (Gemini 3 Pro):
 * - Procedural "Divine Fire" CSS animation
 * - Stone texture overlays
 * - Golden highlights and ambient lighting
 * - Dramatic door opening sequence
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';

// Store
import { useGameStore } from '../store/gameStore';

// Utils
import { cn, validateTempleCode, delay, hapticFeedback } from '../lib/utils';

// Hyperrealistic Components
import FilmGrain from '../components/FilmGrain';
import SmokeParticles from '../components/SmokeParticles';
import VolumetricLight from '../components/VolumetricLight';

// 3D Components
import { Suspense } from 'react';
import CanvasWrapper from '../components/canvas/CanvasWrapper';
import Puzzle3Scene from '../components/canvas/scenes/Puzzle3Scene';

/* ─── CORRECT CODE ─── */
const CORRECT_CODE = [3, 7, 2, 9];

/* ─── HINTS ─── */
const HINTS = [
    { attempts: 2, text: 'Look to the decorations for ancient wisdom...' },
    { attempts: 6, glowClues: true, text: 'The clues begin to glow...' },
    { attempts: 10, showFirstDigit: true, text: 'The first number reveals itself: 3' },
];

export default function Puzzle3Page() {
    const router = useRouter();

    // Store
    const puzzleState = useGameStore((state) => state.puzzles[3]);
    const recordAttempt = useGameStore((state) => state.recordAttempt);
    const completePuzzle = useGameStore((state) => state.completePuzzle);
    const startPuzzle = useGameStore((state) => state.startPuzzle);
    const gameStarted = useGameStore((state) => state.gameStarted);
    const puzzle2Completed = useGameStore((state) => state.puzzles[2].completed);
    const checkTimeAchievements = useGameStore((state) => state.checkTimeAchievements);
    const checkAccuracyAchievements = useGameStore((state) => state.checkAccuracyAchievements);

    // Local state
    const [code, setCode] = useState([0, 0, 0, 0]);
    const [status, setStatus] = useState('idle'); // idle | error | success | opening
    const [currentHint, setCurrentHint] = useState(null);
    const [glowClues, setGlowClues] = useState(false);
    const [showFirstDigit, setShowFirstDigit] = useState(false);

    /* ─── ROUTE PROTECTION ─── */
    useEffect(() => {
        if (!gameStarted) {
            router.replace('/profile');
        } else if (!puzzle2Completed) {
            router.replace('/puzzle2');
        } else {
            startPuzzle(3);
        }
    }, [gameStarted, puzzle2Completed, router, startPuzzle]);

    /* ─── UPDATE HINTS BASED ON ATTEMPTS ─── */
    useEffect(() => {
        const applicableHints = HINTS.filter(h => puzzleState.attempts >= h.attempts);
        if (applicableHints.length > 0) {
            const lastHint = applicableHints[applicableHints.length - 1];
            setCurrentHint(lastHint.text);
            if (lastHint.glowClues) setGlowClues(true);
            if (lastHint.showFirstDigit) setShowFirstDigit(true);
        }
    }, [puzzleState.attempts]);

    /* ─── HANDLE WHEEL CHANGE ─── */
    const changeDigit = useCallback((index, direction) => {
        if (status === 'success' || status === 'opening') return;

        hapticFeedback(20);

        setCode((prev) => {
            const newCode = [...prev];
            if (direction === 'up') {
                newCode[index] = (newCode[index] + 1) % 10;
            } else {
                newCode[index] = (newCode[index] - 1 + 10) % 10;
            }
            return newCode;
        });
    }, [status]);

    /* ─── HANDLE SUBMIT ─── */
    const handleSubmit = useCallback(async () => {
        if (status === 'success' || status === 'opening') return;

        const isCorrect = validateTempleCode(code, CORRECT_CODE);

        if (isCorrect) {
            setStatus('success');
            completePuzzle(3);

            // Check achievements
            checkTimeAchievements();
            checkAccuracyAchievements();

            // Door opening sequence
            await delay(800);
            setStatus('opening');

            // Navigate after animation
            await delay(3500);
            router.push('/finish');
        } else {
            setStatus('error');
            recordAttempt(3);

            // Reset after shake
            await delay(800);
            setStatus('idle');
        }
    }, [code, status, completePuzzle, recordAttempt, router, checkTimeAchievements, checkAccuracyAchievements]);

    /* ─── RENDER ─── */
    if (!gameStarted || !puzzle2Completed) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Puzzle 3 | Olympus Enigma</title>
            </Head>

            <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 bg-[#1a1816]">

                {/* 3D TEMPLE BACKGROUND */}
                <div className="absolute inset-0 z-0">
                    <Suspense fallback={<div className="absolute inset-0 bg-[#1a1816]" />}>
                        <CanvasWrapper quality="high" camera={{ position: [0, 1, 6], fov: 50 }}>
                            <Puzzle3Scene />
                        </CanvasWrapper>
                    </Suspense>
                </div>

                {/* WALL TEXTURE Overlay */}
                <div className="absolute inset-0 marble-texture opacity-10 pointer-events-none z-[1] mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/70 z-[1] pointer-events-none" />

                {/* Film Grain for Cinematic Texture */}
                <FilmGrain opacity={0.03} speed={5} blendMode="overlay" />

                {/* Rising Smoke from Torches */}
                <SmokeParticles
                    particleCount={20}
                    direction="up"
                    speed={0.3}
                    turbulence={0.2}
                    opacity={0.15}
                />

                {/* TORCHES (CSS Procedural Fire) */}
                {['left-10', 'right-10'].map((pos, i) => (
                    <div key={i} className={cn("absolute top-1/2 -translate-y-1/2 hidden md:block", pos)}>
                        <div className="relative">
                            {/* Torch Holder */}
                            <div className="w-4 h-32 bg-gradient-to-r from-[#4a4036] to-[#2a2520] rounded-b-lg shadow-xl" />
                            <div className="absolute -top-4 -left-2 w-8 h-8 rounded-full bg-[#2a2520]" />

                            {/* Divine Fire */}
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-16 h-32 opacity-90 blur-[2px] animate-flicker">
                                <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-temple-torch via-temple-torchGlow to-transparent rounded-full mix-blend-screen animate-pulse-glow" />
                                <div className="absolute bottom-2 left-2 w-10 h-20 bg-yellow-200 rounded-full blur-md opacity-70 animate-float" />
                            </div>

                            {/* Ambient Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-temple-torch/20 rounded-full blur-[50px] pointer-events-none select-none" />
                        </div>
                    </div>
                ))}

                {/* MAIN PUZZLE CONTAINER */}
                <motion.div
                    className="relative z-10 w-full max-w-3xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Top Inscription - PREMIUM TYPOGRAPHY */}
                    <motion.div
                        className="text-center mb-12"
                        animate={glowClues ? { textShadow: '0 0 30px rgba(212,175,55,0.8)' } : {}}
                    >
                        <h1 className="font-display text-5xl md:text-7xl text-olympus-gold mb-4 tracking-widest drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                            style={{ fontFamily: 'Cinzel, serif' }}>
                            Τρία θεοί
                        </h1>
                        <div className="flex items-center justify-center gap-4 opacity-60">
                            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-olympus-gold to-transparent" />
                            <div className="w-3 h-3 rotate-45 border border-olympus-gold bg-black" />
                            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-olympus-gold to-transparent" />
                        </div>
                        <p className="font-body text-olympus-marble/80 text-xl tracking-[0.3em] font-light mt-4 uppercase">
                            Speak the Sacred Numbers
                        </p>
                    </motion.div>

                    {/* THE STONE LOCK - PREMIUM GLASSMORPHISM */}
                    <div className={cn(
                        'relative p-10 md:p-16',
                        'backdrop-blur-sm bg-black/10 rounded-[2.5rem]',
                        'border border-olympus-gold/30',
                        'shadow-[0_20px_60px_rgba(0,0,0,0.2),inset_0_0_80px_rgba(0,0,0,0.1)]',
                        'overflow-hidden',
                        status === 'error' && 'animate-shake border-chaos-error/50',
                        status === 'opening' && 'animate-fade-in-up'
                    )}>

                        {/* ─── ORNATE DECORATIONS ─── */}
                        {/* Top-left corner */}
                        <div className="absolute top-0 left-0 w-24 h-24 border-t-[4px] border-l-[4px] border-olympus-gold/60 rounded-tl-3xl pointer-events-none" />
                        <div className="absolute top-5 left-5 w-4 h-4 border border-olympus-gold/40 rotate-45 pointer-events-none" />

                        {/* Top-right corner */}
                        <div className="absolute top-0 right-0 w-24 h-24 border-t-[4px] border-r-[4px] border-olympus-gold/60 rounded-tr-3xl pointer-events-none" />
                        <div className="absolute top-5 right-5 w-4 h-4 border border-olympus-gold/40 rotate-45 pointer-events-none" />

                        {/* Bottom-left corner */}
                        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-[4px] border-l-[4px] border-olympus-gold/60 rounded-bl-3xl pointer-events-none" />
                        <div className="absolute bottom-5 left-5 w-4 h-4 border border-olympus-gold/40 rotate-45 pointer-events-none" />

                        {/* Bottom-right corner */}
                        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-[4px] border-r-[4px] border-olympus-gold/60 rounded-br-3xl pointer-events-none" />
                        <div className="absolute bottom-5 right-5 w-4 h-4 border border-olympus-gold/40 rotate-45 pointer-events-none" />

                        {/* Inner gold frame */}
                        <div className="absolute inset-4 border border-olympus-gold/10 rounded-[2rem] pointer-events-none" />


                        {/* ─── CLUES ENGRAVED ─── */}
                        <div className="absolute top-8 left-10 text-left font-display text-4xl text-olympus-gold/20 select-none pointer-events-none tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
                            VII
                        </div>
                        <div className="absolute bottom-8 right-10 text-right font-display text-4xl text-olympus-gold/20 select-none pointer-events-none tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
                            IX
                        </div>

                        {/* ─── DIAL MECHANISM ─── */}
                        <div className="flex justify-center gap-4 md:gap-8 relative z-10 py-4">
                            {code.map((digit, index) => (
                                <div key={index} className="flex flex-col items-center gap-6 group">
                                    {/* UP ARROW */}
                                    <button
                                        onClick={() => changeDigit(index, 'up')}
                                        disabled={status === 'success' || status === 'opening'}
                                        className="text-olympus-gold/60 hover:text-olympus-gold hover:-translate-y-1 transition-all disabled:opacity-20 p-2"
                                    >
                                        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-current filter drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]" />
                                    </button>

                                    {/* CYLINDER DIGIT - MARBLE & GOLD */}
                                    <div className={cn(
                                        'w-16 h-24 md:w-24 md:h-36 flex items-center justify-center',
                                        'bg-gradient-to-br from-[#1a1816] to-black rounded-xl',
                                        'border-y-4 border-x border-[#4a4036]',
                                        'font-display text-5xl md:text-7xl text-olympus-gold',
                                        'shadow-[inset_0_10px_20px_rgba(0,0,0,1),0_10px_30px_rgba(0,0,0,0.5)]',
                                        'relative overflow-hidden transition-all duration-500',
                                        // Success Glow
                                        status === 'success' && 'text-white border-olympus-gold shadow-[0_0_50px_rgba(212,175,55,0.6)] scale-105',
                                        status === 'error' && 'text-chaos-error border-chaos-error/50',
                                        showFirstDigit && index === 0 && 'animate-pulse text-white border-olympus-gold/50 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                                    )}
                                        style={{ fontFamily: 'Cinzel, serif' }}
                                    >
                                        <div className="relative z-10">{showFirstDigit && index === 0 ? CORRECT_CODE[0] : digit}</div>

                                        {/* Cylindrical lighting effect (Reflection) */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 pointer-events-none z-0" />
                                        <div className="absolute top-0 w-full h-[1px] bg-white/20 z-0" />
                                        <div className="absolute bottom-0 w-full h-[1px] bg-white/10 z-0" />

                                        {/* Metallic shine */}
                                        <div className="absolute -inset-[100%] bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                                    </div>

                                    {/* DOWN ARROW */}
                                    <button
                                        onClick={() => changeDigit(index, 'down')}
                                        disabled={status === 'success' || status === 'opening'}
                                        className="text-olympus-gold/60 hover:text-olympus-gold hover:translate-y-1 transition-all disabled:opacity-20 p-2"
                                    >
                                        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-current filter drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* UNLOCK BUTTON - PREMIUM GOLD */}
                    <div className="mt-14 text-center relative z-20">
                        <button
                            onClick={handleSubmit}
                            disabled={status === 'success' || status === 'opening'}
                            className={cn(
                                "group relative px-16 py-5 overflow-hidden rounded-full transition-all duration-300",
                                "bg-gradient-to-r from-[#b8860b] via-[#ffd700] to-[#b8860b]",
                                "shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.6)]",
                                "hover:scale-105 active:scale-95",
                                "disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 disabled:shadow-none"
                            )}
                        >
                            <div className="absolute inset-[2px] bg-black rounded-full z-0 group-hover:bg-[#1a1816] transition-colors" />

                            <span className={cn(
                                "relative z-10 font-display text-2xl tracking-[0.3em] text-olympus-gold group-hover:text-white transition-colors duration-300 flex items-center gap-4",
                                "mx-auto block text-center"
                            )}>
                                <span className="text-xl md:text-2xl">❖</span>
                                UNLOCK
                                <span className="text-xl md:text-2xl">❖</span>
                            </span>

                            {/* Shiny overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 z-10" />
                        </button>
                    </div>

                    {/* Status Message */}
                    <div className="h-20 mt-8 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {status === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-3 text-chaos-error"
                                >
                                    <span className="text-xl">⚠️</span>
                                    <p className="font-body text-xl tracking-wide font-light">
                                        The earth trembles... Incorrect.
                                    </p>
                                </motion.div>
                            )}
                            {currentHint && status === 'idle' && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-olympus-gold/60 font-body italic text-lg tracking-wide border-b border-olympus-gold/20 pb-1"
                                >
                                    "{currentHint}"
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                </motion.div>

                {/* LIGHT OF OLYMPUS OVERLAY (Door Opening) */}
                <AnimatePresence>
                    {status === 'opening' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#ffd700] via-white to-[#ffd700] overflow-hidden"
                        >
                            {/* Volumetric God Rays for Divine Revelation */}
                            <VolumetricLight
                                color="#ffd700"
                                intensity={0.6}
                                rayCount={20}
                                pulseSpeed={2000}
                            />

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 1.5 }}
                                className="text-center"
                            >
                                <div className="text-6xl md:text-9xl mb-8 animate-float">🏛️</div>
                                <h2 className="font-display text-4xl md:text-6xl text-olympus-gold tracking-widest uppercase">
                                    Olympus Awaits
                                </h2>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </>
    );
}
