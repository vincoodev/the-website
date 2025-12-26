/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ═══════════════════════════════════════════════════════════════
         OLYMPUS ENIGMA - DESIGN TOKENS
         These tokens define the visual language of the puzzle hunt.
         Gemini Pro: Customize values here for design refinement.
         ═══════════════════════════════════════════════════════════════ */
      
      colors: {
        /* CHAOS REALM - Digital corruption aesthetic */
        chaos: {
          void: '#0a0a0a',       // The abyss - pure black
          glitch: '#00ff41',     // Matrix green - corruption
          error: '#ff006e',      // System failure - magenta
          data: '#00ffff',       // Data streams - cyan
          warning: '#ffff00',    // Alert yellow
        },
        
        /* PUZZLE REALM - Mystical journey */
        puzzle: {
          depth: '#1a0a2e',      // Deep purple mysteries
          glow: '#00ff41',       // Terminal wisdom
          stars: '#ffd700',      // Celestial guidance
          night: '#0a0a2e',      // Night sky
        },
        
        /* OLYMPUS REALM - Divine achievement */
        olympus: {
          sky: '#e6f3ff',        // Heaven's gradient (light)
          skyDark: '#b8d4f0',    // Heaven's gradient (end)
          marble: '#f5f5f5',     // Sacred stone
          marbleDark: '#e8e8e8', // Marble shadow
          gold: '#d4af37',       // Divine metal
          goldLight: '#f4cf67',  // Gold highlight
          goldDark: '#b8960c',   // Gold shadow
          azure: '#4169e1',      // Zeus's realm
          bronze: '#cd7f32',     // Achievement bronze
          silver: '#c0c0c0',     // Achievement silver
        },
        
        /* TEMPLE - Ancient stone */
        temple: {
          stone: '#8b8680',      // Ancient walls
          stoneDark: '#6b6660',  // Stone shadow
          torch: '#ff6b35',      // Flame orange
          torchGlow: '#f7c331',  // Flame core
        },
      },
      
      fontFamily: {
        /* Display - Headlines, divine text */
        display: ['Cinzel Decorative', 'Cinzel', 'serif'],
        
        /* Heading - Section titles */
        heading: ['Cinzel', 'serif'],
        
        /* Body - Paragraphs, descriptions */
        body: ['Cormorant Garamond', 'Georgia', 'serif'],
        
        /* Mono - Terminal, cipher text */
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        
        /* Sans - UI elements, buttons */
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      fontSize: {
        /* Golden Ratio Scale (φ = 1.618) */
        'xs': ['0.618rem', { lineHeight: '1rem' }],
        'sm': ['0.786rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.618rem' }],
        'lg': ['1.272rem', { lineHeight: '1.75rem' }],
        'xl': ['1.618rem', { lineHeight: '2rem' }],
        '2xl': ['2.058rem', { lineHeight: '2.5rem' }],
        '3xl': ['2.618rem', { lineHeight: '3rem' }],
        '4xl': ['3.272rem', { lineHeight: '3.5rem' }],
        '5xl': ['4.236rem', { lineHeight: '1' }],
        '6xl': ['5.382rem', { lineHeight: '1' }],
        '7xl': ['6.854rem', { lineHeight: '1' }],
      },
      
      spacing: {
        /* Golden Ratio Spacing */
        'phi-1': '0.618rem',
        'phi-2': '1rem',
        'phi-3': '1.618rem',
        'phi-4': '2.618rem',
        'phi-5': '4.236rem',
        'phi-6': '6.854rem',
        'phi-7': '11.09rem',
      },
      
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.618rem',
        '2xl': '2.618rem',
      },
      
      boxShadow: {
        /* Layered depth shadows - PREMIUM feel */
        'depth': `
          0 1px 2px rgba(0, 0, 0, 0.07),
          0 2px 4px rgba(0, 0, 0, 0.07),
          0 4px 8px rgba(0, 0, 0, 0.07),
          0 8px 16px rgba(0, 0, 0, 0.07),
          0 16px 32px rgba(0, 0, 0, 0.07)
        `,
        'depth-lg': `
          0 2px 4px rgba(0, 0, 0, 0.1),
          0 4px 8px rgba(0, 0, 0, 0.1),
          0 8px 16px rgba(0, 0, 0, 0.1),
          0 16px 32px rgba(0, 0, 0, 0.1),
          0 32px 64px rgba(0, 0, 0, 0.1)
        `,
        /* Glow effects */
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.4), 0 0 40px rgba(212, 175, 55, 0.2)',
        'glow-green': '0 0 20px rgba(0, 255, 65, 0.4), 0 0 40px rgba(0, 255, 65, 0.2)',
        'glow-error': '0 0 20px rgba(255, 0, 110, 0.4), 0 0 40px rgba(255, 0, 110, 0.2)',
        /* Glassmorphism */
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
      
      backdropBlur: {
        'glass': '12px',
      },
      
      animation: {
        /* Chaos animations */
        'glitch': 'glitch 0.3s infinite',
        'glitch-slow': 'glitch 1s infinite',
        'shake': 'shake 0.5s ease-in-out',
        'shake-hard': 'shake-hard 0.3s ease-in-out',
        
        /* Elegant animations */
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        
        /* Entrance animations */
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        
        /* Special effects */
        'flicker': 'flicker 0.5s infinite alternate',
        'scanline': 'scanline 8s linear infinite',
        'typing': 'typing 3s steps(30, end)',
        'blink': 'blink 1s infinite',
        
        /* Particle */
        'rain': 'rain 2s linear infinite',
      },
      
      keyframes: {
        /* ─── CHAOS KEYFRAMES ─── */
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        'shake-hard': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-8px, -4px)' },
          '20%': { transform: 'translate(8px, 4px)' },
          '30%': { transform: 'translate(-8px, 4px)' },
          '40%': { transform: 'translate(8px, -4px)' },
          '50%': { transform: 'translate(-4px, -8px)' },
          '60%': { transform: 'translate(4px, 8px)' },
          '70%': { transform: 'translate(-4px, 8px)' },
          '80%': { transform: 'translate(4px, -8px)' },
          '90%': { transform: 'translate(-2px, -2px)' },
        },
        
        /* ─── ELEGANT KEYFRAMES ─── */
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.8', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        
        /* ─── ENTRANCE KEYFRAMES ─── */
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        
        /* ─── SPECIAL EFFECTS ─── */
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 50%': { borderColor: 'currentColor' },
          '51%, 100%': { borderColor: 'transparent' },
        },
        rain: {
          '0%': { transform: 'translateY(-100vh)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
      },
      
      transitionTimingFunction: {
        /* Premium custom easing curves */
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'in-out-smooth': 'cubic-bezier(0.45, 0, 0.55, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1000': '1000ms',
      },
      
      zIndex: {
        'behind': '-1',
        'base': '0',
        'above': '10',
        'modal': '50',
        'overlay': '100',
        'top': '999',
      },
    },
  },
  plugins: [],
};
