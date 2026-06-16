/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          light: '#2D5F9E',
          dark: '#142845',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
        },
        surface: '#F8FAFC',
        card: '#FFFFFF',
        muted: '#64748B',
        border: '#E2E8F0',
        error: '#EF4444',
        success: '#10B981',
      },
    },
  },
  plugins: [],
};
