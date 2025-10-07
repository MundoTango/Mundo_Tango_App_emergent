import { 
  Document,
  VectorStoreIndex,
  SimpleDirectoryReader,
  storageContextFromDefaults,
  Settings
} from "llamaindex";

/**
 * LlamaIndex RAG Service (Phase 3)
 * ESA Layer 36 - Retrieval Augmented Generation for Life CEO agents
 * 
 * Features:
 * - Document ingestion and indexing
 * - Semantic search and retrieval
 * - RAG query processing
 * - Multi-document context management
 */

export class LlamaIndexService {
  private index: VectorStoreIndex | null = null;
  private initialized: boolean = false;
  private documentsPath: string;

  constructor(documentsPath: string = "./data/documents") {
    this.documentsPath = documentsPath;
  }

  isEnabled(): boolean {
    return this.initialized;
  }

  async initialize(): Promise<void> {
    try {
      // Configure LlamaIndex settings
      Settings.llm = undefined; // Will use OpenAI by default if OPENAI_API_KEY is set
      Settings.chunkSize = 512;
      Settings.chunkOverlap = 50;

      console.log(`✅ LlamaIndex RAG service initialized`);
      this.initialized = true;
    } catch (error) {
      console.error("❌ Failed to initialize LlamaIndex:", error);
      this.initialized = false;
      throw error;
    }
  }

  async loadDocuments(documentsPath?: string): Promise<Document[]> {
    try {
      const path = documentsPath || this.documentsPath;
      const reader = new SimpleDirectoryReader();
      const documents = await reader.loadData(path);
      console.log(`✅ Loaded ${documents.length} documents from ${path}`);
      return documents;
    } catch (error) {
      console.error("❌ Failed to load documents:", error);
      return [];
    }
  }

  async createIndex(documents: Document[]): Promise<VectorStoreIndex> {
    try {
      const storageContext = await storageContextFromDefaults({
        persistDir: "./data/llamaindex_storage",
      });

      this.index = await VectorStoreIndex.fromDocuments(documents, {
        storageContext,
      });

      console.log(`✅ Created index with ${documents.length} documents`);
      return this.index;
    } catch (error) {
      console.error("❌ Failed to create index:", error);
      throw error;
    }
  }

  async loadIndex(): Promise<VectorStoreIndex | null> {
    try {
      const storageContext = await storageContextFromDefaults({
        persistDir: "./data/llamaindex_storage",
      });

      this.index = await VectorStoreIndex.init({
        storageContext,
      });

      console.log("✅ Loaded existing index from storage");
      return this.index;
    } catch (error) {
      console.log("ℹ️  No existing index found, will create new one");
      return null;
    }
  }

  async query(queryText: string, topK: number = 5): Promise<string> {
    if (!this.index) {
      throw new Error("Index not initialized. Call createIndex() or loadIndex() first");
    }

    try {
      const queryEngine = this.index.asQueryEngine({
        similarityTopK: topK,
      });

      const response = await queryEngine.query({
        query: queryText,
      });

      return response.response;
    } catch (error) {
      console.error("❌ Query failed:", error);
      throw error;
    }
  }

  async addDocuments(documents: Document[]): Promise<void> {
    if (!this.index) {
      throw new Error("Index not initialized");
    }

    try {
      for (const doc of documents) {
        await this.index.insert(doc);
      }
      console.log(`✅ Added ${documents.length} documents to index`);
    } catch (error) {
      console.error("❌ Failed to add documents:", error);
      throw error;
    }
  }

  async retrieveRelevantDocs(
    queryText: string,
    topK: number = 5
  ): Promise<any[]> {
    if (!this.index) {
      throw new Error("Index not initialized");
    }

    try {
      const retriever = this.index.asRetriever({
        similarityTopK: topK,
      });

      const nodes = await retriever.retrieve(queryText);
      
      return nodes.map(node => ({
        text: node.node.getText(),
        score: node.score,
        metadata: node.node.metadata,
      }));
    } catch (error) {
      console.error("❌ Retrieval failed:", error);
      throw error;
    }
  }
}

export const llamaIndexService = new LlamaIndexService();
