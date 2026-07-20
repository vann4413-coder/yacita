import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#1B4332',
        turquoise: '#79C8C5',
        cta:       '#F47E36',
        flash:     '#FFD166',
        ytext:     '#1B4332',
        bgsoft:    '#F7F7F7',
        bgdark:    '#1B4332',
      },
      fontFamily: {
        heading: ['var(--font-jakarta)', 'sans-serif'],
        body:    ['var(--font-inter)',   'sans-serif'],
      },
      borderRadius: {
        card:  '16px',
        pill:  '8px',
        modal: '20px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.06)',
        card: '0 4px 16px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
