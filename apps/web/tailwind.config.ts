import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:  '#1D9E75',
        cta:      '#D85A30',
        ytext:    '#064033',
        bgsoft:   '#E8F8F2',
        bgdark:   '#064033',
      },
      fontFamily: {
        heading: ['var(--font-jakarta)', 'sans-serif'],
        body:    ['var(--font-inter)',   'sans-serif'],
      },
      borderRadius: {
        card:  '12px',
        pill:  '8px',
        modal: '20px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.08)',
        card: '0 4px 16px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
