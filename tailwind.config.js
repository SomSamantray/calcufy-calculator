/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./widgets/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        'chatgpt': {
          'bg': '#f7f7f8',
          'text': '#0d0d0d',
          'border': '#e5e5e5',
          'accent': '#10a37f'
        }
      }
    },
  },
  plugins: [],
}
