import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        arc: {
          blue: '#2563EB',
          'blue-dark': '#1D4ED8',
          'blue-light': '#3B82F6',
          navy: '#0F172A',
          'navy-light': '#1E293B',
          slate: '#334155',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
export default config
