import * as esbuild from 'esbuild';
import { createHash } from 'crypto';

export interface PreviewOptions {
  code: string;
  framework: 'react' | 'vue' | 'vanilla';
  dependencies?: Record<string, string>;
}

export interface PreviewResult {
  html: string;
  css: string;
  js: string;
  error?: string;
}

export class EnhancedVisualPreviewAgent {
  private cache: Map<string, PreviewResult> = new Map();

  async generateInteractivePreview(options: PreviewOptions): Promise<PreviewResult> {
    const { code, framework, dependencies = {} } = options;

    // Cache key based on code hash
    const cacheKey = this.getCacheKey(code, framework);
    if (this.cache.has(cacheKey)) {
      console.log('📦 Using cached preview');
      return this.cache.get(cacheKey)!;
    }

    try {
      console.log('🎨 Generating preview...');

      // Compile code with esbuild
      const compiled = await this.compileCode(code, framework);
      
      // Extract CSS if present
      const css = this.extractCSS(code);
      
      // Generate preview HTML
      const html = this.generatePreviewHTML(compiled, framework, css);

      const result: PreviewResult = {
        html,
        css,
        js: compiled
      };

      // Cache result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error: any) {
      return {
        html: '',
        css: '',
        js: '',
        error: error.message
      };
    }
  }

  private async compileCode(code: string, framework: string): Promise<string> {
    const result = await esbuild.build({
      stdin: {
        contents: code,
        loader: framework === 'react' ? 'tsx' : 'ts',
        resolveDir: process.cwd()
      },
      bundle: true,
      format: 'iife',
      globalName: 'Preview',
      write: false,
      minify: false,
      target: 'es2020',
      jsx: 'automatic',
      jsxImportSource: 'react',
      external: ['react', 'react-dom'],
      define: {
        'process.env.NODE_ENV': '"development"'
      }
    });

    return result.outputFiles[0].text;
  }

  private extractCSS(code: string): string {
    // Extract CSS from template literals or style tags
    const cssRegex = /`([^`]*(?:\.[\w-]+|#[\w-]+)[^`]*)`|css`([^`]+)`/g;
    const matches = code.match(cssRegex);
    
    if (!matches) return '';
    
    return matches
      .map(m => m.replace(/`|css`/g, '').trim())
      .join('\n');
  }

  private generatePreviewHTML(compiledJS: string, framework: string, css: string): string {
    const baseHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style id="preview-styles">
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    ${css}
  </style>
</head>
<body>
  <div id="root"></div>
  ${this.getFrameworkScript(framework)}
  <script type="module">
    ${compiledJS}
  </script>
</body>
</html>`;

    return baseHTML;
  }

  private getFrameworkScript(framework: string): string {
    switch (framework) {
      case 'react':
        return `
          <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        `;
      case 'vue':
        return `
          <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
        `;
      default:
        return '';
    }
  }

  private getCacheKey(code: string, framework: string): string {
    return createHash('md5')
      .update(`${code}-${framework}`)
      .digest('hex');
  }

  async generateComponentPreview(componentCode: string): Promise<string> {
    const preview = await this.generateInteractivePreview({
      code: componentCode,
      framework: 'react'
    });

    if (preview.error) {
      return `<div style="color: red;">Error: ${preview.error}</div>`;
    }

    return preview.html;
  }

  clearCache() {
    this.cache.clear();
  }
}

export const enhancedPreviewAgent = new EnhancedVisualPreviewAgent();
