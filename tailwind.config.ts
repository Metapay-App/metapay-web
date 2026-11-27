import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/client/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        harbor: {
          black: "#000000",
          surface: "#444448",
          "brand-blue": "#3469B7",
          blue: "#0067FF",
          glow: "#4D91FF",
          muted: "#787878",
          caption: "#808183",
          secondary: "#A4A4A4",
          highlight: "#DBDBDB",
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      borderRadius: {
        chip: "6.88542px",
        control: "10px",
        badge: "17px",
        card: "22.0333px",
        modal: "24.7875px",
      },
      boxShadow: {
        "harbor-inset": "inset 0px 0px 30px 2px rgba(77, 145, 255, 0.5)",
        "harbor-glow": "0px 0px 32px rgba(0, 103, 255, 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
