/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Paleta tintada al hue 25 (pole-red) — valores hex derivados de OKLCH.
      // OKLCH semántica en comentarios para referencia; RN consume hex.
      colors: {
        bg: '#0B0A0A',          // oklch(0.15 0.006 25)
        'surface-1': '#171514', // oklch(0.22 0.008 25)
        'surface-2': '#221E1D', // oklch(0.27 0.010 25)
        border: '#2D2826',      // oklch(0.34 0.012 25)
        ink: '#F4F2F0',         // oklch(0.96 0.004 25)
        'ink-muted': '#AAA6A2', // oklch(0.70 0.004 25)
        'ink-subtle': '#6E6A66',// oklch(0.48 0.004 25)
        'pole-red': '#C0342B',  // oklch(0.55 0.180 25)
        'pole-red-deep': '#8C2620',
        'pole-blue': '#1F3A8A',
        'pole-white': '#FFFFFF',
        success: '#3DA55C',
        warning: '#D98A2B',
        destructive: '#C0342B',
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        md: '4px',
        lg: '8px',
        xl: '12px',
      },
      fontFamily: {
        display: ['BigShoulders-Bold'],
        'display-black': ['BigShoulders-Black'],
        sans: ['Archivo'],
        medium: ['Archivo-Medium'],
        semibold: ['Archivo-SemiBold'],
        bold: ['Archivo-Bold'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        md: ['1.125rem', { lineHeight: '1.6rem' }],
        lg: ['1.5rem', { lineHeight: '1.8rem' }],
        xl: ['2rem', { lineHeight: '2.2rem' }],
        '2xl': ['2.625rem', { lineHeight: '2.75rem' }],
        '3xl': ['3.5rem', { lineHeight: '3.6rem' }],
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.03em',
        wider: '0.08em',
        widest: '0.2em',
      },
    },
  },
  plugins: [],
};
