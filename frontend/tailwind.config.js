/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  safelist: [
    "bg-[#eefc9c]",
    "bg-[#f5d8dd]",
    "bg-[#dfe8ff]",
    "bg-[#ffe3a3]"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        sand: "#f7f2e8",
        ember: "#c2410c",
        moss: "#3f6212"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
};
