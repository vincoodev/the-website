/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OLYMPUS ENIGMA - PUZZLE 1: CAESAR CIPHER (DESIGN UPGRADE)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Theme: Terminal aesthetic, dark purple + green
* Challenge: Decode "ROOBPSV WR WKH KRPH RI WKH JRGV" (shift 3)
* Answer: "OLYMPUS"

 * 
 * Design (Gemini 3 Pro):
 * - Matrix Rain Background
 * - Glassmorphism Terminal with "shattered" error state
 * - Typewriter text effect
 * - Phosphor glow
 * - Dynamic input focus effects
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';

// Store
import { useGameStore } from '../store/gameStore';

// Utils
import { cn, validateCaesarAnswer, delay } from '../lib/utils';

// Audio
import { useSynthAudio } from '../lib/synthAudio';

// Components
import MatrixRain from '../components/MatrixRain';
import FilmGrain from '../components/FilmGrain';

// 3D Components
import { Suspense } from 'react';
import CanvasWrapper from '../components/canvas/CanvasWrapper';
import Puzzle1Scene from '../components/canvas/scenes/Puzzle1SceneV3';

/* ─── ENCRYPTED MESSAGE ─── */
const ENCRYPTED_MESSAGE = 'ROOBPSV WR WKH KRPH RI WKH JRGV';

/* ─── PROGRESSIVE HINTS ─── */
const HINTS = [
    { attempts: 1, text: 'Ancient Romans loved simple shifts...' },
    { attempts: 3, text: 'Shift each letter by 3 positions back...' },
    { attempts: 5, text: "Answer starts with 'O' and ends with 'S'..." },
];

/* ─── EASTER EGG ─── */
const EASTER_EGG_WORD = 'ATHENA';

