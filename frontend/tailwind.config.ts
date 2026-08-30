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
        background: "#070A0F",
        surface: "#0B0F19",
        "surface-card": "rgba(15, 23, 42, 0.75)",
        "surface-border": "rgba(255, 255, 255, 0.08)",
        brand: {
          50: "#EEF2FF",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
        },
        cyber: {
          cyan: "#06B6D4",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
          violet: "#8B5CF6",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-line": "glowLine 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glowLine: {
          "0%": { opacity: "0.4", filter: "drop-shadow(0 0 2px #6366F1)" },
          "100%": { opacity: "1", filter: "drop-shadow(0 0 8px #06B6D4)" },
        }
      }
    },
  },
  plugins: [],
};

export default config;
