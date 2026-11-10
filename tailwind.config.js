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
          50: '#F8F5FF',
          100: '#F0EBFE',
          200: '#E1D6FD',
          300: '#C6AEF8', // Cor exata da nova logo iNails
          400: '#B28EF5',
          500: '#9B6DF1', // Tom principal para botões e contrastes com branco
          600: '#864CE9',
          700: '#7132D6',
          800: '#5C24B5',
          900: '#481E8E',
          950: '#2A0D5C',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(198, 174, 248, 0.28), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'nav': '0 -4px 20px -2px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
