import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0f172a", // Slate 950
                foreground: "#f8fafc", // Slate 50
                card: {
                    DEFAULT: "#1e293b", // Slate 800
                    foreground: "#f1f5f9", // Slate 100
                    border: "#334155", // Slate 700
                },
                primary: {
                    DEFAULT: "#8b5cf6", // Violet 500
                    hover: "#7c3aed", // Violet 600
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#06b6d4", // Cyan 500
                    foreground: "#ffffff",
                },
                accent: {
                    DEFAULT: "#f43f5e", // Rose 500
                    foreground: "#ffffff",
                },
                muted: {
                    DEFAULT: "#64748b", // Slate 500
                    foreground: "#94a3b8", // Slate 400
                },
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
