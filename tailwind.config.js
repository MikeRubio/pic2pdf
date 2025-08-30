/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F0F9FF",
          100: "#E0F2FE", 
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
          950: "#082F49"
        },
        accent: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0", 
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          950: "#022C22"
        },
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0A0A0A"
        },
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617"
        },
        background: "#FAFBFC",
        surface: "#FFFFFF",
        surfaceElevated: "#FDFDFD",
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          tertiary: "#94A3B8",
          inverse: "#FFFFFF"
        },
        border: {
          light: "#F1F5F9",
          DEFAULT: "#E2E8F0",
          dark: "#CBD5E1"
        },
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C"
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706"
        },
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          500: "#22C55E",
          600: "#16A34A"
        }
      },
      fontFamily: {
        inter: ["Inter_400Regular", "Inter_500Medium", "Inter_700Bold"],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem'
      },
      boxShadow: {
        soft: "0 1px 3px rgba(15, 23, 42, 0.08)",
        medium: "0 4px 12px rgba(15, 23, 42, 0.1)",
        large: "0 8px 25px rgba(15, 23, 42, 0.15)",
        xl: "0 20px 25px rgba(15, 23, 42, 0.1)"
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      },
      fontSize: {
        '2xs': '0.625rem',
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      }
    }
  },
  plugins: []
}
