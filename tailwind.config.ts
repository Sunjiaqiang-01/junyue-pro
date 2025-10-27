import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 君悦SPA冷色调极简主题 - 方案J
        "primary-cyan": "#06b6d4", // 青色主色（cyan-500）
        "pure-black": "#0a0a0a", // 纯黑背景
        "pure-white": "#ffffff", // 纯白
        primary: {
          DEFAULT: "#06b6d4", // 青色
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4", // 主色
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          cyan: "#06b6d4", // 别名
        },
        secondary: {
          DEFAULT: "#ededed", // 浅灰文字
          50: "#ffffff",
          100: "#fafafa",
          200: "#f5f5f5",
          300: "#f0f0f0",
          400: "#ededed",
          500: "#d4d4d4",
          600: "#a3a3a3",
          700: "#737373",
          800: "#525252",
          900: "#404040",
        },
        accent: {
          DEFAULT: "rgba(255, 255, 255, 0.05)", // 极浅白色透明
          light: "rgba(255, 255, 255, 0.1)",
          dark: "rgba(255, 255, 255, 0.02)",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
