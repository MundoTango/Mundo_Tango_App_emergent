// ESA LIFE CEO 61x21 - Knowledge Graph System (Layer 47: Advanced AI Features)
import { format, differenceInDays, differenceInHours } from 'date-fns';

export interface GraphNode {
  id: string;
  type: 'user' | 'event' | 'location' | 'interest' | 'community' | 'content' | 'agent';
  label: string;
  properties: Record<string, any>;
  weight: number;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'follows' | 'attends' | 'likes' | 'located_at' | 'interested_in' | 'belongs_to' | 'created_by' | 'related_to' | 'interacts_with';
  weight: number;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface Graph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  adjacencyList: Map<string, Set<string>>;
  reverseAdjacencyList: Map<string, Set<string>>;
}

export interface Community {
  id: string;
  name: string;
  nodes: string[];
  centrality: number;
  density: number;
  coherence: number;
  metadata?: Record<string, any>;
}

export interface GraphPath {
  nodes: string[];
  edges: string[];
  weight: number;
  type: 'shortest' | 'strongest' | 'most_recent';
}

export interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  averageDegree: number;
  clusteringCoefficient: number;
  communities: Community[];
  centralNodes: Array<{ nodeId: string; centrality: number }>;
}

export interface InfluenceScore {
  nodeId: string;
  score: number;
  reach: number;
  impact: number;
  factors: Record<string, number>;
}

export interface GraphQuery {
  startNode?: string;
  endNode?: string;
  nodeTypes?: GraphNode['type'][];
  edgeTypes?: GraphEdge['type'][];
  maxDepth?: number;
  minWeight?: number;
  timeRange?: { start: Date; end: Date };
  limit?: number;
}

export interface GraphVisualization {
  layout: 'force' | 'hierarchical' | 'circular' | 'geographic';
  nodes: Array<GraphNode & { x?: number; y?: number; color?: string; size?: number }>;
  edges: Array<GraphEdge & { color?: string; width?: number; curved?: boolean }>;
  clusters?: Community[];
  viewport?: { x: number; y: number; zoom: number };
}

