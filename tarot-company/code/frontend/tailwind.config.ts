import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['IM Fell English', 'serif'],
      },
      colors: {
        bg: '#F7F3EE',
        ink: '#1C1917',
        accent: '#9C8063',
      },
      aspectRatio: {
        tarot: '2 / 3',
      },
    },
  },
  plugins: [],
}

export default config
