/**
 * ESA LIFE CEO 61x21 Framework - Custom ESLint Rules
 * Layer 51-61: CI/CD Automation & Route Protection
 * 
 * Purpose: Prevent debug/archive components from being imported in production code
 * Documentation: docs/build-coordination/route-protection-sprint.md
 */

module.exports = {
  rules: {
    'no-debug-imports-in-production': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent imports from _debug/ and _archive/ directories in production code',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          debugImport: '🚫 ESA Framework Violation: Cannot import from "{{path}}" in production code.\n' +
            '   Debug components must only be used in:\n' +
            '   - Test files (*.test.ts, *.spec.ts)\n' +
            '   - Debug-specific contexts\n' +
            '   Production routes should use components from client/src/pages/ (not _debug/ or _archive/)\n' +
            '   See: docs/build-coordination/route-protection-sprint.md',
          archiveImport: '🚫 ESA Framework Violation: Cannot import from "{{path}}" in production code.\n' +
            '   Archive components are deprecated and cannot be used.\n' +
            '   Use current production components from client/src/pages/\n' +
            '   See: docs/build-coordination/route-protection-sprint.md',
        },
        schema: [],
      },
      create(context) {
        const filename = context.getFilename();
        
        // Allow imports in test files
        const isTestFile = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filename);
        if (isTestFile) {
          return {};
        }
        
        // Allow imports in debug-specific files (files that are themselves in _debug/)
        const isDebugFile = filename.includes('/_debug/') || filename.includes('\\_debug\\');
        if (isDebugFile) {
          return {};
        }
        
        // Allow imports in archive files (files that are themselves in _archive/)
        const isArchiveFile = filename.includes('/_archive/') || filename.includes('\\_archive\\');
        if (isArchiveFile) {
          return {};
        }

        return {
          ImportDeclaration(node) {
            const importPath = node.source.value;
            
            // Check for _debug/ imports
            if (importPath.includes('/_debug/') || importPath.includes('pages/_debug')) {
              context.report({
                node,
                messageId: 'debugImport',
                data: {
                  path: importPath,
                },
              });
            }
            
            // Check for _archive/ imports
            if (importPath.includes('/_archive/') || importPath.includes('pages/_archive')) {
              context.report({
                node,
                messageId: 'archiveImport',
                data: {
                  path: importPath,
                },
              });
            }
          },
        };
      },
    },
  },
};
