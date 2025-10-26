import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

export interface SymbolInfo {
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'const' | 'variable';
  filePath: string;
  line: number;
  signature?: string;
}

export interface DependencyInfo {
  filePath: string;
  imports: string[];
  exports: string[];
}

export interface RepoMap {
  symbols: SymbolInfo[];
  dependencies: DependencyInfo[];
  totalFiles: number;
  totalLines: number;
  indexedAt: Date;
}

export class RepositoryMapper {
  private symbolCache: Map<string, SymbolInfo[]> = new Map();
  private dependencyCache: Map<string, DependencyInfo> = new Map();
  private lastIndexed: Date | null = null;
  private repoMapCache: RepoMap | null = null;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  async indexRepository(basePath: string = process.cwd(), forceRefresh: boolean = false): Promise<RepoMap> {
    if (!forceRefresh && this.repoMapCache && this.lastIndexed) {
      const age = Date.now() - this.lastIndexed.getTime();
      if (age < this.CACHE_TTL_MS) {
        console.log(`[RepoMapper] Using cached index (${Math.round(age / 1000)}s old)`);
        return this.repoMapCache;
      }
    }
    const startTime = Date.now();
    
    const files = await glob('**/*.{ts,tsx,js,jsx}', {
      cwd: basePath,
      ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**', 'coverage/**']
    });

    const allSymbols: SymbolInfo[] = [];
    const allDependencies: DependencyInfo[] = [];
    let totalLines = 0;

    const batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (file) => {
          try {
            const fullPath = path.join(basePath, file);
            const content = await fs.readFile(fullPath, 'utf-8');
            totalLines += content.split('\n').length;

            const symbols = await this.extractSymbols(file, content);
            const deps = await this.extractDependencies(file, content);

            this.symbolCache.set(file, symbols);
            this.dependencyCache.set(file, deps);

            allSymbols.push(...symbols);
            allDependencies.push(deps);
          } catch (error) {
            console.warn(`[RepoMapper] Failed to parse ${file}:`, error);
          }
        })
      );
    }

    const elapsed = Date.now() - startTime;
    console.log(`[RepoMapper] Indexed ${files.length} files (${totalLines} LOC) in ${elapsed}ms`);

    this.repoMapCache = {
      symbols: allSymbols,
      dependencies: allDependencies,
      totalFiles: files.length,
      totalLines,
      indexedAt: new Date()
    };
    this.lastIndexed = new Date();

    return this.repoMapCache;
  }

  async extractSymbols(filePath: string, content: string): Promise<SymbolInfo[]> {
    const symbols: SymbolInfo[] = [];
    const getFunctionSignature = this.getFunctionSignature.bind(this);

    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });

      traverse(ast, {
        FunctionDeclaration(path) {
          if (path.node.id) {
            symbols.push({
              name: path.node.id.name,
              type: 'function',
              filePath,
              line: path.node.loc?.start.line || 0,
              signature: getFunctionSignature(path.node)
            });
          }
        },
        ClassDeclaration(path) {
          if (path.node.id) {
            symbols.push({
              name: path.node.id.name,
              type: 'class',
              filePath,
              line: path.node.loc?.start.line || 0
            });
          }
        },
        TSInterfaceDeclaration(path) {
          symbols.push({
            name: path.node.id.name,
            type: 'interface',
            filePath,
            line: path.node.loc?.start.line || 0
          });
        },
        TSTypeAliasDeclaration(path) {
          symbols.push({
            name: path.node.id.name,
            type: 'type',
            filePath,
            line: path.node.loc?.start.line || 0
          });
        },
        VariableDeclarator(path) {
          if (path.node.id.type === 'Identifier' && path.parent.type === 'VariableDeclaration' && path.parent.kind === 'const') {
            symbols.push({
              name: path.node.id.name,
              type: 'const',
              filePath,
              line: path.node.loc?.start.line || 0
            });
          }
        }
      });
    } catch (error) {
      console.warn(`[RepoMapper] Parse error in ${filePath}`);
    }

    return symbols;
  }

  async extractDependencies(filePath: string, content: string): Promise<DependencyInfo> {
    const imports: string[] = [];
    const exports: string[] = [];

    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });

      traverse(ast, {
        ImportDeclaration(path) {
          imports.push(path.node.source.value);
        },
        ExportNamedDeclaration(path) {
          if (path.node.source) {
            exports.push(path.node.source.value);
          }
        },
        ExportAllDeclaration(path) {
          exports.push(path.node.source.value);
        }
      });
    } catch (error) {
      console.warn(`[RepoMapper] Dependency extraction error in ${filePath}`);
    }

    return { filePath, imports, exports };
  }

  private getFunctionSignature(node: any): string {
    const params = node.params.map((p: any) => {
      if (p.type === 'Identifier') return p.name;
      return '_';
    }).join(', ');
    return `(${params})`;
  }

  async findSymbol(name: string): Promise<SymbolInfo[]> {
    const results: SymbolInfo[] = [];
    
    for (const symbols of this.symbolCache.values()) {
      results.push(...symbols.filter(s => s.name.includes(name)));
    }
    
    return results;
  }

  async findDependenciesOf(filePath: string): Promise<string[]> {
    const deps = this.dependencyCache.get(filePath);
    return deps?.imports || [];
  }

  async findDependentsOf(filePath: string): Promise<string[]> {
    const dependents: string[] = [];
    
    for (const [file, deps] of this.dependencyCache.entries()) {
      if (deps.imports.some(imp => imp.includes(filePath))) {
        dependents.push(file);
      }
    }
    
    return dependents;
  }

  compressToContext(symbols: SymbolInfo[], maxTokens: number = 50000): string {
    const lines: string[] = [];
    let currentTokens = 0;

    for (const symbol of symbols) {
      const line = `${symbol.filePath}:${symbol.line} ${symbol.type} ${symbol.name}${symbol.signature || ''}`;
      const tokens = line.length / 4;
      
      if (currentTokens + tokens > maxTokens) break;
      
      lines.push(line);
      currentTokens += tokens;
    }

    return lines.join('\n');
  }
}
