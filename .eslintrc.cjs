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
    // ESA LIFE CEO 61x21 - Prevent debug/archive imports in production
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['*/_debug/*', '@/pages/_debug/*', '../*/_debug/*', './_debug/*'],
          message: '🚫 ESA Framework Violation: Cannot import from _debug/ in production code.\n' +
            '   Debug components must only be used in:\n' +
            '   - Test files (*.test.ts, *.spec.ts)\n' +
            '   - Debug-specific contexts\n' +
            '   Production routes should use components from client/src/pages/ (not _debug/)\n' +
            '   See: docs/build-coordination/route-protection-sprint.md'
        },
        {
          group: ['*/_archive/*', '@/pages/_archive/*', '../*/_archive/*', './_archive/*'],
          message: '🚫 ESA Framework Violation: Cannot import from _archive/ in production code.\n' +
            '   Archive components are deprecated and cannot be used.\n' +
            '   Use current production components from client/src/pages/\n' +
            '   See: docs/build-coordination/route-protection-sprint.md'
        }
      ]
    }],
    
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
    
    // ESA Agent #66: Code Quality Gates
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-await-in-loop': 'warn',
    'no-eval': 'error',
    'no-implied-eval': 'error',
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
