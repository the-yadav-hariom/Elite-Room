/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        azure: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          500: '#1B64DA',
          800: '#0F2C59',
          900: '#091A36'
        },
        terracotta: {
          400: '#E76F51',
          500: '#C84B31',
          600: '#AF3A23',
          700: '#8A2613'
        },
        champagne: {
          100: '#F9F6F0',
          200: '#EFE9DE',
          400: '#D4AF37'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif']
      },
      boxShadow: {
        'bell-ambient': '0 20px 40px -10px rgba(184, 60, 31, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.15) inset',
        'bell-active': '0 12px 25px -8px rgba(184, 60, 31, 0.6), 0 0 0 6px rgba(200, 75, 49, 0.25)'
      }
    },
  },
  plugins: [],
}
