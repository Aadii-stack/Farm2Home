/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#F4F8F4',
          100: '#E6EFE6',
          200: '#C7DEC8',
          300: '#9BC39D',
          400: '#6BA46F',
          500: '#48854D',
          600: '#346B39',
          700: '#2A552E',
          800: '#214325',
          900: '#1A351D',
          950: '#0E1F11',
        },
        earth: {
          50: '#FDF8F3',
          100: '#F9EEE2',
          200: '#F2DBC3',
          300: '#E7BE9B',
          400: '#DA9C72',
          500: '#CF7D50',
          600: '#B8613A',
          700: '#954B2E',
          800: '#783E2A',
          900: '#633526',
        },
        cream: '#FAF8F5',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
