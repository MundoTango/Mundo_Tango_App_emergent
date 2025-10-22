/**
 * Design System Service
 * MB.MD Track 10: Design System Infrastructure
 * Implements: Component library, design tokens, themes, patterns
 */

export interface DesignToken {
  name: string;
  value: string;
  category: 'color' | 'spacing' | 'typography' | 'shadow' | 'radius' | 'animation';
  cssVar: string;
}

export interface Component {
  id: string;
  name: string;
  description: string;
  category: 'layout' | 'input' | 'display' | 'feedback' | 'navigation';
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: any;
    description: string;
  }>;
  variants: string[];
  examples: Array<{
    name: string;
    code: string;
    preview?: string;
  }>;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  spacing: Record<string, string>;
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
  };
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

class DesignSystemService {
  /**
   * Get all design tokens
   */
  getDesignTokens(): DesignToken[] {
    return [
      // Colors
      { name: 'primary', value: 'hsl(190, 85%, 45%)', category: 'color', cssVar: '--color-primary' },
      { name: 'secondary', value: 'hsl(200, 70%, 50%)', category: 'color', cssVar: '--color-secondary' },
      { name: 'accent', value: 'hsl(180, 65%, 55%)', category: 'color', cssVar: '--color-accent' },
      
      // Spacing
      { name: 'space-xs', value: '0.25rem', category: 'spacing', cssVar: '--space-xs' },
      { name: 'space-sm', value: '0.5rem', category: 'spacing', cssVar: '--space-sm' },
      { name: 'space-md', value: '1rem', category: 'spacing', cssVar: '--space-md' },
      { name: 'space-lg', value: '1.5rem', category: 'spacing', cssVar: '--space-lg' },
      { name: 'space-xl', value: '2rem', category: 'spacing', cssVar: '--space-xl' },
      
      // Typography
      { name: 'font-sans', value: 'Inter, system-ui, sans-serif', category: 'typography', cssVar: '--font-sans' },
      { name: 'font-mono', value: 'Fira Code, monospace', category: 'typography', cssVar: '--font-mono' },
      { name: 'text-xs', value: '0.75rem', category: 'typography', cssVar: '--text-xs' },
      { name: 'text-sm', value: '0.875rem', category: 'typography', cssVar: '--text-sm' },
      { name: 'text-base', value: '1rem', category: 'typography', cssVar: '--text-base' },
      { name: 'text-lg', value: '1.125rem', category: 'typography', cssVar: '--text-lg' },
      { name: 'text-xl', value: '1.25rem', category: 'typography', cssVar: '--text-xl' },
      
      // Shadows
      { name: 'shadow-sm', value: '0 1px 2px rgba(0,0,0,0.05)', category: 'shadow', cssVar: '--shadow-sm' },
      { name: 'shadow-md', value: '0 4px 6px rgba(0,0,0,0.1)', category: 'shadow', cssVar: '--shadow-md' },
      { name: 'shadow-lg', value: '0 10px 15px rgba(0,0,0,0.1)', category: 'shadow', cssVar: '--shadow-lg' },
      
      // Border Radius
      { name: 'radius-sm', value: '0.25rem', category: 'radius', cssVar: '--radius-sm' },
      { name: 'radius-md', value: '0.5rem', category: 'radius', cssVar: '--radius-md' },
      { name: 'radius-lg', value: '1rem', category: 'radius', cssVar: '--radius-lg' },
      { name: 'radius-full', value: '9999px', category: 'radius', cssVar: '--radius-full' },
    ];
  }

