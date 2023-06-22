/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backdropBlur: {
        'none': '0',
        'blur': 'blur(20px)',
      },
      backdropOpacity: {
        '0': '0',
        '25': '0.25',
        '50': '0.5',
        '75': '0.75',
        '100': '1',
      },
      keyframes: {
        blink: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
          }
      },
      animation: {
        blink: 'blink 1s infinite',
       },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
 
    },
  },
   variants: {
    extend: {
      backdropFilter: ['responsive'], // this line is optional
    }
  },
 plugins: [],
}