/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.html',
    './src/**/*.jsx',
    './src/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'main': 'var(--main-color)',
        'sec': 'var(--secondary-color)',
        'ter': 'var(--tertiary-color)',
        'dark': 'var(--main-background-color)'
      }
    },
  },
  plugins: [],
}
