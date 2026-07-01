/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/features/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // 定義一個主色調 (藍色)
      },
    },
  },
  plugins: [],
};
