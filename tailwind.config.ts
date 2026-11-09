
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#090B12',
        panel: '#111521',
        'panel-hover': '#171D2B',
        line: '#252D40',
        muted: '#8992A6',
        accent: '#9B87F5',
        'accent-hover': '#AD9DFF',
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#FB7185',
        info: '#60A5FA',
      },
      boxShadow: {
        glow: '0 0 36px rgba(139, 115, 255, .14)',
        'card': '0 8px 30px rgba(0, 0, 0, .18)',
        'accent-glow': '0 0 24px rgba(155, 135, 245, .20)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
      transitionDuration: {
        '250': '250ms',
      },
      animation: {
        'fade-in': 'fadeIn .35s ease-out',
        'slide-up': 'slideUp .4s ease-out',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '.65' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
