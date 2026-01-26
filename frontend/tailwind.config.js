/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                sm: '1.5rem',
                lg: '2rem',
            },
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                '2xl': '1536px',
            },
        },
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
                    100: '#F9F5F0',
                    200: '#E8DDD0',
                    300: '#D9B48F',
                    400: '#B47B44',
                    500: '#B47B44',
                    600: '#9A6838',
                    700: '#8C5A2D',
                    800: '#6F4823',
                    900: '#523519',
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
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '88': '22rem',
                '100': '25rem',
                '112': '28rem',
                '128': '32rem',
            },
            maxWidth: {
                '8xl': '88rem',
                '9xl': '96rem',
            },
            zIndex: {
                '60': '60',
                '70': '70',
                '80': '80',
                '90': '90',
                '100': '100',
            },
            animation: {
                'slide-in-top': 'slide-in-top 0.3s ease-out',
                'slide-in-left': 'slide-in-left 0.3s ease-out',
            },
            keyframes: {
                'slide-in-top': {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                'slide-in-left': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
            },
        },
    },
    plugins: [],
}

