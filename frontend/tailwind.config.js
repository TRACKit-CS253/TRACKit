/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        '3xl': '-11px 10px 14px 3px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        '4xl': '0.75rem 0.75rem 0 0',
      },
    },
  },
  plugins: [],
};
