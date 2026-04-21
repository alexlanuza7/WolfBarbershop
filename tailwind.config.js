/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0B',
        'surface-1': '#151517',
        'surface-2': '#1E1E21',
        border: '#2A2A2E',
        ink: '#F5F5F2',
        'ink-muted': '#A8A8A3',
        'ink-subtle': '#6C6C68',
        'pole-red': '#C0342B',
        'pole-blue': '#1F3A8A',
        'pole-white': '#FFFFFF',
        success: '#10B981',
        warning: '#F59E0B',
        destructive: '#DC2626',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      fontFamily: {
        display: ['Anton'],
        sans: ['Inter'],
      },
    },
  },
  plugins: [],
};
