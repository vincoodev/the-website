/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OLYMPUS ENIGMA - THREE.JS HYPERREALISTIC LANDING PAGE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * "The Unraveling Reality" - Now with Full 3D
 * 
 * Architecture:
 * - 3D Background: Full Three.js scene with procedural content
 * - 2D Overlay: UI elements (header, buttons, text)
 * 
 * Timeline remains:
 * 0-5s   : Premium corporate + 3D cosmic scene
 * 5-10s  : Reality bending - desaturation, cracks
 * 10-15s : Full chaos - chaos scene
 * 15s+   : Divine revelation - Omega with volumetric 3D
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';

// Store
import { useGameStore } from '../store/gameStore';

// Utils
import { cn, prefersReducedMotion } from '../lib/utils';

// 3D Components
import CanvasWrapper from '../components/canvas/CanvasWrapper';
import LandingScene from '../components/canvas/scenes/LandingScene';

// 2D Hyperrealistic Components (fallback/overlay)
import FilmGrain from '../components/FilmGrain';
import CrackOverlay from '../components/CrackOverlay';

// Chaos Text System
import ChaosText from '../components/ChaosText';

/* ─── CHAOS PHASES ─── */
const PHASES = {
  CALM: 'calm',
  DECAY: 'decay',
  CHAOS: 'chaos',
  REVELATION: 'revelation',
  EXTREME: 'extreme',
};

/* ─── PHASE TIMING (milliseconds) ─── */
const PHASE_TIMING = {
  [PHASES.CALM]: 0,
  [PHASES.DECAY]: 5000,
  [PHASES.CHAOS]: 10000,
  [PHASES.REVELATION]: 15000,
  [PHASES.EXTREME]: 20000,
};

