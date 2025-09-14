// ESA LIFE CEO 61x21 - Graph Database Service (Layer 47: Advanced AI Features)
import { Pool } from 'pg';
import { redisClient } from '../services/cache';
import { EventEmitter } from 'events';

export interface GraphNode {
  id: string;
  type: string;
  properties: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface GraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
  weight: number;
  properties: Record<string, any>;
  created_at: Date;
}

export interface GraphQuery {
  startNode?: string;
  endNode?: string;
  depth?: number;
  edgeTypes?: string[];
  nodeTypes?: string[];
  filters?: Record<string, any>;
  limit?: number;
}

export interface GraphPath {
  nodes: GraphNode[];
  edges: GraphEdge[];
  weight: number;
  length: number;
}

export interface GraphCluster {
  id: string;
  nodes: string[];
  centroid: string;
  density: number;
  metadata: Record<string, any>;
}

export class GraphDatabaseService extends EventEmitter {
  private pool: Pool;
  private nodeCache: Map<string, GraphNode> = new Map();
  private edgeCache: Map<string, GraphEdge> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map();
  private reverseAdjacencyList: Map<string, Set<string>> = new Map();
  private clusters: Map<string, GraphCluster> = new Map();

  constructor(pool: Pool) {
    super();
    this.pool = pool;
    this.initializeService();
  }

  private async initializeService() {
    // Create graph tables if not exist
    await this.createGraphTables();
    
    // Load graph into memory
    await this.loadGraph();
    
    // Start background processes
    this.startGraphMaintenance();
    
    console.log('✅ Graph Database Service initialized');
  }

