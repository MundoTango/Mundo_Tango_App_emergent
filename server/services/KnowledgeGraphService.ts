import { db } from "../db";
import {
  knowledgeGraphNodes,
  knowledgeGraphEdges,
  type InsertKnowledgeGraphNode,
  type InsertKnowledgeGraphEdge,
  type KnowledgeGraphNode,
  type KnowledgeGraphEdge,
} from "@shared/schema";
import { eq, sql, and, or, inArray } from "drizzle-orm";

/**
 * Knowledge Graph Service (Phase 3)
 * ESA Layer 44 - PostgreSQL-based graph using recursive CTEs
 * 
 * Features:
 * - Graph traversal without Apache AGE extension
 * - Recursive CTE queries for pathfinding
 * - Relationship strength tracking
 * - Multi-hop recommendations
 */

export class KnowledgeGraphService {
  // Create a node
  async createNode(node: InsertKnowledgeGraphNode): Promise<KnowledgeGraphNode> {
    const [created] = await db
      .insert(knowledgeGraphNodes)
      .values(node)
      .returning();
    return created;
  }

  // Create an edge/relationship
  async createEdge(edge: InsertKnowledgeGraphEdge): Promise<KnowledgeGraphEdge> {
    const [created] = await db
      .insert(knowledgeGraphEdges)
      .values(edge)
      .returning();
    return created;
  }

  // Find path between two nodes using recursive CTE
  async findPath(
    sourceNodeId: number,
    targetNodeId: number,
    maxDepth: number = 5
  ): Promise<any[]> {
    const pathQuery = sql`
      WITH RECURSIVE path AS (
        -- Base case: direct edges from source
        SELECT
          e.source_node_id,
          e.target_node_id,
          e.relationship_type,
          e.weight,
          1 as depth,
          ARRAY[e.source_node_id, e.target_node_id] as node_path,
          ARRAY[e.relationship_type] as edge_path
        FROM knowledge_graph_edges e
        WHERE e.source_node_id = ${sourceNodeId}

        UNION ALL

        -- Recursive case: extend path
        SELECT
          e.source_node_id,
          e.target_node_id,
          e.relationship_type,
          e.weight,
          p.depth + 1,
          p.node_path || e.target_node_id,
          p.edge_path || e.relationship_type
        FROM knowledge_graph_edges e
        INNER JOIN path p ON e.source_node_id = p.target_node_id
        WHERE
          p.depth < ${maxDepth}
          AND NOT (e.target_node_id = ANY(p.node_path)) -- Prevent cycles
      )
      SELECT * FROM path
      WHERE target_node_id = ${targetNodeId}
      ORDER BY depth ASC
      LIMIT 1
    `;

    const result = await db.execute(pathQuery);
    return result.rows as any[];
  }

  // Get all neighbors of a node
  async getNeighbors(
    nodeId: number,
    relationshipType?: string,
    depth: number = 1
  ): Promise<KnowledgeGraphNode[]> {
    const neighborsQuery = sql`
      WITH RECURSIVE neighbors AS (
        -- Base case: direct neighbors
        SELECT
          n.*,
          e.relationship_type,
          e.weight,
          1 as depth
        FROM knowledge_graph_nodes n
        INNER JOIN knowledge_graph_edges e ON n.id = e.target_node_id
        WHERE e.source_node_id = ${nodeId}
          ${relationshipType ? sql`AND e.relationship_type = ${relationshipType}` : sql``}

        UNION ALL

        -- Recursive case: neighbors of neighbors
        SELECT
          n.*,
          e.relationship_type,
          e.weight,
          nb.depth + 1
        FROM knowledge_graph_nodes n
        INNER JOIN knowledge_graph_edges e ON n.id = e.target_node_id
        INNER JOIN neighbors nb ON e.source_node_id = nb.id
        WHERE nb.depth < ${depth}
      )
      SELECT DISTINCT ON (id) * FROM neighbors
    `;

    const result = await db.execute(neighborsQuery);
    return result.rows as KnowledgeGraphNode[];
  }

