/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#72AD62', // Lighter green
                    DEFAULT: '#2D5A27', // Forest Green (Industrial)
                    dark: '#1E3F1A', // Dark Forest
                    50: '#F5F9F4',
                    100: '#E7F2E5',
                    200: '#C7DFC2',
                    300: '#9BBE93',
                    400: '#72AD62',
                    500: '#2D5A27',
                    600: '#264D21',
                    700: '#1E3C1A',
                    800: '#172E14',
                    900: '#0F1F0D',
                },
                secondary: {
                    light: '#D9B48F', // Earthy clay
                    DEFAULT: '#B47B44', // Industrial earth tone
                    dark: '#8C5A2D',
                    50: '#FDFCFB',
                },
                neutral: {
                    light: '#F5F5F0', // Off-white/Industrial neutral
                    DEFAULT: '#E0E0D1',
                    dark: '#C2C2B0',
                }
            },
            fontFamily: {
                sans: ['Roboto', 'Inter', 'sans-serif'],
                display: ['Roboto', 'Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
