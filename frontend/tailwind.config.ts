import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#191F28',
        canvas: '#F7F8FA',
        surface: '#FFFFFF',
        muted: '#6B7684',
        magenta: '#E93CAC',
        purple: '#7C3AED',
      },
    },
  },
  plugins: [],
};

export default config;
