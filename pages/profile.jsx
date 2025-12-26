/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OLYMPUS ENIGMA - COMPANY PROFILE LANDING PAGE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * The "Normal" Entry Point - Linear-inspired Premium Design
 * User sees this first, clicks "View Demo" → triggers chaos → redirects to /
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { cn } from '../lib/utils';
import { useGameStore } from '../store/gameStore';

/* ─── CHAOS STAGES ─── */
const CHAOS_STAGES = {
    IDLE: 'idle',
    GLITCH: 'glitch',       // Stage 1: Minor flickers
    CRACK: 'crack',         // Stage 2: Screen shatters
    SCRAMBLE: 'scramble',   // Stage 3: Text breaks
    REDIRECT: 'redirect',   // Stage 4: Go to Omega
};

/* ─── CHAOS OVERLAY COMPONENT ─── */
function ChaosOverlay({ stage, onComplete }) {
    useEffect(() => {
        if (stage === CHAOS_STAGES.IDLE) return;

        const timings = {
            [CHAOS_STAGES.GLITCH]: 800,
            [CHAOS_STAGES.CRACK]: 1200,
            [CHAOS_STAGES.SCRAMBLE]: 1000,
            [CHAOS_STAGES.REDIRECT]: 500,
        };

        const timer = setTimeout(() => {
            const stages = Object.values(CHAOS_STAGES);
            const currentIndex = stages.indexOf(stage);
            if (currentIndex < stages.length - 1) {
                onComplete(stages[currentIndex + 1]);
            }
        }, timings[stage] || 1000);

        return () => clearTimeout(timer);
    }, [stage, onComplete]);

    if (stage === CHAOS_STAGES.IDLE) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
        >
            {/* Stage 1: Glitch Lines */}
            {stage === CHAOS_STAGES.GLITCH && (
                <div className="absolute inset-0 animate-pulse">
                    {[...Array(20)].map((_, i) => {
                        const randomWidth = 20 + Math.random() * 30;
                        const randomLeft = Math.random() * 100;
                        const randomTop = Math.random() * 100;
                        return (
                            <motion.div
                                key={i}
                                className="absolute h-px bg-red-500/50"
                                style={{ left: `${randomLeft}%`, top: `${randomTop}%` }}
                                initial={{ width: '0%' }}
                                animate={{
                                    width: ['0%', `${randomWidth}%`, '0%'],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 0.3 + Math.random() * 0.2,
                                    repeat: Infinity,
                                    delay: Math.random() * 0.5,
                                }}
                            />
                        );
                    })}
                </div>
            )}

            {/* Stage 2: Glass Crack SVG */}
            {(stage === CHAOS_STAGES.CRACK || stage === CHAOS_STAGES.SCRAMBLE) && (
                <motion.svg
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 1920 1080"
                    preserveAspectRatio="xMidYMid slice"
                >
                    {/* Radial cracks from center */}
                    {[...Array(12)].map((_, i) => {
                        const angle = (i / 12) * Math.PI * 2;
                        const length = 400 + Math.random() * 300;
                        const x2 = 960 + Math.cos(angle) * length;
                        const y2 = 540 + Math.sin(angle) * length;
                        return (
                            <motion.line
                                key={i}
                                x1="960"
                                y1="540"
                                x2={x2}
                                y2={y2}
                                stroke="rgba(255,255,255,0.6)"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                            />
                        );
                    })}
                    {/* Secondary cracks */}
                    {[...Array(30)].map((_, i) => {
                        const x1 = 200 + Math.random() * 1520;
                        const y1 = 100 + Math.random() * 880;
                        const angle = Math.random() * Math.PI * 2;
                        const length = 50 + Math.random() * 150;
                        return (
                            <motion.line
                                key={`s-${i}`}
                                x1={x1}
                                y1={y1}
                                x2={x1 + Math.cos(angle) * length}
                                y2={y1 + Math.sin(angle) * length}
                                stroke="rgba(255,255,255,0.3)"
                                strokeWidth="1"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.3 + i * 0.02 }}
                            />
                        );
                    })}
                </motion.svg>
            )}

            {/* Stage 3: Text Scramble */}
            {stage === CHAOS_STAGES.SCRAMBLE && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        className="text-red-500 font-mono text-6xl md:text-9xl font-bold tracking-wider"
                        animate={{
                            x: [0, -5, 5, -3, 3, 0],
                            opacity: [1, 0.8, 1, 0.9, 1],
                        }}
                        transition={{ duration: 0.2, repeat: Infinity }}
                    >
                        ERROR
                    </motion.div>
                </div>
            )}

            {/* Background darkening */}
            <motion.div
                className="absolute inset-0 bg-black"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: stage === CHAOS_STAGES.GLITCH ? 0.3
                        : stage === CHAOS_STAGES.CRACK ? 0.6
                            : stage === CHAOS_STAGES.SCRAMBLE ? 0.85
                                : 1
                }}
                transition={{ duration: 0.5 }}
            />

            {/* Screen flash for crack */}
            {stage === CHAOS_STAGES.CRACK && (
                <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                />
            )}
        </motion.div>
    );
}

