/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OLYMPUS ENIGMA - FINISH: MOUNT OLYMPUS (DESIGN UPGRADE)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Theme: Divine / Heaven
 * Reward: Certificate of Ascension, Stats, Leaderboard
 * 
 * Design (Gemini 3 Pro):
 * - Golden Rain Canvas Effect
 * - SVG Statue Silhouettes (Zeus, Athena, Apollo)
 * - Parchment texture for Certificate
 * - Glassmorphism cards with gold borders
 * - Sophisticated typography
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Store
import { useGameStore } from '../store/gameStore';

// Utils
import { cn, formatTimeHuman, generateCertificateId, calculateAccuracy } from '../lib/utils';

// Audio
import { useSynthAudio } from '../lib/synthAudio';

// Components
import GoldenRain from '../components/GoldenRain';
import FilmGrain from '../components/FilmGrain';
import VolumetricLight from '../components/VolumetricLight';

// 3D Components
import { Suspense } from 'react';
import CanvasWrapper from '../components/canvas/CanvasWrapper';
import FinishScene from '../components/canvas/scenes/FinishScene';

/* ─── STATUE DATA ─── */
const STATUES = [
    {
        id: 'zeus',
        name: 'Zeus',
        title: 'King of Gods',
        quote: "Power comes to those who dare to seek it.",
        // Abstract SVG Path for Silhouette
        path: "M50 10 L60 30 L90 30 L65 50 L75 80 L50 60 L25 80 L35 50 L10 30 L40 30 Z", // Placeholder for artistic shape
        color: "from-yellow-400 to-yellow-600"
    },
    {
        id: 'athena',
        name: 'Athena',
        title: 'Goddess of Wisdom',
        quote: "Wisdom is the key to every lock.",
        path: "M50 15 C50 15 70 30 70 50 C70 70 50 85 50 85 C50 85 30 70 30 50 C30 30 50 15 50 15",
        color: "from-blue-400 to-blue-600"
    },
    {
        id: 'apollo',
        name: 'Apollo',
        title: 'God of Light',
        quote: "Let your inner light guide the way.",
        path: "M50 20 A30 30 0 1 0 50 80 A30 30 0 1 0 50 20 M50 0 L55 15 L65 5 L60 20 L75 20 L60 25 L70 35 L55 30 L50 45 L45 30 L30 35 L40 25 L25 20 L40 20 L35 5 L45 15 Z",
        color: "from-orange-400 to-orange-600"
    }
];

