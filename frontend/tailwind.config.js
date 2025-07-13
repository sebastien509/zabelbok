// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'], // adjust to your paths
  theme: {
    extend: {
      keyframes: {
        scrollY: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(-50%)' },
        },
      },
      animation: {
        scrollY: 'scrollY 30s linear infinite',
      },
    },
  },
  plugins: [],
};
