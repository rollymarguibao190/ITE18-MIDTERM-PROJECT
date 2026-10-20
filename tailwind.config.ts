import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2586A6',
          50: '#EAF4F8',
          100: '#D2E8F0',
          200: '#A6D0E0',
          300: '#79B9D1',
          400: '#4D9FB9',
          500: '#2586A6',
          600: '#1E6E8A',
          700: '#17566E',
          800: '#103E52',
          900: '#0A2B36',
        },
        teal: {
          DEFAULT: '#0F5D6B',
          deep: '#0A4550',
          light: '#178396',
        },
        sky: {
          DEFAULT: '#63C7E8',
          light: '#A5DDF1',
          dark: '#3FB0D6',
        },
        sand: {
          DEFAULT: '#F1D6A8',
          light: '#F8E8CE',
          dark: '#E0BD7E',
        },
        coral: {
          DEFAULT: '#FF765E',
          light: '#FFA48F',
          dark: '#E85F48',
        },
        page: '#F7F9FA',
        ink: '#25343B',
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(16, 62, 82, 0.08), 0 1px 2px rgba(16, 62, 82, 0.04)',
        panel: '0 10px 30px rgba(16, 62, 82, 0.15), 0 2px 8px rgba(16, 62, 82, 0.08)',
        lift: '0 12px 32px rgba(16, 62, 82, 0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      maxWidth: {
        container: '1200px',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
