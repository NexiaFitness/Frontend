/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
  "./src/**/*.{js,ts,jsx,tsx}",          // dentro de ui-web
  "../../apps/web/src/**/*.{js,ts,jsx,tsx}", // tu app web
  "../../packages/ui-web/src/**/*.{js,ts,jsx,tsx}" // componentes locales de ui-web
],

    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    300: '#60a5fa',
                    400: '#38b6ff',  // Color corporativo NEXIA
                    500: '#38b6ff',  // Color corporativo NEXIA
                    600: '#2da1e6',  // Hover más oscuro
                    700: '#1d4ed8',
                    800: '#ff33c5ff', // un naranja fuerte de prueba
                },
                // Alias directo para color corporativo
                nexia: '#38b6ff',
                // Colores NEXIA del mesh gradient
                turquoise: '#56E0DB',
                mint: '#C0EFE5',
                seashell: '#FFECE3',
                skyblue: '#7ECFDE',
                platinum: '#DAE1E2',
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
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
};