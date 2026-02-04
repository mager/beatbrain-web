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
        // Developer + Music palette
        'terminal': {
          bg: '#0d0d12',
          surface: '#15151c',
          border: '#23233a',
          'border-bright': '#2e2e44',
        },
        'phosphor': '#bfc0cb',
        'phosphor-dim': '#52526e',
        'accent': '#c9a461',        // warm amber — primary
        'warm': '#c75d4d',           // coral — hot/trending
        'cool': '#7b8ec8',           // muted blue — secondary
        // Legacy aliases
        'ink': '#0d0d12',
        'vinyl': '#15151c',
        'groove': '#23233a',
        'sleeve': '#bfc0cb',
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        mono: ['var(--font-body)'],
        display: ['var(--font-display)'],
      },
      fontSize: {
        'massive': ['clamp(3rem, 12vw, 8rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'hero': ['clamp(1.5rem, 5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
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
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 30s) linear infinite',
        'fadeUp': 'fadeUp 0.5s ease-out forwards',
        'fadeIn': 'fadeIn 0.3s ease-out forwards',
        'blink': 'blink 1.1s step-end infinite',
        'pulse': 'pulse 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(201, 164, 97, 0.15), 0 0 60px rgba(201, 164, 97, 0.05)',
        'glow-warm': '0 0 20px rgba(199, 93, 77, 0.15), 0 0 60px rgba(199, 93, 77, 0.05)',
        'glow-cool': '0 0 20px rgba(123, 142, 200, 0.15), 0 0 60px rgba(123, 142, 200, 0.05)',
        'terminal': 'inset 0 0 80px rgba(201, 164, 97, 0.02)',
      },
    },
  },
  plugins: [],
}
