
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        primary: "#0A84FF",
        secondary: "#00C2A8",
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#0A84FF',
          600: '#0070E0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(10, 132, 255, 0.15)',
      }
    },
  },
  plugins: [],
}
