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
          // Accent (cyan)
          blue: '#6AE4FF',
          'blue-dark': '#3ECBEB',
          'blue-light': '#9AEEFF',
          // Backgrounds
          navy: '#0B1020',
          'navy-light': '#111A33',
          slate: '#1E2A4A',
          muted: '#9AA6C2',
          // Status
          success: '#3DFFB5',
          error: '#FF5C7A',
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
