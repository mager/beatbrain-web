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
        // Bright editorial foundation
        'terminal': {
          bg: '#faf9f7',
          surface: '#ffffff',
          border: '#e8e6e1',
          'border-bright': '#d4d0c8',
        },
        // Text palette — rich dark for readability
        'phosphor': '#1a1a1a',
        'phosphor-dim': '#888580',
        // Vivid accent palette — bubblegum meets fashion
        'accent': '#ff3366',           // hot pink — the hero color
        'warm': '#ff6b35',             // electric orange
        'cool': '#6c63ff',             // deep violet
        'mint': '#00c9a7',             // fresh teal-mint
        'violet': '#9d4edd',           // purple fashion
        'rose': '#ff3366',             // alias for accent
        // Legacy aliases
        'ink': '#faf9f7',
        'vinyl': '#ffffff',
        'groove': '#e8e6e1',
        'sleeve': '#1a1a1a',
      },
      fontFamily: {
        sans: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-body)', 'monospace'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'massive': ['clamp(2.5rem, 9vw, 7rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
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
        'glow-accent': '0 4px 24px rgba(255, 51, 102, 0.15)',
        'glow-warm': '0 4px 24px rgba(255, 107, 53, 0.15)',
        'glow-cool': '0 4px 24px rgba(108, 99, 255, 0.15)',
        'glow-mint': '0 4px 24px rgba(0, 201, 167, 0.15)',
        'glow-violet': '0 4px 24px rgba(157, 78, 221, 0.15)',
        'editorial': '0 2px 20px rgba(0, 0, 0, 0.06)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
