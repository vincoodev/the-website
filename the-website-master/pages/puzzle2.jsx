import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
// import useSound from 'use-sound'; // Removed to avoid dependency error
import { Canvas } from '@react-three/fiber';

// Components
import Puzzle2Scene from '../components/canvas/scenes/Puzzle2Scene';
import CanvasWrapper from '../components/canvas/CanvasWrapper';

// Stores
import { useGameStore } from '../store/gameStore';

// Utils
import { cn } from '../lib/utils';

// Audio
import { useSynthAudio } from '../lib/synthAudio';

// Assets
// Assuming sound assets exist or will be placeholders
// const [playClick] = useSound('/sounds/click.mp3');

export default function Puzzle2() {
    const router = useRouter();
    const { completePuzzle, puzzles, gameStarted, startPuzzle } = useGameStore();

    // Audio
    const audio = useSynthAudio();

    // Start ambient
    useEffect(() => {
        audio.startAmbient('temple');
        return () => audio.stopAmbient();
    }, [audio]);

    // ─── ROUTE PROTECTION ───
    const puzzle1Completed = puzzles[1]?.completed;
    const puzzle2Started = puzzles[2]?.startTime;

    useEffect(() => {
        // Must have completed puzzle 1
        if (!gameStarted || !puzzle1Completed) {
            router.replace(gameStarted ? '/puzzle1' : '/profile');
        } else if (!puzzle2Started) {
            // Only start puzzle if not already started (prevents infinite loop)
            startPuzzle(2);
        }
    }, [gameStarted, puzzle1Completed, puzzle2Started, router, startPuzzle]);

    // ─── STATE ───
    const [sequence, setSequence] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, error, success


    const CORRECT_SEQUENCE = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Handle Node Click
    const handleNodeClick = (id) => {
        if (status === 'success') return;

        // Audio click
        audio.playClick();

        // Check availability (must be next in sequence)
        const nextIndex = sequence.length;
        if (id === CORRECT_SEQUENCE[nextIndex]) {
            const newSequence = [...sequence, id];
            setSequence(newSequence);
            audio.playPatternSelect(); // Connection sound

            // WIN CONDITION
            if (newSequence.length === CORRECT_SEQUENCE.length) {
                setStatus('success');
                audio.playTriumph(); // Victory sound
                setTimeout(() => {
                    completePuzzle(2);
                    // router.push('/puzzle3'); // Auto-nav or manual? Let's show success first
                }, 1000);
            }
        } else {
            // ERROR
            setStatus('error');
            audio.playWrong(); // Error sound
            setTimeout(() => {
                setSequence([]);
                setStatus('idle');
            }, 500);
        }
    };

    // Nodes Data
    const nodes = [
        { id: 1, label: 'α', x: 50, y: 20 },
        { id: 2, label: 'β', x: 80, y: 35 },
        { id: 3, label: 'γ', x: 70, y: 65 },
        { id: 4, label: 'δ', x: 30, y: 65 },
        { id: 5, label: 'ε', x: 20, y: 35 },
        { id: 6, label: 'ζ', x: 50, y: 50 }, // Center
        { id: 7, label: 'η', x: 35, y: 85 },
        { id: 8, label: 'θ', x: 65, y: 85 },
        { id: 9, label: 'ι', x: 50, y: 10 }, // Top
    ];

    // ─── GUARD: Prevent render if route is invalid ───
    if (!gameStarted || !puzzle1Completed) {
        return null;
    }

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black text-white font-cinzel selection:bg-cyan-500/30">
            <Head>
                <title>The Constellation | Olympus Enigma</title>
            </Head>

            {/* ─── 3D BACKGROUND (Nebula & Stars) ─── */}
            <div className="absolute inset-0 z-0">
                <CanvasWrapper>
                    <Puzzle2Scene status={status} />
                </CanvasWrapper>
            </div>

            {/* ─── UI LAYER ─── */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">

                {/* HEADLINE */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-cyan-400 text-sm tracking-[0.5em] uppercase mb-4 opacity-80 font-inter">
                        Puzzle II
                    </h2>
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-100 to-cyan-900 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                        The Constellation
                    </h1>
                    <p className="mt-4 text-cyan-200/60 tracking-widest text-sm max-w-md mx-auto">
                        CONNECT THE STARS IN THE CORRECT ORDER
                    </p>
                </motion.div>

                {/* PUZZLE CONTAINER */}
                <div className="relative w-full max-w-[600px] aspect-square">

                    {/* SVG LINES LAYER (Behind nodes) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                        {/* Render lines for connected sequence */}
                        {sequence.map((nodeId, index) => {
                            if (index === 0) return null;
                            const prevNode = nodes.find(n => n.id === sequence[index - 1]);
                            const currNode = nodes.find(n => n.id === nodeId);
                            return (
                                <motion.line
                                    key={`line-${index}`}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    x1={`${prevNode.x}%`}
                                    y1={`${prevNode.y}%`}
                                    x2={`${currNode.x}%`}
                                    y2={`${currNode.y}%`}
                                    stroke="url(#lineGradient)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            );
                        })}
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#a5f3fc" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* NODES LAYER */}
                    <div className="absolute inset-0">
                        {nodes.map((node) => {
                            const isConnected = sequence.includes(node.id);
                            const isNext = !isConnected && node.id === CORRECT_SEQUENCE[sequence.length];

                            return (
                                <button
                                    key={node.id}
                                    onClick={() => handleNodeClick(node.id)}
                                    className={cn(
                                        "absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300",
                                        "border border-white/20 backdrop-blur-md",
                                        isConnected
                                            ? "bg-cyan-500 text-black shadow-[0_0_30px_rgba(34,211,238,0.8)] scale-110 border-cyan-300"
                                            : "bg-black/40 text-cyan-400 hover:bg-cyan-900/40 hover:border-cyan-400/50 hover:scale-105",
                                        status === 'error' && "animate-shake border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                                    )}
                                    // Audio Hover
                                    onMouseEnter={() => audio.playHover()}
                                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                >
                                    {node.label}

                                    {/* Ripple Effect for active hint */}
                                    {isNext && status === 'idle' && (
                                        <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                </div>

                {/* STATUS MESSAGE */}
                <div className="h-8 mt-8">
                    <AnimatePresence>
                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="px-6 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_cyan]"
                            >
                                ✨ CONSTELLATION ALIGNED
                            </motion.div>
                        )}
                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="px-6 py-2 rounded-full bg-red-500/20 border border-red-400/50 text-red-300 shadow-[0_0_20px_red]"
                            >
                                ⚠️ STAR MISALIGNED
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* UNLOCK BTN (Appears on Success) */}
                <AnimatePresence>
                    {status === 'success' && (
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => router.push('/puzzle3')}
                            className="mt-8 relative group overflow-hidden px-12 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold tracking-widest uppercase rounded-sm border border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.6)]"
                        >
                            <span className="relative z-10">Proceed to The Temple</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </motion.button>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}
