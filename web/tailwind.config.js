/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/components/abaya-designer/**/*.{tsx,ts}', './src/pages/AbayaDesignerPage.jsx'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        ad: {
          ink: '#1a1a1e',
          muted: '#6b6b76',
          sand: '#f7f4ef',
          gold: '#b8956a',
          line: '#e8e4dc',
        },
      },
      fontFamily: {
        ad: ['Outfit', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ad: '0 12px 40px rgba(26, 26, 30, 0.08)',
      },
    },
  },
  plugins: [],
};
