/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF5F6',
          100: '#FFE8EB',
          200: '#FFD1D7',
          300: '#FFA5B0',
          400: '#FF94A0',
          500: '#FF8894', // cor principal mais avermelhada solicitada
          600: '#F06272',
          700: '#D64556',
          800: '#B23040',
          900: '#8B222E',
          950: '#4D0E16',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(255, 136, 148, 0.16), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'nav': '0 -4px 20px -2px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
