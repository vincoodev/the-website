/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OLYMPUS ENIGMA - WEB AUDIO API SOUND SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Premium synthesized audio without external files.
 * All sounds generated programmatically using Web Audio API.
 * 
 * Features:
 * - Zero external dependencies
 * - Instant loading (no network requests)
 * - iOS/Safari compatible
 * - Professional quality synthesized sounds
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

class SynthAudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isEnabled = true;
        this.masterVolume = 0.7;
        this.isInitialized = false;
        this.ambientNodes = [];
    }

    /**
     * Initialize AudioContext (must be called after user interaction)
     */
    init() {
        if (this.isInitialized) return this;
        if (typeof window === 'undefined') return this;

        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.ctx.destination);
            this.isInitialized = true;
            console.log('[SynthAudio] Initialized');
        } catch (e) {
            console.warn('[SynthAudio] Failed to initialize:', e);
        }

        return this;
    }

    /**
     * Resume context if suspended (iOS requirement)
     */
    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    /* ═══════════════════════════════════════════════════════════════════════
     * UI FEEDBACK SOUNDS
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Click sound - subtle UI feedback
     */
    playClick() {
        if (!this.isEnabled || !this.ctx) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    /**
     * Hover sound - very subtle
     */
    playHover() {
        if (!this.isEnabled || !this.ctx) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 1200;

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    /**
     * Correct answer - triumphant ascending tone
     */
    playCorrect() {
        if (!this.isEnabled || !this.ctx) return;
        this.resume();

        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)
        const duration = 0.15;

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = this.ctx.currentTime + (i * 0.08);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration + 0.2);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(startTime);
            osc.stop(startTime + duration + 0.3);
        });
    }

    /**
     * Wrong answer - descending dissonant tone
     */
    playWrong() {
        if (!this.isEnabled || !this.ctx) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        // Add distortion for "error" feel
        const distortion = this.ctx.createWaveShaper();
        distortion.curve = this.makeDistortionCurve(50);

        osc.connect(distortion);
        distortion.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    /* ═══════════════════════════════════════════════════════════════════════
     * CHAOS & GLITCH SOUNDS
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Glitch sound - digital distortion
     */
    playGlitch() {
        if (!this.isEnabled || !this.ctx) return;
        this.resume();

        const duration = 0.3;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate glitchy noise
        for (let i = 0; i < bufferSize; i++) {
            // Random noise with sudden level changes
            const segment = Math.floor(i / (bufferSize / 20));
            const segmentVolume = Math.random() > 0.5 ? Math.random() : 0;
            data[i] = (Math.random() * 2 - 1) * segmentVolume;
        }

        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        source.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.value = 1000;

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start();
    }

    /**
     * Chaos escalation tone - eerie building sound
     */
    playChaosEscalation(level = 1) {
        if (!this.isEnabled || !this.ctx) return;
        this.resume();

        const baseFreq = 50 + (level * 20);
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.value = baseFreq;

        osc2.type = 'sine';
        osc2.frequency.value = baseFreq * 1.01; // Slight detuning for unsettling feel

        filter.type = 'lowpass';
        filter.frequency.value = 200 + (level * 100);

        gain.gain.setValueAtTime(0.1 * (level / 5), this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc1.start();
        osc2.start();
        osc1.stop(this.ctx.currentTime + 2.5);
        osc2.stop(this.ctx.currentTime + 2.5);
    }

    /* ═══════════════════════════════════════════════════════════════════════
     * PUZZLE & GAME SOUNDS
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Pattern select - gentle confirmation
     */
    playPatternSelect() {
        if (!this.isEnabled || !this.ctx) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    /**
     * Wheel turn - mechanical rotation sound
     */
    playWheelTurn() {
        if (!this.isEnabled || !this.ctx) return;
        this.resume();

        for (let i = 0; i < 5; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = 100 + Math.random() * 50;

            const startTime = this.ctx.currentTime + (i * 0.08);
            gain.gain.setValueAtTime(0.08, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(startTime);
            osc.stop(startTime + 0.1);
        }
    }

    /**
     * Door open - epic revelation
     */
    playDoorOpen() {
        if (!this.isEnabled || !this.ctx) return;
        this.resume();

        // Low rumble
        const rumble = this.ctx.createOscillator();
        const rumbleGain = this.ctx.createGain();
        rumble.type = 'sine';
        rumble.frequency.value = 40;
        rumbleGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
        rumble.connect(rumbleGain);
        rumbleGain.connect(this.masterGain);
        rumble.start();
        rumble.stop(this.ctx.currentTime + 2);

        // Rising tone
        const rise = this.ctx.createOscillator();
        const riseGain = this.ctx.createGain();
        rise.type = 'sine';
        rise.frequency.setValueAtTime(100, this.ctx.currentTime);
        rise.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 1);
        riseGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        riseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
        rise.connect(riseGain);
        riseGain.connect(this.masterGain);
        rise.start();
        rise.stop(this.ctx.currentTime + 1.5);
    }

    /* ═══════════════════════════════════════════════════════════════════════
     * VICTORY & ACHIEVEMENT SOUNDS
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Triumph - epic victory fanfare
     */
    playTriumph() {
        if (!this.isEnabled || !this.ctx) return;
        this.resume();

        // Major chord arpeggio: C4 - E4 - G4 - C5
        const notes = [261.63, 329.63, 392.00, 523.25];

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = this.ctx.currentTime + (i * 0.15);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
            gain.gain.setValueAtTime(0.25, startTime + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(startTime);
            osc.stop(startTime + 1);
        });

        // Final chord (all notes together)
        setTimeout(() => {
            notes.forEach((freq) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.value = freq;

                const startTime = this.ctx.currentTime;
                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start();
                osc.stop(startTime + 2);
            });
        }, 700);
    }

    /**
     * Achievement unlock - short celebratory sound
     */
    playAchievement() {
        if (!this.isEnabled || !this.ctx) return;
        this.resume();

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = this.ctx.currentTime + (i * 0.05);
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    }

    /* ═══════════════════════════════════════════════════════════════════════
     * AMBIENT SOUNDS
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Start ambient drone - ethereal background
     */
    startAmbient(type = 'olympus') {
        if (!this.isEnabled || !this.ctx) return;
        this.resume();
        this.stopAmbient();

        const frequencies = type === 'temple'
            ? [55, 82.5, 110, 165] // A1, E2, A2, E3 - mysterious
            : [65.41, 98, 130.81, 196]; // C2, G2, C3, G3 - divine

        frequencies.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.value = freq;

            // Gentle LFO for subtle movement
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.value = 0.1 + (i * 0.05);
            lfoGain.gain.value = freq * 0.02;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();

            filter.type = 'lowpass';
            filter.frequency.value = 500;

            gain.gain.value = 0.04;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start();

            this.ambientNodes.push({ osc, gain, lfo });
        });
    }

    /**
     * Stop ambient sounds with fade out
     */
    stopAmbient() {
        this.ambientNodes.forEach(({ osc, gain, lfo }) => {
            if (this.ctx) {
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
                setTimeout(() => {
                    osc.stop();
                    lfo.stop();
                }, 1100);
            }
        });
        this.ambientNodes = [];
    }

    /* ═══════════════════════════════════════════════════════════════════════
     * UTILITY METHODS
     * ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Create distortion curve for effects
     */
    makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;

        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    /**
     * Set master volume (0-1)
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    /**
     * Toggle audio on/off
     */
    toggle() {
        this.isEnabled = !this.isEnabled;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isEnabled ? this.masterVolume : 0;
        }
        return this.isEnabled;
    }

    /**
     * Enable audio
     */
    enable() {
        this.isEnabled = true;
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    /**
     * Disable audio
     */
    disable() {
        this.isEnabled = false;
        if (this.masterGain) {
            this.masterGain.gain.value = 0;
        }
        this.stopAmbient();
    }

    /**
     * Universal play method for compatibility
     */
    play(soundKey) {
        const methodMap = {
            click: () => this.playClick(),
            hover: () => this.playHover(),
            correct: () => this.playCorrect(),
            wrong: () => this.playWrong(),
            glitch: () => this.playGlitch(),
            patternSelect: () => this.playPatternSelect(),
            wheelTurn: () => this.playWheelTurn(),
            doorOpen: () => this.playDoorOpen(),
            triumph: () => this.playTriumph(),
            achievement: () => this.playAchievement(),
        };

        if (methodMap[soundKey]) {
            methodMap[soundKey]();
        }
    }
}

