import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#121018",
        violet: {
          50: "#f7f4ff",
          100: "#eee8ff",
          500: "#7c5cff",
          600: "#6847ed",
          700: "#5637cb",
          950: "#21163f"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(58, 40, 110, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
