/** @type {import('tailwindcss').Config} */
/**
 * Nexia Sparkle Flow — Design tokens en :root (index.css).
 * Breakpoints: escala Tailwind por defecto (sm:640, md:768, lg:1024, xl:1280, 2xl:1536).
 */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "../../packages/shared/src/**/*.{ts,tsx}"
    ],
    theme: {
        extend: {
            /* Breakpoints: no sobrescribir; usa defaults Tailwind */
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
                success: {
                    DEFAULT: "hsl(var(--success))",
                    foreground: "hsl(var(--success-foreground))",
                },
                warning: {
                    DEFAULT: "hsl(var(--warning))",
                    foreground: "hsl(var(--warning-foreground))",
                },
                info: {
                    DEFAULT: "hsl(var(--info))",
                    foreground: "hsl(var(--info-foreground))",
                },
                surface: {
                    DEFAULT: "hsl(var(--surface))",
                    2: "hsl(var(--surface-2))",
                },
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
                /* Legacy: compatibilidad hasta migración en fases posteriores */
                "primary-600": "#4A67B3",
                "sidebar-header": "rgba(4, 21, 32, 1)",
                "sidebar-nav": "#4A67B3",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                "4xl": "2rem",
                "5xl": "2.5rem",
                "6xl": "3rem",
                "7xl": "3.5rem",
                "8xl": "4rem",
                "9xl": "4.5rem",
                "10xl": "5rem",
            },
            spacing: {
                'navbar-mobile': '4rem',
                'navbar-desktop': '5.5rem',
                'navbar-dashboard-mobile': '3.5rem',
                'navbar-dashboard-desktop': '5rem',
            },
        },
    },
    plugins: [require("@tailwindcss/forms")],
};
