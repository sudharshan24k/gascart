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
                xl: '3rem',
                '2xl': '4rem',
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
                    light: '#5B8C51', // Lighter, vibrant green
                    DEFAULT: '#2D5A27', // Deep Forest Green (Main Brand)
                    dark: '#1A3816', // Rich dark green
                    50: '#F0F7EF',
                    100: '#E1EFDF',
                    200: '#C2DFBE',
                    300: '#A3CF9D',
                    400: '#84BF7C',
                    500: '#2D5A27',
                    600: '#24481F',
                    700: '#1B3617',
                    800: '#12240F',
                    900: '#091208',
                },
                secondary: {
                    light: '#E6C9A8', // Soft earth tone
                    DEFAULT: '#C19A6B', // Refined Gold/Earth
                    dark: '#8C6B42',
                    50: '#FCF9F5',
                    100: '#F9F3EB',
                    200: '#F0E3D1',
                    300: '#E6D3B7',
                    400: '#DDC39D',
                    500: '#C19A6B',
                    600: '#9A7B56',
                    700: '#745C40',
                    800: '#4D3D2B',
                    900: '#271F15',
                },
                neutral: {
                    light: '#F8F9FA', // Clean background
                    DEFAULT: '#E9ECEF', // Soft structure
                    dark: '#DEE2E6', // Borders
                    900: '#212529', // Typography Main
                    800: '#343A40', // Typography Secondary
                    700: '#495057', // Typography Tertiary
                },
                success: {
                    50: '#F0FDF4',
                    500: '#10B981',
                    700: '#047857',
                },
                warning: {
                    50: '#FFFBEB',
                    500: '#F59E0B',
                    700: '#B45309',
                },
                error: {
                    50: '#FEF2F2',
                    500: '#EF4444',
                    700: '#B91C1C',
                },
                info: {
                    50: '#EFF6FF',
                    500: '#3B82F6',
                    700: '#1D4ED8',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1' }],
                '6xl': ['3.75rem', { lineHeight: '1' }],
                '7xl': ['4.5rem', { lineHeight: '1' }],
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '30': '7.5rem',
                '34': '8.5rem',
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
                'skip': '1000', // Skip link
                'modal': '2000',
                'toast': '3000',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', // Softer default
                'md': '0 6px 12px -2px rgba(0, 0, 0, 0.08), 0 3px 6px -2px rgba(0, 0, 0, 0.04)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
                'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
                '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
                'primary': '0 10px 30px -5px rgba(45, 90, 39, 0.25)',
                'secondary': '0 10px 30px -5px rgba(193, 154, 107, 0.25)',
                'glow-primary': '0 0 25px rgba(45, 90, 39, 0.3)',
                'glow-secondary': '0 0 25px rgba(193, 154, 107, 0.3)',
                'card': '0 2px 10px rgba(0, 0, 0, 0.03)',
                'card-hover': '0 10px 30px rgba(0, 0, 0, 0.06)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.25rem',
                '3xl': '1.5rem',
                '4xl': '2rem',
            },
            animation: {
                'fade-in': 'fade-in 0.4s ease-out forwards',
                'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
                'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
                'zoom-in': 'zoom-in 0.3s ease-out forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2.5s linear infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in-right': {
                    '0%': { transform: 'translateX(20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                'zoom-in': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
            backdropBlur: {
                xs: '2px',
            },
            transitionDuration: {
                '400': '400ms',
            },
        },
    },
    plugins: [],
}

