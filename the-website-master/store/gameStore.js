/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OLYMPUS ENIGMA - GAME STATE STORE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Zustand store managing the entire puzzle hunt state.
 * Includes localStorage persistence for progress saving.
 * 
 * Architecture:
 * - puzzleProgress: Track completion of each puzzle (1-3)
 * - attempts: Count wrong attempts per puzzle
 * - timing: Start/end timestamps for completion time
 * - achievements: Unlocked achievements
 * - settings: User preferences (audio, motion)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ─── INITIAL STATE ─── */
const initialState = {
    // Game Progress
    gameStarted: false,
    currentPuzzle: 0, // 0 = not started, 1-3 = puzzle number, 4 = finished

    // Puzzle Completion Status
    puzzles: {
        1: { completed: false, attempts: 0, startTime: null, endTime: null },
        2: { completed: false, attempts: 0, startTime: null, endTime: null },
        3: { completed: false, attempts: 0, startTime: null, endTime: null },
    },

    // Overall Timing
    gameStartTime: null,
    gameEndTime: null,

    // Achievements
    achievements: {
        lightningFast: false,      // Complete < 5 minutes
        quickThinker: false,       // Complete < 10 minutes
        perfectRun: false,         // Zero wrong attempts
        determined: false,         // Puzzle 3 with ≥10 attempts
        eagleEye: false,           // Find all easter eggs
        athenaFavorite: false,     // Type ATHENA in puzzle 1
    },

    // Easter Eggs Found
    easterEggs: {
        athenaSecret: false,
        hiddenOmega: false,
        starPattern: false,
        templeWhisper: false,
        olympusGlow: false,
    },

    // User Settings
    settings: {
        audioEnabled: true,
        reducedMotion: false,
        volume: 0.7,
    },

    // Chaos State (for Omega page escalation)
    chaosTriggered: false,      // Has user come from /profile chaos?
    chaosStartTime: null,       // When did they arrive at Omega page?
    chaosLevel: 0,              // 0-5 escalation level

    // Leaderboard (local only)
    leaderboard: [],
};

