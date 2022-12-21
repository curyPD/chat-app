/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", ...defaultTheme.fontFamily.sans],
            },
            backgroundImage: {
                "custom-gradient":
                    "linear-gradient(234deg,rgba(255,255,255,0.7),rgba(237,233,254,0.7) 7%,rgba(255,255,255,0.7) 17%,rgba(224,242,254,0.7) 21%,rgba(237,233,254,0.7) 26%,rgba(255,255,255,0.7) 30%,rgba(252,231,243,0.7) 36%,rgba(243,232,255,0.7) 42%,transparent 50%)",
                "custom-gradient-dark": "linear-gradient(#0f172a,#0f172a)",
            },
            spacing: {
                "fixed-bar-tablet": "calc(100% - 56px)",
                "no-messages-screen": "calc(100% - 90px)",
            },
        },
    },
    plugins: [],
};
