/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0D',
        cream: '#F5EFE6',
        wolf: '#B38B4C',
      },
    },
  },
  plugins: [],
};
