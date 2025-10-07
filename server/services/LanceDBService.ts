import { connect, Connection, Table } from "@lancedb/lancedb";

/**
 * LanceDB Vector Storage Service (Phase 3)
 * ESA Layer 26 - Local vector database for recommendations and semantic search
 * 
 * Features:
 * - Embedded vector database (no external server needed)
 * - Multimodal support (text, images, metadata)
 * - Zero-copy access for performance
 * - Automatic versioning
 * - Updated to @lancedb/lancedb (latest SDK)
 */

export class LanceDBService {
  private db: Connection | null = null;
  private tables: Map<string, Table<any>> = new Map();
  private dbPath: string;
  private initialized: boolean = false;

  constructor(dbPath: string = "./data/lancedb") {
    this.dbPath = dbPath;
  }

  isEnabled(): boolean {
    return this.initialized;
  }

  async initialize(): Promise<void> {
    try {
      this.db = await connect(this.dbPath);
      this.initialized = true;
      console.log(`✅ LanceDB initialized at ${this.dbPath}`);
    } catch (error) {
      console.error("❌ Failed to initialize LanceDB:", error);
      this.initialized = false;
      throw error;
    }
  }

  async createTable<T extends Record<string, any>>(
    name: string,
    data: T[],
    overwrite: boolean = false
  ): Promise<Table<T>> {
    if (!this.db) throw new Error("LanceDB not initialized");
    
    try {
      const mode = overwrite ? "overwrite" : "create";
      const table = await this.db.createTable({ name, data, mode });
      this.tables.set(name, table);
      console.log(`✅ LanceDB table "${name}" created with ${data.length} records`);
      return table;
    } catch (error) {
      console.error(`❌ Failed to create table "${name}":`, error);
      throw error;
    }
  }

  async openTable<T extends Record<string, any>>(name: string): Promise<Table<T>> {
    if (!this.db) throw new Error("LanceDB not initialized");
    
    if (this.tables.has(name)) {
      return this.tables.get(name) as Table<T>;
    }

    try {
      const table = await this.db.openTable(name);
      this.tables.set(name, table);
      return table;
    } catch (error) {
      console.error(`❌ Failed to open table "${name}":`, error);
      throw error;
    }
  }

  async addRecords<T extends Record<string, any>>(
    tableName: string,
    data: T[]
  ): Promise<void> {
    try {
      const table = await this.openTable(tableName);
      await table.add(data);
      console.log(`✅ Added ${data.length} records to "${tableName}"`);
    } catch (error) {
      console.error(`❌ Failed to add records to "${tableName}":`, error);
      throw error;
    }
  }

  async vectorSearch<T extends Record<string, any>>(
    tableName: string,
    queryVector: number[],
    limit: number = 10
  ): Promise<T[]> {
    try {
      const table = await this.openTable<T>(tableName);
      const results = await table
        .vectorSearch(queryVector)
        .limit(limit)
        .toArray();
      
      return results;
    } catch (error) {
      console.error(`❌ Vector search failed on "${tableName}":`, error);
      throw error;
    }
  }

  async listTables(): Promise<string[]> {
    if (!this.db) return [];
    
    try {
      const tableNames = await this.db.tableNames();
      return tableNames;
    } catch (error) {
      console.error("❌ Failed to list tables:", error);
      return [];
    }
  }

  async deleteTable(name: string): Promise<void> {
    if (!this.db) throw new Error("LanceDB not initialized");
    
    try {
      await this.db.dropTable(name);
      this.tables.delete(name);
      console.log(`✅ Deleted table "${name}"`);
    } catch (error) {
      console.error(`❌ Failed to delete table "${name}":`, error);
      throw error;
    }
  }
}

export const lanceDBService = new LanceDBService();
