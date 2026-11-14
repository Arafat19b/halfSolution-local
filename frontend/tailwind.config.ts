import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F5F3ED",
        charcoal: "#1E1F1D",
        olive: { DEFAULT: "#5C7C47", dark: "#4A6738" },
        sage: "#EBF1E6",
        lemon: "#D6E85A",
        paper: "#FFFEFA",
        muted: "#85877F",
        line: "#E3E1D9",
        danger: "#9A3B2E",
      },
      fontFamily: {
        sans: ['"Inter Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Fraunces Variable"', "ui-serif", "Georgia", "serif"],
      },
      boxShadow: { soft: "0 1px 2px rgba(30,31,29,0.04)" },
      borderRadius: { xl: "0.875rem" },
    },
  },
  plugins: [],
};
export default config;
