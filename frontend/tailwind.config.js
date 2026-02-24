/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9e9ff",
          500: "#1f6feb",
          700: "#0f3d8c",
        },
      },
      boxShadow: {
        panel: "0 12px 35px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [],
};