export default function Puzzle1Page() {
    const router = useRouter();

    // Audio
    const audio = useSynthAudio();

    // Store
    const puzzleState = useGameStore((state) => state.puzzles[1]);
    const recordAttempt = useGameStore((state) => state.recordAttempt);
    const completePuzzle = useGameStore((state) => state.completePuzzle);
    const discoverEasterEgg = useGameStore((state) => state.discoverEasterEgg);
    const unlockAchievement = useGameStore((state) => state.unlockAchievement);
    const startPuzzle = useGameStore((state) => state.startPuzzle);
    const gameStarted = useGameStore((state) => state.gameStarted);

    // Local state
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('idle'); // idle | error | success
    const [currentHint, setCurrentHint] = useState(null);
    const [easterEggTriggered, setEasterEggTriggered] = useState(false);

    // Refs for typing effect
    const [typedMessage, setTypedMessage] = useState('');
    const messageIndex = useRef(0);

    /* ─── ROUTE PROTECTION ─── */
    useEffect(() => {
        if (!gameStarted) {
            router.replace('/profile');
        } else {
            startPuzzle(1);
        }
    }, [gameStarted, router, startPuzzle]);

    /* ─── TYPEWRITER EFFECT ─── */
    useEffect(() => {
        if (typedMessage.length < ENCRYPTED_MESSAGE.length) {
            const timeout = setTimeout(() => {
                setTypedMessage(ENCRYPTED_MESSAGE.slice(0, messageIndex.current + 1));
                messageIndex.current += 1;
            }, 50); // Speed of typing
            return () => clearTimeout(timeout);
        }
    }, [typedMessage]);

    /* ─── UPDATE HINTS BASED ON ATTEMPTS ─── */
    useEffect(() => {
        const applicableHint = HINTS.filter(h => puzzleState.attempts >= h.attempts).pop();
        if (applicableHint) {
            setCurrentHint(applicableHint.text);
        }
    }, [puzzleState.attempts]);

    /* ─── CHECK FOR EASTER EGG ─── */
    useEffect(() => {
        if (input.toUpperCase() === EASTER_EGG_WORD && !easterEggTriggered) {
            setEasterEggTriggered(true);
            discoverEasterEgg('athenaSecret');
            unlockAchievement('athenaFavorite');
            audio.playAchievement(); // Play achievement sound
            console.log('[Puzzle1] Athena easter egg discovered!');
        }
    }, [input, easterEggTriggered, discoverEasterEgg, unlockAchievement, audio]);

    /* ─── HANDLE SUBMIT ─── */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!input.trim() || status === 'success') return;

        const isCorrect = validateCaesarAnswer(input);

        if (isCorrect) {
            setStatus('success');
            completePuzzle(1);
            audio.playCorrect(); // Play success sound
            audio.playDoorOpen(); // Epic door sound

            // Wait and navigate
            await delay(2000);
            router.push('/puzzle2');
        } else {
            setStatus('error');
            recordAttempt(1);
            audio.playWrong(); // Play error sound

            // Reset error state after animation
            await delay(800);
            setStatus('idle');
        }
    }, [input, status, completePuzzle, recordAttempt, router, audio]);

    /* ─── HANDLE INPUT CHANGE ─── */
    const handleInputChange = (e) => {
        const value = e.target.value.toUpperCase();
        setInput(value);
        if (status === 'error') {
            setStatus('idle');
        }
    };

    /* ─── RENDER ─── */
    if (!gameStarted) {
        return null; // Will redirect
    }

    return (
        <>
            <Head>
                <title>Puzzle 1 | Olympus Enigma</title>
            </Head>

            <div className="min-h-screen bg-puzzle-depth relative overflow-hidden flex items-center justify-center p-6">
                {/* 3D BACKGROUND LAYER */}
                <div className="absolute inset-0 z-0">
                    <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
                        <CanvasWrapper quality="high" camera={{ position: [0, 0, 8], fov: 60 }}>
                            <Puzzle1Scene />
                        </CanvasWrapper>
                    </Suspense>
                </div>

                {/* 2D Fallback / Overlay - Minimal darkness to show off 3D scene */}
                <div className="absolute inset-0 bg-black/10 z-[1]" />

                {/* CRT Scanline Overlay */}
                <div className="absolute inset-0 crt-scanlines pointer-events-none z-10 opacity-30" />

                {/* Film Grain for Hyperrealistic Texture */}
                <FilmGrain opacity={0.05} speed={6} />

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                        'relative z-20 w-full max-w-2xl',
                        'bg-black/40 backdrop-blur-xl', // Ultra-premium glass
                        'border border-chaos-glitch/20',
                        'rounded-lg shadow-2xl',
                        // Error Shake Animation
                        status === 'error' && 'animate-shake-hard',
                    )}
                >
                    {/* ⚡ SHATTERED OVERLAY (Error State) ⚡ */}
                    <AnimatePresence>
                        {status === 'error' && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-chaos-error/10 z-30 clip-shatter-1 mix-blend-overlay"
                                />
                                <motion.div
                                    initial={{ opacity: 0, x: 5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-chaos-error/10 z-30 clip-shatter-2 mix-blend-color-dodge"
                                />
                            </>
                        )}
                    </AnimatePresence>

                    {/* Terminal Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-chaos-glitch/20 bg-black/20">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        </div>
                        <span className="font-mono text-xs text-chaos-glitch/60 tracking-widest uppercase">
                            Secure_Connection_Established
                        </span>
                    </div>

                    {/* Terminal Body */}
                    <div className="p-8 space-y-8 relative overflow-hidden">
                        {/* Background Glow within terminal */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-chaos-glitch/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        {/* Encrypted Message */}
                        <div className="space-y-3 relative z-10">
                            <div className="flex items-center gap-2">
                                <span className="text-chaos-glitch/60 font-mono text-xs">STATUS:</span>
                                <span className="px-2 py-0.5 rounded bg-chaos-error/20 text-chaos-error text-[10px] font-mono border border-chaos-error/30 animate-pulse">ENCRYPTED</span>
                            </div>

                            <div className="relative p-6 bg-black/40 border border-chaos-glitch/10 rounded overflow-hidden group">
                                {/* Scanline inside message box */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-chaos-glitch/5 to-transparent h-[200%] w-full animate-scanline pointer-events-none opacity-30" />

                                <p className="font-mono text-xl md:text-3xl text-chaos-glitch tracking-widest glow-text-green break-all">
                                    {typedMessage}
                                    <span className="animate-blink inline-block w-3 h-8 align-middle bg-chaos-glitch ml-1" />
                                </p>
                            </div>
                        </div>

                        {/* Decoder Input */}
                        <div className="space-y-2 relative z-10">
                            <p className="font-mono text-xs text-chaos-glitch/80 flex items-center gap-2">
                                <span className="text-lg">›</span> AWAITING DECRYPTION KEY...
                            </p>

                            <form onSubmit={handleSubmit} className="relative group">
                                <div className="relative overflow-hidden rounded transition-all duration-300 focus-within:ring-2 focus-within:ring-chaos-glitch/50 focus-within:shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={handleInputChange}
                                        placeholder="ENTER_PASSWORD"
                                        disabled={status === 'success'}
                                        className={cn(
                                            'w-full pl-6 pr-4 py-4',
                                            'bg-black/60 border border-chaos-glitch/30',
                                            'font-mono text-xl tracking-[0.2em] text-center',
                                            'text-white placeholder:text-chaos-glitch/20',
                                            'transition-all duration-300',
                                            'disabled:opacity-50',
                                            status === 'error' && 'border-chaos-error text-chaos-error ring-1 ring-chaos-error/50',
                                            status === 'success' && 'border-puzzle-stars text-puzzle-stars bg-puzzle-stars/10',
                                        )}
                                        autoFocus
                                        spellCheck={false}
                                        autoComplete="off"
                                    />

                                    {/* Corner accents */}
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-chaos-glitch opacity-50 group-focus-within:opacity-100 transition-opacity" />
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-chaos-glitch opacity-50 group-focus-within:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-chaos-glitch opacity-50 group-focus-within:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-chaos-glitch opacity-50 group-focus-within:opacity-100 transition-opacity" />
                                </div>

                                {/* Dynamic Submit Button */}
                                <AnimatePresence>
                                    {input.length > 0 && status !== 'success' && (
                                        <motion.button
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            type="submit"
                                            className={cn(
                                                'absolute right-2 top-2 bottom-2 px-4',
                                                'bg-chaos-glitch text-black font-bold font-mono text-sm tracking-wider',
                                                'rounded hover:bg-white transition-colors duration-200',
                                                'flex items-center',
                                            )}
                                        >
                                            UNLOCK
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>

                        {/* Status & Hints Area */}
                        <div className="min-h-[60px] flex flex-col items-center justify-center text-center">
                            <AnimatePresence mode="wait">
                                {status === 'success' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center gap-2 text-puzzle-stars"
                                    >
                                        <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">🔓 ACCESS GRANTED</div>
                                        <span className="font-mono text-sm tracking-widest opacity-80">REDIRECTING TO SECTOR 02...</span>
                                    </motion.div>
                                )}

                                {status === 'error' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-chaos-error font-mono text-lg tracking-widest flex items-center gap-2"
                                    >
                                        <span className="text-2xl">⚠️</span> ACCESS DENIED
                                    </motion.div>
                                )}

                                {currentHint && status === 'idle' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-chaos-glitch/50 font-mono text-xs italic border-t border-chaos-glitch/10 pt-2 w-full"
                                    >
                                        SYSTEM_HINT: {currentHint}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Attempt Counter */}
                            <div className="absolute bottom-4 right-4 font-mono text-[10px] text-chaos-glitch/20">
                                ATTEMPTS_LOG: {String(puzzleState.attempts).padStart(3, '0')}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Easter Egg Notification */}
                <AnimatePresence>
                    {easterEggTriggered && (
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className="fixed top-8 right-8 bg-gradient-to-r from-olympus-gold to-olympus-goldLight text-black px-6 py-3 rounded-lg shadow-glow-gold font-body font-bold z-50 flex items-center gap-3"
                        >
                            <span className="text-2xl">🦉</span>
                            <div>
                                <div className="text-xs uppercase tracking-wider opacity-80">Secret Discovered</div>
                                <div>Athena&apos;s Wisdom</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
