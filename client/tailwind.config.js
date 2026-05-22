/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0C9A56',   // QuickKart green (Blinkit-inspired)
        secondary: '#FFC220', // accent yellow
      },
    },
  },
  plugins: [],
};