export default function FinishPage() {
    const router = useRouter();
    const certRef = useRef(null);

    // Store
    const gameState = useGameStore((state) => state);
    const resetGame = useGameStore((state) => state.resetGame);
    const addToLeaderboard = useGameStore((state) => state.addToLeaderboard);
    const leaderboard = useGameStore((state) => state.leaderboard);

    // Audio
    const audio = useSynthAudio();

    // Start triumphant ambient
    useEffect(() => {
        audio.startAmbient('olympus');
        // Play triumph fanfare on mount
        setTimeout(() => audio.playTriumph(), 500);
        return () => audio.stopAmbient();
    }, [audio]);

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [activeStatue, setActiveStatue] = useState(1); // Default Athena

    // Derived Stats
    const totalTime = gameState.gameEndTime && gameState.gameStartTime
        ? gameState.gameEndTime - gameState.gameStartTime
        : 0;

    // Calculate total attempts from puzzles object
    const totalAttempts = Object.values(gameState.puzzles || {}).reduce((sum, p) => sum + (p.attempts || 0), 0);
    const accuracy = calculateAccuracy(totalAttempts);

    // Fix Hydration Error: Generate ID only on client
    const [certificateId, setCertificateId] = useState('');

    useEffect(() => {
        setCertificateId(generateCertificateId());
    }, []);

    /* ─── ROUTE PROTECTION ─── */
    useEffect(() => {
        if (!gameState.gameStarted) {
            router.replace('/profile');
            return;
        }
        if (!gameState.puzzles[3].completed) {
            router.replace('/puzzle3');
            return;
        }

        addToLeaderboard({
            name: 'Seeker', // In real app, ask for name
            time: totalTime,
            accuracy: accuracy,
            date: new Date().toISOString()
        });
    }, [gameState.gameStarted, gameState.puzzles, router, addToLeaderboard, totalTime, accuracy]);

    /* ─── DOWNLOAD CERTIFICATE ─── */
    const handleDownloadCertificate = async () => {
        if (!certRef.current) {
            alert('Certificate not found!');
            return;
        }

        setIsGeneratingPdf(true);

        try {
            // Capture the certificate element
            const canvas = await html2canvas(certRef.current, {
                scale: 3, // Higher quality
                backgroundColor: '#fefefe',
                logging: false,
                useCORS: true,
                allowTaint: true,
                windowWidth: certRef.current.scrollWidth,
                windowHeight: certRef.current.scrollHeight,
            });

            // Convert to image
            const imgData = canvas.toDataURL('image/png', 1.0);

            // Create PDF (landscape A4)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate aspect ratio to fit certificate in PDF
            const canvasRatio = canvas.width / canvas.height;
            const pdfRatio = pdfWidth / pdfHeight;

            let finalWidth = pdfWidth;
            let finalHeight = pdfHeight;
            let offsetX = 0;
            let offsetY = 0;

            if (canvasRatio > pdfRatio) {
                // Canvas is wider - fit to width
                finalHeight = pdfWidth / canvasRatio;
                offsetY = (pdfHeight - finalHeight) / 2;
            } else {
                // Canvas is taller - fit to height
                finalWidth = pdfHeight * canvasRatio;
                offsetX = (pdfWidth - finalWidth) / 2;
            }

            // Add image to PDF
            pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalWidth, finalHeight);

            // Save the PDF
            const fileName = `Olympus_Certificate_${certificateId || 'DIVINE'}.pdf`;
            pdf.save(fileName);

            alert('🎉 Certificate downloaded successfully!');
            audio.playAchievement(); // Achievement sound
        } catch (err) {
            console.error('PDF Generation failed:', err);
            alert('Failed to generate certificate. Please try again.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    if (!gameState.gameStarted || !gameState.puzzles[3].completed) return null;

    return (
        <>
            <Head>
                <title>Ascension | Olympus Enigma</title>
            </Head>

            <div className="min-h-screen bg-[#f5f5f5] text-slate-800 relative overflow-x-hidden">

                {/* 3D DIVINE BACKGROUND */}
                <div className="absolute inset-0 z-0 opacity-80">
                    <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-b from-olympus-sky to-white" />}>
                        <CanvasWrapper quality="high" camera={{ position: [0, 2, 10], fov: 50 }}>
                            <FinishScene />
                        </CanvasWrapper>
                    </Suspense>
                </div>

                {/* SKY BACKGROUND Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-olympus-sky/30 via-transparent to-white/80 z-[1] pointer-events-none" />
                <GoldenRain opacity={0.4} />

                {/* Film Grain for Cinematic Texture */}
                <FilmGrain opacity={0.015} speed={10} blendMode="overlay" />

                {/* Divine Volumetric Light from Top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] pointer-events-none opacity-30 z-[2]">
                    <VolumetricLight
                        color="#ffd700"
                        intensity={0.2}
                        rayCount={10}
                        pulseSpeed={6000}
                        animated={true}
                    />
                </div>

                {/* HERO SECTION */}
                <div className="relative z-10 pt-20 pb-10 px-6 text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block px-3 py-1 rounded-full bg-olympus-gold/10 text-olympus-goldDark font-body font-bold tracking-widest text-xs mb-4 border border-olympus-gold/20">
                            JOURNEY COMPLETE
                        </span>
                        <h1 className="font-display text-5xl md:text-7xl text-slate-900 bg-clip-text text-transparent bg-gradient-to-b from-slate-800 to-slate-600 mb-2">
                            Ascended to Olympus
                        </h1>
                        <p className="font-body text-xl text-slate-500 max-w-2xl mx-auto italic">
                            "Through chaos, stars, and fire, you have proven your worth."
                        </p>
                    </motion.div>
                </div>

                {/* STATUES CAROUSEL */}
                <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {STATUES.map((statue, idx) => (
                        <motion.div
                            key={statue.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.2 + 0.5 }}
                            className="relative group"
                        >
                            <div className="glass-card bg-white/40 p-8 text-center rounded-2xl h-full border-t-4 border-olympus-gold/50 shadow-depth transition-all hover:-translate-y-2 hover:shadow-glow-gold">
                                {/* Silhouette Visualization (CSS/SVG) */}
                                <div className="h-32 mb-6 flex items-center justify-center">
                                    <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md">
                                        <path d={statue.path} fill="url(#goldGradient)" />
                                        <defs>
                                            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#d4af37" />
                                                <stop offset="100%" stopColor="#b8960c" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>

                                <h3 className="font-heading text-2xl text-slate-900 mb-1">{statue.name}</h3>
                                <p className="font-body text-olympus-goldDark text-sm uppercase tracking-widest mb-4">{statue.title}</p>
                                <div className="w-8 h-[1px] bg-slate-200 mx-auto mb-4" />
                                <p className="font-body text-slate-600 italic">"{statue.quote}"</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* STATS & CERTIFICATE */}
                <section className="relative z-20 max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-start">

                    {/* Certificate Preview (Hidden off-screen usually, but we show it here) */}
                    <div className="relative perspective-1000 group">
                        {/* Actual Certificate DOM to capture - SIMPLE HTML2CANVAS COMPATIBLE */}
                        <div
                            ref={certRef}
                            style={{
                                width: '600px',
                                minHeight: '400px',
                                padding: '40px',
                                backgroundColor: '#fffef8',
                                border: '8px double #d4af37',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'Georgia, serif',
                            }}
                        >
                            {/* Inner border */}
                            <div style={{
                                position: 'absolute',
                                top: '15px',
                                left: '15px',
                                right: '15px',
                                bottom: '15px',
                                border: '2px solid #d4af37',
                                pointerEvents: 'none',
                            }} />

                            {/* Omega Symbol */}
                            <div style={{
                                fontSize: '48px',
                                color: '#d4af37',
                                marginBottom: '10px',
                            }}>
                                &#937;
                            </div>

                            {/* Title */}
                            <h1 style={{
                                fontSize: '32px',
                                letterSpacing: '8px',
                                color: '#2a2520',
                                margin: '0 0 5px 0',
                                textTransform: 'uppercase',
                            }}>
                                CERTIFICATE
                            </h1>
                            <p style={{
                                fontSize: '18px',
                                letterSpacing: '4px',
                                color: '#d4af37',
                                margin: '0 0 20px 0',
                                textTransform: 'uppercase',
                            }}>
                                OF DIVINE ASCENSION
                            </p>

                            {/* Divider */}
                            <div style={{
                                width: '200px',
                                height: '2px',
                                background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                                margin: '10px 0 20px 0',
                            }} />

                            {/* Body */}
                            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 10px 0' }}>
                                This prestigious document hereby certifies that
                            </p>
                            <p style={{
                                fontSize: '28px',
                                color: '#1a1510',
                                fontWeight: 'bold',
                                margin: '0 0 10px 0',
                                borderBottom: '2px solid #d4af37',
                                paddingBottom: '5px',
                            }}>
                                Seeker of Divine Wisdom
                            </p>
                            <p style={{
                                fontSize: '14px',
                                color: '#666',
                                textAlign: 'center',
                                maxWidth: '400px',
                                lineHeight: '1.6',
                                margin: '0 0 20px 0',
                            }}>
                                has triumphantly conquered the trials of chaos, navigated the celestial mysteries, and proven worthy of ascension to Mount Olympus.
                            </p>

                            {/* Stats */}
                            <div style={{
                                display: 'flex',
                                gap: '40px',
                                margin: '15px 0',
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1510', margin: 0 }}>
                                        {formatTimeHuman(totalTime)}
                                    </p>
                                    <p style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                                        Completion Time
                                    </p>
                                </div>
                                <div style={{ width: '1px', backgroundColor: '#ddd' }} />
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1510', margin: 0 }}>
                                        {accuracy}%
                                    </p>
                                    <p style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                                        Divine Accuracy
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                marginTop: '20px',
                                paddingTop: '15px',
                                borderTop: '1px solid #eee',
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: '100px', height: '1px', backgroundColor: '#ccc', margin: '0 auto 5px' }} />
                                    <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>ID: {certificateId}</p>
                                    <p style={{ fontSize: '9px', color: '#aaa', margin: 0 }}>Seal of Authenticity</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '28px', color: '#d4af37', margin: '0 0 5px 0' }}>&#937;</p>
                                    <div style={{ width: '100px', height: '1px', backgroundColor: '#ccc', margin: '0 auto 5px' }} />
                                    <p style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                                        Olympus High Council
                                    </p>
                                </div>
                            </div>

                            {/* Stars decoration */}
                            <div style={{
                                position: 'absolute',
                                bottom: '25px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                color: '#d4af37',
                                fontSize: '12px',
                                letterSpacing: '8px',
                            }}>
                                ★ ★ ★ ★ ★
                            </div>
                        </div>

                        {/* Hover Shine Effect over the certificate container */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20" />
                    </div>

                    {/* Action Panel - YOUR PERFORMANCE */}
                    <div className="space-y-6">
                        <div
                            className="p-8 rounded-2xl shadow-2xl border-2 border-olympus-gold/30"
                            style={{
                                backgroundColor: '#ffffff',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(212,175,55,0.2)',
                            }}
                        >
                            <h3 className="font-heading text-2xl mb-6 flex items-center gap-3 text-slate-900">
                                <span className="text-2xl">⚡</span>
                                Your Performance
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div
                                    className="p-5 rounded-xl border-2 border-slate-200"
                                    style={{ backgroundColor: '#f8fafc' }}
                                >
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Total Time</p>
                                    <p className="font-mono text-3xl text-slate-900 font-bold">{formatTimeHuman(totalTime)}</p>
                                </div>
                                <div
                                    className="p-5 rounded-xl border-2 border-slate-200"
                                    style={{ backgroundColor: '#f8fafc' }}
                                >
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Accuracy</p>
                                    <p className="font-mono text-3xl text-slate-900 font-bold">{accuracy}%</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleDownloadCertificate}
                                    disabled={isGeneratingPdf}
                                    className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
                                    style={{
                                        background: 'linear-gradient(135deg, #d4af37 0%, #f0c850 50%, #d4af37 100%)',
                                        color: '#1a1510',
                                        boxShadow: '0 4px 20px rgba(212,175,55,0.5)',
                                    }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    {isGeneratingPdf ? 'Generating Certificate...' : '📜 Download Certificate (PDF)'}
                                </button>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        className="px-4 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:bg-blue-50"
                                        style={{
                                            backgroundColor: '#ffffff',
                                            border: '2px solid #e2e8f0',
                                            color: '#475569',
                                        }}
                                    >
                                        🐦 Share to Twitter
                                    </button>
                                    <button
                                        onClick={() => {
                                            audio.playClick();
                                            resetGame();
                                            window.location.href = '/';
                                        }}
                                        className="px-4 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:bg-green-50"
                                        style={{
                                            backgroundColor: '#ffffff',
                                            border: '2px solid #e2e8f0',
                                            color: '#475569',
                                        }}
                                    >
                                        🔄 Play Again
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Achievements Mini */}
                        <div
                            className="p-6 rounded-2xl shadow-lg border-2 border-slate-200"
                            style={{ backgroundColor: '#ffffff' }}
                        >
                            <h3 className="font-heading text-lg mb-4">Achievements Unlocked</h3>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(gameState.achievements || {}).filter(([_, unlocked]) => unlocked).map(([achId]) => (
                                    <span key={achId} className="px-3 py-1 bg-olympus-gold/10 text-olympus-goldDark rounded-full text-xs font-bold border border-olympus-gold/20">
                                        {achId}
                                    </span>
                                ))}
                                {Object.values(gameState.achievements || {}).every(v => !v) && (
                                    <span className="text-slate-400 text-sm italic">None yet...</span>
                                )}
                            </div>
                        </div>
                    </div>

                </section >

            </div >
        </>
    );
}
