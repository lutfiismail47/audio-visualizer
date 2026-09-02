/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0a0a0a',
          panel: '#161618',
          light: '#1a1a1a'
        },
        accent: {
          DEFAULT: '#f59e0b',
          hover: '#d97706'
        }
      }
    },
  },
  plugins: [],
}