import { promises as fs } from 'fs';
import path from 'path';

export class FolderProvider {
  async provide(folderPath: string): Promise<string> {
    const basePath = process.cwd();
    const fullPath = path.join(basePath, folderPath);

    const entries = await fs.readdir(fullPath, { recursive: true, withFileTypes: true });
    
    const files = entries
      .filter(e => e.isFile())
      .map(e => path.join(e.path, e.name).replace(basePath + '/', ''));

    return `@folder ${folderPath} (${files.length} files):\n\n${files.join('\n')}`;
  }
}
