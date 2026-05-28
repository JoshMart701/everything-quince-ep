import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: "#C4547A",
          50: "#fdf2f6",
          100: "#fce7ef",
          200: "#fad0e0",
          300: "#f6a9c5",
          400: "#ef75a0",
          500: "#C4547A",
          600: "#b03a63",
          700: "#932d51",
          800: "#7b2846",
          900: "#69253d",
        },
        gold: {
          DEFAULT: "#C9A84C",
          50: "#fdf9ed",
          100: "#faf0d0",
          200: "#f4dea0",
          300: "#ecc66b",
          400: "#e5ad3e",
          500: "#C9A84C",
          600: "#b3862a",
          700: "#906523",
          800: "#774f22",
          900: "#654220",
        },
        plum: {
          DEFAULT: "#3D1A2E",
          50: "#f9f0f5",
          100: "#f4e0ec",
          200: "#eac2d9",
          300: "#d993ba",
          400: "#c0619a",
          500: "#a03e7a",
          600: "#7d2c5e",
          700: "#612349",
          800: "#4d1d3b",
          900: "#3D1A2E",
        },
        cream: {
          DEFAULT: "#FDF7F0",
          50: "#FFFDF9",
          100: "#FDF7F0",
          200: "#f9edd9",
          300: "#f3ddb9",
          400: "#e9c68e",
          500: "#ddab62",
        },
        brand: {
          rose: "#C4547A",
          gold: "#C9A84C",
          plum: "#3D1A2E",
          cream: "#FDF7F0",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        heading: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-quince": "linear-gradient(135deg, #3D1A2E 0%, #6b2d4f 50%, #C4547A 100%)",
        "gradient-gold": "linear-gradient(135deg, #C9A84C 0%, #e5c97a 100%)",
        "gradient-hero": "linear-gradient(160deg, #3D1A2E 0%, #5c2044 40%, #C4547A 100%)",
      },
      boxShadow: {
        quince: "0 4px 24px rgba(196, 84, 122, 0.15)",
        gold: "0 4px 24px rgba(201, 168, 76, 0.2)",
        card: "0 2px 16px rgba(61, 26, 46, 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};

export default config;
