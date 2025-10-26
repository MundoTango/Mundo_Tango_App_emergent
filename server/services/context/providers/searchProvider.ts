import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class SearchProvider {
  async provide(query: string, options: { type?: string; maxResults?: number } = {}): Promise<string> {
    const { type, maxResults = 20 } = options;

    try {
      const typeArg = type ? `-t ${type}` : '';
      const command = `rg "${query}" ${typeArg} --heading --line-number --max-count ${maxResults}`;
      
      const { stdout } = await execAsync(command, { cwd: process.cwd() });
      
      return `@search "${query}" (ripgrep results):\n\n${stdout}`;
    } catch (error) {
      return `@search "${query}": No results found`;
    }
  }
}
