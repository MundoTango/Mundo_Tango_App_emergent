/**
 * AST PARSER - TypeScript/JavaScript Repository Mapping
 * MB.MD SIMULTANEOUS - Agent #3: Repository Mapping Specialist
 * 
 * Research Sources:
 * - Aider: aider/repomap.py (repository mapping algorithm)
 * - Babel: @babel/parser, @babel/traverse (AST parsing)
 * - Target: 20x compression (100k LOC → 5k tokens)
 * 
 * Created: October 23, 2025
 */

import { parse, type ParserPlugin } from '@babel/parser';
import traverse, { type NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as fs from 'fs/promises';
import * as path from 'path';

interface Symbol {
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'const' | 'let' | 'var' | 'import' | 'export';
  line: number;
  scope?: string; // For class methods
  params?: string[]; // For functions
  returnType?: string;
  exported?: boolean;
}

interface FileSymbols {
  filePath: string;
  imports: string[];
  exports: string[];
  symbols: Symbol[];
  loc: number; // Lines of code
}

interface CompactMap {
  filePath: string;
  symbols: string[]; // Compact representation
  imports: string[];
  exports: string[];
}

/**
 * ASTParser - Parse TypeScript/JavaScript files into symbol maps
 * 
 * Based on Aider's repomap.py algorithm:
 * 1. Parse file into AST
 * 2. Extract symbols (functions, classes, imports, exports)
 * 3. Generate compact representation (20x compression)
 * 4. Track dependencies (import/export graph)
 */
export class ASTParser {
  private projectRoot: string;
  private parserPlugins: ParserPlugin[];

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    
    // Enable all TypeScript and React features
    this.parserPlugins = [
      'typescript',
      'jsx',
      'decorators-legacy',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'dynamicImport',
      'nullishCoalescingOperator',
      'optionalChaining',
      'importMeta',
      'topLevelAwait'
    ];
  }

  /**
   * Parse TypeScript/JavaScript file into AST
   */
  async parseFile(filePath: string): Promise<t.File> {
    const fullPath = path.join(this.projectRoot, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    
    return parse(content, {
      sourceType: 'module',
      plugins: this.parserPlugins,
      errorRecovery: true // Continue parsing even with errors
    });
  }

  /**
   * Extract all symbols from AST
   * 
   * Symbols include: functions, classes, interfaces, types, variables, imports, exports
   */
  extractSymbols(ast: t.File, filePath: string): FileSymbols {
    const symbols: Symbol[] = [];
    const imports: string[] = [];
    const exports: string[] = [];
    let loc = 0;

    traverse(ast, {
      // Count lines of code
      Program(path) {
        if (path.node.loc) {
          loc = path.node.loc.end.line;
        }
      },

      // Extract imports
      ImportDeclaration(path) {
        const source = path.node.source.value;
        imports.push(source);
        
        path.node.specifiers.forEach(spec => {
          if (t.isImportSpecifier(spec) || t.isImportDefaultSpecifier(spec)) {
            symbols.push({
              name: spec.local.name,
              type: 'import',
              line: path.node.loc?.start.line || 0
            });
          }
        });
      },

      // Extract function declarations
      FunctionDeclaration(path) {
        if (path.node.id) {
          const params = path.node.params.map(param => {
            if (t.isIdentifier(param)) return param.name;
            if (t.isRestElement(param) && t.isIdentifier(param.argument)) {
              return `...${param.argument.name}`;
            }
            return '_';
          });

          symbols.push({
            name: path.node.id.name,
            type: 'function',
            line: path.node.loc?.start.line || 0,
            params,
            exported: this.isExported(path)
          });
        }
      },

      // Extract arrow functions assigned to variables
      VariableDeclaration(path) {
        path.node.declarations.forEach(declarator => {
          if (t.isIdentifier(declarator.id) && t.isArrowFunctionExpression(declarator.init)) {
            const params = declarator.init.params.map(param => {
              if (t.isIdentifier(param)) return param.name;
              return '_';
            });

            symbols.push({
              name: declarator.id.name,
              type: path.node.kind as 'const' | 'let' | 'var',
              line: path.node.loc?.start.line || 0,
              params,
              exported: this.isExported(path)
            });
          } else if (t.isIdentifier(declarator.id)) {
            symbols.push({
              name: declarator.id.name,
              type: path.node.kind as 'const' | 'let' | 'var',
              line: path.node.loc?.start.line || 0,
              exported: this.isExported(path)
            });
          }
        });
      },

      // Extract class declarations
      ClassDeclaration(path) {
        if (path.node.id) {
          const className = path.node.id.name;
          
          symbols.push({
            name: className,
            type: 'class',
            line: path.node.loc?.start.line || 0,
            exported: this.isExported(path)
          });

          // Extract class methods
          path.node.body.body.forEach(member => {
            if (t.isClassMethod(member) && t.isIdentifier(member.key)) {
              const params = member.params.map(param => {
                if (t.isIdentifier(param)) return param.name;
                return '_';
              });

              symbols.push({
                name: member.key.name,
                type: 'function',
                line: member.loc?.start.line || 0,
                scope: className,
                params
              });
            }
          });
        }
      },

      // Extract TypeScript interfaces
      TSInterfaceDeclaration(path) {
        symbols.push({
          name: path.node.id.name,
          type: 'interface',
          line: path.node.loc?.start.line || 0,
          exported: this.isExported(path)
        });
      },

      // Extract TypeScript type aliases
      TSTypeAliasDeclaration(path) {
        symbols.push({
          name: path.node.id.name,
          type: 'type',
          line: path.node.loc?.start.line || 0,
          exported: this.isExported(path)
        });
      },

      // Extract exports
      ExportNamedDeclaration(path) {
        if (path.node.source) {
          exports.push(path.node.source.value);
        }
        
        path.node.specifiers?.forEach(spec => {
          if (t.isExportSpecifier(spec)) {
            exports.push(spec.exported.name);
          }
        });
      },

      ExportDefaultDeclaration(path) {
        exports.push('default');
      },

      ExportAllDeclaration(path) {
        if (path.node.source) {
          exports.push(`* from ${path.node.source.value}`);
        }
      }
    });

    return {
      filePath,
      imports: [...new Set(imports)], // Remove duplicates
      exports: [...new Set(exports)],
      symbols,
      loc
    };
  }

  /**
   * Check if a node is exported
   */
  private isExported(path: NodePath<any>): boolean {
    const parent = path.parent;
    return t.isExportNamedDeclaration(parent) || t.isExportDefaultDeclaration(parent);
  }

  /**
   * Generate compact representation (Aider-style)
   * 
   * Format:
   * ## src/auth.ts (150 LOC)
   *   - function login(email, password)
   *   - function logout()
   *   - class AuthService
   *     → constructor()
   *     → verifyToken(token)
   *   - imports: [React, { db } from './db']
   */
  generateCompactMap(fileSymbols: FileSymbols): CompactMap {
    const compactSymbols: string[] = [];

    // Group symbols by type
    const functions = fileSymbols.symbols.filter(s => s.type === 'function' && !s.scope);
    const classes = fileSymbols.symbols.filter(s => s.type === 'class');
    const interfaces = fileSymbols.symbols.filter(s => s.type === 'interface');
    const types = fileSymbols.symbols.filter(s => s.type === 'type');
    const variables = fileSymbols.symbols.filter(s => 
      ['const', 'let', 'var'].includes(s.type) && !s.params
    );

    // Add functions
    functions.forEach(fn => {
      const params = fn.params?.join(', ') || '';
      const exportPrefix = fn.exported ? 'export ' : '';
      compactSymbols.push(`  ${exportPrefix}function ${fn.name}(${params})`);
    });

    // Add classes with methods
    classes.forEach(cls => {
      const exportPrefix = cls.exported ? 'export ' : '';
      compactSymbols.push(`  ${exportPrefix}class ${cls.name}`);
      
      const methods = fileSymbols.symbols.filter(s => s.scope === cls.name);
      methods.forEach(method => {
        const params = method.params?.join(', ') || '';
        compactSymbols.push(`    → ${method.name}(${params})`);
      });
    });

    // Add interfaces
    interfaces.forEach(iface => {
      const exportPrefix = iface.exported ? 'export ' : '';
      compactSymbols.push(`  ${exportPrefix}interface ${iface.name}`);
    });

    // Add type aliases
    types.forEach(type => {
      const exportPrefix = type.exported ? 'export ' : '';
      compactSymbols.push(`  ${exportPrefix}type ${type.name}`);
    });

    // Add important variables (exported ones)
    variables.filter(v => v.exported).forEach(variable => {
      compactSymbols.push(`  export ${variable.type} ${variable.name}`);
    });

    return {
      filePath: fileSymbols.filePath,
      symbols: compactSymbols,
      imports: fileSymbols.imports,
      exports: fileSymbols.exports
    };
  }

  /**
   * Format compact map as string (for LLM context)
   */
  formatCompactMap(compactMap: CompactMap, loc: number): string {
    let output = `## ${compactMap.filePath} (${loc} LOC)\n`;
    
    if (compactMap.imports.length > 0) {
      output += `  imports: [${compactMap.imports.join(', ')}]\n`;
    }
    
    if (compactMap.exports.length > 0) {
      output += `  exports: [${compactMap.exports.join(', ')}]\n`;
    }
    
    output += compactMap.symbols.join('\n');
    output += '\n';
    
    return output;
  }

  /**
   * Calculate compression ratio
   */
  calculateCompression(originalLOC: number, compactTokens: number): number {
    // Rough estimate: 1 LOC ≈ 20 tokens, compact symbol ≈ 5 tokens
    const originalTokens = originalLOC * 20;
    return originalTokens / compactTokens;
  }

  /**
   * Parse entire directory recursively
   */
  async parseDirectory(dirPath: string): Promise<FileSymbols[]> {
    const results: FileSymbols[] = [];
    const fullPath = path.join(this.projectRoot, dirPath);
    
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .git, dist, etc.
        if (['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
          continue;
        }
        
        // Recursive parse
        const subResults = await this.parseDirectory(entryPath);
        results.push(...subResults);
      } else if (entry.isFile()) {
        // Parse TypeScript/JavaScript files
        if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          try {
            const ast = await this.parseFile(entryPath);
            const symbols = this.extractSymbols(ast, entryPath);
            results.push(symbols);
          } catch (error) {
            console.warn(`Failed to parse ${entryPath}:`, error);
          }
        }
      }
    }
    
    return results;
  }
}

/**
 * Factory function
 */
export function createASTParser(projectRoot?: string): ASTParser {
  return new ASTParser(projectRoot);
}
