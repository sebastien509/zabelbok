// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'], // adjust to your paths
  theme: {
    extend: {
      colors: {
        absoluteBlack: '#000000',
        appleGreen: '#8DB600',
        heritageRed: '#C1272D',
        warmRootBrown: '#5D3721',
        burntOrange: '#EE964B',
        ivoryNeutral: '#FAF9F6',
        blackOlive: '#3B3C36',
      },
      backgroundColor: {
        'brand-40': 'rgba(var(--brand-rgb), 0.4)',
        'brand-60': 'rgba(var(--brand-rgb), 0.6)',
        'brand-80': 'rgba(var(--brand-rgb), 0.8)',
      },
      textColor: {
        'brand-60': 'rgba(var(--brand-rgb), 0.6)',
        'brand-80': 'rgba(var(--brand-rgb), 0.8)',
      },
      borderColor: {
        'brand-40': 'rgba(var(--brand-rgb), 0.4)',
        'brand-60': 'rgba(var(--brand-rgb), 0.6)',
        'brand-80': 'rgba(var(--brand-rgb), 0.8)',
      },
    
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
