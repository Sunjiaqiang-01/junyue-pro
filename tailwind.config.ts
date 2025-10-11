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
        // 君悦SPA主题色
        'primary-gold': "#D4AF37", // 金色
        'primary-purple': "#8B5CF6", // 紫色 (violet-500)
        'deep-black': "#0B0C0F", // 深黑色
        primary: {
          DEFAULT: "#D4AF37", // 金色
          50: "#FBF7EC",
          100: "#F6EFD9",
          200: "#EDDEB3",
          300: "#E3CE8D",
          400: "#DABE67",
          500: "#D4AF37", // 主色
          600: "#B8982C",
          700: "#8A7221",
          800: "#5C4C16",
          900: "#2E260B",
          gold: "#D4AF37", // 别名
        },
        secondary: {
          DEFAULT: "#2D2D2D", // 深灰
          50: "#F5F5F5",
          100: "#E5E5E5",
          200: "#CCCCCC",
          300: "#B2B2B2",
          400: "#999999",
          500: "#7F7F7F",
          600: "#666666",
          700: "#4C4C4C",
          800: "#333333",
          900: "#2D2D2D", // 主色
        },
        accent: {
          DEFAULT: "#F5E6D3", // 米白色
          light: "#FAF3E9",
          dark: "#E8D4BE",
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
  plugins: [require("tailwindcss-animate")],
};

export default config;