  // Get recommendations based on graph traversal
  async getRecommendations(
    userId: number,
    nodeType: string,
    limit: number = 10
  ): Promise<any[]> {
    // Find user node
    const userNodes = await db
      .select()
      .from(knowledgeGraphNodes)
      .where(
        and(
          eq(knowledgeGraphNodes.nodeType, "user"),
          eq(knowledgeGraphNodes.entityId, userId)
        )
      );

    if (userNodes.length === 0) {
      return [];
    }

    const userNodeId = userNodes[0].id;

    // Get recommendations using collaborative filtering via graph
    const recommendationsQuery = sql`
      WITH user_likes AS (
        -- What the user likes
        SELECT target_node_id
        FROM knowledge_graph_edges
        WHERE source_node_id = ${userNodeId}
          AND relationship_type = 'likes'
      ),
      similar_users AS (
        -- Users who like similar things
        SELECT e.source_node_id, COUNT(*) as similarity_score
        FROM knowledge_graph_edges e
        INNER JOIN user_likes ul ON e.target_node_id = ul.target_node_id
        WHERE e.relationship_type = 'likes'
          AND e.source_node_id != ${userNodeId}
        GROUP BY e.source_node_id
        ORDER BY similarity_score DESC
        LIMIT 20
      ),
      recommendations AS (
        -- What similar users like that our user hasn't seen
        SELECT
          n.*,
          COUNT(*) as recommendation_score
        FROM knowledge_graph_edges e
        INNER JOIN similar_users su ON e.source_node_id = su.source_node_id
        INNER JOIN knowledge_graph_nodes n ON e.target_node_id = n.id
        WHERE e.relationship_type = 'likes'
          AND n.node_type = ${nodeType}
          AND e.target_node_id NOT IN (SELECT target_node_id FROM user_likes)
        GROUP BY n.id, n.node_type, n.entity_id, n.label, n.properties, n.embedding, n.created_at, n.updated_at
        ORDER BY recommendation_score DESC
        LIMIT ${limit}
      )
      SELECT * FROM recommendations
    `;

    const result = await db.execute(recommendationsQuery);
    return result.rows as any[];
  }

  // Calculate centrality (PageRank-style) for a node type
  async getTopNodes(
    nodeType: string,
    limit: number = 10
  ): Promise<any[]> {
    const centralityQuery = sql`
      SELECT
        n.*,
        COUNT(DISTINCT e_in.source_node_id) as in_degree,
        COUNT(DISTINCT e_out.target_node_id) as out_degree,
        (COUNT(DISTINCT e_in.source_node_id) + COUNT(DISTINCT e_out.target_node_id)) as total_degree
      FROM knowledge_graph_nodes n
      LEFT JOIN knowledge_graph_edges e_in ON n.id = e_in.target_node_id
      LEFT JOIN knowledge_graph_edges e_out ON n.id = e_out.source_node_id
      WHERE n.node_type = ${nodeType}
      GROUP BY n.id, n.node_type, n.entity_id, n.label, n.properties, n.embedding, n.created_at, n.updated_at
      ORDER BY total_degree DESC
      LIMIT ${limit}
    `;

    const result = await db.execute(centralityQuery);
    return result.rows as any[];
  }

  // Get node by entity
  async getNodeByEntity(
    nodeType: string,
    entityId: number
  ): Promise<KnowledgeGraphNode | null> {
    const nodes = await db
      .select()
      .from(knowledgeGraphNodes)
      .where(
        and(
          eq(knowledgeGraphNodes.nodeType, nodeType),
          eq(knowledgeGraphNodes.entityId, entityId)
        )
      );

    return nodes[0] || null;
  }

  // Create or get node for an entity
  async ensureNode(
    nodeType: string,
    entityId: number,
    label: string,
    properties: Record<string, any> = {}
  ): Promise<KnowledgeGraphNode> {
    const existing = await this.getNodeByEntity(nodeType, entityId);
    if (existing) {
      return existing;
    }

    return await this.createNode({
      nodeType,
      entityId,
      label,
      properties,
    });
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();
