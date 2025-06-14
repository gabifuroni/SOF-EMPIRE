import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        inter: ["Inter", "sans-serif"],
        ofelia: ["Ofelia Display", "serif"], // Brand typography
      },
      colors: {
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
        // New brand-aligned color palette
        symbol: {
          black: "#070808",        // Pure black from brand
          white: "#f6f7f7",        // Soft white from brand  
          beige: "#d9d3c5",        // Main beige from brand
          gold: "#c5a876",         // Warm gold accent
          gray: {
            50: "#fafafa",
            100: "#f5f5f5", 
            200: "#e5e5e5",
            300: "#d4d4d4",
            400: "#a3a3a3",
            500: "#737373",
            600: "#525252",
            700: "#404040",
            800: "#262626",
            900: "#171717",
          }
        },
        // Keep existing elite colors for backward compatibility
        elite: {
          charcoal: {
            50: "#f9f8f7",
            100: "#f1eeeb",
            200: "#e2ddd6", 
            300: "#d0c7ba",
            400: "#b8aa98",
            500: "#a08c7a",
            600: "#8b7663",
            700: "#73614f",
            800: "#5d4f42",
            900: "#4c4137",
          },
          pearl: {
            25: "#fefdfb",
            50: "#fdf8f6",
            100: "#f8f0e6",
            200: "#f1e8d8",
            300: "#e8dcc7",
            400: "#dccab0",
            500: "#ccb491",
            600: "#b8a082",
            700: "#a08c7a",
            800: "#8b7663",
            900: "#73614f",
          },
          champagne: {
            50: "#fdfcfa",
            100: "#faf6f0",
            200: "#f4edde",
            300: "#ece0c8",
            400: "#e0d0ad",
            500: "#d1bb8b",
            600: "#c0a875",
            700: "#a6925f",
            800: "#8b7a4f",
            900: "#736341",
          },
          rose: {
            50: "#fdf7f6",
            100: "#faecea",
            200: "#f5ddd9",
            300: "#edc7c0",
            400: "#e1a59a",
            500: "#d28470",
            600: "#c06851",
            700: "#a15540",
            800: "#864738",
            900: "#6f3d33",
          },
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
      },
      gridTemplateColumns: {
        '15': 'repeat(15, minmax(0, 1fr))',
      },
      letterSpacing: {
        'wider': '0.2em',
        'widest': '0.3em',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
