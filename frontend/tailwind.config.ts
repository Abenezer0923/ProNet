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
          50: '#fffbf7',
          100: '#fdf3e6',
          200: '#f9e1c5',
          300: '#f4ca99',
          400: '#eda862',
          500: '#e68a35', // Brighter, more golden brown base
          600: '#ca6e24',
          700: '#a8531d',
          800: '#89421c',
          900: '#6f3719',
          950: '#3e1c0b',
        },
        accent: {
          orange: '#f59e0b', // Brighter amber
          green: '#10b981', // Emerald green
          red: '#ef4444',   // Brighter red
        },
      },
      keyframes: {
        progress: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(156, 122, 60, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(156, 122, 60, 0.6)' },
        },
        'logo-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
      },
      animation: {
        progress: 'progress 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'logo-pulse': 'logo-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