  /**
   * Get component library
   */
  getComponents(): Component[] {
    return [
      {
        id: 'button',
        name: 'Button',
        description: 'Interactive button component with multiple variants',
        category: 'input',
        props: [
          { name: 'variant', type: 'primary | secondary | outline | ghost', required: false, default: 'primary', description: 'Visual style variant' },
          { name: 'size', type: 'sm | md | lg', required: false, default: 'md', description: 'Button size' },
          { name: 'disabled', type: 'boolean', required: false, default: false, description: 'Disable button' },
          { name: 'loading', type: 'boolean', required: false, default: false, description: 'Show loading state' },
          { name: 'onClick', type: '() => void', required: false, description: 'Click handler' },
        ],
        variants: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
        examples: [
          {
            name: 'Basic',
            code: '<Button>Click me</Button>',
          },
          {
            name: 'Variants',
            code: '<Button variant="primary">Primary</Button>\n<Button variant="secondary">Secondary</Button>',
          },
        ],
      },
      {
        id: 'card',
        name: 'Card',
        description: 'Container component for content',
        category: 'layout',
        props: [
          { name: 'variant', type: 'default | outlined | elevated', required: false, default: 'default', description: 'Visual style variant' },
          { name: 'padding', type: 'sm | md | lg', required: false, default: 'md', description: 'Internal padding' },
        ],
        variants: ['default', 'outlined', 'elevated', 'glass'],
        examples: [
          {
            name: 'Basic',
            code: '<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><CardContent>Content</CardContent></Card>',
          },
        ],
      },
    ];
  }

  /**
   * Get theme
   */
  getTheme(themeId: 'light' | 'dark' | 'ocean'): Theme {
    const themes: Record<string, Theme> = {
      light: {
        id: 'light',
        name: 'Light',
        colors: {
          primary: 'hsl(190, 85%, 45%)',
          secondary: 'hsl(200, 70%, 50%)',
          accent: 'hsl(180, 65%, 55%)',
          background: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(222, 47%, 11%)',
          muted: 'hsl(210, 40%, 96%)',
          border: 'hsl(214, 32%, 91%)',
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
        typography: {
          fontFamily: {
            sans: 'Inter, system-ui, sans-serif',
            mono: 'Fira Code, monospace',
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
        },
        borderRadius: {
          sm: '0.25rem',
          md: '0.5rem',
          lg: '1rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 1px 2px rgba(0,0,0,0.05)',
          md: '0 4px 6px rgba(0,0,0,0.1)',
          lg: '0 10px 15px rgba(0,0,0,0.1)',
        },
      },
      dark: {
        id: 'dark',
        name: 'Dark',
        colors: {
          primary: 'hsl(190, 85%, 55%)',
          secondary: 'hsl(200, 70%, 60%)',
          accent: 'hsl(180, 65%, 65%)',
          background: 'hsl(222, 47%, 11%)',
          foreground: 'hsl(0, 0%, 100%)',
          muted: 'hsl(217, 33%, 17%)',
          border: 'hsl(217, 33%, 25%)',
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
        typography: {
          fontFamily: {
            sans: 'Inter, system-ui, sans-serif',
            mono: 'Fira Code, monospace',
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
        },
        borderRadius: {
          sm: '0.25rem',
          md: '0.5rem',
          lg: '1rem',
          full: '9999px',
        },
        shadows: {
          sm: '0 2px 4px rgba(0,0,0,0.3)',
          md: '0 8px 12px rgba(0,0,0,0.4)',
          lg: '0 20px 30px rgba(0,0,0,0.5)',
        },
      },
    };

    return themes[themeId] || themes.light;
  }

  /**
   * Generate CSS variables from theme
   */
  generateCSSVariables(theme: Theme): string {
    const cssVars: string[] = [];

    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      cssVars.push(`  --color-${key}: ${value};`);
    });

    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      cssVars.push(`  --space-${key}: ${value};`);
    });

    // Typography
    Object.entries(theme.typography.fontFamily).forEach(([key, value]) => {
      cssVars.push(`  --font-${key}: ${value};`);
    });
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      cssVars.push(`  --text-${key}: ${value};`);
    });

    // Border radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      cssVars.push(`  --radius-${key}: ${value};`);
    });

    // Shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      cssVars.push(`  --shadow-${key}: ${value};`);
    });

    return `:root {\n${cssVars.join('\n')}\n}`;
  }

  /**
   * Validate accessibility
   */
  validateAccessibility(component: Component): {
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for aria labels
    if (!component.props.some(p => p.name.includes('aria'))) {
      issues.push('Missing ARIA labels');
      suggestions.push('Add aria-label prop');
    }

    // Check for keyboard support
    if (!component.props.some(p => p.name.includes('onKeyDown'))) {
      issues.push('No keyboard event handlers');
      suggestions.push('Add keyboard navigation support');
    }

    const score = Math.max(0, 100 - (issues.length * 20));

    return {
      score,
      issues,
      suggestions,
    };
  }
}

// Export singleton instance
export const designSystemService = new DesignSystemService();
