/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Semantic theme tokens backed by CSS variables
        base:    'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated:'var(--bg-elevated)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
