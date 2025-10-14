/**
 * AGENT #116: DEPENDENCY MAPPER
 * MB.MD Phase 9 - Track 73
 * 
 * Expert Research:
 * - Facebook Graph Analysis: Large-scale dependency graphs
 * - Netflix Chaos Engineering: Dependency mapping under stress
 * - LinkedIn Knowledge Graph: Entity relationship extraction
 * - Twitter GraphJet: Real-time graph processing
 */

import { nanoid } from 'nanoid';

interface DependencyNode {
  id: string;
  name: string;
  type: 'task' | 'agent' | 'api' | 'resource';
  metadata: Record<string, any>;
}

interface DependencyEdge {
  from: string;
  to: string;
  type: 'requires' | 'blocks' | 'enhances' | 'conflicts';
  strength: number; // 0-1
}

interface DependencyGraph {
  id: string;
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  clusters: Array<{ id: string; nodes: string[]; }>;
  criticalPath: string[];
  bottlenecks: string[];
}

interface ResolutionPlan {
  issue: string;
  affectedNodes: string[];
  resolution: string;
  steps: string[];
  estimatedTime: number;
}

export class Agent116_DependencyMapper {
  private agentId = 'agent-116-dependency-mapper';
  private version = '1.0.0';

  /**
   * Map dependencies and create visual graph
   */
  async mapDependencies(entities: DependencyNode[]): Promise<DependencyGraph> {
    const graphId = nanoid();

    try {
      // Extract dependencies between entities
      const edges = await this.extractDependencies(entities);

      // Detect clusters (groups of related entities)
      const clusters = await this.detectClusters(entities, edges);

      // Find critical path
      const criticalPath = await this.findCriticalPath(entities, edges);

      // Identify bottlenecks
      const bottlenecks = await this.identifyBottlenecks(entities, edges);

      return {
        id: graphId,
        nodes: entities,
        edges,
        clusters,
        criticalPath,
        bottlenecks,
      };
    } catch (error) {
      throw new Error(`Dependency mapping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract dependencies between entities
   */
  private async extractDependencies(nodes: DependencyNode[]): Promise<DependencyEdge[]> {
    const edges: DependencyEdge[] = [];

    // Analyze each node for dependencies
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const from = nodes[i];
        const to = nodes[j];

        // Check metadata for dependency hints
        const dependency = this.analyzeDependency(from, to);
        if (dependency) {
          edges.push(dependency);
        }
      }
    }

    return edges;
  }

  /**
   * Analyze dependency between two nodes
   */
  private analyzeDependency(from: DependencyNode, to: DependencyNode): DependencyEdge | null {
    // Check if 'from' mentions 'to' in metadata
    const fromMentions = JSON.stringify(from.metadata).toLowerCase();
    const toName = to.name.toLowerCase();

    if (fromMentions.includes(toName)) {
      return {
        from: from.id,
        to: to.id,
        type: 'requires',
        strength: 0.8,
      };
    }

    // Check type-based dependencies
    if (from.type === 'task' && to.type === 'agent') {
      return {
        from: from.id,
        to: to.id,
        type: 'requires',
        strength: 0.6,
      };
    }

    return null;
  }

  /**
   * Detect clusters of related nodes
   */
  private async detectClusters(
    nodes: DependencyNode[],
    edges: DependencyEdge[]
  ): Promise<Array<{ id: string; nodes: string[] }>> {
    const clusters: Array<{ id: string; nodes: string[] }> = [];

    // Simple clustering by type
    const byType = nodes.reduce((acc, node) => {
      if (!acc[node.type]) acc[node.type] = [];
      acc[node.type].push(node.id);
      return acc;
    }, {} as Record<string, string[]>);

    Object.entries(byType).forEach(([type, nodeIds]) => {
      if (nodeIds.length > 1) {
        clusters.push({
          id: `cluster-${type}`,
          nodes: nodeIds,
        });
      }
    });

    return clusters;
  }

  /**
   * Find critical path through dependency graph
   */
  private async findCriticalPath(
    nodes: DependencyNode[],
    edges: DependencyEdge[]
  ): Promise<string[]> {
    // Simplified critical path: longest chain
    const path: string[] = [];
    const visited = new Set<string>();

    // Start from nodes with no incoming edges
    const roots = nodes.filter(n => 
      !edges.some(e => e.to === n.id)
    );

    if (roots.length === 0) return [];

    // DFS to find longest path
    const findPath = (nodeId: string, currentPath: string[]): string[] => {
      if (visited.has(nodeId)) return currentPath;
      
      visited.add(nodeId);
      currentPath.push(nodeId);

      const outgoing = edges.filter(e => e.from === nodeId);
      
      if (outgoing.length === 0) {
        return currentPath;
      }

      let longest = currentPath;
      outgoing.forEach(edge => {
        const subPath = findPath(edge.to, [...currentPath]);
        if (subPath.length > longest.length) {
          longest = subPath;
        }
      });

      return longest;
    };

    return findPath(roots[0].id, []);
  }

  /**
   * Identify bottleneck nodes
   */
  private async identifyBottlenecks(
    nodes: DependencyNode[],
    edges: DependencyEdge[]
  ): Promise<string[]> {
    const bottlenecks: string[] = [];

    // Nodes with many incoming edges are bottlenecks
    nodes.forEach(node => {
      const incomingCount = edges.filter(e => e.to === node.id).length;
      if (incomingCount > 3) {
        bottlenecks.push(node.id);
      }
    });

    return bottlenecks;
  }

  /**
   * Resolve dependency conflicts
   */
  async resolveDependencyConflict(
    graph: DependencyGraph,
    conflictingNodes: string[]
  ): Promise<ResolutionPlan> {
    const affectedEdges = graph.edges.filter(e => 
      conflictingNodes.includes(e.from) || conflictingNodes.includes(e.to)
    );

    const resolutionSteps: string[] = [];
    
    // Analyze conflict type
    const hasCircular = this.detectCircularDependency(graph, conflictingNodes);
    
    if (hasCircular) {
      resolutionSteps.push('Break circular dependency by removing weakest link');
      resolutionSteps.push('Refactor affected nodes to eliminate cycle');
    } else {
      resolutionSteps.push('Reorder execution to satisfy dependencies');
      resolutionSteps.push('Parallelize independent branches');
    }

    return {
      issue: hasCircular ? 'Circular dependency detected' : 'Dependency conflict',
      affectedNodes: conflictingNodes,
      resolution: resolutionSteps[0],
      steps: resolutionSteps,
      estimatedTime: resolutionSteps.length * 15, // 15 min per step
    };
  }

  /**
   * Detect circular dependencies
   */
  private detectCircularDependency(graph: DependencyGraph, nodes: string[]): boolean {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (stack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      stack.add(nodeId);

      const outgoing = graph.edges.filter(e => e.from === nodeId);
      for (const edge of outgoing) {
        if (hasCycle(edge.to)) return true;
      }

      stack.delete(nodeId);
      return false;
    };

    return nodes.some(nodeId => hasCycle(nodeId));
  }

  /**
   * Generate graph visualization data
   */
  async generateVisualization(graph: DependencyGraph): Promise<{
    nodes: Array<{ id: string; label: string; color: string; size: number }>;
    edges: Array<{ from: string; to: string; label: string; color: string }>;
  }> {
    const colorMap: Record<string, string> = {
      task: '#0ea5e9',
      agent: '#8b5cf6',
      api: '#10b981',
      resource: '#f59e0b',
    };

    const nodes = graph.nodes.map(node => ({
      id: node.id,
      label: node.name,
      color: colorMap[node.type] || '#6b7280',
      size: graph.bottlenecks.includes(node.id) ? 30 : 20,
    }));

    const edgeColors: Record<string, string> = {
      requires: '#ef4444',
      blocks: '#f97316',
      enhances: '#22c55e',
      conflicts: '#dc2626',
    };

    const edges = graph.edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      label: edge.type,
      color: edgeColors[edge.type] || '#9ca3af',
    }));

    return { nodes, edges };
  }

  /**
   * Get agent metadata
   */
  getMetadata() {
    return {
      id: this.agentId,
      name: 'Dependency Mapper',
      version: this.version,
      capabilities: [
        'dependency-extraction',
        'graph-visualization',
        'critical-path-analysis',
        'bottleneck-detection',
        'conflict-resolution',
        'circular-dependency-detection'
      ],
      expertSources: [
        'Facebook Graph Analysis',
        'Netflix Chaos Engineering',
        'LinkedIn Knowledge Graph',
        'Twitter GraphJet'
      ]
    };
  }
}

export const agent116 = new Agent116_DependencyMapper();
