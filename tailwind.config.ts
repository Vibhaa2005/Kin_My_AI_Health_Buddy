import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, calm, high-contrast palette
        sand: {
          50:  "#fdf8f0",
          100: "#faefd9",
          200: "#f3ddb0",
          300: "#e8c47c",
          400: "#dba748",
          500: "#c48c2a",
        },
        sage: {
          50:  "#f2f7f2",
          100: "#e0ede0",
          200: "#b8d4b8",
          300: "#7fb87f",
          400: "#4d9a4d",
          500: "#2e7d2e",
          600: "#1e5e1e",
        },
        rose: {
          50:  "#fff5f5",
          100: "#ffe0e0",
          200: "#ffc0c0",
          300: "#ff8080",
          400: "#f05050",
          500: "#cc2020",
        },
        amber: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fbbf24",
          400: "#f59e0b",
          500: "#d97706",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        base: ["1rem", "1.6"],
        lg:   ["1.125rem", "1.6"],
        xl:   ["1.25rem", "1.6"],
        "2xl":["1.5rem", "1.4"],
      },
    },
  },
  plugins: [],
};

export default config;
