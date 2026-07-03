/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050505',
        haze: '#BDBDBD',
        gold: {
          DEFAULT: '#C9A24B',
          soft: '#D8BE86',
          faint: 'rgba(201,162,75,0.14)',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'Cormorant Garamond', 'cursive'],
      },
      letterSpacing: {
        widest2: '0.42em',
      },
    },
  },
  plugins: [],
}
