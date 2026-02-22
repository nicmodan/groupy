/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      colors: {
        ink: '#0a0a14',
        paper: '#f5f3ee',
        cream: '#ede9e0',
        accent: '#e85d26',
        accent2: '#2563eb',
        gold: '#c9a84c',
        muted: '#7a7870',
        border: '#d4cfc5',
      },
      animation: {
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'shuffle-in': 'shuffleIn 0.4s ease-out both',
      },
      keyframes: {
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
        fadeIn: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
        shuffleIn: { from: { opacity: 0, transform: 'translateY(20px) rotate(-2deg)' }, to: { opacity: 1, transform: 'none' } },
      },
    },
  },
  plugins: [],
}
