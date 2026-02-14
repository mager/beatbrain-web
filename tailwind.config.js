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
        // Rich dark foundation — not a dungeon, more like a midnight lounge
        'terminal': {
          bg: '#0c0c14',
          surface: '#13131f',
          border: '#1f1f35',
          'border-bright': '#2d2d4a',
        },
        // Text palette — brighter, more readable
        'phosphor': '#d4d4e8',
        'phosphor-dim': '#6b6b8a',
        // Vibrant accent palette
        'accent': '#e8a948',           // golden amber — warm & inviting
        'warm': '#f06449',             // punchy coral-red
        'cool': '#7c8fff',             // electric periwinkle
        'mint': '#5ce0b8',             // fresh mint
        'violet': '#b07cff',           // playful violet
        'rose': '#ff6b9d',             // hot pink
        // Legacy aliases
        'ink': '#0c0c14',
        'vinyl': '#13131f',
        'groove': '#1f1f35',
        'sleeve': '#d4d4e8',
      },
      fontFamily: {
        sans: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-body)', 'monospace'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'massive': ['clamp(2.25rem, 8vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'hero': ['clamp(1.25rem, 4vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 30s) linear infinite',
        'fadeUp': 'fadeUp 0.5s ease-out forwards',
        'fadeIn': 'fadeIn 0.3s ease-out forwards',
        'blink': 'blink 1.1s step-end infinite',
        'pulse': 'pulse 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(232, 169, 72, 0.2), 0 0 60px rgba(232, 169, 72, 0.06)',
        'glow-warm': '0 0 20px rgba(240, 100, 73, 0.2), 0 0 60px rgba(240, 100, 73, 0.06)',
        'glow-cool': '0 0 20px rgba(124, 143, 255, 0.2), 0 0 60px rgba(124, 143, 255, 0.06)',
        'glow-mint': '0 0 20px rgba(92, 224, 184, 0.2), 0 0 60px rgba(92, 224, 184, 0.06)',
        'glow-violet': '0 0 20px rgba(176, 124, 255, 0.2), 0 0 60px rgba(176, 124, 255, 0.06)',
        'terminal': 'inset 0 0 80px rgba(124, 143, 255, 0.02)',
      },
    },
  },
  plugins: [],
}
