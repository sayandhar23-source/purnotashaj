/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f0',
          100: '#fbe6db',
          200: '#f5c7ad',
          300: '#eea77e',
          400: '#e3773a',
          500: '#c85a28', // primary
          600: '#a5451e',
          700: '#82361a',
          800: '#5f2814',
          900: '#3d1a0d',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
        serif: ['Playfair Display', 'ui-serif', 'Georgia'],
      },
    },
  },
  plugins: [],
};
