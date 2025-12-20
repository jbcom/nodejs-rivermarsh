/* eslint-disable no-undef */
// @ts-check
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // Otter blue
        secondary: '#10b981', // River green
        accent: '#fbbf24', // Coin gold
        danger: '#ef4444', // Alert red
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        otter: {
          primary: '#3b82f6',
          secondary: '#10b981',
          accent: '#fbbf24',
          neutral: '#1e293b',
          'base-100': '#ffffff',
          info: '#0ea5e9',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      'dark',
      'cupcake',
    ],
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
  },
};
