/**
 * Agent Ecosystem & Marketplace
 * MB.MD PHASE 6 - TRACK 28
 * 
 * Community-driven agent registry and sharing platform
 */

import { EventEmitter } from 'events';

interface AgentDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'optimization' | 'monitoring' | 'healing' | 'analytics' | 'utility';
  capabilities: string[];
  code: string;
  dependencies: string[];
  downloadCount: number;
  rating: number;
  reviews: number;
  publishedAt: Date;
  updatedAt: Date;
}

interface AgentInstallation {
  agentId: string;
  installedAt: Date;
  version: string;
  active: boolean;
}

interface AgentReview {
  id: string;
  agentId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export class AgentMarketplace extends EventEmitter {
  private registry: Map<string, AgentDefinition> = new Map();
  private installations: Map<string, AgentInstallation> = new Map();
  private reviews: Map<string, AgentReview[]> = new Map();

  constructor() {
    super();
    this.initializeMarketplace();
  }

  /**
   * Initialize marketplace with default agents
   */
  private initializeMarketplace() {
    // Add community agents
    this.publishAgent({
      id: 'agent-api-validator-community',
      name: 'Community API Validator',
      version: '1.0.0',
      description: 'Enhanced API path validator with advanced pattern matching',
      author: 'community',
      category: 'monitoring',
      capabilities: ['api-validation', 'path-matching', 'auto-fix'],
      code: '// Agent code here',
      dependencies: [],
      downloadCount: 0,
      rating: 0,
      reviews: 0,
      publishedAt: new Date(),
      updatedAt: new Date()
    });

    this.publishAgent({
      id: 'agent-performance-booster',
      name: 'Performance Booster',
      version: '2.1.0',
      description: 'Automatically optimizes slow endpoints and database queries',
      author: 'community',
      category: 'optimization',
      capabilities: ['query-optimization', 'caching', 'auto-scaling'],
      code: '// Agent code here',
      dependencies: [],
      downloadCount: 0,
      rating: 0,
      reviews: 0,
      publishedAt: new Date(),
      updatedAt: new Date()
    });

    console.log('🏪 [Agent Marketplace] Initialized with 2 community agents');
  }

  /**
   * Publish agent to marketplace
   */
  publishAgent(agent: Omit<AgentDefinition, 'downloadCount' | 'rating' | 'reviews' | 'publishedAt' | 'updatedAt'>) {
    const fullAgent: AgentDefinition = {
      ...agent,
      downloadCount: 0,
      rating: 0,
      reviews: 0,
      publishedAt: new Date(),
      updatedAt: new Date()
    };

    this.registry.set(agent.id, fullAgent);
    this.emit('agent-published', fullAgent);

    console.log(`📦 [Agent Marketplace] Published: ${agent.name} v${agent.version} by ${agent.author}`);
  }

  /**
   * Search agents in marketplace
   */
  searchAgents(query: string, category?: AgentDefinition['category']): AgentDefinition[] {
    const agents = Array.from(this.registry.values());

    let filtered = agents;

    if (category) {
      filtered = filtered.filter(a => a.category === category);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(lowerQuery) ||
        a.description.toLowerCase().includes(lowerQuery) ||
        a.capabilities.some(c => c.toLowerCase().includes(lowerQuery))
      );
    }

    // Sort by rating and downloads
    return filtered.sort((a, b) => {
      const scoreA = a.rating * 0.6 + (a.downloadCount / 100) * 0.4;
      const scoreB = b.rating * 0.6 + (b.downloadCount / 100) * 0.4;
      return scoreB - scoreA;
    });
  }

  /**
   * Install agent
   */
  async installAgent(agentId: string): Promise<boolean> {
    const agent = this.registry.get(agentId);
    if (!agent) {
      console.error(`❌ [Agent Marketplace] Agent not found: ${agentId}`);
      return false;
    }

    // Check if already installed
    if (this.installations.has(agentId)) {
      console.log(`⚠️  [Agent Marketplace] Agent already installed: ${agent.name}`);
      return false;
    }

    // Install dependencies
    for (const dep of agent.dependencies) {
      if (!this.installations.has(dep)) {
        await this.installAgent(dep);
      }
    }

    // Create installation record
    const installation: AgentInstallation = {
      agentId,
      installedAt: new Date(),
      version: agent.version,
      active: true
    };

    this.installations.set(agentId, installation);
    
    // Update download count
    agent.downloadCount++;
    
    this.emit('agent-installed', { agentId, agent });
    console.log(`✅ [Agent Marketplace] Installed: ${agent.name} v${agent.version}`);

    return true;
  }

