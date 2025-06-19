import { type Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const tailwindConfig = {
  darkMode: ['class'],
  content: [
    './index.html',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        'border': 'hsl(var(--border))',
        'input': 'hsl(var(--input))',
        'ring': 'hsl(var(--ring))',
        'background': 'hsl(var(--background))',
        'foreground': 'hsl(var(--foreground))',
        'primary': {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        'secondary': {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        'destructive': {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        'muted': {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        'accent': {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        'popover': {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        'card': {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'sidebar': {
          'DEFAULT': 'hsl(var(--sidebar-background))',
          'foreground': 'hsl(var(--sidebar-foreground))',
          'primary': 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          'accent': 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          'border': 'hsl(var(--sidebar-border))',
          'ring': 'hsl(var(--sidebar-ring))',
        },
        // iOS System Colors - Semantic & Accessible
        'ios': {
          'blue': '#007AFF',
          'green': '#34C759',
          'indigo': '#5856D6',
          'orange': '#FF9500',
          'pink': '#FF2D92',
          'purple': '#AF52DE',
          'red': '#FF3B30',
          'teal': '#5AC8FA',
          'yellow': '#FFCC00',
          'gray': '#8E8E93',
          'gray2': '#AEAEB2',
          'gray3': '#C7C7CC',
          'gray4': '#D1D1D6',
          'gray5': '#E5E5EA',
          'gray6': '#F2F2F7',
        },
        // iOS Dynamic Colors (Light/Dark adaptive)
        'ios-label': {
          'primary': '#000000',
          'secondary': '#3C3C43',
          'tertiary': '#3C3C43',
          'quaternary': '#2C2C2E',
        },
        // iOS Background Colors
        'ios-bg': {
          'primary': '#FFFFFF',
          'secondary': '#F2F2F7',
          'tertiary': '#FFFFFF',
          'grouped-primary': '#F2F2F7',
          'grouped-secondary': '#FFFFFF',
          'grouped-tertiary': '#F2F2F7',
        },
        // iOS Fill Colors
        'ios-fill': {
          'primary': '#78788033',
          'secondary': '#78788028',
          'tertiary': '#7676801E',
          'quaternary': '#74748014',
        },
        // Legacy iOS colors for backward compatibility
        'ios-blue-legacy': '#007AFF',
        'ios-dark': '#1D1D1F',
        'ios-gray-legacy': '#F5F5F7',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // iOS-specific border radius
        'ios-xs': '4px',
        'ios-sm': '8px',
        'ios-md': '12px',
        'ios-lg': '16px',
        'ios-xl': '20px',
        'ios-2xl': '24px',
        'ios-3xl': '28px',
      },
      fontFamily: {
        'sf-pro': ['"SF Pro Display"', '"SF Pro Text"', ...fontFamily.sans],
        'sf-pro-display': ['"SF Pro Display"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', ...fontFamily.sans],
        'sf-pro-text': ['"SF Pro Text"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', ...fontFamily.sans],
        'sf-mono': ['"SF Mono"', 'Monaco', 'Inconsolata', 'Roboto Mono', ...fontFamily.mono],
      },
      spacing: {
        // iOS 8px grid system
        'ios-1': '4px',   // 0.5 * 8px
        'ios-2': '8px',   // 1 * 8px
        'ios-3': '12px',  // 1.5 * 8px
        'ios-4': '16px',  // 2 * 8px
        'ios-5': '20px',  // 2.5 * 8px
        'ios-6': '24px',  // 3 * 8px
        'ios-8': '32px',  // 4 * 8px
        'ios-10': '40px', // 5 * 8px
        'ios-12': '48px', // 6 * 8px
        'ios-16': '64px', // 8 * 8px
        'ios-20': '80px', // 10 * 8px
        'ios-24': '96px', // 12 * 8px
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        // iOS-style animations
        'ios-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
        },
        'ios-slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'ios-slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'ios-fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'ios-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        // iOS-style animations with 60fps performance
        'ios-bounce': 'ios-bounce 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ios-slide-up': 'ios-slide-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ios-slide-down': 'ios-slide-down 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ios-fade-in': 'ios-fade-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ios-pulse': 'ios-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      // iOS-specific design tokens
      backdropBlur: {
        'ios-thin': '20px',
        'ios-regular': '40px',
        'ios-thick': '80px',
        'ios-ultra-thin': '10px',
      },
      boxShadow: {
        'ios-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'ios-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'ios-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'ios-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'ios-card': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'ios-elevated': '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default tailwindConfig;
