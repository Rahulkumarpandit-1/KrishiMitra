/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        earth: {
          50: '#fdf8f0',
          100: '#f5e6d3',
          200: '#e8d0b3',
          300: '#d4a574',
          400: '#c08840',
          500: '#a67332',
          600: '#8b5e28',
          700: '#6d4a20',
          800: '#503718',
          900: '#362510',
        },
      },
    },
  },
  plugins: [],
};
