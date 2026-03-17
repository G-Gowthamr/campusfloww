/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#6467f2",
        "background-light": "#f6f6f8",
        "background-dark": "#101122",
      },
      fontFamily: {
        "display": ["Inter"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem", 
        "lg": "1rem", 
        "xl": "1.5rem", 
        "2xl": "2rem", 
        "full": "9999px"
      },
      animation: {
        'bounce-short': 'bounce-short 3s ease-in-out infinite'
      },
      keyframes: {
        'bounce-short': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }
    },
  },
  plugins: [],
}
