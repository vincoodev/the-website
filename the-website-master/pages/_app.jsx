/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OLYMPUS ENIGMA - APP WRAPPER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Next.js App component with:
 * - Global styles
 * - Motion preferences detection
 * - Audio initialization on first interaction
 * - Lenis smooth scroll
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';
import '../styles/globals.css';

// Store
import { useGameStore } from '../store/gameStore';

// Audio (lazy import)
let audioManager = null;

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [isLenisReady, setIsLenisReady] = useState(false);
  const settings = useGameStore((state) => state.settings);

  /* ─── AUDIO INITIALIZATION (on first user interaction) ─── */
  const initAudio = useCallback(async () => {
    if (isAudioInitialized) return;

    try {
      const { default: audio } = await import('../lib/audio');
      audioManager = audio;
      if (audioManager) {
        audioManager.init();
        // Sync with store settings
        if (!settings.audioEnabled) {
          audioManager.disable();
        }
        audioManager.setVolume(settings.volume);
      }
      setIsAudioInitialized(true);
    } catch (e) {
      console.warn('[App] Audio initialization failed:', e);
    }
  }, [isAudioInitialized, settings]);

  /* ─── FIRST INTERACTION LISTENER ─── */
  useEffect(() => {
    const handleInteraction = () => {
      initAudio();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [initAudio]);

  /* ─── LENIS SMOOTH SCROLL ─── */
  useEffect(() => {
    let lenis = null;

    const initLenis = async () => {
      try {
        const Lenis = (await import('lenis')).default;

        lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
        });

        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
        setIsLenisReady(true);
      } catch (e) {
        console.warn('[App] Lenis initialization failed:', e);
      }
    };

    // Only init on client
    if (typeof window !== 'undefined') {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (!prefersReducedMotion && !settings.reducedMotion) {
        initLenis();
      }
    }

    return () => {
      if (lenis) {
        lenis.destroy();
      }
    };
  }, [settings.reducedMotion]);

  /* ─── PAGE TRANSITION VARIANTS ─── */
  const pageVariants = {
    initial: { opacity: 0 },
    enter: {
      opacity: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    },
  };

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>Olympus Enigma - The Puzzle Hunt</title>
        <meta name="title" content="Olympus Enigma - The Puzzle Hunt" />
        <meta name="description" content="Embark on a mysterious journey from digital chaos to the divine realm of Olympus. Solve three ancient puzzles to ascend to the Temple of the Gods." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0a0a0a" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Olympus Enigma - The Puzzle Hunt" />
        <meta property="og:description" content="Embark on a mysterious journey from digital chaos to the divine realm of Olympus." />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Olympus Enigma - The Puzzle Hunt" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={router.asPath}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={pageVariants}
        >
          {/* Global Noise Texture - Crucial for organic feel */}
          <div className="noise-overlay" />

          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </>
  );
}