export class KnowledgeGraph {
  private graph: Graph;
  private communities: Map<string, Community> = new Map();
  private nodeIndex: Map<string, Set<string>> = new Map(); // Type -> NodeIds
  private temporalIndex: Map<number, Set<string>> = new Map(); // Timestamp -> EdgeIds
  private influenceCache: Map<string, InfluenceScore> = new Map();
  private pathCache: Map<string, GraphPath> = new Map();

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      adjacencyList: new Map(),
      reverseAdjacencyList: new Map()
    };
    
    this.initializeGraph();
  }

  private initializeGraph() {
    // Load existing graph from storage
    this.loadFromStorage();
    
    // Start background processing
    this.startBackgroundProcessing();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('knowledge_graph');
      if (stored) {
        const data = JSON.parse(stored);
        
        // Rebuild nodes
        data.nodes?.forEach((node: GraphNode) => {
          this.addNode(node);
        });
        
        // Rebuild edges
        data.edges?.forEach((edge: GraphEdge) => {
          this.addEdge(edge);
        });
      }
    } catch (error) {
      console.error('Failed to load knowledge graph:', error);
    }
  }

  private startBackgroundProcessing() {
    // Community detection every 5 minutes
    setInterval(() => {
      this.detectCommunities();
      this.updateInfluenceScores();
      this.pruneOldData();
      this.saveToStorage();
    }, 5 * 60 * 1000);
  }

  // Node Management
  public addNode(node: GraphNode): boolean {
    if (this.graph.nodes.has(node.id)) {
      // Update existing node
      const existing = this.graph.nodes.get(node.id)!;
      existing.properties = { ...existing.properties, ...node.properties };
      existing.weight = Math.max(existing.weight, node.weight);
      existing.timestamp = node.timestamp || existing.timestamp;
      return false;
    }

    // Add new node
    this.graph.nodes.set(node.id, node);
    
    // Update indexes
    if (!this.nodeIndex.has(node.type)) {
      this.nodeIndex.set(node.type, new Set());
    }
    this.nodeIndex.get(node.type)!.add(node.id);
    
    // Initialize adjacency lists
    if (!this.graph.adjacencyList.has(node.id)) {
      this.graph.adjacencyList.set(node.id, new Set());
    }
    if (!this.graph.reverseAdjacencyList.has(node.id)) {
      this.graph.reverseAdjacencyList.set(node.id, new Set());
    }
    
    return true;
  }

  public removeNode(nodeId: string): boolean {
    const node = this.graph.nodes.get(nodeId);
    if (!node) return false;

    // Remove all edges connected to this node
    const edges = this.getNodeEdges(nodeId);
    edges.forEach(edge => this.removeEdge(edge.id));

    // Remove from indexes
    this.nodeIndex.get(node.type)?.delete(nodeId);
    
    // Remove from graph
    this.graph.nodes.delete(nodeId);
    this.graph.adjacencyList.delete(nodeId);
    this.graph.reverseAdjacencyList.delete(nodeId);
    
    // Clear caches
    this.influenceCache.delete(nodeId);
    this.clearPathCache(nodeId);
    
    return true;
  }

  public getNode(nodeId: string): GraphNode | undefined {
    return this.graph.nodes.get(nodeId);
  }

  public getNodesByType(type: GraphNode['type']): GraphNode[] {
    const nodeIds = this.nodeIndex.get(type) || new Set();
    return Array.from(nodeIds)
      .map(id => this.graph.nodes.get(id))
      .filter(node => node !== undefined) as GraphNode[];
  }

  // Edge Management
  public addEdge(edge: GraphEdge): boolean {
    // Validate nodes exist
    if (!this.graph.nodes.has(edge.source) || !this.graph.nodes.has(edge.target)) {
      console.warn('Cannot add edge: source or target node not found');
      return false;
    }

    // Check if edge exists
    if (this.graph.edges.has(edge.id)) {
      // Update weight
      const existing = this.graph.edges.get(edge.id)!;
      existing.weight = Math.max(existing.weight, edge.weight);
      existing.timestamp = edge.timestamp || existing.timestamp;
      return false;
    }

    // Add edge
    this.graph.edges.set(edge.id, edge);
    
    // Update adjacency lists
    this.graph.adjacencyList.get(edge.source)?.add(edge.target);
    this.graph.reverseAdjacencyList.get(edge.target)?.add(edge.source);
    
    // Update temporal index
    if (edge.timestamp) {
      const day = Math.floor(edge.timestamp.getTime() / (1000 * 60 * 60 * 24));
      if (!this.temporalIndex.has(day)) {
        this.temporalIndex.set(day, new Set());
      }
      this.temporalIndex.get(day)!.add(edge.id);
    }
    
    // Clear affected caches
    this.clearPathCache(edge.source);
    this.clearPathCache(edge.target);
    
    return true;
  }

  public removeEdge(edgeId: string): boolean {
    const edge = this.graph.edges.get(edgeId);
    if (!edge) return false;

    // Remove from adjacency lists
    this.graph.adjacencyList.get(edge.source)?.delete(edge.target);
    this.graph.reverseAdjacencyList.get(edge.target)?.delete(edge.source);
    
    // Remove from temporal index
    if (edge.timestamp) {
      const day = Math.floor(edge.timestamp.getTime() / (1000 * 60 * 60 * 24));
      this.temporalIndex.get(day)?.delete(edgeId);
    }
    
    // Remove edge
    this.graph.edges.delete(edgeId);
    
    // Clear caches
    this.clearPathCache(edge.source);
    this.clearPathCache(edge.target);
    
    return true;
  }

  public getEdge(edgeId: string): GraphEdge | undefined {
    return this.graph.edges.get(edgeId);
  }

  public getNodeEdges(nodeId: string): GraphEdge[] {
    const edges: GraphEdge[] = [];
    
    this.graph.edges.forEach(edge => {
      if (edge.source === nodeId || edge.target === nodeId) {
        edges.push(edge);
      }
    });
    
    return edges;
  }

  // Path Finding
  public findShortestPath(startNode: string, endNode: string): GraphPath | null {
    const cacheKey = `${startNode}->${endNode}`;
    
    // Check cache
    if (this.pathCache.has(cacheKey)) {
      return this.pathCache.get(cacheKey)!;
    }

    // Dijkstra's algorithm
    const distances: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();
    const visited: Set<string> = new Set();
    const queue: string[] = [];

    // Initialize
    this.graph.nodes.forEach((node, id) => {
      distances.set(id, id === startNode ? 0 : Infinity);
      previous.set(id, null);
      queue.push(id);
    });

    while (queue.length > 0) {
      // Find minimum distance node
      let minNode: string | null = null;
      let minDistance = Infinity;
      
      queue.forEach(node => {
        const dist = distances.get(node)!;
        if (dist < minDistance) {
          minDistance = dist;
          minNode = node;
        }
      });

      if (!minNode || minDistance === Infinity) break;
      
      // Remove from queue
      const index = queue.indexOf(minNode);
      queue.splice(index, 1);
      visited.add(minNode);

      // Found target
      if (minNode === endNode) break;

      // Update neighbors
      const neighbors = this.graph.adjacencyList.get(minNode) || new Set();
      neighbors.forEach(neighbor => {
        if (visited.has(neighbor)) return;

        const edge = this.findEdgeBetween(minNode!, neighbor);
        if (!edge) return;

        const alt = distances.get(minNode!)! + (1 / edge.weight); // Inverse weight for shortest path
        
        if (alt < distances.get(neighbor)!) {
          distances.set(neighbor, alt);
          previous.set(neighbor, minNode);
        }
      });
    }

    // Reconstruct path
    const path: string[] = [];
    const edgePath: string[] = [];
    let current: string | null = endNode;
    
    while (current !== null) {
      path.unshift(current);
      const prev = previous.get(current);
      
      if (prev !== null) {
        const edge = this.findEdgeBetween(prev, current);
        if (edge) {
          edgePath.unshift(edge.id);
        }
      }
      
      current = prev || null;
    }

    if (path[0] !== startNode) {
      return null; // No path found
    }

    const result: GraphPath = {
      nodes: path,
      edges: edgePath,
      weight: distances.get(endNode) || Infinity,
      type: 'shortest'
    };

    // Cache result
    this.pathCache.set(cacheKey, result);
    
    return result;
  }

  public findStrongestPath(startNode: string, endNode: string): GraphPath | null {
    // Modified Dijkstra for maximum weight path
    const weights: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();
    const visited: Set<string> = new Set();
    const queue: string[] = [];

    // Initialize
    this.graph.nodes.forEach((node, id) => {
      weights.set(id, id === startNode ? 1 : 0);
      previous.set(id, null);
      queue.push(id);
    });

    while (queue.length > 0) {
      // Find maximum weight node
      let maxNode: string | null = null;
      let maxWeight = 0;
      
      queue.forEach(node => {
        const weight = weights.get(node)!;
        if (weight > maxWeight) {
          maxWeight = weight;
          maxNode = node;
        }
      });

      if (!maxNode || maxWeight === 0) break;
      
      // Remove from queue
      const index = queue.indexOf(maxNode);
      queue.splice(index, 1);
      visited.add(maxNode);

      // Found target
      if (maxNode === endNode) break;

      // Update neighbors
      const neighbors = this.graph.adjacencyList.get(maxNode) || new Set();
      neighbors.forEach(neighbor => {
        if (visited.has(neighbor)) return;

        const edge = this.findEdgeBetween(maxNode!, neighbor);
        if (!edge) return;

        const newWeight = weights.get(maxNode!)! * edge.weight;
        
        if (newWeight > weights.get(neighbor)!) {
          weights.set(neighbor, newWeight);
          previous.set(neighbor, maxNode);
        }
      });
    }

    // Reconstruct path
    const path: string[] = [];
    const edgePath: string[] = [];
    let current: string | null = endNode;
    
    while (current !== null) {
      path.unshift(current);
      const prev = previous.get(current);
      
      if (prev !== null) {
        const edge = this.findEdgeBetween(prev, current);
        if (edge) {
          edgePath.unshift(edge.id);
        }
      }
      
      current = prev || null;
    }

    if (path[0] !== startNode) {
      return null; // No path found
    }

    return {
      nodes: path,
      edges: edgePath,
      weight: weights.get(endNode) || 0,
      type: 'strongest'
    };
  }

  private findEdgeBetween(source: string, target: string): GraphEdge | undefined {
    for (const edge of this.graph.edges.values()) {
      if (edge.source === source && edge.target === target) {
        return edge;
      }
    }
    return undefined;
  }

  // Community Detection
  public detectCommunities(): Community[] {
    // Louvain algorithm for community detection
    const communities: Map<string, Set<string>> = new Map();
    const nodeCommunity: Map<string, string> = new Map();
    
    // Initialize: each node in its own community
    this.graph.nodes.forEach((node, id) => {
      communities.set(id, new Set([id]));
      nodeCommunity.set(id, id);
    });

    let improved = true;
    let iteration = 0;
    const maxIterations = 100;

    while (improved && iteration < maxIterations) {
      improved = false;
      iteration++;

      // For each node
      this.graph.nodes.forEach((node, nodeId) => {
        const currentCommunity = nodeCommunity.get(nodeId)!;
        const neighbors = this.graph.adjacencyList.get(nodeId) || new Set();
        
        // Calculate modularity gain for each neighbor's community
        let bestCommunity = currentCommunity;
        let bestGain = 0;

        neighbors.forEach(neighbor => {
          const neighborCommunity = nodeCommunity.get(neighbor)!;
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

    // Convert to Community objects
    const result: Community[] = [];
    let communityId = 0;
    
    communities.forEach((nodes, leaderId) => {
      if (nodes.size === 0) return;
      
      const community: Community = {
        id: `community_${communityId++}`,
        name: this.generateCommunityName(Array.from(nodes)),
        nodes: Array.from(nodes),
        centrality: this.calculateCommunityCentrality(nodes),
        density: this.calculateCommunityDensity(nodes),
        coherence: this.calculateCommunityCoherence(nodes),
        metadata: {
          leaderId,
          size: nodes.size,
          created: new Date()
        }
      };
      
      result.push(community);
      this.communities.set(community.id, community);
    });

    return result.sort((a, b) => b.nodes.length - a.nodes.length);
  }

  private calculateModularityGain(nodeId: string, fromCommunity: string, toCommunity: string): number {
    // Simplified modularity gain calculation
    const totalEdges = this.graph.edges.size;
    if (totalEdges === 0) return 0;

    let gain = 0;
    const nodeEdges = this.getNodeEdges(nodeId);
    
    // Calculate edges to new community
    let edgesToNew = 0;
    let edgesToOld = 0;
    
    nodeEdges.forEach(edge => {
      const otherNode = edge.source === nodeId ? edge.target : edge.source;
      const otherCommunity = this.findNodeCommunity(otherNode);
      
      if (otherCommunity === toCommunity) {
        edgesToNew += edge.weight;
      } else if (otherCommunity === fromCommunity) {
        edgesToOld += edge.weight;
      }
    });
    
    gain = (edgesToNew - edgesToOld) / totalEdges;
    
    return gain;
  }

  private findNodeCommunity(nodeId: string): string | null {
    for (const [communityId, community] of this.communities) {
      if (community.nodes.includes(nodeId)) {
        return communityId;
      }
    }
    return null;
  }

  private generateCommunityName(nodeIds: string[]): string {
    // Generate name based on most common node types or properties
    const types: Map<string, number> = new Map();
    
    nodeIds.forEach(id => {
      const node = this.graph.nodes.get(id);
      if (node) {
        types.set(node.type, (types.get(node.type) || 0) + 1);
      }
    });
    
    const dominantType = Array.from(types.entries())
      .sort(([,a], [,b]) => b - a)[0];
    
    return dominantType ? `${dominantType[0]} Community` : 'Community';
  }

  private calculateCommunityCentrality(nodes: Set<string>): number {
    // Average centrality of nodes in community
    let totalCentrality = 0;
    
    nodes.forEach(nodeId => {
      totalCentrality += this.calculateNodeCentrality(nodeId);
    });
    
    return nodes.size > 0 ? totalCentrality / nodes.size : 0;
  }

  private calculateCommunityDensity(nodes: Set<string>): number {
    // Ratio of internal edges to possible edges
    if (nodes.size <= 1) return 1;
    
    let internalEdges = 0;
    
    this.graph.edges.forEach(edge => {
      if (nodes.has(edge.source) && nodes.has(edge.target)) {
        internalEdges++;
      }
    });
    
    const possibleEdges = (nodes.size * (nodes.size - 1)) / 2;
    return possibleEdges > 0 ? internalEdges / possibleEdges : 0;
  }

  private calculateCommunityCoherence(nodes: Set<string>): number {
    // Measure how similar nodes are within community
    let similarity = 0;
    let comparisons = 0;
    
    const nodeArray = Array.from(nodes);
    for (let i = 0; i < nodeArray.length; i++) {
      for (let j = i + 1; j < nodeArray.length; j++) {
        similarity += this.calculateNodeSimilarity(nodeArray[i], nodeArray[j]);
        comparisons++;
      }
    }
    
    return comparisons > 0 ? similarity / comparisons : 0;
  }

  private calculateNodeSimilarity(nodeId1: string, nodeId2: string): number {
    const node1 = this.graph.nodes.get(nodeId1);
    const node2 = this.graph.nodes.get(nodeId2);
    
    if (!node1 || !node2) return 0;
    
    let similarity = 0;
    
    // Type similarity
    if (node1.type === node2.type) similarity += 0.3;
    
    // Common neighbors (Jaccard similarity)
    const neighbors1 = this.graph.adjacencyList.get(nodeId1) || new Set();
    const neighbors2 = this.graph.adjacencyList.get(nodeId2) || new Set();
    
    const intersection = new Set([...neighbors1].filter(x => neighbors2.has(x)));
    const union = new Set([...neighbors1, ...neighbors2]);
    
    if (union.size > 0) {
      similarity += (intersection.size / union.size) * 0.7;
    }
    
    return similarity;
  }

  // Centrality Measures
  public calculateNodeCentrality(nodeId: string): number {
    // Degree centrality (normalized)
    const degree = (this.graph.adjacencyList.get(nodeId)?.size || 0) +
                   (this.graph.reverseAdjacencyList.get(nodeId)?.size || 0);
    const maxDegree = this.graph.nodes.size - 1;
    
    return maxDegree > 0 ? degree / maxDegree : 0;
  }

  public calculateBetweennessCentrality(nodeId: string): number {
    // Simplified betweenness centrality
    let centrality = 0;
    const nodes = Array.from(this.graph.nodes.keys());
    
    // Sample paths (full calculation is expensive)
    const sampleSize = Math.min(100, nodes.length);
    const sampledNodes = this.sampleNodes(nodes, sampleSize);
    
    for (let i = 0; i < sampledNodes.length; i++) {
      for (let j = i + 1; j < sampledNodes.length; j++) {
        const source = sampledNodes[i];
        const target = sampledNodes[j];
        
        if (source === nodeId || target === nodeId) continue;
        
        const path = this.findShortestPath(source, target);
        if (path && path.nodes.includes(nodeId)) {
          centrality++;
        }
      }
    }
    
    // Normalize
    const pairs = (sampleSize * (sampleSize - 1)) / 2;
    return pairs > 0 ? centrality / pairs : 0;
  }

  public calculatePageRank(iterations: number = 20, damping: number = 0.85): Map<string, number> {
    const pageRank: Map<string, number> = new Map();
    const nodeCount = this.graph.nodes.size;
    
    if (nodeCount === 0) return pageRank;
    
    // Initialize
    this.graph.nodes.forEach((node, id) => {
      pageRank.set(id, 1 / nodeCount);
    });
    
    // Iterate
    for (let i = 0; i < iterations; i++) {
      const newPageRank: Map<string, number> = new Map();
      
      this.graph.nodes.forEach((node, nodeId) => {
        let rank = (1 - damping) / nodeCount;
        
        // Sum contributions from incoming links
        const incoming = this.graph.reverseAdjacencyList.get(nodeId) || new Set();
        incoming.forEach(source => {
          const outDegree = this.graph.adjacencyList.get(source)?.size || 1;
          rank += damping * (pageRank.get(source) || 0) / outDegree;
        });
        
        newPageRank.set(nodeId, rank);
      });
      
      // Update
      newPageRank.forEach((rank, id) => pageRank.set(id, rank));
    }
    
    return pageRank;
  }

  // Influence Propagation
  public calculateInfluence(nodeId: string, depth: number = 3): InfluenceScore {
    // Check cache
    if (this.influenceCache.has(nodeId)) {
      return this.influenceCache.get(nodeId)!;
    }

    const visited: Set<string> = new Set();
    const queue: Array<{ node: string; level: number; weight: number }> = [
      { node: nodeId, level: 0, weight: 1 }
    ];
    
    let totalInfluence = 0;
    let reach = 0;
    const factors: Record<string, number> = {
      direct: 0,
      indirect: 0,
      network: 0
    };

    while (queue.length > 0) {
      const { node, level, weight } = queue.shift()!;
      
      if (visited.has(node) || level > depth) continue;
      visited.add(node);
      
      // Add to influence
      const decay = Math.pow(0.5, level);
      totalInfluence += weight * decay;
      reach++;
      
      if (level === 0) {
        factors.direct += weight;
      } else if (level === 1) {
        factors.indirect += weight * decay;
      } else {
        factors.network += weight * decay;
      }
      
      // Add neighbors to queue
      const neighbors = this.graph.adjacencyList.get(node) || new Set();
      neighbors.forEach(neighbor => {
        const edge = this.findEdgeBetween(node, neighbor);
        if (edge && !visited.has(neighbor)) {
          queue.push({
            node: neighbor,
            level: level + 1,
            weight: weight * edge.weight
          });
        }
      });
    }

    const score: InfluenceScore = {
      nodeId,
      score: totalInfluence,
      reach,
      impact: totalInfluence / Math.max(reach, 1),
      factors
    };

    // Cache result
    this.influenceCache.set(nodeId, score);
    
    return score;
  }

  // Queries
  public query(query: GraphQuery): { nodes: GraphNode[]; edges: GraphEdge[] } {
    let nodes: GraphNode[] = [];
    let edges: GraphEdge[] = [];

    // Filter nodes
    if (query.startNode) {
      // BFS from start node
      const visited: Set<string> = new Set();
      const queue: Array<{ node: string; depth: number }> = [
        { node: query.startNode, depth: 0 }
      ];

      while (queue.length > 0) {
        const { node, depth } = queue.shift()!;
        
        if (visited.has(node)) continue;
        if (query.maxDepth && depth > query.maxDepth) continue;
        
        visited.add(node);
        
        const graphNode = this.graph.nodes.get(node);
        if (!graphNode) continue;
        
        // Check node type filter
        if (query.nodeTypes && !query.nodeTypes.includes(graphNode.type)) {
          continue;
        }
        
        nodes.push(graphNode);
        
        // Add edges
        const nodeEdges = this.getNodeEdges(node);
        nodeEdges.forEach(edge => {
          // Check edge type filter
          if (query.edgeTypes && !query.edgeTypes.includes(edge.type)) {
            return;
          }
          
          // Check weight filter
          if (query.minWeight && edge.weight < query.minWeight) {
            return;
          }
          
          // Check time range
          if (query.timeRange && edge.timestamp) {
            if (edge.timestamp < query.timeRange.start || edge.timestamp > query.timeRange.end) {
              return;
            }
          }
          
          edges.push(edge);
          
          // Add to queue
          const otherNode = edge.source === node ? edge.target : edge.source;
          if (!visited.has(otherNode)) {
            queue.push({ node: otherNode, depth: depth + 1 });
          }
        });
      }
    } else {
      // Global query
      this.graph.nodes.forEach(node => {
        if (query.nodeTypes && !query.nodeTypes.includes(node.type)) {
          return;
        }
        nodes.push(node);
      });
      
      this.graph.edges.forEach(edge => {
        if (query.edgeTypes && !query.edgeTypes.includes(edge.type)) {
          return;
        }
        if (query.minWeight && edge.weight < query.minWeight) {
          return;
        }
        if (query.timeRange && edge.timestamp) {
          if (edge.timestamp < query.timeRange.start || edge.timestamp > query.timeRange.end) {
            return;
          }
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

  // Visualization
  public generateVisualization(
    query?: GraphQuery,
    layout: GraphVisualization['layout'] = 'force'
  ): GraphVisualization {
    const { nodes, edges } = query ? this.query(query) : { 
      nodes: Array.from(this.graph.nodes.values()),
      edges: Array.from(this.graph.edges.values())
    };

    // Apply layout algorithm
    const layoutNodes = this.applyLayout(nodes, edges, layout);
    
    // Add visual properties
    const visualNodes = layoutNodes.map(node => ({
      ...node,
      color: this.getNodeColor(node),
      size: this.getNodeSize(node)
    }));

    const visualEdges = edges.map(edge => ({
      ...edge,
      color: this.getEdgeColor(edge),
      width: Math.max(1, edge.weight * 3),
      curved: true
    }));

    return {
      layout,
      nodes: visualNodes,
      edges: visualEdges,
      clusters: Array.from(this.communities.values()),
      viewport: { x: 0, y: 0, zoom: 1 }
    };
  }

  private applyLayout(
    nodes: GraphNode[],
    edges: GraphEdge[],
    layout: GraphVisualization['layout']
  ): Array<GraphNode & { x: number; y: number }> {
    const layoutNodes = nodes.map(node => ({ ...node, x: 0, y: 0 }));
    
    switch (layout) {
      case 'force':
        return this.forceDirectedLayout(layoutNodes, edges);
      case 'hierarchical':
        return this.hierarchicalLayout(layoutNodes, edges);
      case 'circular':
        return this.circularLayout(layoutNodes);
      case 'geographic':
        return this.geographicLayout(layoutNodes);
      default:
        return layoutNodes;
    }
  }

  private forceDirectedLayout(
    nodes: Array<GraphNode & { x: number; y: number }>,
    edges: GraphEdge[]
  ): Array<GraphNode & { x: number; y: number }> {
    // Simple force-directed layout
    const iterations = 100;
    const k = Math.sqrt(1000 / nodes.length); // Optimal distance
    
    // Initialize random positions
    nodes.forEach(node => {
      node.x = Math.random() * 800 - 400;
      node.y = Math.random() * 600 - 300;
    });
    
    for (let iter = 0; iter < iterations; iter++) {
      const forces: Map<string, { fx: number; fy: number }> = new Map();
      
      // Initialize forces
      nodes.forEach(node => {
        forces.set(node.id, { fx: 0, fy: 0 });
      });
      
      // Repulsive forces
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const repulsion = (k * k) / dist;
          const fx = (dx / dist) * repulsion;
          const fy = (dy / dist) * repulsion;
          
          const force1 = forces.get(nodes[i].id)!;
          const force2 = forces.get(nodes[j].id)!;
          
          force1.fx -= fx;
          force1.fy -= fy;
          force2.fx += fx;
          force2.fy += fy;
        }
      }
      
      // Attractive forces
      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const attraction = (dist * dist) / k;
          const fx = (dx / dist) * attraction * 0.1;
          const fy = (dy / dist) * attraction * 0.1;
          
          const force1 = forces.get(source.id)!;
          const force2 = forces.get(target.id)!;
          
          force1.fx += fx;
          force1.fy += fy;
          force2.fx -= fx;
          force2.fy -= fy;
        }
      });
      
      // Apply forces
      nodes.forEach(node => {
        const force = forces.get(node.id)!;
        const damping = 0.95;
        
        node.x += force.fx * damping;
        node.y += force.fy * damping;
        
        // Keep within bounds
        node.x = Math.max(-400, Math.min(400, node.x));
        node.y = Math.max(-300, Math.min(300, node.y));
      });
    }
    
    return nodes;
  }

  private hierarchicalLayout(
    nodes: Array<GraphNode & { x: number; y: number }>,
    edges: GraphEdge[]
  ): Array<GraphNode & { x: number; y: number }> {
    // Calculate levels using topological sort
    const levels: Map<string, number> = new Map();
    const visited: Set<string> = new Set();
    
    // Find root nodes (no incoming edges)
    const roots = nodes.filter(node => {
      const incoming = this.graph.reverseAdjacencyList.get(node.id);
      return !incoming || incoming.size === 0;
    });
    
    // BFS to assign levels
    const queue: Array<{ node: GraphNode; level: number }> = 
      roots.map(node => ({ node, level: 0 }));
    
    while (queue.length > 0) {
      const { node, level } = queue.shift()!;
      
      if (visited.has(node.id)) continue;
      visited.add(node.id);
      levels.set(node.id, level);
      
      const neighbors = this.graph.adjacencyList.get(node.id) || new Set();
      neighbors.forEach(neighborId => {
        const neighbor = nodes.find(n => n.id === neighborId);
        if (neighbor && !visited.has(neighborId)) {
          queue.push({ node: neighbor, level: level + 1 });
        }
      });
    }
    
    // Position nodes by level
    const levelNodes: Map<number, GraphNode[]> = new Map();
    nodes.forEach(node => {
      const level = levels.get(node.id) || 0;
      if (!levelNodes.has(level)) {
        levelNodes.set(level, []);
      }
      levelNodes.get(level)!.push(node);
    });
    
    levelNodes.forEach((nodesAtLevel, level) => {
      const spacing = 800 / (nodesAtLevel.length + 1);
      nodesAtLevel.forEach((node, index) => {
        (node as any).x = -400 + spacing * (index + 1);
        (node as any).y = -300 + level * 100;
      });
    });
    
    return nodes;
  }

  private circularLayout(
    nodes: Array<GraphNode & { x: number; y: number }>
  ): Array<GraphNode & { x: number; y: number }> {
    const radius = 300;
    const angleStep = (2 * Math.PI) / nodes.length;
    
    nodes.forEach((node, index) => {
      const angle = index * angleStep;
      node.x = radius * Math.cos(angle);
      node.y = radius * Math.sin(angle);
    });
    
    return nodes;
  }

  private geographicLayout(
    nodes: Array<GraphNode & { x: number; y: number }>
  ): Array<GraphNode & { x: number; y: number }> {
    // Use location properties if available
    nodes.forEach(node => {
      if (node.properties?.latitude && node.properties?.longitude) {
        // Map to screen coordinates
        node.x = (node.properties.longitude + 180) * (800 / 360) - 400;
        node.y = (90 - node.properties.latitude) * (600 / 180) - 300;
      } else {
        // Random position for non-geographic nodes
        node.x = Math.random() * 800 - 400;
        node.y = Math.random() * 600 - 300;
      }
    });
    
    return nodes;
  }

  private getNodeColor(node: GraphNode): string {
    const colors: Record<GraphNode['type'], string> = {
      'user': '#5EEAD4',
      'event': '#FB923C',
      'location': '#A78BFA',
      'interest': '#FDE047',
      'community': '#86EFAC',
      'content': '#93C5FD',
      'agent': '#FCA5A5'
    };
    
    return colors[node.type] || '#9CA3AF';
  }

  private getEdgeColor(edge: GraphEdge): string {
    const colors: Record<GraphEdge['type'], string> = {
      'follows': '#5EEAD4',
      'attends': '#FB923C',
      'likes': '#F472B6',
      'located_at': '#A78BFA',
      'interested_in': '#FDE047',
      'belongs_to': '#86EFAC',
      'created_by': '#93C5FD',
      'related_to': '#9CA3AF',
      'interacts_with': '#FCA5A5'
    };
    
    return colors[edge.type] || '#6B7280';
  }

  private getNodeSize(node: GraphNode): number {
    // Size based on centrality
    const centrality = this.calculateNodeCentrality(node.id);
    return 5 + centrality * 20;
  }

  // Utility methods
  private sampleNodes(nodes: string[], sampleSize: number): string[] {
    const sampled: string[] = [];
    const available = [...nodes];
    
    for (let i = 0; i < sampleSize && available.length > 0; i++) {
      const index = Math.floor(Math.random() * available.length);
      sampled.push(available[index]);
      available.splice(index, 1);
    }
    
    return sampled;
  }

  private clearPathCache(nodeId?: string) {
    if (nodeId) {
      // Clear paths involving this node
      const keysToDelete: string[] = [];
      this.pathCache.forEach((path, key) => {
        if (key.includes(nodeId)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.pathCache.delete(key));
    } else {
      // Clear all
      this.pathCache.clear();
    }
  }

  private updateInfluenceScores() {
    // Recalculate influence for top nodes
    const pageRank = this.calculatePageRank();
    const topNodes = Array.from(pageRank.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 100)
      .map(([nodeId]) => nodeId);
    
    topNodes.forEach(nodeId => {
      this.influenceCache.delete(nodeId);
      this.calculateInfluence(nodeId);
    });
  }

  private pruneOldData() {
    // Remove old temporal data
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const edgesToRemove: string[] = [];
    this.graph.edges.forEach((edge, id) => {
      if (edge.timestamp && edge.timestamp.getTime() < thirtyDaysAgo) {
        // Keep if weight is high
        if (edge.weight < 0.5) {
          edgesToRemove.push(id);
        }
      }
    });
    
    edgesToRemove.forEach(id => this.removeEdge(id));
  }

  private saveToStorage() {
    try {
      const data = {
        nodes: Array.from(this.graph.nodes.values()),
        edges: Array.from(this.graph.edges.values()),
        communities: Array.from(this.communities.values())
      };
      
      localStorage.setItem('knowledge_graph', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save knowledge graph:', error);
    }
  }

  // Public API
  public getGraph(): Graph {
    return this.graph;
  }

  public getMetrics(): GraphMetrics {
    const nodeCount = this.graph.nodes.size;
    const edgeCount = this.graph.edges.size;
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
    
    // Calculate average degree
    let totalDegree = 0;
    this.graph.nodes.forEach((node, id) => {
      totalDegree += (this.graph.adjacencyList.get(id)?.size || 0) +
                     (this.graph.reverseAdjacencyList.get(id)?.size || 0);
    });
    
    // Get top central nodes
    const pageRank = this.calculatePageRank();
    const centralNodes = Array.from(pageRank.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([nodeId, centrality]) => ({ nodeId, centrality }));
    
    return {
      nodeCount,
      edgeCount,
      density: maxEdges > 0 ? edgeCount / maxEdges : 0,
      averageDegree: nodeCount > 0 ? totalDegree / nodeCount : 0,
      clusteringCoefficient: this.calculateGlobalClusteringCoefficient(),
      communities: Array.from(this.communities.values()),
      centralNodes
    };
  }

  private calculateGlobalClusteringCoefficient(): number {
    let totalCoefficient = 0;
    let count = 0;
    
    this.graph.nodes.forEach((node, nodeId) => {
      const coefficient = this.calculateLocalClusteringCoefficient(nodeId);
      if (coefficient > 0) {
        totalCoefficient += coefficient;
        count++;
      }
    });
    
    return count > 0 ? totalCoefficient / count : 0;
  }

  private calculateLocalClusteringCoefficient(nodeId: string): number {
    const neighbors = this.graph.adjacencyList.get(nodeId) || new Set();
    
    if (neighbors.size < 2) return 0;
    
    let triangles = 0;
    const neighborArray = Array.from(neighbors);
    
    for (let i = 0; i < neighborArray.length; i++) {
      for (let j = i + 1; j < neighborArray.length; j++) {
        // Check if neighbors are connected
        const edge = this.findEdgeBetween(neighborArray[i], neighborArray[j]);
        if (edge) triangles++;
      }
    }
    
    const possibleTriangles = (neighbors.size * (neighbors.size - 1)) / 2;
    return possibleTriangles > 0 ? triangles / possibleTriangles : 0;
  }

  public getCommunity(communityId: string): Community | undefined {
    return this.communities.get(communityId);
  }

  public getNodeCommunity(nodeId: string): Community | null {
    for (const community of this.communities.values()) {
      if (community.nodes.includes(nodeId)) {
        return community;
      }
    }
    return null;
  }

  public clear() {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      adjacencyList: new Map(),
      reverseAdjacencyList: new Map()
    };
    this.communities.clear();
    this.nodeIndex.clear();
    this.temporalIndex.clear();
    this.influenceCache.clear();
    this.pathCache.clear();
  }
}

// Export singleton instance
export const knowledgeGraph = new KnowledgeGraph();