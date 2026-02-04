/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Terminal / Hacker palette
        'terminal': {
          bg: '#0a0a0a',
          surface: '#111111',
          border: '#1a1a1a',
          'border-bright': '#222222',
        },
        'phosphor': '#c8c8c8',
        'phosphor-dim': '#4a4a4a',
        'matrix': '#00ff41',
        'hotpink': '#ff3366',
        'cyber': '#00d4ff',
        // Legacy aliases for easy migration
        'ink': '#0a0a0a',
        'vinyl': '#111111',
        'groove': '#1a1a1a',
        'sleeve': '#c8c8c8',
        'amber': {
          glow: '#00ff41',
          bright: '#00ff41',
          dim: '#00cc33',
        },
        'neon': {
          pink: '#ff3366',
          cyan: '#00d4ff',
          violet: '#00ff41',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        mono: ['var(--font-body)'],
        display: ['var(--font-display)'],
      },
      fontSize: {
        'massive': ['clamp(3rem, 12vw, 8rem)', { lineHeight: '1', letterSpacing: '0.02em' }],
        'hero': ['clamp(1.5rem, 5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '0.02em' }],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)', textShadow: '2px 0 #ff3366, -2px 0 #00d4ff' },
          '20%': { transform: 'translate(-2px, 2px)', textShadow: '2px 0 #00ff41, -2px 0 #ff3366' },
          '40%': { transform: 'translate(-2px, -2px)', textShadow: '-2px 0 #00d4ff, 2px 0 #00ff41' },
          '60%': { transform: 'translate(2px, 2px)', textShadow: '2px 0 #ff3366, -2px 0 #00ff41' },
          '80%': { transform: 'translate(2px, -2px)', textShadow: '-2px 0 #00ff41, 2px 0 #00d4ff' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.8' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.9' },
          '97%': { opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        datastream: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 30s) linear infinite',
        'fadeUp': 'fadeUp 0.6s ease-out forwards',
        'fadeIn': 'fadeIn 0.4s ease-out forwards',
        'blink': 'blink 1s step-end infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'flicker': 'flicker 4s infinite',
        'pulse': 'pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'datastream': 'datastream 1s ease-out infinite',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 65, 0.3), 0 0 60px rgba(0, 255, 65, 0.1)',
        'glow-pink': '0 0 20px rgba(255, 51, 102, 0.3), 0 0 60px rgba(255, 51, 102, 0.1)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3), 0 0 60px rgba(0, 212, 255, 0.1)',
        'terminal': 'inset 0 0 60px rgba(0, 255, 65, 0.03)',
      },
    },
  },
  plugins: [],
}
