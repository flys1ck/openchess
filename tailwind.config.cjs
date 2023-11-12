/* eslint-env node */
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      gridTemplateColumns: {
        16: "repeat(16, minmax(0, 1fr))",
      },
      spacing: {
        "1/8": "12.5%",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwind-scrollbar")],
  darkMode: ["class", '[data-theme="dark"]'],
};
