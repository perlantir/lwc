import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/blocks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#061B3A',
        'deep-navy': '#03142B',
        royal: '#003A78',
        cyan: {
          DEFAULT: '#12AEEA',
          dark: '#079DDB',
        },
        'off-white': '#F8FBFF',
        'text-navy': '#071C3D',
        muted: '#6E7C8E',
        border: '#E3EAF3',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 45px rgba(0, 31, 68, .16)',
        soft: '0 10px 30px rgba(0, 31, 68, .12)',
        glow: '0 6px 18px rgba(18,174,234,.4)',
      },
      borderRadius: {
        pill: '24px',
      },
      maxWidth: {
        page: '941px',
      },
    },
  },
  plugins: [],
};

export default config;
