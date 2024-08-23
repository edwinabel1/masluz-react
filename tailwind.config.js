module.exports = {
  darkMode: 'class', // 启用通过类名控制的暗色模式
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 添加更多自定义颜色
        darkBackground: '#1a1a2e',
        darkCard: '#16213e',
        darkText: '#e0e0e0',
      },
    },
  },
  plugins: [],
};