/* ─── SINGLETON EXPORT ─── */
const synthAudio = typeof window !== 'undefined' ? new SynthAudioManager() : null;
export default synthAudio;

/* ─── REACT HOOK ─── */
export function useSynthAudio() {
    return {
        init: () => synthAudio?.init(),
        play: (key) => synthAudio?.play(key),
        playClick: () => synthAudio?.playClick(),
        playHover: () => synthAudio?.playHover(),
        playCorrect: () => synthAudio?.playCorrect(),
        playWrong: () => synthAudio?.playWrong(),
        playGlitch: () => synthAudio?.playGlitch(),
        playChaosEscalation: (level) => synthAudio?.playChaosEscalation(level),
        playPatternSelect: () => synthAudio?.playPatternSelect(),
        playWheelTurn: () => synthAudio?.playWheelTurn(),
        playDoorOpen: () => synthAudio?.playDoorOpen(),
        playTriumph: () => synthAudio?.playTriumph(),
        playAchievement: () => synthAudio?.playAchievement(),
        startAmbient: (type) => synthAudio?.startAmbient(type),
        stopAmbient: () => synthAudio?.stopAmbient(),
        toggle: () => synthAudio?.toggle(),
        setVolume: (v) => synthAudio?.setVolume(v),
        isEnabled: synthAudio?.isEnabled ?? false,
    };
}
