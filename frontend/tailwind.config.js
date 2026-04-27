/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // 掃描 src 底下所有 React 檔案
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
