/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'electric-violet': {
          50: '#f9f5ff',
          100: '#f3ebff',
          200: '#e4ccff',
          300: '#d09eff',
          400: '#b861ff',
          500: '#9d24ff',
          600: '#8900ff',
          700: '#7300d6',
          800: '#5e00a8',
          900: '#4a0080',
          950: '#2b0054',
        }
      },
      fontFamily: {
        sans: ['"Aptos Display"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
