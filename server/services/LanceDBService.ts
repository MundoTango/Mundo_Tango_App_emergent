import * as lancedb from "@lancedb/lancedb";
import { Table } from "@lancedb/lancedb";

/**
 * LanceDB Vector Storage Service
 * ESA Layer 26 - Local vector database for recommendations and semantic search
 * 
 * Features:
 * - Embedded vector database (no external server needed)
 * - Multimodal support (text, images, metadata)
 * - Zero-copy access for performance
 * - Automatic versioning
 */

export class LanceDBService {
  private db: any;
  private tables: Map<string, Table<any>> = new Map();
  private dbPath: string;

  constructor(dbPath: string = "./data/lancedb") {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    try {
      this.db = await lancedb.connect(this.dbPath);
      console.log(`✅ LanceDB initialized at ${this.dbPath}`);
    } catch (error) {
      console.error("❌ Failed to initialize LanceDB:", error);
      throw error;
    }
  }

  async createTable<T extends Record<string, any>>(
    name: string,
    data: T[],
    overwrite: boolean = false
  ): Promise<Table<T>> {
    try {
      const mode = overwrite ? "overwrite" : "create";
      const table = await this.db.createTable(name, data, { mode });
      this.tables.set(name, table);
      console.log(`✅ LanceDB table "${name}" created with ${data.length} records`);
      return table;
    } catch (error) {
      console.error(`❌ Failed to create table "${name}":`, error);
      throw error;
    }
  }

  async openTable<T extends Record<string, any>>(name: string): Promise<Table<T>> {
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
      
      return results as T[];
    } catch (error) {
      console.error(`❌ Vector search failed on "${tableName}":`, error);
      throw error;
    }
  }

  async listTables(): Promise<string[]> {
    try {
      const tableNames = await this.db.tableNames();
      return tableNames;
    } catch (error) {
      console.error("❌ Failed to list tables:", error);
      return [];
    }
  }

  async deleteTable(name: string): Promise<void> {
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
