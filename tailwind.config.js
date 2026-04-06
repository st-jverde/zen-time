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
        main: 'var(--main-color)',
        sec: 'var(--secondary-color)',
        ter: 'var(--tertiary-color)',
        dark: 'var(--main-background-color)',
        surface: 'var(--surface-color)',
        'surface-elevated': 'var(--surface-elevated-color)',
        border: 'var(--border-color)',
        muted: 'var(--text-muted-color)',
        'on-accent': 'var(--on-accent-color)',
      },
    },
  },
  plugins: [],
}
