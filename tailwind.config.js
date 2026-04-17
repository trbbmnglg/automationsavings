/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Accenture Branding Guidelines July 2025 v4.
        accenture: {
          purple: {
            darkest: '#460073',
            dark:    '#7500C0',
            DEFAULT: '#A100FF',
            light:   '#C2A3FF',
            lightest:'#E6DCFF',
          },
          black:            '#000000',
          'gray-dark':      '#818180',
          'gray-light':     '#CFCFCF',
          'gray-off-white': '#F1F1EF',
          white:            '#FFFFFF',
          pink: '#FF50A0',
          blue: '#224BFF',
          aqua: '#05F2DB',
        },
        // Legacy `electric-violet-*` shades remapped to Accenture purple hexes.
        // Preserves every existing class name in the codebase while making them
        // render as brand-compliant purple.
        'electric-violet': {
          50:  '#F1F1EF', // off-white (neutral lightest)
          100: '#E6DCFF', // purple-lightest
          200: '#E6DCFF',
          300: '#C2A3FF', // purple-light
          400: '#C2A3FF',
          500: '#A100FF', // purple default
          600: '#A100FF',
          700: '#7500C0', // purple-dark
          800: '#7500C0',
          900: '#460073', // purple-darkest
          950: '#460073',
        },
      },
      fontFamily: {
        sans: ['"Graphik"', '"Graphik Web"', 'ui-sans-serif', 'system-ui',
               '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
