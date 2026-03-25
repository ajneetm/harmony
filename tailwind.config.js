module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        red: {
          600: '#ae1f23',
        },
      },
      height: {
        '100dvh': '100dvh',
        '100lvh': '100lvh', // Large viewport height
        '100svh': '100svh', // Small viewport height
      },
      maxHeight: {
        '100dvh': '100dvh',
        '100lvh': '100lvh',
        '100svh': '100svh',
      },
      minHeight: {
        '100dvh': '100dvh',
        '100lvh': '100lvh',
        '100svh': '100svh',
      },
      fontFamily: {
        'tajawal': ['Tajawal', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
