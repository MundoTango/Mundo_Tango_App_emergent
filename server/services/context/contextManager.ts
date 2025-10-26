import { CodebaseProvider } from './providers/codebaseProvider';
import { FolderProvider } from './providers/folderProvider';
import { TreeProvider } from './providers/treeProvider';
import { SearchProvider } from './providers/searchProvider';
import { DiffProvider } from './providers/diffProvider';

export interface ContextRequest {
  type: 'codebase' | 'folder' | 'tree' | 'search' | 'diff' | 'docs';
  query?: string;
  options?: any;
}

export class ContextManager {
  private providers: Map<string, any> = new Map();

  constructor() {
    this.providers.set('codebase', new CodebaseProvider());
    this.providers.set('folder', new FolderProvider());
    this.providers.set('tree', new TreeProvider());
    this.providers.set('search', new SearchProvider());
    this.providers.set('diff', new DiffProvider());
  }

  async getContext(request: ContextRequest): Promise<string> {
    const provider = this.providers.get(request.type);
    
    if (!provider) {
      throw new Error(`Unknown context type: ${request.type}`);
    }

    return await provider.provide(request.query || '', request.options);
  }

  async getMultipleContexts(requests: ContextRequest[]): Promise<string[]> {
    return await Promise.all(
      requests.map(req => this.getContext(req))
    );
  }

  parseContextMentions(text: string): ContextRequest[] {
    const requests: ContextRequest[] = [];
    const regex = /@(\w+)(?:\s+([^\s]+))?/g;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      const type = match[1] as any;
      const query = match[2];
      
      if (['codebase', 'folder', 'tree', 'search', 'diff', 'docs'].includes(type)) {
        requests.push({ type, query });
      }
    }
    
    return requests;
  }
}
