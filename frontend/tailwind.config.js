/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sentinel: {
          bg: "#05070d",
          panel: "#0b0f1a",
          border: "#1b2333",
          cyan: "#22d3ee",
          blue: "#3b82f6",
          safe: "#22c55e",
          caution: "#f59e0b",
          danger: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px -4px rgba(34, 211, 238, 0.35)",
      },
      keyframes: {
        "slide-in": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.35s ease-out",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
