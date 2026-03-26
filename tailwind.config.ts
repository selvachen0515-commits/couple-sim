import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto-sans-sc)', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        warm: {
          50: '#fdf8f6',
          100: '#fce7e7',
          200: '#f9d0d0',
          300: '#f5a8a8',
          400: '#f07070',
          500: '#e84e4e',
        },
        rose: {
          25: '#fff5f5',
        },
      },
      animation: {
        'float-up': 'float-up 0.3s ease-out',
        'pulse-soft': 'pulse-soft 1.5s ease-in-out infinite',
        'bounce-gentle': 'bounce 2s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config
