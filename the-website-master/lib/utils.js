/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OLYMPUS ENIGMA - UTILITY FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Shared utility functions used across the application.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* ═══════════════════════════════════════════════════════════════════════════
   CLASS NAME UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Merge Tailwind classes intelligently
 * Combines clsx and tailwind-merge for optimal class handling
 * @param {...(string|object|array)} inputs - Class names to merge
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/* ═══════════════════════════════════════════════════════════════════════════
   PUZZLE UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Caesar cipher decryption
 * @param {string} text - Encrypted text
 * @param {number} shift - Shift amount (default 3)
 * @returns {string} Decrypted text
 */
export function caesarDecrypt(text, shift = 3) {
    return text.replace(/[A-Z]/g, (char) => {
        const code = char.charCodeAt(0) - 65;
        const shifted = (code - shift + 26) % 26;
        return String.fromCharCode(shifted + 65);
    });
}

/**
 * Validate Caesar cipher answer
 * @param {string} input - User input
 * @param {string} expected - Expected answer
 * @returns {boolean} True if correct
 */
export function validateCaesarAnswer(input, expected = 'OLYMPUS') {
    return input.trim().toUpperCase() === expected.toUpperCase();
}

/**
 * Validate constellation pattern
 * @param {array} sequence - User's click sequence (indices)
 * @param {array} expected - Expected sequence (default: [0, 4, 8, 2])
 * @returns {boolean} True if correct
 */
export function validatePatternSequence(sequence, expected = [0, 4, 8, 2]) {
    if (sequence.length !== expected.length) return false;
    return sequence.every((val, idx) => val === expected[idx]);
}

/**
 * Validate temple code
 * @param {array} digits - Array of 4 digits
 * @param {array} expected - Expected code (default: [3, 7, 2, 9])
 * @returns {boolean} True if correct
 */
export function validateTempleCode(digits, expected = [3, 7, 2, 9]) {
    if (digits.length !== 4) return false;
    return digits.every((digit, idx) => digit === expected[idx]);
}

/* ═══════════════════════════════════════════════════════════════════════════
   TIME UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Format milliseconds to MM:SS
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted time string
 */
export function formatTime(ms) {
    if (!ms || ms < 0) return '--:--';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format milliseconds to human readable
 * @param {number} ms - Milliseconds
 * @returns {string} Human readable string
 */
export function formatTimeHuman(ms) {
    if (!ms || ms < 0) return 'Unknown';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
        return `${remainingSeconds} seconds`;
    }
    if (remainingSeconds === 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Check if reduced motion is preferred
 * @returns {boolean} True if reduced motion preferred
 */
export function prefersReducedMotion() {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Generate random number in range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate random integer in range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Delay execution
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ═══════════════════════════════════════════════════════════════════════════
   CERTIFICATE UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Generate unique certificate ID
 * @returns {string} 12-character alphanumeric ID
 */
export function generateCertificateId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        if (i === 4 || i === 8) result += '-';
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

/**
 * Calculate accuracy percentage
 * @param {number} totalAttempts - Wrong attempts
 * @param {number} puzzlesCompleted - Number of puzzles (default 3)
 * @returns {number} Accuracy percentage (0-100)
 */
export function calculateAccuracy(totalAttempts, puzzlesCompleted = 3) {
    if (totalAttempts === 0) return 100;
    // Base score of 100, minus 10 per wrong attempt, minimum 10
    const score = Math.max(10, 100 - (totalAttempts * 10));
    return Math.round(score);
}

/* ═══════════════════════════════════════════════════════════════════════════
   DEVICE DETECTION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Check if running on mobile device
 * @returns {boolean} True if mobile
 */
export function isMobile() {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

/**
 * Check if touch device
 * @returns {boolean} True if touch capable
 */
export function isTouchDevice() {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Trigger haptic feedback (if available)
 * @param {number} duration - Vibration duration in ms
 */
export function hapticFeedback(duration = 50) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOCAL STORAGE HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Safe localStorage get
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Stored value or default
 */
export function getStorageItem(key, defaultValue = null) {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

/**
 * Safe localStorage set
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} Success status
 */
export function setStorageItem(key, value) {
    if (typeof window === 'undefined') return false;
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}
