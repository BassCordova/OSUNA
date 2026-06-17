import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f1fe",
          100: "#e9e3fd",
          200: "#d3c7fb",
          300: "#b29ff6",
          400: "#8b6cef",
          500: "#6b46e5",
          600: "#5a32d1",
          700: "#4c27ad",
          800: "#40228d",
          900: "#371f73",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
