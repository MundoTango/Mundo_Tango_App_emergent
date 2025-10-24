import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import { sanitizeFilePath } from './securityUtils.js';

const router = Router();

interface ComponentAnalysis {
  name: string;
  props: string[];
  state: string[];
  methods: string[];
  imports: Array<{ source: string; specifiers: string[] }>;
  exports: string[];
  hooks: string[];
}

/**
 * POST /api/mrblue/analyze-component
 * Parse React/TypeScript component and extract structure
 */
router.post('/analyze-component', async (req, res) => {
  try {
    const { filePath, componentName } = req.body;

    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'filePath is required and must be a string'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔬 [MR BLUE - AST ANALYSIS]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📁 File:', filePath);
    console.log('🎯 Component:', componentName || 'auto-detect');

    // Security: Sanitize and validate path (prevents path traversal)
    const fullPath = sanitizeFilePath(filePath);
    console.log('🔒 Validated Path:', fullPath);

    // Read file
    const code = await fs.readFile(fullPath, 'utf-8');
    const ext = path.extname(fullPath);

    // Parse with Babel
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'typescript',
        'jsx',
        ext === '.tsx' ? 'tsx' : undefined
      ].filter(Boolean) as any[]
    });

    const analysis: ComponentAnalysis = {
      name: componentName || '',
      props: [],
      state: [],
      methods: [],
      imports: [],
      exports: [],
      hooks: []
    };

    // Traverse AST
    traverse(ast, {
      // Import statements
      ImportDeclaration(nodePath) {
        const source = nodePath.node.source.value;
        const specifiers = nodePath.node.specifiers.map(spec => {
          if (spec.type === 'ImportDefaultSpecifier') {
            return spec.local.name;
          }
          if (spec.type === 'ImportSpecifier') {
            return spec.imported.type === 'Identifier' 
              ? spec.imported.name 
              : '';
          }
          return '';
        }).filter(Boolean);

        analysis.imports.push({ source, specifiers });
      },

      // Export statements
      ExportNamedDeclaration(nodePath) {
        if (nodePath.node.declaration?.type === 'VariableDeclaration') {
          nodePath.node.declaration.declarations.forEach(decl => {
            if (decl.id.type === 'Identifier') {
              analysis.exports.push(decl.id.name);
            }
          });
        }
        if (nodePath.node.declaration?.type === 'FunctionDeclaration' && nodePath.node.declaration.id) {
          analysis.exports.push(nodePath.node.declaration.id.name);
        }
      },

      ExportDefaultDeclaration(nodePath) {
        if (nodePath.node.declaration.type === 'Identifier') {
          analysis.exports.push(nodePath.node.declaration.name);
        }
      },

      // Function components
      FunctionDeclaration(nodePath) {
        const name = nodePath.node.id?.name || '';
        if (name && /^[A-Z]/.test(name)) {  // Component names start with capital
          if (!analysis.name) analysis.name = name;

          // Look for props parameter
          if (nodePath.node.params.length > 0) {
            const param = nodePath.node.params[0];
            if (param.type === 'Identifier' && param.typeAnnotation) {
              // Extract prop types from TypeScript annotation
              // Simplified - would need full type resolver for production
              analysis.props.push('props (detected via type annotation)');
            }
          }
        }
      },

      // Arrow function components
      VariableDeclarator(nodePath) {
        if (nodePath.node.id.type === 'Identifier') {
          const name = nodePath.node.id.name;
          if (/^[A-Z]/.test(name) && nodePath.node.init?.type === 'ArrowFunctionExpression') {
            if (!analysis.name) analysis.name = name;
          }
        }
      },

      // React hooks (useState, useEffect, etc.)
      CallExpression(nodePath) {
        if (nodePath.node.callee.type === 'Identifier') {
          const name = nodePath.node.callee.name;
          if (name.startsWith('use') && /^use[A-Z]/.test(name)) {
            if (!analysis.hooks.includes(name)) {
              analysis.hooks.push(name);
            }

            // Detect useState calls
            if (name === 'useState' && nodePath.parent.type === 'VariableDeclarator') {
              if (nodePath.parent.id.type === 'ArrayPattern' && nodePath.parent.id.elements[0]) {
                const stateVar = nodePath.parent.id.elements[0];
                if (stateVar?.type === 'Identifier') {
                  analysis.state.push(stateVar.name);
                }
              }
            }
          }
        }
      }
    });

    console.log('✅ Analysis complete');
    console.log('📊 Results:', {
      component: analysis.name,
      imports: analysis.imports.length,
      exports: analysis.exports.length,
      hooks: analysis.hooks.length,
      state: analysis.state.length
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.json({
      success: true,
      data: analysis
    });

  } catch (error: any) {
    console.error('❌ [AST PARSE ERROR]:', error.message);
    
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
