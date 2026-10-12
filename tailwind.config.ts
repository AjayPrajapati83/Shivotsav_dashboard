import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui CSS variable colors
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // CL Theme - Mythos
        cosmic: {
          DEFAULT: "#07070d",
          50: "#0e0e1a",
          100: "#151527",
          200: "#1c1c34",
          300: "#232341",
          400: "#2a2a4e",
        },
        gold: {
          DEFAULT: "#d4a017",
          light: "#f5d77a",
          dark: "#b8860b",
          muted: "#8b6914",
        },
        ember: {
          DEFAULT: "#ff6b35",
          glow: "#ff8c5a",
        },
        // Mythology accent colors
        myth: {
          hindu: "#ff9933",      // saffron
          norse: "#7eb8da",      // ice-blue
          egyptian: "#40e0d0",   // turquoise
          greek: "#4169e1",      // royal-blue
        },
        // Admin Theme
        admin: {
          bg: "#f8fafc",
          surface: "#ffffff",
          border: "#e2e8f0",
          text: "#0f172a",
          muted: "#64748b",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "serif"],
        "cinzel-decorative": ["var(--font-cinzel-decorative)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "float-up": {
          "0%": { transform: "translateY(100vh)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-10vh)", opacity: "0" },
        },
        glow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        shimmer: "shimmer 3s ease-in-out infinite",
        "float-up": "float-up 15s linear infinite",
        glow: "glow 3s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
