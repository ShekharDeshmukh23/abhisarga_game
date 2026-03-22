/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0b0f',
        neonRed: '#ff003c',
        neonBlue: '#00f3ff',
        neonPurple: '#b800ff',
        neonGreen: '#00ff66',
        neonOrange: '#ff6600',
        neonYellow: '#ffee00',
        glassDark: 'rgba(20, 20, 30, 0.75)',
      },
      fontFamily: {
        cinematic: ['"Bebas Neue"', 'sans-serif'],
        digital: ['"VT323"', 'monospace'],
        body: ['"Inter"', 'sans-serif']
      },
      boxShadow: {
        'glow-red': '0 0 10px #ff003c, 0 0 20px #ff003c',
        'glow-blue': '0 0 10px #00f3ff, 0 0 20px #00f3ff',
        'glow-purple': '0 0 10px #b800ff, 0 0 20px #b800ff',
      },
      animation: {
        'flicker': 'flicker 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': {
            opacity: 1,
            filter: 'drop-shadow(0 0 10px rgba(255,0,60,0.8))'
          },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': {
            opacity: 0.4,
            filter: 'none'
          }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .7 }
        }
      }
    },
  },
  plugins: [],
}
