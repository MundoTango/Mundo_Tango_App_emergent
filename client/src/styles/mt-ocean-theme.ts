// MT Ocean Design System Constants
// ESA LIFE CEO 61x21 Theme Configuration

export const MTOceanTheme = {
  // Primary Ocean Colors - Teal to Deep Blue Gradient
  colors: {
    primary: {
      50: '#F0FDFA',
      100: '#CCFBF1', 
      200: '#99F6E4',
      300: '#5EEAD4', // Primary Teal
      400: '#2DD4BF',
      500: '#14B8A6',
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#155E75', // Primary Deep Blue
      950: '#042F2E'
    },
    secondary: {
      light: '#A78BFA', // Light purple
      default: '#8B5CF6', // Purple
      dark: '#6D28D9' // Dark purple
    },
    accent: {
      coral: '#FF6B6B',
      sunset: '#FF9F43',
      ocean: '#4ECDC4',
      sky: '#48CAE4'
    },
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    }
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #5EEAD4 0%, #155E75 100%)',
    primaryHover: 'linear-gradient(135deg, #2DD4BF 0%, #115E59 100%)',
    primarySubtle: 'linear-gradient(135deg, #CCFBF1 0%, #CCFBF1 100%)',
    secondary: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
    oceanSunset: 'linear-gradient(135deg, #4ECDC4 0%, #FF6B6B 100%)',
    skyTeal: 'linear-gradient(135deg, #48CAE4 0%, #5EEAD4 100%)',
    aurora: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'
  },

  // Glassmorphic Effects
  glassmorphism: {
    light: {
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
    },
    dark: {
      background: 'rgba(17, 24, 39, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
    },
    colored: {
      teal: {
        background: 'rgba(94, 234, 212, 0.15)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(94, 234, 212, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(94, 234, 212, 0.15)'
      },
      purple: {
        background: 'rgba(139, 92, 246, 0.15)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(139, 92, 246, 0.15)'
      }
    }
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      display: ['Poppins', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    }
  },

  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    full: '9999px'
  },

  // Animations
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms'
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    teal: '0 10px 40px -15px rgba(94, 234, 212, 0.5)',
    purple: '0 10px 40px -15px rgba(139, 92, 246, 0.5)',
    glow: '0 0 20px rgba(94, 234, 212, 0.5)'
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// Tailwind class utilities for MT Ocean theme
export const mtOceanClasses = {
  // Glassmorphic card
  card: 'bg-[var(--color-surface)]/85 dark:bg-gray-900/85 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300',
  
  // Primary button with gradient
  buttonPrimary: 'bg-gradient-to-r from-teal-300 to-blue-900 hover:from-[var(--color-ocean-400)] hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300',
  
  // Input field
  input: 'bg-[var(--color-surface)]/90 dark:bg-gray-800/90 backdrop-blur-md border border-teal-200/50 dark:border-teal-700/50 focus:border-teal-400 dark:focus:border-[var(--color-primary)] rounded-lg px-4 py-2 transition-all duration-300',
  
  // Badge
  badge: 'bg-gradient-to-r from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900 text-teal-800 dark:text-teal-200 px-3 py-1 rounded-full text-sm font-medium',
  
  // Text gradients
  textGradient: 'bg-gradient-to-r from-[var(--color-ocean-400)] to-blue-900 bg-clip-text text-transparent',
  
  // Hover effects
  hoverScale: 'hover:scale-105 transition-transform duration-300',
  hoverGlow: 'hover:shadow-[0_0_20px_rgba(94,234,212,0.5)] transition-shadow duration-300'
};

// Helper function to apply glassmorphism
export const applyGlassmorphism = (isDark = false) => {
  const style = isDark ? MTOceanTheme.glassmorphism.dark : MTOceanTheme.glassmorphism.light;
  return {
    background: style.background,
    backdropFilter: style.backdropFilter,
    WebkitBackdropFilter: style.backdropFilter,
    border: style.border,
    boxShadow: style.boxShadow
  };
};

// Helper function to get gradient style
export const getGradient = (type: keyof typeof MTOceanTheme.gradients) => ({
  background: MTOceanTheme.gradients[type]
});

export default MTOceanTheme;