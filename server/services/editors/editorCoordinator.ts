import { UnifiedDiffEditor, DiffResult } from './unifiedDiffEditor';
import { SearchReplaceEditor, SearchReplaceBlock, SearchReplaceResult } from './searchReplaceEditor';
import { WholeFileEditor, WholeFileResult } from './wholeFileEditor';
import { promises as fs } from 'fs';
import path from 'path';

export type EditorMode = 'unified-diff' | 'search-replace' | 'whole-file' | 'diff-fenced';

export interface EditorRequest {
  mode: EditorMode;
  filePath: string;
  content: string;
  basePath?: string;
}

export type EditorResult = DiffResult | SearchReplaceResult | WholeFileResult;

export class EditorCoordinator {
  private unifiedDiffEditor: UnifiedDiffEditor;
  private searchReplaceEditor: SearchReplaceEditor;
  private wholeFileEditor: WholeFileEditor;

  constructor() {
    this.unifiedDiffEditor = new UnifiedDiffEditor();
    this.searchReplaceEditor = new SearchReplaceEditor();
    this.wholeFileEditor = new WholeFileEditor();
  }

  private validateFilePath(filePath: string, basePath: string): string {
    const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.resolve(basePath, normalized);
    
    if (!fullPath.startsWith(basePath)) {
      throw new Error(`Path traversal detected: ${filePath}`);
    }
    
    return normalized;
  }

  async applyEdit(request: EditorRequest): Promise<EditorResult> {
    const basePath = request.basePath || process.cwd();
    const safeFilePath = this.validateFilePath(request.filePath, basePath);
    request.filePath = safeFilePath;

    switch (request.mode) {
      case 'unified-diff':
      case 'diff-fenced':
        return this.unifiedDiffEditor.applyUnifiedDiff(
          request.filePath,
          request.content,
          basePath
        );

      case 'search-replace': {
        const blocks = this.searchReplaceEditor.parseSearchReplaceBlocks(request.content);
        return this.searchReplaceEditor.applySearchReplace(
          request.filePath,
          blocks,
          basePath
        );
      }

      case 'whole-file':
        return this.wholeFileEditor.replaceWholeFile(
          request.filePath,
          request.content,
          basePath
        );

      default:
        throw new Error(`Unknown editor mode: ${request.mode}`);
    }
  }

  async previewEdit(request: EditorRequest): Promise<{ before: string; after: string; mode: EditorMode }> {
    const basePath = request.basePath || process.cwd();

    let preview;
    switch (request.mode) {
      case 'unified-diff':
      case 'diff-fenced':
        preview = await this.unifiedDiffEditor.previewDiff(
          request.filePath,
          request.content,
          basePath
        );
        break;

      case 'search-replace': {
        const blocks = this.searchReplaceEditor.parseSearchReplaceBlocks(request.content);
        preview = await this.searchReplaceEditor.previewSearchReplace(
          request.filePath,
          blocks,
          basePath
        );
        break;
      }

      case 'whole-file':
        preview = await this.wholeFileEditor.previewWholeFile(
          request.filePath,
          request.content,
          basePath
        );
        break;

      default:
        throw new Error(`Unknown editor mode: ${request.mode}`);
    }

    return {
      ...preview,
      mode: request.mode
    };
  }

  selectBestMode(modelName: string): EditorMode {
    const lowerModel = modelName.toLowerCase();

    if (lowerModel.includes('gpt-4-turbo') || lowerModel.includes('gpt-4') && lowerModel.includes('preview')) {
      return 'unified-diff';
    }

    if (lowerModel.includes('claude-3-opus') || lowerModel.includes('claude-3.7') || 
        lowerModel.includes('gpt-4') || lowerModel.includes('deepseek')) {
      return 'search-replace';
    }

    if (lowerModel.includes('gemini')) {
      return 'diff-fenced';
    }

    if (lowerModel.includes('gpt-3.5') || lowerModel.includes('sonnet-3.5')) {
      return 'whole-file';
    }

    return 'search-replace';
  }

  async applyBatchEdits(
    requests: EditorRequest[]
  ): Promise<{ results: EditorResult[]; successCount: number; failureCount: number }> {
    const backups: Map<string, string> = new Map();
    const newFiles: Set<string> = new Set();
    const basePath = requests[0]?.basePath || process.cwd();
    
    try {
      for (const req of requests) {
        const safeFilePath = this.validateFilePath(req.filePath, basePath);
        const fullPath = path.join(basePath, safeFilePath);
        try {
          const originalContent = await fs.readFile(fullPath, 'utf-8');
          backups.set(safeFilePath, originalContent);
        } catch {
          newFiles.add(safeFilePath);
        }
      }
      
      const results: EditorResult[] = [];
      for (const req of requests) {
        try {
          const result = await this.applyEdit(req);
          results.push(result);
          if (!result.success) {
            throw new Error(`Edit failed for ${req.filePath}: ${result.error}`);
          }
        } catch (error) {
          throw new Error(`Batch edit failed at ${req.filePath}, rolling back all changes`);
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      return { results, successCount, failureCount };
    } catch (error) {
      console.error('[EditorCoordinator] Batch edit failed, rolling back...', error);
      
      for (const [filePath, originalContent] of backups.entries()) {
        try {
          await fs.writeFile(path.join(basePath, filePath), originalContent, 'utf-8');
          console.log(`[EditorCoordinator] ✅ Restored ${filePath}`);
        } catch (rollbackError) {
          console.error(`[EditorCoordinator] ❌ Restore failed for ${filePath}:`, rollbackError);
        }
      }
      
      for (const filePath of newFiles) {
        try {
          await fs.unlink(path.join(basePath, filePath));
          console.log(`[EditorCoordinator] ✅ Deleted new file ${filePath}`);
        } catch (deleteError) {
          console.error(`[EditorCoordinator] ❌ Delete failed for ${filePath}:`, deleteError);
        }
      }
      
      throw error;
    }
  }
}
