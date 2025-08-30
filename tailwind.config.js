/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE", 
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A"
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
          900: "#064E3B"
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
          900: "#171717"
        },
        background: "#FAFBFC",
        surface: "#FFFFFF",
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          tertiary: "#94A3B8"
        },
        border: {
          light: "#F1F5F9",
          DEFAULT: "#E2E8F0",
          dark: "#CBD5E1"
        },
        error: {
          50: "#FEF2F2",
          500: "#EF4444",
          600: "#DC2626"
        },
        warning: {
          50: "#FFFBEB",
          500: "#F59E0B"
        },
        success: {
          50: "#F0FDF4",
          500: "#22C55E"
        }
      },
      fontFamily: {
        inter: ["Inter_400Regular", "Inter_500Medium", "Inter_700Bold"],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem'
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.08)",
        medium: "0 4px 6px rgba(0,0,0,0.07)",
        large: "0 10px 15px rgba(0,0,0,0.1)"
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    }
  },
  plugins: []
}