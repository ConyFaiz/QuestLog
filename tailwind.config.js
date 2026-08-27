/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace', 'cursive'],
        retro: ['"Silkscreen"', '"VT323"', 'monospace'],
        body: ['"VT323"', 'monospace', 'sans-serif'],
      },
      colors: {
        pixel: {
          bg: '#14141d',
          card: '#1e1e2d',
          border: '#3b3b54',
          accent: '#795294',
          gold: '#fbbf24',
          goldDark: '#d97706',
          hp: '#ef4444',
          hpDark: '#991b1b',
          exp: '#06b6d4',
          expDark: '#0e7490',
          mana: '#8b5cf6',
          success: '#22c55e',
          text: '#f3f4f6',
          muted: '#9ca3af',
        },
        dungeon: {
          bg: '#0c0a09',
          card: '#1c1917',
          border: '#44403c',
          accent: '#dc2626',
        },
        castle: {
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#94a3b8',
          accent: '#2563eb',
        }
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0, 0, 0, 0.85)',
        'pixel-sm': '2px 2px 0px 0px rgba(0, 0, 0, 0.85)',
        'pixel-lg': '6px 6px 0px 0px rgba(0, 0, 0, 0.85)',
        'pixel-inset': 'inset 3px 3px 0px 0px rgba(0, 0, 0, 0.5)',
        'pixel-gold': '4px 4px 0px 0px #b45309',
        'pixel-red': '4px 4px 0px 0px #991b1b',
        'pixel-cyan': '4px 4px 0px 0px #0e7490',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pixel-float': 'pixelFloat 3s ease-in-out infinite',
      },
      keyframes: {
        pixelFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
