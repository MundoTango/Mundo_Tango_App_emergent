import { promises as fs } from 'fs';
import path from 'path';

export const FILE_OPERATION_TOOLS = [
  {
    name: 'read_file',
    description: 'Read contents of a file',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to file' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'write_file',
    description: 'Write content to a file',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to file' },
        content: { type: 'string', description: 'Content to write' }
      },
      required: ['filePath', 'content']
    }
  },
  {
    name: 'edit_file',
    description: 'Edit a file using search/replace',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to file' },
        search: { type: 'string', description: 'Text to find' },
        replace: { type: 'string', description: 'Replacement text' }
      },
      required: ['filePath', 'search', 'replace']
    }
  },
  {
    name: 'delete_file',
    description: 'Delete a file',
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to file' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'move_file',
    description: 'Move or rename a file',
    parameters: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Source path' },
        to: { type: 'string', description: 'Destination path' }
      },
      required: ['from', 'to']
    }
  },
  {
    name: 'copy_file',
    description: 'Copy a file',
    parameters: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Source path' },
        to: { type: 'string', description: 'Destination path' }
      },
      required: ['from', 'to']
    }
  },
  {
    name: 'create_directory',
    description: 'Create a directory',
    parameters: {
      type: 'object',
      properties: {
        dirPath: { type: 'string', description: 'Directory path' }
      },
      required: ['dirPath']
    }
  },
  {
    name: 'delete_directory',
    description: 'Delete a directory',
    parameters: {
      type: 'object',
      properties: {
        dirPath: { type: 'string', description: 'Directory path' }
      },
      required: ['dirPath']
    }
  },
  {
    name: 'list_files',
    description: 'List files in a directory',
    parameters: {
      type: 'object',
      properties: {
        dirPath: { type: 'string', description: 'Directory path' },
        recursive: { type: 'boolean', description: 'List recursively', default: false }
      },
      required: ['dirPath']
    }
  },
  {
    name: 'search_files',
    description: 'Search for files by pattern',
    parameters: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'Glob pattern' },
        basePath: { type: 'string', description: 'Base directory', default: '.' }
      },
      required: ['pattern']
    }
  }
];

export async function executeFileOperation(name: string, args: any): Promise<any> {
  const basePath = process.cwd();

  switch (name) {
    case 'read_file':
      return await fs.readFile(path.join(basePath, args.filePath), 'utf-8');
    
    case 'write_file':
      await fs.mkdir(path.dirname(path.join(basePath, args.filePath)), { recursive: true });
      await fs.writeFile(path.join(basePath, args.filePath), args.content, 'utf-8');
      return { success: true, filePath: args.filePath };
    
    case 'edit_file':
      const content = await fs.readFile(path.join(basePath, args.filePath), 'utf-8');
      const newContent = content.replace(args.search, args.replace);
      await fs.writeFile(path.join(basePath, args.filePath), newContent, 'utf-8');
      return { success: true, filePath: args.filePath };
    
    case 'delete_file':
      await fs.unlink(path.join(basePath, args.filePath));
      return { success: true, filePath: args.filePath };
    
    case 'move_file':
      await fs.rename(path.join(basePath, args.from), path.join(basePath, args.to));
      return { success: true, from: args.from, to: args.to };
    
    case 'copy_file':
      await fs.copyFile(path.join(basePath, args.from), path.join(basePath, args.to));
      return { success: true, from: args.from, to: args.to };
    
    case 'create_directory':
      await fs.mkdir(path.join(basePath, args.dirPath), { recursive: true });
      return { success: true, dirPath: args.dirPath };
    
    case 'delete_directory':
      await fs.rm(path.join(basePath, args.dirPath), { recursive: true });
      return { success: true, dirPath: args.dirPath };
    
    case 'list_files':
      const files = await fs.readdir(path.join(basePath, args.dirPath), { recursive: args.recursive });
      return { files };
    
    case 'search_files':
      const { glob } = await import('glob');
      const matches = await glob(args.pattern, { cwd: path.join(basePath, args.basePath || '.') });
      return { files: matches };
    
    default:
      throw new Error(`Unknown file operation: ${name}`);
  }
}
