/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effcf5",
          100: "#d9f7e7",
          200: "#b3efcf",
          300: "#83e4b2",
          400: "#4ad58f",
          500: "#22c870",
          600: "#16a65b",
          700: "#11864b",
          800: "#0f6a3e",
          900: "#0c5734"
        }
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(34, 200, 112, 0.5)' },
          '70%': { boxShadow: '0 0 0 10px rgba(34, 200, 112, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(34, 200, 112, 0)' }
        },
        dotty: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
          '100%': { transform: 'translateY(0)' }
        }
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        pulseGlow: 'pulseGlow 2s ease-out infinite',
        dot1: 'dotty 1s ease-in-out infinite',
        dot2: 'dotty 1s ease-in-out .15s infinite',
        dot3: 'dotty 1s ease-in-out .3s infinite'
      },
      backgroundImage: {
        'mesh': 'radial-gradient(circle at 20% 20%, rgba(34,200,112,.10), transparent 20%), radial-gradient(circle at 80% 0%, rgba(16,185,129,.10), transparent 25%), radial-gradient(circle at 0% 80%, rgba(5,150,105,.10), transparent 25%)'
      }
    },
  },
  plugins: [],
}
