/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        accent: "#10B981",
        background: "#F9FAFB",
        text: "#111827"
      },
      fontFamily: {
        inter: ["Inter_400Regular", "Inter_500Medium", "Inter_700Bold"],
      },
      borderRadius: {
        '2xl': '1rem'
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.1)"
      }
    }
  },
  plugins: []
}

