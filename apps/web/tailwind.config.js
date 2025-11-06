/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",            // solo la app web
        "../../packages/shared/src/**/*.{ts,tsx}" // librería shared
    ],
    theme: {
        extend: {
            screens: {
                xs: "480px",   // móviles pequeños
                sm: "640px",   // móviles grandes
                md: "820px",   // tablets
                lg: "1200px",  // desktops estándar
                xl: "1536px",  // pantallas grandes
            },
            colors: {
                primary: {
                    50: '#eff6ff',
                    300: '#60a5fa',
                    400: '#38b6ff',
                    500: '#38b6ff',
                    600: '#2da1e6',
                    700: '#1d4ed8',
                    800: '#ff33c5ff',
                },
                nexia: '#38b6ff',
                turquoise: '#56E0DB',
                mint: '#C0EFE5',
                seashell: '#FFECE3',
                skyblue: '#7ECFDE',
                platinum: '#DAE1E2',
                'sidebar-header': 'rgba(4, 21, 32, 1)',
                'sidebar-nav': 'rgba(84, 160, 207, 1)',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
                '6xl': '3rem',
                '7xl': '3.5rem',
                '8xl': '4rem',
                '9xl': '4.5rem',
                '10xl': '5rem',
            },
            spacing: {
                'navbar-mobile': '5rem', 
                'navbar-desktop': '7rem',
            },
        },
    },
    plugins: [require("@tailwindcss/forms")],
};