/* ─── 3D LOADING SCREEN ─── */
function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-olympus-gold/30 border-t-olympus-gold rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-olympus-gold font-display text-2xl tracking-[0.3em] uppercase animate-pulse">
          ENTERING OLYMPUS
        </h2>
        <p className="text-white/40 font-mono text-sm mt-4">
          Loading divine realm...
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const startGame = useGameStore((state) => state.startGame);
  const gameStarted = useGameStore((state) => state.gameStarted);

  // Chaos state from store
  const chaosTriggered = useGameStore((state) => state.chaosTriggered);
  const chaosLevel = useGameStore((state) => state.chaosLevel);
  const incrementChaosLevel = useGameStore((state) => state.incrementChaosLevel);
  const resetChaos = useGameStore((state) => state.resetChaos);
  const triggerChaos = useGameStore((state) => state.triggerChaos);

  // State
  const [phase, setPhase] = useState(PHASES.CALM);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const [cursorDelay, setCursorDelay] = useState(0);
  const [mutatedText, setMutatedText] = useState('THE VEIL LIFTS');

  // Refs
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const chaosTimerRef = useRef(null);

  // Text mutations based on chaos level - observational, reflective language
  // "Omega tidak berbicara pada user. Omega berbicara pada ruang."
  const TEXT_MUTATIONS = useMemo(() => [
    '',                              // Level 0: Silence - user is active
    'stillness',                     // Level 1: A whisper of awareness
    'presence observed',             // Level 2: Acknowledgment
    'the room remembers',            // Level 3: Environment aware
    'nothing escapes attention',     // Level 4: Calm finality
    'Ω',                             // Level 5: Ultimate reduction to essence
  ], []);

  // Client-side mount + Route Protection
  useEffect(() => {
    setMounted(true);

    // Route protection removed - chaos presence runs on this page directly
    // User activity does not reset chaos - only clicking Omega exits

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setWebglSupported(!!gl);
    } catch (e) {
      setWebglSupported(false);
    }

    // If coming from /profile with chaos, trigger it
    if (chaosTriggered) {
      setPhase(PHASES.REVELATION);
    }
  }, [chaosTriggered, gameStarted, router]);

  // ─── TIME-BASED CHAOS PRESENCE ───
  // Chaos escalates based on TIME ON PAGE, not inactivity
  // User activity (mouse, scroll, keys) does NOT reset - only clicking Omega exits
  const [presenceLevel, setPresenceLevel] = useState(0);
  const presenceTimerRef = useRef(null);
  const pageLoadTimeRef = useRef(Date.now());

  // Start presence escalation on mount (based on time, not activity)
  useEffect(() => {
    if (gameStarted) return; // No chaos if game already started

    // Reset page load time on mount
    pageLoadTimeRef.current = Date.now();

    // Presence escalation timer - check every 1 second for precise timing
    presenceTimerRef.current = setInterval(() => {
      const timeOnPage = Date.now() - pageLoadTimeRef.current;
      const secondsOnPage = Math.floor(timeOnPage / 1000);

      // Start escalation after 10 seconds on page
      if (secondsOnPage >= 10) {
        // Calculate level based on time (every 10 seconds = +1 level)
        const newLevel = Math.min(Math.floor((secondsOnPage - 10) / 10) + 1, 5);
        setPresenceLevel(prev => {
          if (newLevel > prev) return newLevel;
          return prev;
        });
      }
    }, 1000);

    return () => {
      if (presenceTimerRef.current) {
        clearInterval(presenceTimerRef.current);
      }
    };
  }, [gameStarted]);

  // Apply presence chaos effects (CSS only - text handled by ChaosText component)
  useEffect(() => {
    if (presenceLevel === 0) return;

    // Apply body class for CSS effects
    if (typeof document !== 'undefined') {
      // Remove previous levels first
      for (let i = 0; i <= 5; i++) {
        if (i !== presenceLevel) {
          document.body.classList.remove(`chaos-level-${i}`);
        }
      }
      document.body.classList.add(`chaos-level-${presenceLevel}`);
    }
  }, [presenceLevel]);

  /* ─── CHAOS TIMER (Original phase system) ─── */
  useEffect(() => {
    if (gameStarted) {
      setPhase(PHASES.REVELATION);
      return;
    }

    // If chaos was triggered from /profile, skip to revelation
    if (chaosTriggered) {
      setPhase(PHASES.REVELATION);
      return;
    }

    startTimeRef.current = Date.now();

    const updatePhase = () => {
      const elapsed = Date.now() - startTimeRef.current;

      if (elapsed >= PHASE_TIMING[PHASES.EXTREME]) {
        setPhase(PHASES.EXTREME);
      } else if (elapsed >= PHASE_TIMING[PHASES.REVELATION]) {
        setPhase(PHASES.REVELATION);
      } else if (elapsed >= PHASE_TIMING[PHASES.CHAOS]) {
        setPhase(PHASES.CHAOS);
      } else if (elapsed >= PHASE_TIMING[PHASES.DECAY]) {
        setPhase(PHASES.DECAY);
      }
    };

    timerRef.current = setInterval(updatePhase, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, chaosTriggered]);

  /* ─── HANDLE OMEGA CLICK ─── */
  const handleOmegaClick = useCallback(() => {
    if (phase !== PHASES.REVELATION && phase !== PHASES.EXTREME) return;

    setHasInteracted(true);
    resetChaos(); // Clear chaos state
    startGame();

    setTimeout(() => {
      router.push('/puzzle1');
    }, 800);
  }, [phase, startGame, router, resetChaos]);

  // Map phase names for 3D scene
  const scenePhase = useMemo(() => {
    switch (phase) {
      case PHASES.CALM: return 'calm';
      case PHASES.DECAY: return 'decay';
      case PHASES.CHAOS: return 'chaos';
      case PHASES.REVELATION:
      case PHASES.EXTREME: return 'revelation';
      default: return 'calm';
    }
  }, [phase]);

  const omegaVisible = phase === PHASES.REVELATION || phase === PHASES.EXTREME;

  // Determine if we should show extreme chaos (either from timer or from escalation)
  const isExtremeChaos = phase === PHASES.EXTREME || chaosLevel >= 4;

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>{phase === PHASES.CALM ? 'Nexus Technologies' : 'ERROR | ▓█▓█'}</title>
      </Head>

      <div
        className={cn(
          'min-h-screen relative overflow-hidden',
          'transition-all duration-1000',
        )}
        style={{
          background: phase === PHASES.CALM
            ? 'linear-gradient(to bottom, #fafafa, #f0f0f5)'
            : '#000000',
        }}
      >
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 3D SCENE LAYER - Full screen behind everything */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {webglSupported ? (
          <div className={cn(
            'absolute inset-0 z-0 transition-opacity duration-1000',
            phase === PHASES.CALM ? 'opacity-30' : 'opacity-100'
          )}>
            <Suspense fallback={<LoadingScreen />}>
              <CanvasWrapper
                quality="high"
                camera={{ position: [0, 0, 12], fov: 50 }}
              >
                <LandingScene
                  phase={scenePhase}
                  omegaVisible={omegaVisible}
                  onOmegaClick={null} // Disabled - use 2D button only
                />
              </CanvasWrapper>
            </Suspense>
          </div>
        ) : (
          // Fallback for no WebGL
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black z-0" />
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FILM GRAIN OVERLAY - Always present for organic texture */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <FilmGrain
          opacity={phase === PHASES.CALM ? 0.015 : 0.04}
          speed={phase === PHASES.CALM ? 10 : 5}
          blendMode="overlay"
        />

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 2D UI OVERLAY - Premium Corporate (CALM Phase) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {phase === PHASES.CALM && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{
                opacity: 0,
                scale: 1.02,
                filter: 'blur(20px) saturate(0)',
              }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-screen flex flex-col relative z-20"
            >
              {/* Premium Header */}
              <header className="fixed top-0 w-full z-50">
                <div className="mx-auto max-w-7xl px-6 py-4">
                  <div className="flex items-center justify-between rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                        <span className="text-white font-bold text-sm">N</span>
                      </div>
                      <span className="text-[15px] font-semibold text-gray-900 tracking-tight">
                        Nexus Technologies
                      </span>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                      {['Products', 'Solutions', 'Developers', 'Company'].map((item) => (
                        <button
                          key={item}
                          className="text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </nav>

                    {/* CTA */}
                    <div className="flex items-center gap-3">
                      <button className="text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Sign in
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              {/* Hero Section */}
              <main className="flex-1 flex items-center justify-center pt-24 pb-16 px-6">
                <div className="text-center max-w-4xl mx-auto space-y-8">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 text-[13px] font-medium text-violet-700">
                      <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                      Introducing Nexus 3.0
                    </span>
                  </motion.div>

                  {/* Headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl md:text-7xl font-semibold text-gray-900 leading-[1.1] tracking-tight"
                  >
                    Build the future.
                    <br />
                    <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Ship with confidence.
                    </span>
                  </motion.h1>

                  {/* Subheadline */}
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
                  >
                    The complete platform for modern software teams.
                    From development to deployment, we handle the complexity
                    so you can focus on what matters.
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap justify-center gap-4 pt-4"
                  >
                    <button className="group relative px-8 py-4 rounded-xl bg-gray-900 text-white font-medium overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-gray-900/30">
                      <span className="relative z-10">Start Free Trial</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="px-8 py-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all">
                      Watch Demo →
                    </button>
                  </motion.div>

                  {/* Social Proof */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="pt-12 flex items-center justify-center gap-8 text-gray-400"
                  >
                    <span className="text-sm">Trusted by teams at</span>
                    {['Google', 'Meta', 'Stripe', 'Vercel', 'Linear'].map((company) => (
                      <span key={company} className="text-gray-300 font-semibold text-lg">
                        {company}
                      </span>
                    ))}
                  </motion.div>
                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* CHAOS PRESENCE TEXT - Independent of Phase System */}
        {/* Renders based on time on page, independent of user activity */}
        {/* "Omega tidak berbicara pada user. Omega berbicara pada ruang." */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {presenceLevel > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <ChaosText
                text={TEXT_MUTATIONS[Math.min(presenceLevel, TEXT_MUTATIONS.length - 1)]}
                level={presenceLevel}
                className="text-2xl md:text-4xl"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DECAY + CHAOS OVERLAYS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {phase !== PHASES.CALM && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 pointer-events-none"
            >
              {/* Cracks */}
              <CrackOverlay
                intensity={phase === PHASES.EXTREME ? 1 : phase === PHASES.REVELATION ? 0.7 : 0.4}
                color={phase === PHASES.EXTREME ? 'rgba(255,100,100,0.6)' : 'rgba(255,255,255,0.4)'}
                glowColor={phase === PHASES.EXTREME ? 'rgba(255,50,50,0.5)' : 'rgba(150,100,100,0.3)'}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* OMEGA CLICK OVERLAY (2D fallback if 3D doesn't capture click) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {omegaVisible && !hasInteracted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
            >
              {/* 2D Omega Button (clickable overlay) */}
              <motion.button
                onClick={handleOmegaClick}
                disabled={hasInteracted}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className={cn(
                  'relative cursor-pointer select-none pointer-events-auto',
                  'text-[10rem] md:text-[16rem] font-display leading-none',
                  'transition-all duration-500',
                  phase === PHASES.EXTREME
                    ? 'text-red-500 animate-pulse drop-shadow-[0_0_60px_rgba(255,0,0,0.5)]'
                    : 'text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 drop-shadow-[0_0_80px_rgba(212,175,55,0.6)]',
                )}
                aria-label="Click to escape the chaos"
              >
                Ω
              </motion.button>

              {/* Call to Action */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={cn(
                  'absolute bottom-1/4 left-1/2 -translate-x-1/2 text-center',
                  'font-mono text-sm tracking-[0.5em] uppercase',
                  phase === PHASES.EXTREME
                    ? 'text-red-400 animate-pulse'
                    : 'text-amber-400/80'
                )}
              >
                {phase === PHASES.EXTREME
                  ? '⚠ CLICK NOW OR LOSE EVERYTHING ⚠'
                  : 'The symbol awaits'
                }
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TRANSITION FLASH */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {hasInteracted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-gradient-to-b from-white via-amber-100 to-white"
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
