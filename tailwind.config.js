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
        'main-1': 'var(--main-color)',
        'secondary-1': 'var(--secondary-color)',
        'tertiary': 'var(--tertiary-color)',
      },
      backgroundColor: {
        'main-2': 'var(--main-color)',
        'secondary-2': 'var(--secondary-color)',
        'nav': 'var(--tertiary-color)',
        'dark': 'var(--main-background-color)'
      }
    },
  },
  plugins: [],
}

