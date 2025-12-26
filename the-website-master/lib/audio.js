/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OLYMPUS ENIGMA - AUDIO MANAGER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Central audio management using Howler.js
 * Handles sound effects, ambient music, and user preferences.
 * 
 * Features:
 * - Lazy loading of audio files
 * - Volume control with global mute
 * - Spatial audio support
 * - iOS autoplay workaround
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Howl, Howler } from 'howler';

/* ─── SOUND DEFINITIONS ─── */
const SOUNDS = {
    // UI Feedback
    correct: {
        src: ['/audio/correct.mp3', '/audio/correct.webm'],
        volume: 0.6,
        preload: true,
    },
    wrong: {
        src: ['/audio/wrong.mp3', '/audio/wrong.webm'],
        volume: 0.5,
        preload: true,
    },
    click: {
        src: ['/audio/click.mp3', '/audio/click.webm'],
        volume: 0.3,
        preload: true,
    },

    // Chaos Effects
    glitch: {
        src: ['/audio/glitch.mp3', '/audio/glitch.webm'],
        volume: 0.4,
        preload: false,
    },

    // Puzzle Specific
    patternSelect: {
        src: ['/audio/pattern-select.mp3'],
        volume: 0.4,
    },
    wheelTurn: {
        src: ['/audio/wheel-turn.mp3'],
        volume: 0.3,
    },
    doorOpen: {
        src: ['/audio/door-open.mp3'],
        volume: 0.7,
    },

    // Ambient
    ambientOlympus: {
        src: ['/audio/ambient-olympus.mp3'],
        volume: 0.3,
        loop: true,
        preload: false,
    },
    ambientTemple: {
        src: ['/audio/ambient-temple.mp3'],
        volume: 0.25,
        loop: true,
        preload: false,
    },

    // Victory
    triumph: {
        src: ['/audio/triumph.mp3'],
        volume: 0.6,
        preload: false,
    },
    achievement: {
        src: ['/audio/achievement.mp3'],
        volume: 0.5,
    },
};

/* ─── AUDIO MANAGER CLASS ─── */
class AudioManager {
    constructor() {
        this.sounds = {};
        this.currentAmbient = null;
        this.isEnabled = true;
        this.masterVolume = 0.7;
        this.isInitialized = false;

        // Bind methods
        this.init = this.init.bind(this);
        this.play = this.play.bind(this);
        this.stop = this.stop.bind(this);
    }

    /**
     * Initialize audio system (call after user interaction for iOS)
     */
    init() {
        if (this.isInitialized) return;

        // Preload essential sounds
        Object.entries(SOUNDS).forEach(([key, config]) => {
            if (config.preload) {
                this.sounds[key] = new Howl({
                    ...config,
                    volume: config.volume * this.masterVolume,
                });
            }
        });

        this.isInitialized = true;
        console.log('[AudioManager] Initialized');
    }

    /**
     * Get or create a sound instance
     * @param {string} soundKey - Key from SOUNDS object
     * @returns {Howl} Howler instance
     */
    getSound(soundKey) {
        if (!this.sounds[soundKey] && SOUNDS[soundKey]) {
            const config = SOUNDS[soundKey];
            this.sounds[soundKey] = new Howl({
                ...config,
                volume: config.volume * this.masterVolume,
            });
        }
        return this.sounds[soundKey];
    }

    /**
     * Play a sound effect
     * @param {string} soundKey - Key from SOUNDS object
     * @param {object} options - Optional: { volume, rate, fade }
     * @returns {number|null} Howler sound ID or null if disabled
     */
    play(soundKey, options = {}) {
        if (!this.isEnabled) return null;

        const sound = this.getSound(soundKey);
        if (!sound) {
            console.warn(`[AudioManager] Sound not found: ${soundKey}`);
            return null;
        }

        // Apply options
        if (options.volume !== undefined) {
            sound.volume(options.volume * this.masterVolume);
        }
        if (options.rate !== undefined) {
            sound.rate(options.rate);
        }

        const id = sound.play();

        // Apply fade in if specified
        if (options.fade) {
            sound.fade(0, sound.volume(), options.fade, id);
        }

        return id;
    }

    /**
     * Stop a sound
     * @param {string} soundKey - Key from SOUNDS object
     * @param {number} fadeOut - Fade out duration in ms
     */
    stop(soundKey, fadeOut = 0) {
        const sound = this.sounds[soundKey];
        if (!sound) return;

        if (fadeOut > 0) {
            sound.fade(sound.volume(), 0, fadeOut);
            setTimeout(() => sound.stop(), fadeOut);
        } else {
            sound.stop();
        }
    }

    /**
     * Play ambient background music
     * @param {string} soundKey - Key for ambient sound
     */
    playAmbient(soundKey) {
        // Stop current ambient if different
        if (this.currentAmbient && this.currentAmbient !== soundKey) {
            this.stop(this.currentAmbient, 1000);
        }

        this.currentAmbient = soundKey;
        this.play(soundKey, { fade: 2000 });
    }

    /**
     * Stop all ambient sounds
     */
    stopAmbient() {
        if (this.currentAmbient) {
            this.stop(this.currentAmbient, 1000);
            this.currentAmbient = null;
        }
    }

    /**
     * Set master volume
     * @param {number} volume - 0 to 1
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        Howler.volume(this.masterVolume);
    }

    /**
     * Toggle audio on/off
     */
    toggle() {
        this.isEnabled = !this.isEnabled;
        if (!this.isEnabled) {
            Howler.mute(true);
        } else {
            Howler.mute(false);
        }
        return this.isEnabled;
    }

    /**
     * Enable audio
     */
    enable() {
        this.isEnabled = true;
        Howler.mute(false);
    }

    /**
     * Disable audio
     */
    disable() {
        this.isEnabled = false;
        Howler.mute(true);
    }

    /**
     * Check if audio is enabled
     */
    get enabled() {
        return this.isEnabled;
    }
}

/* ─── SINGLETON EXPORT ─── */
const audioManager = typeof window !== 'undefined' ? new AudioManager() : null;
export default audioManager;

/* ─── REACT HOOK ─── */
export function useAudio() {
    return {
        play: audioManager?.play,
        stop: audioManager?.stop,
        toggle: audioManager?.toggle,
        setVolume: audioManager?.setVolume,
        isEnabled: audioManager?.isEnabled ?? false,
    };
}