  private async createGraphTables() {
    try {
      // Create nodes table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS graph_nodes (
          id VARCHAR(255) PRIMARY KEY,
          type VARCHAR(100) NOT NULL,
          properties JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_graph_nodes_type ON graph_nodes(type);
        CREATE INDEX IF NOT EXISTS idx_graph_nodes_properties ON graph_nodes USING GIN(properties);
      `);

      // Create edges table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS graph_edges (
          id VARCHAR(255) PRIMARY KEY,
          source_id VARCHAR(255) NOT NULL,
          target_id VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          weight FLOAT DEFAULT 1.0,
          properties JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (source_id) REFERENCES graph_nodes(id) ON DELETE CASCADE,
          FOREIGN KEY (target_id) REFERENCES graph_nodes(id) ON DELETE CASCADE
        );
        
        CREATE INDEX IF NOT EXISTS idx_graph_edges_source ON graph_edges(source_id);
        CREATE INDEX IF NOT EXISTS idx_graph_edges_target ON graph_edges(target_id);
        CREATE INDEX IF NOT EXISTS idx_graph_edges_type ON graph_edges(type);
      `);

      // Create clusters table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS graph_clusters (
          id VARCHAR(255) PRIMARY KEY,
          node_ids TEXT[],
          centroid VARCHAR(255),
          density FLOAT,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
    } catch (error) {
      console.error('Error creating graph tables:', error);
    }
  }

  private async loadGraph() {
    try {
      // Load nodes
      const nodesResult = await this.pool.query('SELECT * FROM graph_nodes');
      nodesResult.rows.forEach(row => {
        const node: GraphNode = {
          id: row.id,
          type: row.type,
          properties: row.properties,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
        this.nodeCache.set(node.id, node);
        
        // Initialize adjacency lists
        if (!this.adjacencyList.has(node.id)) {
          this.adjacencyList.set(node.id, new Set());
        }
        if (!this.reverseAdjacencyList.has(node.id)) {
          this.reverseAdjacencyList.set(node.id, new Set());
        }
      });

      // Load edges
      const edgesResult = await this.pool.query('SELECT * FROM graph_edges');
      edgesResult.rows.forEach(row => {
        const edge: GraphEdge = {
          id: row.id,
          source_id: row.source_id,
          target_id: row.target_id,
          type: row.type,
          weight: row.weight,
          properties: row.properties,
          created_at: row.created_at
        };
        this.edgeCache.set(edge.id, edge);
        
        // Update adjacency lists
        this.adjacencyList.get(edge.source_id)?.add(edge.target_id);
        this.reverseAdjacencyList.get(edge.target_id)?.add(edge.source_id);
      });

      // Load clusters
      const clustersResult = await this.pool.query('SELECT * FROM graph_clusters');
      clustersResult.rows.forEach(row => {
        const cluster: GraphCluster = {
          id: row.id,
          nodes: row.node_ids,
          centroid: row.centroid,
          density: row.density,
          metadata: row.metadata
        };
        this.clusters.set(cluster.id, cluster);
      });

      console.log(`📊 Loaded ${this.nodeCache.size} nodes, ${this.edgeCache.size} edges, ${this.clusters.size} clusters`);
    } catch (error) {
      console.error('Error loading graph:', error);
    }
  }

  // Node Operations
  public async createNode(type: string, properties: Record<string, any>): Promise<GraphNode> {
    const id = `node_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const node: GraphNode = {
      id,
      type,
      properties,
      created_at: new Date(),
      updated_at: new Date()
    };

    try {
      await this.pool.query(
        'INSERT INTO graph_nodes (id, type, properties) VALUES ($1, $2, $3)',
        [node.id, node.type, JSON.stringify(node.properties)]
      );

      this.nodeCache.set(node.id, node);
      this.adjacencyList.set(node.id, new Set());
      this.reverseAdjacencyList.set(node.id, new Set());

      this.emit('node-created', node);
      return node;
    } catch (error) {
      console.error('Error creating node:', error);
      throw error;
    }
  }

  public async updateNode(nodeId: string, updates: Partial<GraphNode>): Promise<GraphNode | null> {
    const node = this.nodeCache.get(nodeId);
    if (!node) return null;

    const updatedNode = {
      ...node,
      ...updates,
      updated_at: new Date()
    };

    try {
      await this.pool.query(
        'UPDATE graph_nodes SET type = $2, properties = $3, updated_at = NOW() WHERE id = $1',
        [nodeId, updatedNode.type, JSON.stringify(updatedNode.properties)]
      );

      this.nodeCache.set(nodeId, updatedNode);
      this.emit('node-updated', updatedNode);
      return updatedNode;
    } catch (error) {
      console.error('Error updating node:', error);
      throw error;
    }
  }

  public async deleteNode(nodeId: string): Promise<boolean> {
    try {
      await this.pool.query('DELETE FROM graph_nodes WHERE id = $1', [nodeId]);
      
      this.nodeCache.delete(nodeId);
      this.adjacencyList.delete(nodeId);
      this.reverseAdjacencyList.delete(nodeId);
      
      // Remove edges referencing this node
      const edgesToRemove: string[] = [];
      this.edgeCache.forEach((edge, edgeId) => {
        if (edge.source_id === nodeId || edge.target_id === nodeId) {
          edgesToRemove.push(edgeId);
        }
      });
      
      edgesToRemove.forEach(edgeId => this.edgeCache.delete(edgeId));
      
      this.emit('node-deleted', nodeId);
      return true;
    } catch (error) {
      console.error('Error deleting node:', error);
      return false;
    }
  }

  public getNode(nodeId: string): GraphNode | undefined {
    return this.nodeCache.get(nodeId);
  }

  public getNodesByType(type: string): GraphNode[] {
    const nodes: GraphNode[] = [];
    this.nodeCache.forEach(node => {
      if (node.type === type) {
        nodes.push(node);
      }
    });
    return nodes;
  }

  // Edge Operations
  public async createEdge(
    sourceId: string,
    targetId: string,
    type: string,
    weight: number = 1.0,
    properties: Record<string, any> = {}
  ): Promise<GraphEdge> {
    const id = `edge_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const edge: GraphEdge = {
      id,
      source_id: sourceId,
      target_id: targetId,
      type,
      weight,
      properties,
      created_at: new Date()
    };

    try {
      await this.pool.query(
        'INSERT INTO graph_edges (id, source_id, target_id, type, weight, properties) VALUES ($1, $2, $3, $4, $5, $6)',
        [edge.id, edge.source_id, edge.target_id, edge.type, edge.weight, JSON.stringify(edge.properties)]
      );

      this.edgeCache.set(edge.id, edge);
      this.adjacencyList.get(sourceId)?.add(targetId);
      this.reverseAdjacencyList.get(targetId)?.add(sourceId);

      this.emit('edge-created', edge);
      return edge;
    } catch (error) {
      console.error('Error creating edge:', error);
      throw error;
    }
  }

  public async updateEdge(edgeId: string, updates: Partial<GraphEdge>): Promise<GraphEdge | null> {
    const edge = this.edgeCache.get(edgeId);
    if (!edge) return null;

    const updatedEdge = {
      ...edge,
      ...updates
    };

    try {
      await this.pool.query(
        'UPDATE graph_edges SET type = $2, weight = $3, properties = $4 WHERE id = $1',
        [edgeId, updatedEdge.type, updatedEdge.weight, JSON.stringify(updatedEdge.properties)]
      );

      this.edgeCache.set(edgeId, updatedEdge);
      this.emit('edge-updated', updatedEdge);
      return updatedEdge;
    } catch (error) {
      console.error('Error updating edge:', error);
      throw error;
    }
  }

  public async deleteEdge(edgeId: string): Promise<boolean> {
    const edge = this.edgeCache.get(edgeId);
    if (!edge) return false;

    try {
      await this.pool.query('DELETE FROM graph_edges WHERE id = $1', [edgeId]);
      
      this.edgeCache.delete(edgeId);
      this.adjacencyList.get(edge.source_id)?.delete(edge.target_id);
      this.reverseAdjacencyList.get(edge.target_id)?.delete(edge.source_id);
      
      this.emit('edge-deleted', edgeId);
      return true;
    } catch (error) {
      console.error('Error deleting edge:', error);
      return false;
    }
  }

  public getEdge(edgeId: string): GraphEdge | undefined {
    return this.edgeCache.get(edgeId);
  }

  public getEdgesBetween(sourceId: string, targetId: string): GraphEdge[] {
    const edges: GraphEdge[] = [];
    this.edgeCache.forEach(edge => {
      if (edge.source_id === sourceId && edge.target_id === targetId) {
        edges.push(edge);
      }
    });
    return edges;
  }

  // Graph Traversal
  public async findShortestPath(startNodeId: string, endNodeId: string): Promise<GraphPath | null> {
    if (!this.nodeCache.has(startNodeId) || !this.nodeCache.has(endNodeId)) {
      return null;
    }

    // Dijkstra's algorithm
    const distances: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();
    const visited: Set<string> = new Set();
    const queue: string[] = [];

    // Initialize
    this.nodeCache.forEach((_, nodeId) => {
      distances.set(nodeId, nodeId === startNodeId ? 0 : Infinity);
      previous.set(nodeId, null);
      queue.push(nodeId);
    });

    while (queue.length > 0) {
      // Find minimum distance node
      let minNode: string | null = null;
      let minDistance = Infinity;
      
      queue.forEach(nodeId => {
        const dist = distances.get(nodeId)!;
        if (dist < minDistance) {
          minDistance = dist;
          minNode = nodeId;
        }
      });

      if (!minNode || minDistance === Infinity) break;
      
      // Remove from queue
      const index = queue.indexOf(minNode);
      queue.splice(index, 1);
      visited.add(minNode);

      // Found target
      if (minNode === endNodeId) break;

      // Update neighbors
      const neighbors = this.adjacencyList.get(minNode) || new Set();
      neighbors.forEach(neighborId => {
        if (visited.has(neighborId)) return;

        const edges = this.getEdgesBetween(minNode!, neighborId);
        if (edges.length === 0) return;

        const minEdgeWeight = Math.min(...edges.map(e => 1 / e.weight)); // Inverse for shortest path
        const alt = distances.get(minNode!)! + minEdgeWeight;
        
        if (alt < distances.get(neighborId)!) {
          distances.set(neighborId, alt);
          previous.set(neighborId, minNode);
        }
      });
    }

    // Reconstruct path
    const path: GraphPath = {
      nodes: [],
      edges: [],
      weight: distances.get(endNodeId) || Infinity,
      length: 0
    };

    let current: string | null = endNodeId;
    const nodeIds: string[] = [];
    
    while (current !== null) {
      nodeIds.unshift(current);
      current = previous.get(current) || null;
    }

    if (nodeIds[0] !== startNodeId) {
      return null; // No path found
    }

    // Build full path
    for (let i = 0; i < nodeIds.length; i++) {
      const node = this.nodeCache.get(nodeIds[i]);
      if (node) path.nodes.push(node);
      
      if (i < nodeIds.length - 1) {
        const edges = this.getEdgesBetween(nodeIds[i], nodeIds[i + 1]);
        if (edges.length > 0) {
          path.edges.push(edges[0]);
        }
      }
    }

    path.length = path.nodes.length - 1;
    
    return path;
  }

  public async traverseBFS(startNodeId: string, maxDepth: number = 3): Promise<GraphNode[]> {
    const visited: Set<string> = new Set();
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId: startNodeId, depth: 0 }];
    const result: GraphNode[] = [];

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;
      
      if (visited.has(nodeId) || depth > maxDepth) continue;
      visited.add(nodeId);
      
      const node = this.nodeCache.get(nodeId);
      if (node) result.push(node);
      
      const neighbors = this.adjacencyList.get(nodeId) || new Set();
      neighbors.forEach(neighborId => {
        if (!visited.has(neighborId)) {
          queue.push({ nodeId: neighborId, depth: depth + 1 });
        }
      });
    }

    return result;
  }

  public async traverseDFS(startNodeId: string, maxDepth: number = 3): Promise<GraphNode[]> {
    const visited: Set<string> = new Set();
    const result: GraphNode[] = [];

    const dfs = (nodeId: string, depth: number) => {
      if (visited.has(nodeId) || depth > maxDepth) return;
      visited.add(nodeId);
      
      const node = this.nodeCache.get(nodeId);
      if (node) result.push(node);
      
      const neighbors = this.adjacencyList.get(nodeId) || new Set();
      neighbors.forEach(neighborId => {
        dfs(neighborId, depth + 1);
      });
    };

    dfs(startNodeId, 0);
    return result;
  }

  // Graph Analytics
  public calculateDegree(nodeId: string): { inDegree: number; outDegree: number; totalDegree: number } {
    const inDegree = this.reverseAdjacencyList.get(nodeId)?.size || 0;
    const outDegree = this.adjacencyList.get(nodeId)?.size || 0;
    
    return {
      inDegree,
      outDegree,
      totalDegree: inDegree + outDegree
    };
  }

  public calculatePageRank(iterations: number = 20, damping: number = 0.85): Map<string, number> {
    const pageRank: Map<string, number> = new Map();
    const nodeCount = this.nodeCache.size;
    
    if (nodeCount === 0) return pageRank;
    
    // Initialize
    this.nodeCache.forEach((_, nodeId) => {
      pageRank.set(nodeId, 1 / nodeCount);
    });
    
    // Iterate
    for (let i = 0; i < iterations; i++) {
      const newPageRank: Map<string, number> = new Map();
      
      this.nodeCache.forEach((_, nodeId) => {
        let rank = (1 - damping) / nodeCount;
        
        // Sum contributions from incoming links
        const incoming = this.reverseAdjacencyList.get(nodeId) || new Set();
        incoming.forEach(sourceId => {
          const outDegree = this.adjacencyList.get(sourceId)?.size || 1;
          rank += damping * (pageRank.get(sourceId) || 0) / outDegree;
        });
        
        newPageRank.set(nodeId, rank);
      });
      
      // Update
      newPageRank.forEach((rank, nodeId) => pageRank.set(nodeId, rank));
    }
    
    return pageRank;
  }

  public async detectCommunities(): Promise<GraphCluster[]> {
    // Louvain algorithm for community detection
    const communities: Map<string, Set<string>> = new Map();
    const nodeCommunity: Map<string, string> = new Map();
    
    // Initialize: each node in its own community
    this.nodeCache.forEach((_, nodeId) => {
      communities.set(nodeId, new Set([nodeId]));
      nodeCommunity.set(nodeId, nodeId);
    });

    let improved = true;
    let iteration = 0;
    const maxIterations = 100;

    while (improved && iteration < maxIterations) {
      improved = false;
      iteration++;

      // For each node
      this.nodeCache.forEach((_, nodeId) => {
        const currentCommunity = nodeCommunity.get(nodeId)!;
        const neighbors = this.adjacencyList.get(nodeId) || new Set();
        
        // Calculate modularity gain for each neighbor's community
        let bestCommunity = currentCommunity;
        let bestGain = 0;

        neighbors.forEach(neighborId => {
          const neighborCommunity = nodeCommunity.get(neighborId)!;
          if (neighborCommunity === currentCommunity) return;

          const gain = this.calculateModularityGain(nodeId, currentCommunity, neighborCommunity);
          
          if (gain > bestGain) {
            bestGain = gain;
            bestCommunity = neighborCommunity;
          }
        });

        // Move node to best community
        if (bestCommunity !== currentCommunity) {
          communities.get(currentCommunity)?.delete(nodeId);
          communities.get(bestCommunity)?.add(nodeId);
          nodeCommunity.set(nodeId, bestCommunity);
          improved = true;
        }
      });
    }

    // Convert to clusters
    const clusters: GraphCluster[] = [];
    let clusterId = 0;
    
    communities.forEach((nodeIds, leaderId) => {
      if (nodeIds.size === 0) return;
      
      const cluster: GraphCluster = {
        id: `cluster_${clusterId++}`,
        nodes: Array.from(nodeIds),
        centroid: this.findCentroid(nodeIds),
        density: this.calculateDensity(nodeIds),
        metadata: {
          size: nodeIds.size,
          leaderId
        }
      };
      
      clusters.push(cluster);
    });

    // Save clusters
    for (const cluster of clusters) {
      await this.saveCluster(cluster);
      this.clusters.set(cluster.id, cluster);
    }

    return clusters;
  }

  private calculateModularityGain(nodeId: string, fromCommunity: string, toCommunity: string): number {
    const totalEdges = this.edgeCache.size;
    if (totalEdges === 0) return 0;

    let edgesToNew = 0;
    let edgesToOld = 0;
    
    this.edgeCache.forEach(edge => {
      if (edge.source_id === nodeId || edge.target_id === nodeId) {
        const otherNode = edge.source_id === nodeId ? edge.target_id : edge.source_id;
        
        // Find community of other node
        let otherCommunity: string | null = null;
        this.clusters.forEach(cluster => {
          if (cluster.nodes.includes(otherNode)) {
            otherCommunity = cluster.id;
          }
        });
        
        if (otherCommunity === toCommunity) {
          edgesToNew += edge.weight;
        } else if (otherCommunity === fromCommunity) {
          edgesToOld += edge.weight;
        }
      }
    });
    
    return (edgesToNew - edgesToOld) / totalEdges;
  }

  private findCentroid(nodeIds: Set<string>): string {
    let maxCentrality = 0;
    let centroid = '';
    
    nodeIds.forEach(nodeId => {
      const degree = this.calculateDegree(nodeId);
      const centrality = degree.totalDegree;
      
      if (centrality > maxCentrality) {
        maxCentrality = centrality;
        centroid = nodeId;
      }
    });
    
    return centroid;
  }

  private calculateDensity(nodeIds: Set<string>): number {
    if (nodeIds.size <= 1) return 1;
    
    let internalEdges = 0;
    
    this.edgeCache.forEach(edge => {
      if (nodeIds.has(edge.source_id) && nodeIds.has(edge.target_id)) {
        internalEdges++;
      }
    });
    
    const possibleEdges = nodeIds.size * (nodeIds.size - 1);
    return possibleEdges > 0 ? internalEdges / possibleEdges : 0;
  }

  // Query Operations
  public async query(query: GraphQuery): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    let nodes: GraphNode[] = [];
    let edges: GraphEdge[] = [];

    if (query.startNode) {
      // BFS from start node
      const visited: Set<string> = new Set();
      const queue: Array<{ nodeId: string; depth: number }> = [
        { nodeId: query.startNode, depth: 0 }
      ];

      while (queue.length > 0) {
        const { nodeId, depth } = queue.shift()!;
        
        if (visited.has(nodeId)) continue;
        if (query.depth && depth > query.depth) continue;
        
        visited.add(nodeId);
        
        const node = this.nodeCache.get(nodeId);
        if (!node) continue;
        
        // Check node type filter
        if (query.nodeTypes && !query.nodeTypes.includes(node.type)) {
          continue;
        }
        
        // Check property filters
        if (query.filters) {
          let match = true;
          for (const [key, value] of Object.entries(query.filters)) {
            if (node.properties[key] !== value) {
              match = false;
              break;
            }
          }
          if (!match) continue;
        }
        
        nodes.push(node);
        
        // Add edges
        this.edgeCache.forEach(edge => {
          if (edge.source_id === nodeId) {
            // Check edge type filter
            if (query.edgeTypes && !query.edgeTypes.includes(edge.type)) {
              return;
            }
            
            edges.push(edge);
            
            // Add to queue
            if (!visited.has(edge.target_id)) {
              queue.push({ nodeId: edge.target_id, depth: depth + 1 });
            }
          }
        });
      }
    } else {
      // Global query
      this.nodeCache.forEach(node => {
        if (query.nodeTypes && !query.nodeTypes.includes(node.type)) {
          return;
        }
        
        if (query.filters) {
          let match = true;
          for (const [key, value] of Object.entries(query.filters)) {
            if (node.properties[key] !== value) {
              match = false;
              break;
            }
          }
          if (!match) return;
        }
        
        nodes.push(node);
      });
      
      this.edgeCache.forEach(edge => {
        if (query.edgeTypes && !query.edgeTypes.includes(edge.type)) {
          return;
        }
        edges.push(edge);
      });
    }

    // Apply limit
    if (query.limit) {
      nodes = nodes.slice(0, query.limit);
      edges = edges.slice(0, query.limit);
    }

    return { nodes, edges };
  }

  // Batch Operations
  public async batchCreateNodes(nodes: Array<{ type: string; properties: Record<string, any> }>): Promise<GraphNode[]> {
    const createdNodes: GraphNode[] = [];
    
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const nodeData of nodes) {
        const node = await this.createNode(nodeData.type, nodeData.properties);
        createdNodes.push(node);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
    return createdNodes;
  }

  public async batchCreateEdges(
    edges: Array<{ sourceId: string; targetId: string; type: string; weight?: number; properties?: Record<string, any> }>
  ): Promise<GraphEdge[]> {
    const createdEdges: GraphEdge[] = [];
    
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const edgeData of edges) {
        const edge = await this.createEdge(
          edgeData.sourceId,
          edgeData.targetId,
          edgeData.type,
          edgeData.weight,
          edgeData.properties
        );
        createdEdges.push(edge);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
    return createdEdges;
  }

  // Import/Export
  public async exportGraph(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[]; clusters: GraphCluster[] }> {
    return {
      nodes: Array.from(this.nodeCache.values()),
      edges: Array.from(this.edgeCache.values()),
      clusters: Array.from(this.clusters.values())
    };
  }

  public async importGraph(data: { nodes: GraphNode[]; edges: GraphEdge[] }): Promise<void> {
    // Clear existing graph
    await this.clearGraph();
    
    // Import nodes
    for (const node of data.nodes) {
      this.nodeCache.set(node.id, node);
      
      await this.pool.query(
        'INSERT INTO graph_nodes (id, type, properties, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
        [node.id, node.type, JSON.stringify(node.properties), node.created_at, node.updated_at]
      );
    }
    
    // Import edges
    for (const edge of data.edges) {
      this.edgeCache.set(edge.id, edge);
      
      await this.pool.query(
        'INSERT INTO graph_edges (id, source_id, target_id, type, weight, properties, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [edge.id, edge.source_id, edge.target_id, edge.type, edge.weight, JSON.stringify(edge.properties), edge.created_at]
      );
      
      // Update adjacency lists
      this.adjacencyList.get(edge.source_id)?.add(edge.target_id);
      this.reverseAdjacencyList.get(edge.target_id)?.add(edge.source_id);
    }
  }

  // Maintenance
  private startGraphMaintenance() {
    // Periodic graph optimization
    setInterval(async () => {
      await this.optimizeGraph();
    }, 60 * 60 * 1000); // Every hour

    // Periodic clustering
    setInterval(async () => {
      await this.detectCommunities();
    }, 6 * 60 * 60 * 1000); // Every 6 hours

    // Cache synchronization
    setInterval(async () => {
      await this.syncCache();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private async optimizeGraph() {
    // Remove orphaned nodes
    const orphaned: string[] = [];
    
    this.nodeCache.forEach((node, nodeId) => {
      const degree = this.calculateDegree(nodeId);
      if (degree.totalDegree === 0) {
        orphaned.push(nodeId);
      }
    });
    
    for (const nodeId of orphaned) {
      await this.deleteNode(nodeId);
    }
    
    // Remove weak edges
    const weakEdges: string[] = [];
    
    this.edgeCache.forEach((edge, edgeId) => {
      if (edge.weight < 0.1) {
        weakEdges.push(edgeId);
      }
    });
    
    for (const edgeId of weakEdges) {
      await this.deleteEdge(edgeId);
    }
    
    console.log(`🔧 Graph optimized: removed ${orphaned.length} orphaned nodes and ${weakEdges.length} weak edges`);
  }

  private async syncCache() {
    // Sync cache with Redis
    for (const [nodeId, node] of this.nodeCache) {
      const key = `graph:node:${nodeId}`;
      await redisClient.setex(key, 3600, JSON.stringify(node));
    }
    
    for (const [edgeId, edge] of this.edgeCache) {
      const key = `graph:edge:${edgeId}`;
      await redisClient.setex(key, 3600, JSON.stringify(edge));
    }
  }

  private async saveCluster(cluster: GraphCluster) {
    try {
      await this.pool.query(
        `INSERT INTO graph_clusters (id, node_ids, centroid, density, metadata) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
         node_ids = $2,
         centroid = $3,
         density = $4,
         metadata = $5,
         updated_at = NOW()`,
        [
          cluster.id,
          cluster.nodes,
          cluster.centroid,
          cluster.density,
          JSON.stringify(cluster.metadata)
        ]
      );
    } catch (error) {
      console.error('Error saving cluster:', error);
    }
  }

  public async clearGraph() {
    await this.pool.query('TRUNCATE graph_nodes, graph_edges, graph_clusters CASCADE');
    
    this.nodeCache.clear();
    this.edgeCache.clear();
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();
    this.clusters.clear();
  }

  // Public API
  public getGraphStats(): {
    nodeCount: number;
    edgeCount: number;
    clusterCount: number;
    avgDegree: number;
    density: number;
  } {
    const nodeCount = this.nodeCache.size;
    const edgeCount = this.edgeCache.size;
    const clusterCount = this.clusters.size;
    
    let totalDegree = 0;
    this.nodeCache.forEach((_, nodeId) => {
      const degree = this.calculateDegree(nodeId);
      totalDegree += degree.totalDegree;
    });
    
    const avgDegree = nodeCount > 0 ? totalDegree / nodeCount : 0;
    const maxPossibleEdges = nodeCount * (nodeCount - 1);
    const density = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;
    
    return {
      nodeCount,
      edgeCount,
      clusterCount,
      avgDegree,
      density
    };
  }

  public getCluster(clusterId: string): GraphCluster | undefined {
    return this.clusters.get(clusterId);
  }

  public getNodeCluster(nodeId: string): GraphCluster | null {
    for (const cluster of this.clusters.values()) {
      if (cluster.nodes.includes(nodeId)) {
        return cluster;
      }
    }
    return null;
  }
}

// Export singleton instance
let graphDatabase: GraphDatabaseService | null = null;

export function initializeGraphDatabase(pool: Pool): GraphDatabaseService {
  if (!graphDatabase) {
    graphDatabase = new GraphDatabaseService(pool);
  }
  return graphDatabase;
}

export function getGraphDatabase(): GraphDatabaseService | null {
  return graphDatabase;
}