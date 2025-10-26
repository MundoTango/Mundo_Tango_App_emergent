import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class DiffProvider {
  async provide(options: { ref?: string; files?: string[] } = {}): Promise<string> {
    const { ref = 'HEAD', files = [] } = options;

    try {
      const filesArg = files.length > 0 ? files.join(' ') : '';
      const command = `git diff ${ref} ${filesArg}`;
      
      const { stdout } = await execAsync(command, { cwd: process.cwd() });
      
      return `@diff (${ref}):\n\n${stdout}`;
    } catch (error) {
      return `@diff: No changes or git not available`;
    }
  }
}