/* ─── STORE DEFINITION ─── */
export const useGameStore = create(
    persist(
        (set, get) => ({
            ...initialState,

            /* ═══════════════════════════════════════════════════════════════════
               GAME CONTROL ACTIONS
               ═══════════════════════════════════════════════════════════════════ */

            /**
             * Start the puzzle hunt journey
             */
            startGame: () => set({
                gameStarted: true,
                currentPuzzle: 1,
                gameStartTime: Date.now(),
                puzzles: {
                    ...initialState.puzzles,
                    1: { ...initialState.puzzles[1], startTime: Date.now() },
                },
            }),

            /**
             * Reset entire game state
             */
            resetGame: () => set({ ...initialState }),

            /* ═══════════════════════════════════════════════════════════════════
               PUZZLE ACTIONS
               ═══════════════════════════════════════════════════════════════════ */

            /**
             * Start a specific puzzle
             * @param {number} puzzleNumber - 1, 2, or 3
             */
            startPuzzle: (puzzleNumber) => set((state) => ({
                currentPuzzle: puzzleNumber,
                puzzles: {
                    ...state.puzzles,
                    [puzzleNumber]: {
                        ...state.puzzles[puzzleNumber],
                        startTime: state.puzzles[puzzleNumber].startTime || Date.now(),
                    },
                },
            })),

            /**
             * Record a wrong attempt
             * @param {number} puzzleNumber - 1, 2, or 3
             */
            recordAttempt: (puzzleNumber) => set((state) => ({
                puzzles: {
                    ...state.puzzles,
                    [puzzleNumber]: {
                        ...state.puzzles[puzzleNumber],
                        attempts: state.puzzles[puzzleNumber].attempts + 1,
                    },
                },
            })),

            /**
             * Complete a puzzle and advance
             * @param {number} puzzleNumber - 1, 2, or 3
             */
            completePuzzle: (puzzleNumber) => set((state) => {
                const now = Date.now();
                const isLastPuzzle = puzzleNumber === 3;
                const nextPuzzle = isLastPuzzle ? 4 : puzzleNumber + 1;

                const newPuzzles = {
                    ...state.puzzles,
                    [puzzleNumber]: {
                        ...state.puzzles[puzzleNumber],
                        completed: true,
                        endTime: now,
                    },
                };

                // Start next puzzle timer if not finished
                if (!isLastPuzzle) {
                    newPuzzles[nextPuzzle] = {
                        ...state.puzzles[nextPuzzle],
                        startTime: now,
                    };
                }

                return {
                    puzzles: newPuzzles,
                    currentPuzzle: nextPuzzle,
                    gameEndTime: isLastPuzzle ? now : state.gameEndTime,
                };
            }),

            /**
             * Get total wrong attempts across all puzzles
             */
            getTotalAttempts: () => {
                const state = get();
                return Object.values(state.puzzles).reduce(
                    (sum, puzzle) => sum + puzzle.attempts, 0
                );
            },

            /**
             * Get completion time in milliseconds
             */
            getCompletionTime: () => {
                const state = get();
                if (!state.gameStartTime || !state.gameEndTime) return null;
                return state.gameEndTime - state.gameStartTime;
            },

            /**
             * Get formatted completion time (MM:SS)
             */
            getFormattedTime: () => {
                const ms = get().getCompletionTime();
                if (!ms) return '--:--';
                const seconds = Math.floor(ms / 1000);
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
            },

            /* ═══════════════════════════════════════════════════════════════════
               ACHIEVEMENT ACTIONS
               ═══════════════════════════════════════════════════════════════════ */

            /**
             * Unlock an achievement
             * @param {string} achievementKey - Key from achievements object
             */
            unlockAchievement: (achievementKey) => set((state) => ({
                achievements: {
                    ...state.achievements,
                    [achievementKey]: true,
                },
            })),

            /**
             * Check and unlock time-based achievements
             */
            checkTimeAchievements: () => {
                const state = get();
                const completionTime = state.getCompletionTime();
                if (!completionTime) return;

                const minutes = completionTime / 1000 / 60;

                if (minutes < 5 && !state.achievements.lightningFast) {
                    get().unlockAchievement('lightningFast');
                }
                if (minutes < 10 && !state.achievements.quickThinker) {
                    get().unlockAchievement('quickThinker');
                }
            },

            /**
             * Check and unlock accuracy-based achievements
             */
            checkAccuracyAchievements: () => {
                const state = get();
                const totalAttempts = get().getTotalAttempts();

                if (totalAttempts === 0 && !state.achievements.perfectRun) {
                    get().unlockAchievement('perfectRun');
                }

                if (state.puzzles[3].attempts >= 10 && !state.achievements.determined) {
                    get().unlockAchievement('determined');
                }
            },

            /**
             * Discover an easter egg
             * @param {string} eggKey - Key from easterEggs object
             */
            discoverEasterEgg: (eggKey) => set((state) => {
                const newEasterEggs = {
                    ...state.easterEggs,
                    [eggKey]: true,
                };

                // Check if all eggs found
                const allFound = Object.values(newEasterEggs).every(Boolean);

                return {
                    easterEggs: newEasterEggs,
                    achievements: allFound
                        ? { ...state.achievements, eagleEye: true }
                        : state.achievements,
                };
            }),

            /* ═══════════════════════════════════════════════════════════════════
               SETTINGS ACTIONS
               ═══════════════════════════════════════════════════════════════════ */

            /**
             * Toggle audio on/off
             */
            toggleAudio: () => set((state) => ({
                settings: {
                    ...state.settings,
                    audioEnabled: !state.settings.audioEnabled,
                },
            })),

            /**
             * Set volume level
             * @param {number} volume - 0 to 1
             */
            setVolume: (volume) => set((state) => ({
                settings: {
                    ...state.settings,
                    volume: Math.max(0, Math.min(1, volume)),
                },
            })),

            /**
             * Toggle reduced motion mode
             */
            toggleReducedMotion: () => set((state) => ({
                settings: {
                    ...state.settings,
                    reducedMotion: !state.settings.reducedMotion,
                },
            })),

            /* ═══════════════════════════════════════════════════════════════════
               CHAOS ACTIONS (Omega Page Escalation)
               ═══════════════════════════════════════════════════════════════════ */

            /**
             * Trigger chaos mode (called from /profile when redirecting to /)
             */
            triggerChaos: () => set({
                chaosTriggered: true,
                chaosStartTime: Date.now(),
                chaosLevel: 0,
            }),

            /**
             * Increment chaos level (called by escalation timer)
             */
            incrementChaosLevel: () => set((state) => ({
                chaosLevel: Math.min(state.chaosLevel + 1, 5),
            })),

            /**
             * Reset chaos state (called when user clicks Omega)
             */
            resetChaos: () => set({
                chaosTriggered: false,
                chaosStartTime: null,
                chaosLevel: 0,
            }),

            /**
             * Get seconds since chaos started
             */
            getChaosElapsed: () => {
                const state = get();
                if (!state.chaosStartTime) return 0;
                return Math.floor((Date.now() - state.chaosStartTime) / 1000);
            },

            /* ═══════════════════════════════════════════════════════════════════
               LEADERBOARD ACTIONS
               ═══════════════════════════════════════════════════════════════════ */

            /**
             * Add entry to leaderboard
             * @param {object} entry - { name, time, date }
             */
            addToLeaderboard: (entry) => set((state) => {
                const newLeaderboard = [
                    ...state.leaderboard,
                    {
                        ...entry,
                        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        date: new Date().toISOString(),
                    },
                ]
                    .sort((a, b) => a.time - b.time) // Sort by fastest time
                    .slice(0, 10); // Keep top 10

                return { leaderboard: newLeaderboard };
            }),

            /**
             * Get user's rank in leaderboard
             * @param {number} time - Time in milliseconds
             */
            getUserRank: (time) => {
                const state = get();
                const rank = state.leaderboard.findIndex((entry) => entry.time > time) + 1;
                return rank === 0 ? state.leaderboard.length + 1 : rank;
            },
        }),
        {
            name: 'olympus-enigma-storage',
            storage: createJSONStorage(() => {
                // Safe localStorage access (handles SSR and incognito)
                if (typeof window === 'undefined') {
                    return {
                        getItem: () => null,
                        setItem: () => { },
                        removeItem: () => { },
                    };
                }
                try {
                    return localStorage;
                } catch {
                    return {
                        getItem: () => null,
                        setItem: () => { },
                        removeItem: () => { },
                    };
                }
            }),
            partialize: (state) => ({
                // Only persist specific fields
                puzzles: state.puzzles,
                achievements: state.achievements,
                easterEggs: state.easterEggs,
                settings: state.settings,
                leaderboard: state.leaderboard,
                gameStartTime: state.gameStartTime,
                gameEndTime: state.gameEndTime,
                currentPuzzle: state.currentPuzzle,
                gameStarted: state.gameStarted,
                // Do NOT persist chaos state - it should reset on reload
            }),
        }
    )
);

/* ─── SELECTORS (for optimized re-renders) ─── */
export const selectPuzzleProgress = (state) => state.puzzles;
export const selectAchievements = (state) => state.achievements;
export const selectSettings = (state) => state.settings;
export const selectCurrentPuzzle = (state) => state.currentPuzzle;
export const selectGameStarted = (state) => state.gameStarted;
export const selectLeaderboard = (state) => state.leaderboard;

/* ─── HELPER HOOKS ─── */
export const usePuzzleState = (puzzleNumber) => {
    return useGameStore((state) => state.puzzles[puzzleNumber]);
};

export const useAudioEnabled = () => {
    return useGameStore((state) => state.settings.audioEnabled);
};

export default useGameStore;
