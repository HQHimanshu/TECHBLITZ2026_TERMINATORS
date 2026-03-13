/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 10px 30px rgba(2, 6, 23, 0.10)',
      },
    },
  },
  plugins: [],
};

