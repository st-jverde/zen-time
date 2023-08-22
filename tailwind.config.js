/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.html', 
    './src/**/*.jsx', 
    './src/**/*.js',
  ],
  theme: {
    extend: {
      textColor: {
        'main': 'var(--main-color)',
        'secondary': 'var(--secondary-color)',
        'tertiary': 'var(--tertiary-color)',
      },
      backgroundColor: {
        'nav': 'var(--tertiary-color)',
        'dark': 'var(--main-background-color)'
      }
    },
  },
  plugins: [],
}