  /**
   * Uninstall agent
   */
  async uninstallAgent(agentId: string): Promise<boolean> {
    const installation = this.installations.get(agentId);
    if (!installation) {
      console.error(`❌ [Agent Marketplace] Agent not installed: ${agentId}`);
      return false;
    }

    // Check if other agents depend on this
    const dependents = Array.from(this.registry.values())
      .filter(a => 
        a.dependencies.includes(agentId) && 
        this.installations.has(a.id)
      );

    if (dependents.length > 0) {
      console.error(`❌ [Agent Marketplace] Cannot uninstall: ${dependents.length} agents depend on this`);
      return false;
    }

    this.installations.delete(agentId);
    this.emit('agent-uninstalled', { agentId });
    
    const agent = this.registry.get(agentId);
    console.log(`🗑️  [Agent Marketplace] Uninstalled: ${agent?.name}`);

    return true;
  }

  /**
   * Submit agent review
   */
  submitReview(agentId: string, userId: string, rating: number, comment: string): string {
    const agent = this.registry.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const review: AgentReview = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      userId,
      rating: Math.max(1, Math.min(5, rating)), // Clamp to 1-5
      comment,
      createdAt: new Date()
    };

    if (!this.reviews.has(agentId)) {
      this.reviews.set(agentId, []);
    }

    this.reviews.get(agentId)!.push(review);

    // Recalculate average rating
    const agentReviews = this.reviews.get(agentId)!;
    const avgRating = agentReviews.reduce((sum, r) => sum + r.rating, 0) / agentReviews.length;
    
    agent.rating = avgRating;
    agent.reviews = agentReviews.length;

    this.emit('review-submitted', review);
    console.log(`⭐ [Agent Marketplace] Review submitted for ${agent.name}: ${rating}/5`);

    return review.id;
  }

  /**
   * Update agent version
   */
  updateAgent(agentId: string, newVersion: string, updates: Partial<AgentDefinition>): boolean {
    const agent = this.registry.get(agentId);
    if (!agent) {
      return false;
    }

    Object.assign(agent, updates, {
      version: newVersion,
      updatedAt: new Date()
    });

    this.emit('agent-updated', { agentId, newVersion });
    console.log(`🔄 [Agent Marketplace] Updated: ${agent.name} to v${newVersion}`);

    return true;
  }

  /**
   * Get agent details
   */
  getAgent(agentId: string): AgentDefinition | undefined {
    return this.registry.get(agentId);
  }

  /**
   * Get installed agents
   */
  getInstalledAgents(): Array<AgentDefinition & { installation: AgentInstallation }> {
    const installed: Array<AgentDefinition & { installation: AgentInstallation }> = [];

    for (const [agentId, installation] of this.installations.entries()) {
      const agent = this.registry.get(agentId);
      if (agent) {
        installed.push({ ...agent, installation });
      }
    }

    return installed;
  }

  /**
   * Get agent reviews
   */
  getAgentReviews(agentId: string): AgentReview[] {
    return this.reviews.get(agentId) || [];
  }

  /**
   * Get marketplace statistics
   */
  getStats() {
    return {
      totalAgents: this.registry.size,
      installedAgents: this.installations.size,
      totalDownloads: Array.from(this.registry.values())
        .reduce((sum, a) => sum + a.downloadCount, 0),
      totalReviews: Array.from(this.reviews.values())
        .reduce((sum, reviews) => sum + reviews.length, 0),
      avgRating: Array.from(this.registry.values())
        .reduce((sum, a) => sum + a.rating, 0) / this.registry.size || 0,
      categories: {
        optimization: Array.from(this.registry.values()).filter(a => a.category === 'optimization').length,
        monitoring: Array.from(this.registry.values()).filter(a => a.category === 'monitoring').length,
        healing: Array.from(this.registry.values()).filter(a => a.category === 'healing').length,
        analytics: Array.from(this.registry.values()).filter(a => a.category === 'analytics').length,
        utility: Array.from(this.registry.values()).filter(a => a.category === 'utility').length
      }
    };
  }
}

export const agentMarketplace = new AgentMarketplace();
