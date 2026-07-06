import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF9F6",
        ink: "#1C1B19",
        muted: "#8A8578",
        line: "#E7E3D9",
        accent: "#3E6259", // deep pine — the app's single accent
        accentSoft: "#DCE7E1",
        note: {
          default: "#FFFFFF",
          yellow: "#FCEFC7",
          rose: "#F6E1E1",
          sky: "#E1EAF6",
          sage: "#E3ECE1",
          lilac: "#EAE1F0",
        },
      },
      fontFamily: {
        display: ["Georgia", "ui-serif", "serif"],
        body: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,27,25,0.06), 0 1px 8px rgba(28,27,25,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
