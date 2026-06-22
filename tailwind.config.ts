import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: { 50: "#f6f7f4", 100: "#e9ede4", 400: "#9caf88", 500: "#7d9171", 600: "#5b6b52", 700: "#46533f" },
        cream: { 50: "#fdfcfa", 100: "#faf7f2", 200: "#f3ede2" },
        gold: { 400: "#d4af7a", 500: "#c19a5b" },
      },
      fontFamily: { serif: ["Cormorant Garamond", "serif"], sans: ["Inter", "sans-serif"] },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { "fade-up": "fade-up 0.6s ease-out" },
    },
  },
  plugins: [],
} satisfies Config;