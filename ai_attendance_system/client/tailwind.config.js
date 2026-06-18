/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebedff',
          200: '#dce0ff',
          300: '#c2c9ff',
          400: '#9fa8ff',
          500: '#757fff',
          600: '#4c52ff',
          700: '#383cff',
          800: '#2d30cc',
          900: '#2628a3',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
