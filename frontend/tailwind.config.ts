import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17131D',
        paper: '#F7F5FA',
        signal: '#D81B72',
        jeju: '#6D3CE7',
        mist: '#DDEEEB',
      },
    },
  },
  plugins: [],
};

export default config;
