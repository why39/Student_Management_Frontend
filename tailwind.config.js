/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss'),  // Add this line for Tailwind CSS
    require('autoprefixer'),  // Optional: Add Autoprefixer if needed
  ],
}