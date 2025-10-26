import { RepositoryMapper } from '../repositoryMapper';

export class CodebaseProvider {
  private repoMapper: RepositoryMapper;

  constructor() {
    this.repoMapper = new RepositoryMapper();
  }

  async provide(query: string, options: { nRetrieve?: number; nFinal?: number } = {}): Promise<string> {
    const { nRetrieve = 25, nFinal = 5 } = options;

    const repoMap = await this.repoMapper.indexRepository(process.cwd(), false);
    
    const relevantSymbols = repoMap.symbols
      .filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, nRetrieve);

    const compressed = this.repoMapper.compressToContext(relevantSymbols.slice(0, nFinal));

    return `@codebase context (${relevantSymbols.length} symbols found):\n\n${compressed}`;
  }
}
