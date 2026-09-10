/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', '"Oswald"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif']
      },
      colors: {
        rip: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b'
        },
        storm: {
          DEFAULT: '#0b1020',
          light: '#11183a'
        },
        accent: {
          gold: '#fbbf24',
          red:  '#ef4444',
          blue: '#38bdf8',
          green:'#22c55e'
        }
      },
      boxShadow: {
        glow: '0 0 40px rgba(99,102,241,0.45)',
        ring: '0 0 0 1px rgba(255,255,255,0.06), 0 30px 60px -20px rgba(0,0,0,0.6)',
        card: '0 10px 30px -10px rgba(2, 6, 23, 0.4)'
      },
      keyframes: {
        'spin-slow':   { '0%':   { transform: 'rotate(0deg)' },   '100%': { transform: 'rotate(360deg)' } },
        'spin-fast':   { '0%':   { transform: 'rotate(0deg)' },   '100%': { transform: 'rotate(-720deg)' } },
        'spin-wobble': {
          '0%':   { transform: 'rotate(0deg) scale(1)' },
          '25%':  { transform: 'rotate(90deg) scale(1.05)' },
          '50%':  { transform: 'rotate(180deg) scale(0.98)' },
          '75%':  { transform: 'rotate(270deg) scale(1.05)' },
          '100%': { transform: 'rotate(360deg) scale(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' }
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2)',   opacity: '0'   }
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-down': {
          '0%':   { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pop-in': {
          '0%':   { opacity: '0', transform: 'scale(0.85)' },
          '60%':  { opacity: '1', transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' }
        },
        burst: {
          '0%':   { transform: 'scale(0)',   opacity: '1' },
          '100%': { transform: 'scale(1.6)', opacity: '0' }
        },
        'tilt-shake': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%':      { transform: 'rotate(2deg)' },
          '75%':      { transform: 'rotate(-2deg)' }
        },
        'spin-cw':      { '0%': { transform: 'rotate(0deg)' },   '100%': { transform: 'rotate(360deg)' } },
        'spin-ccw':     { '0%': { transform: 'rotate(0deg)' },   '100%': { transform: 'rotate(-360deg)' } },
        'spin-crazy': {
          '0%':   { transform: 'rotate(0deg) scale(1)' },
          '20%':  { transform: 'rotate(140deg) scale(1.08)' },
          '40%':  { transform: 'rotate(260deg) scale(0.94)' },
          '60%':  { transform: 'rotate(420deg) scale(1.1)' },
          '80%':  { transform: 'rotate(540deg) scale(0.97)' },
          '100%': { transform: 'rotate(720deg) scale(1)' }
        },
        'orbit-1': {
          '0%':   { transform: 'rotate(0deg) translateX(var(--orbit-r, 180px)) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(var(--orbit-r, 180px)) rotate(-360deg)' }
        },
        'orbit-2': {
          '0%':   { transform: 'rotate(120deg) translateX(var(--orbit-r, 240px)) rotate(0deg)' },
          '100%': { transform: 'rotate(480deg) translateX(var(--orbit-r, 240px)) rotate(-360deg)' }
        },
        'orbit-3': {
          '0%':   { transform: 'rotate(240deg) translateX(var(--orbit-r, 210px)) rotate(0deg)' },
          '100%': { transform: 'rotate(-120deg) translateX(var(--orbit-r, 210px)) rotate(-360deg)' }
        },
        'spark-fly': {
          '0%':   { transform: 'translate(0,0) scale(1)',   opacity: '1' },
          '60%':  { opacity: '1' },
          '100%': { transform: 'translate(var(--tx, 60px), var(--ty, -60px)) scale(0.2)', opacity: '0' }
        },
        'crash-flash': {
          '0%, 100%': { opacity: '0' },
          '45%':      { opacity: '0' },
          '50%':      { opacity: '0.9' },
          '55%':      { opacity: '0' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%':      { opacity: '0.7',  transform: 'scale(1.05)' }
        },
        'breath': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.04)' }
        },
        'streak-fast': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(720deg)' }
        },
        'streak-reverse': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-540deg)' }
        },
        'shockwave': {
          '0%':   { transform: 'scale(0.5)', opacity: '0.8' },
          '100%': { transform: 'scale(2.4)', opacity: '0' }
        },
        'glitch-x': {
          '0%, 92%, 100%': { transform: 'translateX(0)' },
          '94%':           { transform: 'translateX(-3px)' },
          '96%':           { transform: 'translateX(2px)' },
          '98%':           { transform: 'translateX(-1px)' }
        }
      },
      animation: {
        'spin-slow':   'spin-slow 6s linear infinite',
        'spin-fast':   'spin-fast 1.2s linear infinite',
        'spin-wobble': 'spin-wobble 3s ease-in-out infinite',
        'spin-cw':     'spin-cw 2.4s linear infinite',
        'spin-ccw':    'spin-ccw 3.2s linear infinite',
        'spin-crazy':  'spin-crazy 4s cubic-bezier(0.4,0,0.2,1) infinite',
        float:         'float 4s ease-in-out infinite',
        'pulse-ring':  'pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
        shimmer:       'shimmer 2.4s linear infinite',
        'fade-up':     'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':     'fade-in 0.5s ease-out both',
        'slide-down':  'slide-down 0.4s ease-out both',
        'pop-in':      'pop-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
        gradient:      'gradient 8s ease infinite',
        burst:         'burst 0.6s ease-out forwards',
        'tilt-shake':  'tilt-shake 0.5s ease-in-out',
        'orbit-1':     'orbit-1 var(--orbit-d, 6s) linear infinite',
        'orbit-2':     'orbit-2 var(--orbit-d, 8s) linear infinite',
        'orbit-3':     'orbit-3 var(--orbit-d, 10s) linear infinite',
        'spark-fly':   'spark-fly var(--spark-d, 1.6s) ease-out infinite',
        'crash-flash': 'crash-flash 2.4s ease-out infinite',
        'pulse-glow':  'pulse-glow 3s ease-in-out infinite',
        breath:        'breath 2.8s ease-in-out infinite',
        'streak-fast': 'streak-fast 0.8s linear infinite',
        'streak-reverse': 'streak-reverse 1.1s linear infinite',
        shockwave:     'shockwave 2.2s ease-out infinite',
        'glitch-x':    'glitch-x 4s steps(1, end) infinite'
      }
    }
  },
  plugins: []
}
