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
      // backgroundImage: {
      //   'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      //   'gradient-conic':
      //     'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      // },
      // colors: {
      //   'gpt-gray': '#343541',
      //   'gpt-lightgray': '#40414F',
      // },
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
 plugins: [],
}