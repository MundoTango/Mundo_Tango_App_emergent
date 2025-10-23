/**
 * CODE MANIPULATION TOOLS - Advanced Code Operations
 * MB.MD SIMULTANEOUS - Agent #7: Tools Expansion Specialist
 * 
 * 10 Tools for AI to manipulate code:
 * 1. read_file - Read file contents
 * 2. write_file - Write/create file
 * 3. search_code - Search codebase for patterns
 * 4. replace_in_file - Replace text in file
 * 5. get_file_tree - Get directory structure
 * 6. run_command - Execute shell command
 * 7. install_package - Install npm package
 * 8. get_imports - List file imports
 * 9. find_usages - Find where symbol is used
 * 10. refactor_rename - Rename symbol across files
 * 
 * Created: October 23, 2025
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const codeToolSchemas = {
  read_file: {
    name: 'read_file',
    description: 'Read contents of a file',
    input_schema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Relative file path' }
      },
      required: ['filePath']
    }
  },

  write_file: {
    name: 'write_file',
    description: 'Write or create a file',
    input_schema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Relative file path' },
        content: { type: 'string', description: 'File content' }
      },
      required: ['filePath', 'content']
    }
  },

  search_code: {
    name: 'search_code',
    description: 'Search for pattern in codebase',
    input_schema: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'Search pattern/regex' },
        directory: { type: 'string', description: 'Directory to search (default: .)' },
        fileExtension: { type: 'string', description: 'File extension filter (e.g., .ts)' }
      },
      required: ['pattern']
    }
  },

  replace_in_file: {
    name: 'replace_in_file',
    description: 'Replace text in a file',
    input_schema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'File path' },
        searchText: { type: 'string', description: 'Text to find' },
        replaceText: { type: 'string', description: 'Replacement text' }
      },
      required: ['filePath', 'searchText', 'replaceText']
    }
  },

  get_file_tree: {
    name: 'get_file_tree',
    description: 'Get directory structure as tree',
    input_schema: {
      type: 'object',
      properties: {
        directory: { type: 'string', description: 'Root directory (default: .)' },
        maxDepth: { type: 'number', description: 'Max depth (default: 3)' }
      }
    }
  },

  run_command: {
    name: 'run_command',
    description: 'Execute a safe shell command',
    input_schema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to run (whitelisted)' }
      },
      required: ['command']
    }
  },

  install_package: {
    name: 'install_package',
    description: 'Install npm package',
    input_schema: {
      type: 'object',
      properties: {
        packageName: { type: 'string', description: 'Package name' },
        dev: { type: 'boolean', description: 'Install as dev dependency' }
      },
      required: ['packageName']
    }
  },

  get_imports: {
    name: 'get_imports',
    description: 'List all imports in a file',
    input_schema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'File path' }
      },
      required: ['filePath']
    }
  },

  find_usages: {
    name: 'find_usages',
    description: 'Find where a symbol/function is used',
    input_schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Symbol name to find' },
        directory: { type: 'string', description: 'Directory to search' }
      },
      required: ['symbol']
    }
  },

  refactor_rename: {
    name: 'refactor_rename',
    description: 'Rename symbol across multiple files',
    input_schema: {
      type: 'object',
      properties: {
        oldName: { type: 'string', description: 'Current symbol name' },
        newName: { type: 'string', description: 'New symbol name' },
        files: { 
          type: 'array',
          items: { type: 'string' },
          description: 'Files to update'
        }
      },
      required: ['oldName', 'newName', 'files']
    }
  }
};

const ALLOWED_COMMANDS = ['npm test', 'npm run build', 'npm run lint', 'git status', 'git diff'];

export const codeTools = {
  read_file: async (params: any) => {
    try {
      const content = await fs.readFile(params.filePath, 'utf-8');
      return {
        success: true,
        content,
        lines: content.split('\n').length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read file'
      };
    }
  },

  write_file: async (params: any) => {
    try {
      await fs.mkdir(path.dirname(params.filePath), { recursive: true });
      await fs.writeFile(params.filePath, params.content, 'utf-8');
      return {
        success: true,
        message: `File written: ${params.filePath}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to write file'
      };
    }
  },

  search_code: async (params: any) => {
    try {
      const dir = params.directory || '.';
      const results: string[] = [];

      // Simplified search (use grep in production)
      const files = await getAllFiles(dir);
      
      for (const file of files) {
        if (params.fileExtension && !file.endsWith(params.fileExtension)) {
          continue;
        }

        const content = await fs.readFile(file, 'utf-8');
        if (content.includes(params.pattern)) {
          results.push(file);
        }
      }

      return {
        success: true,
        matches: results,
        count: results.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  },

  replace_in_file: async (params: any) => {
    try {
      let content = await fs.readFile(params.filePath, 'utf-8');
      const originalContent = content;
      
      content = content.replace(new RegExp(params.searchText, 'g'), params.replaceText);
      
      if (content === originalContent) {
        return {
          success: false,
          error: 'Pattern not found in file'
        };
      }

      await fs.writeFile(params.filePath, content, 'utf-8');

      return {
        success: true,
        message: 'Text replaced successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Replace failed'
      };
    }
  },

  get_file_tree: async (params: any) => {
    try {
      const dir = params.directory || '.';
      const maxDepth = params.maxDepth || 3;
      
      const tree = await buildFileTree(dir, 0, maxDepth);

      return {
        success: true,
        tree
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get tree'
      };
    }
  },

  run_command: async (params: any) => {
    try {
      // Security: Only allow whitelisted commands
      if (!ALLOWED_COMMANDS.includes(params.command)) {
        return {
          success: false,
          error: `Command not allowed. Allowed: ${ALLOWED_COMMANDS.join(', ')}`
        };
      }

      const { stdout, stderr } = await execAsync(params.command);

      return {
        success: true,
        stdout,
        stderr
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Command failed'
      };
    }
  },

  install_package: async (params: any) => {
    try {
      const devFlag = params.dev ? '--save-dev' : '';
      const command = `npm install ${params.packageName} ${devFlag}`.trim();

      const { stdout } = await execAsync(command);

      return {
        success: true,
        message: `Installed ${params.packageName}`,
        output: stdout
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Installation failed'
      };
    }
  },

  get_imports: async (params: any) => {
    try {
      const content = await fs.readFile(params.filePath, 'utf-8');
      const importRegex = /import\s+.*\s+from\s+['"](.+)['"]/g;
      
      const imports: string[] = [];
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      return {
        success: true,
        imports,
        count: imports.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get imports'
      };
    }
  },

  find_usages: async (params: any) => {
    try {
      const dir = params.directory || '.';
      const usages: { file: string; line: number }[] = [];

      const files = await getAllFiles(dir);

      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          if (line.includes(params.symbol)) {
            usages.push({ file, line: index + 1 });
          }
        });
      }

      return {
        success: true,
        usages,
        count: usages.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Find usages failed'
      };
    }
  },

  refactor_rename: async (params: any) => {
    try {
      let updatedCount = 0;

      for (const file of params.files) {
        let content = await fs.readFile(file, 'utf-8');
        const originalContent = content;

        content = content.replace(
          new RegExp(`\\b${params.oldName}\\b`, 'g'),
          params.newName
        );

        if (content !== originalContent) {
          await fs.writeFile(file, content, 'utf-8');
          updatedCount++;
        }
      }

      return {
        success: true,
        message: `Renamed ${params.oldName} to ${params.newName} in ${updatedCount} files`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refactor failed'
      };
    }
  }
};

// Helper functions
async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.name === 'node_modules' || entry.name === '.git') continue;

    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function buildFileTree(dir: string, depth: number, maxDepth: number): Promise<any> {
  if (depth >= maxDepth) return null;

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const tree: any = {};

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;

    if (entry.isDirectory()) {
      tree[entry.name] = await buildFileTree(path.join(dir, entry.name), depth + 1, maxDepth);
    } else {
      tree[entry.name] = 'file';
    }
  }

  return tree;
}
