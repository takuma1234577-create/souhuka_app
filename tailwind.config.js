/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#f0f0f0',
        card: '#111111',
        muted: '#666666',
        border: '#222222',
        neon: '#ccff00',
        'neon-dim': '#99cc00',
        surface: '#141414',
        'surface-raised': '#1c1c1c',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
