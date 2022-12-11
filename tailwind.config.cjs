/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", ...defaultTheme.fontFamily.sans],
            },
            backgroundImage: {
                "custom-gradient":
                    "linear-gradient(234deg,rgb(255,255,255),rgb(237,233,254) 7%,rgb(255,255,255) 17%,rgb(224,242,254) 21%,rgb(237,233,254) 26%,rgb(255,255,255) 30%,rgb(252,231,243) 36%,rgb(243,232,255) 42%,transparent 50%)",
            },
        },
    },
    plugins: [],
};
