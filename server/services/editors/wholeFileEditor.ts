import { promises as fs } from 'fs';
import path from 'path';

export interface WholeFileResult {
  success: boolean;
  filePath: string;
  bytesWritten: number;
  linesWritten: number;
  error?: string;
}

export class WholeFileEditor {
  private readonly MAX_FILE_SIZE = 10 * 1024;

  async replaceWholeFile(
    filePath: string,
    newContent: string,
    basePath: string = process.cwd()
  ): Promise<WholeFileResult> {
    try {
      const fullPath = path.join(basePath, filePath);
      
      const originalContent = await fs.readFile(fullPath, 'utf-8');
      
      if (originalContent.length > this.MAX_FILE_SIZE) {
        return {
          success: false,
          filePath,
          bytesWritten: 0,
          linesWritten: 0,
          error: `File too large for whole-file replacement (${originalContent.length} bytes > ${this.MAX_FILE_SIZE} limit)`
        };
      }
      
      await fs.writeFile(fullPath, newContent, 'utf-8');
      
      const bytesWritten = Buffer.byteLength(newContent, 'utf-8');
      const linesWritten = newContent.split('\n').length;
      
      return {
        success: true,
        filePath,
        bytesWritten,
        linesWritten
      };
    } catch (error) {
      return {
        success: false,
        filePath,
        bytesWritten: 0,
        linesWritten: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createNewFile(
    filePath: string,
    content: string,
    basePath: string = process.cwd()
  ): Promise<WholeFileResult> {
    try {
      const fullPath = path.join(basePath, filePath);
      
      const dirPath = path.dirname(fullPath);
      await fs.mkdir(dirPath, { recursive: true });
      
      await fs.writeFile(fullPath, content, 'utf-8');
      
      const bytesWritten = Buffer.byteLength(content, 'utf-8');
      const linesWritten = content.split('\n').length;
      
      return {
        success: true,
        filePath,
        bytesWritten,
        linesWritten
      };
    } catch (error) {
      return {
        success: false,
        filePath,
        bytesWritten: 0,
        linesWritten: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async previewWholeFile(
    filePath: string,
    newContent: string,
    basePath: string = process.cwd()
  ): Promise<{ before: string; after: string; stats: { oldLines: number; newLines: number; diff: number } }> {
    const fullPath = path.join(basePath, filePath);
    let before = '';
    
    try {
      before = await fs.readFile(fullPath, 'utf-8');
    } catch {
      before = '(new file)';
    }
    
    const oldLines = before === '(new file)' ? 0 : before.split('\n').length;
    const newLines = newContent.split('\n').length;
    
    return {
      before,
      after: newContent,
      stats: {
        oldLines,
        newLines,
        diff: newLines - oldLines
      }
    };
  }
}
