/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#080B0F',
        surface: '#0D1117',
        surface2: '#111827',
        border: '#1C2333',
        green: '#00FF88',
        amber: '#F59E0B',
        red: '#FF3B5C',
        text: '#E8EDF5',
        muted: '#6B7688',
        dim: '#2A3347',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Syne', 'sans-serif'],
      },
      keyframes: {
        sonar: {
          '0%': { boxShadow: '0 0 0 0 rgba(0,255,136,0.7), 0 0 6px #00FF88' },
          '70%': { boxShadow: '0 0 0 12px rgba(0,255,136,0), 0 0 6px #00FF88' },
          '100%': { boxShadow: '0 0 0 0 rgba(0,255,136,0), 0 0 6px #00FF88' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scanline-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'execute-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,255,136,0.5), 0 0 15px rgba(0,255,136,0.2)' },
          '50%': { boxShadow: '0 0 0 6px rgba(0,255,136,0), 0 0 25px rgba(0,255,136,0.4)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        sonar: 'sonar 2s ease-out infinite',
        ticker: 'ticker 30s linear infinite',
        'scanline-in': 'scanline-in 0.4s ease both',
        'execute-pulse': 'execute-pulse 1.5s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease both',
      },
    },
  },
  plugins: [],
}
