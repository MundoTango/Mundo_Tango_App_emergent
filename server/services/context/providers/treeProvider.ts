import { promises as fs } from 'fs';
import path from 'path';

export class TreeProvider {
  async provide(basePath: string = '.'): Promise<string> {
    const fullPath = path.join(process.cwd(), basePath);
    const tree = await this.buildTree(fullPath, '', 0, 3);
    return `@tree ${basePath}:\n\n${tree}`;
  }

  private async buildTree(dir: string, prefix: string, depth: number, maxDepth: number): Promise<string> {
    if (depth > maxDepth) return '';

    const entries = await fs.readdir(dir, { withFileTypes: true });
    const filtered = entries.filter(e => 
      !e.name.startsWith('.') && 
      e.name !== 'node_modules' && 
      e.name !== 'dist' &&
      e.name !== 'build'
    );

    let result = '';
    for (let i = 0; i < filtered.length; i++) {
      const entry = filtered[i];
      const isLast = i === filtered.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const icon = entry.isDirectory() ? '📁 ' : '📄 ';
      
      result += `${prefix}${connector}${icon}${entry.name}\n`;

      if (entry.isDirectory()) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        result += await this.buildTree(path.join(dir, entry.name), newPrefix, depth + 1, maxDepth);
      }
    }

    return result;
  }
}
