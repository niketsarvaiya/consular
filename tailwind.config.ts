import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      colors: {
        // ── Modern Wanderlust palette ──
        // crisp white canvas (kept as `ivory` token so existing bg-ivory works)
        ivory: {
          DEFAULT: "#FFFFFF",
          50: "#FFFFFF",
          100: "#FAFAFB",
          200: "#F4F4F6",
          300: "#ECECEF",
        },
        // near-black neutral ink
        ink: {
          DEFAULT: "#16181D",
          50: "#F7F7F8",
          100: "#ECECEF",
          200: "#D4D5DA",
          300: "#AEB0B8",
          400: "#7C7F8A",
          500: "#565963",
          600: "#3A3C45",
          700: "#26272E",
          800: "#16181D",
          900: "#0D0E12",
        },
        // signature sunset gradient anchors
        coral: {
          DEFAULT: "#FF6B4A",
          50: "#FFF1EC",
          100: "#FFE0D6",
          300: "#FF9F86",
          400: "#FF7E5E",
          500: "#FF6B4A",
          600: "#ED4F2C",
          700: "#C53B1D",
          800: "#992C15",
        },
        iris: {
          DEFAULT: "#7C5CFF",
          50: "#F1EEFF",
          100: "#E2DBFF",
          300: "#B3A4FF",
          400: "#957EFF",
          500: "#7C5CFF",
          600: "#6841F0",
          700: "#5430D0",
          800: "#3E2299",
        },
        azure: {
          DEFAULT: "#3BA0FF",
          50: "#ECF6FF",
          100: "#D4ECFF",
          300: "#84C4FF",
          400: "#54AEFF",
          500: "#3BA0FF",
          600: "#1E84E6",
          700: "#1668B8",
        },
        // legacy aliases (mapped onto new palette so older classes don't break)
        gold: {
          DEFAULT: "#7C5CFF",
          50: "#F1EEFF",
          100: "#E2DBFF",
          200: "#CFC4FF",
          300: "#B3A4FF",
          400: "#957EFF",
          500: "#7C5CFF",
          600: "#6841F0",
          700: "#5430D0",
          800: "#3E2299",
        },
        sage: {
          DEFAULT: "#0E9F6E",
          50: "#E7F8F0",
          100: "#C7EEDD",
          300: "#67D7A8",
          500: "#0E9F6E",
          700: "#0A6E4D",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
