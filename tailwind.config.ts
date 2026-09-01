import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
        },
        sidebar: {
          DEFAULT: "#101827",
          light: "#182338",
        },
        bg: "#f4f7fb",
        card: "#ffffff",
        muted: "#6b7280",
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626",
        border: "#e5e7eb",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 12px 35px rgba(15,23,42,.08)",
        soft: "0 4px 14px rgba(15,23,42,.03)",
      },
    },
  },
  plugins: [],
};

export default config;
