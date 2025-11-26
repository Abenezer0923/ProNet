import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fbf7f4',
          100: '#f5ebe6',
          200: '#ebd5c8',
          300: '#dfbda8',
          400: '#d0a083',
          500: '#c0805d',
          600: '#a66546',
          700: '#8a5038',
          800: '#724231',
          900: '#5e372b',
        },
      },
      keyframes: {
        progress: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        }
      },
      animation: {
        progress: 'progress 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
