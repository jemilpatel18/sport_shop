import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          lime: "#C6F500",
          "lime-hover": "#B3DD00",
          "lime-light": "#E9FF80",
          charcoal: "#111318",
          dark: "#0B0D11",
          card: "#181B22",
          surface: "#1F232C",
          border: "#2A2F3D",
          muted: "#8A92A6",
          gray: "#F4F5F7",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Oswald",
          "Inter",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        "lime-glow": "0 0 25px -5px rgba(198, 245, 0, 0.4)",
        "lime-glow-lg": "0 0 35px -5px rgba(198, 245, 0, 0.6)",
        "card-hover": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

