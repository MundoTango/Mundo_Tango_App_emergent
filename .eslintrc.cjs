module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    // Custom rule: Prevent hardcoded hex colors
    'no-restricted-syntax': [
      'warn',
      {
        selector: "Literal[value=/#[0-9A-Fa-f]{3,8}/]",
        message: '⛔ Hardcoded hex color detected! Use design tokens from design-tokens.css instead. Example: Use className="text-ocean" instead of color="#5EEAD4"',
      },
      {
        selector: "TemplateElement[value.raw=/#[0-9A-Fa-f]{3,8}/]",
        message: '⛔ Hardcoded hex color in template literal! Use design tokens from design-tokens.css instead.',
      },
    ],
    // Disable rules that conflict with our setup
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '.cache',
    'build',
    'coverage',
    '*.config.js',
    '*.config.ts',
    'vite.config.ts',
    'drizzle.config.ts',
  ],
};
