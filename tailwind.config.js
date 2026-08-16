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
          DEFAULT: '#0a0a0a', // Latar belakang utama paling gelap
          panel: '#161618',   // Latar belakang panel (sedikit lebih terang)
          light: '#1a1a1a'    // Latar belakang area aktif/hover
        },
        accent: {
          DEFAULT: '#f59e0b', // Oranye untuk elemen aktif (slider, dll)
          hover: '#d97706'
        }
      }
    },
  },
  plugins: [],
}