/* ─── FEATURES DATA ─── */
const FEATURES = [
    {
        icon: '⚡',
        title: 'Lightning Fast',
        description: 'Sub-millisecond response times powered by edge computing.',
    },
    {
        icon: '🔒',
        title: 'Enterprise Security',
        description: 'SOC 2 Type II certified with end-to-end encryption.',
    },
    {
        icon: '🌍',
        title: 'Global Scale',
        description: 'Deploy to 300+ edge locations in seconds.',
    },
    {
        icon: '🔄',
        title: 'Zero Downtime',
        description: '99.99% uptime SLA with automatic failover.',
    },
];

/* ─── MAIN PAGE ─── */
export default function ProfilePage() {
    const router = useRouter();
    const triggerChaosStore = useGameStore((state) => state.triggerChaos);
    const [chaosStage, setChaosStage] = useState(CHAOS_STAGES.IDLE);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChaosProgress = useCallback((nextStage) => {
        if (nextStage === CHAOS_STAGES.REDIRECT) {
            setChaosStage(nextStage);
            triggerChaosStore(); // Set chaos state in store
            setTimeout(() => {
                router.push('/');
            }, 400);
        } else {
            setChaosStage(nextStage);
        }
    }, [router, triggerChaosStore]);

    const triggerChaos = useCallback(() => {
        setChaosStage(CHAOS_STAGES.GLITCH);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <Head>
                <title>Nexus Technologies | Build the Future</title>
                <meta name="description" content="The complete platform for modern software teams." />
            </Head>

            <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
                {/* Chaos Overlay */}
                <ChaosOverlay stage={chaosStage} onComplete={handleChaosProgress} />

                {/* ═══ HEADER ═══ */}
                <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">N</span>
                            </div>
                            <span className="text-lg font-semibold tracking-tight">Nexus</span>
                        </div>

                        {/* Nav */}
                        <nav className="hidden md:flex items-center gap-8">
                            {['Product', 'Pricing', 'Docs', 'Blog'].map((item) => (
                                <button
                                    key={item}
                                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
                                >
                                    {item}
                                </button>
                            ))}
                        </nav>

                        {/* CTA */}
                        <div className="flex items-center gap-4">
                            <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                                Sign in
                            </button>
                            <button
                                onClick={triggerChaos}
                                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
                            >
                                View Demo
                            </button>
                        </div>
                    </div>
                </header>

                {/* ═══ HERO SECTION ═══ */}
                <main className="pt-32 pb-24">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-4xl mx-auto">
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 text-violet-700 text-sm font-medium border border-violet-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                    Now in Public Beta
                                </span>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="mt-8 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.1]"
                            >
                                Build products
                                <br />
                                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                    people love
                                </span>
                            </motion.h1>

                            {/* Subheadline */}
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
                            >
                                The modern platform for product teams. Issue tracking,
                                sprints, and product roadmaps. Built for the way you work.
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="mt-10 flex flex-wrap justify-center gap-4"
                            >
                                <button
                                    onClick={triggerChaos}
                                    className="group px-8 py-4 rounded-xl bg-gray-900 text-white font-medium transition-all hover:scale-[1.02] hover:bg-gray-800 active:scale-[0.98] shadow-xl shadow-gray-900/20"
                                >
                                    Start Free Trial
                                    <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
                                </button>
                                <button
                                    onClick={triggerChaos}
                                    className="px-8 py-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                                >
                                    View Demo
                                </button>
                            </motion.div>

                            {/* Social Proof */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-4"
                            >
                                <span className="text-sm text-gray-400">Trusted by 10,000+ teams</span>
                                {['Linear', 'Vercel', 'Notion', 'Figma'].map((company) => (
                                    <span
                                        key={company}
                                        className="text-xl font-semibold text-gray-300 tracking-tight"
                                    >
                                        {company}
                                    </span>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </main>

                {/* ═══ FEATURES SECTION ═══ */}
                <section className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                                Everything you need
                            </h2>
                            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                                Built from the ground up for modern development workflows.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {FEATURES.map((feature, i) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
                                >
                                    <div className="text-3xl mb-4">{feature.icon}</div>
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ FOOTER ═══ */}
                <footer className="py-12 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">N</span>
                                </div>
                                <span className="text-sm text-gray-500">© 2024 Nexus Technologies</span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <button className="hover:text-gray-900 transition-colors">Privacy</button>
                                <button className="hover:text-gray-900 transition-colors">Terms</button>
                                <button className="hover:text-gray-900 transition-colors">Contact</button>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
