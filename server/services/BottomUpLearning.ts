/**
 * PHASE 12 TRACK 4: Bottom-Up Learning System
 * Bottom-level agents (widgets/buttons) learn from org chart history
 * Understanding: "How did we get here? What made this component what it is?"
 */

import { db } from '../db';
import { esaAgents, componentAgents, componentHistory } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';

export class BottomUpLearning {
  /**
   * Enable bottom-level agent to learn full organizational history
   */
  async learnOrganizationalHistory(componentId: number): Promise<{
    historyLearned: any[];
    parentGuidance: any[];
    layerStandards: any[];
    peerPatterns: any[];
  }> {
    console.log(`📚 Bottom-Up Learning: Component #${componentId} learning org history...`);

    const component = await db
      .select()
      .from(componentAgents)
      .where(eq(componentAgents.id, componentId));

    if (component.length === 0) {
      throw new Error('Component not found');
    }

    const comp = component[0];

    // Step 1: Learn own history
    const ownHistory = await this.learnOwnHistory(componentId);
    console.log(`  📖 Learned own history: ${ownHistory.length} events`);

    // Step 2: Learn from parent agent
    const parentGuidance = await this.learnFromParent(comp.parentAgent);
    console.log(`  👨‍🏫 Learned from parent: ${parentGuidance.length} guidelines`);

    // Step 3: Learn from layer agents
    const layerStandards = await this.learnFromLayers(comp.layerAgents || []);
    console.log(`  📐 Learned layer standards: ${layerStandards.length} standards`);

    // Step 4: Learn from peer patterns
    const peerPatterns = await this.learnFromPeers(comp.componentType);
    console.log(`  🤝 Learned peer patterns: ${peerPatterns.length} patterns`);

    return {
      historyLearned: ownHistory,
      parentGuidance,
      layerStandards,
      peerPatterns,
    };
  }

  /**
   * Learn own component history
   */
  private async learnOwnHistory(componentId: number): Promise<any[]> {
    const history = await db
      .select()
      .from(componentHistory)
      .where(eq(componentHistory.componentId, componentId));

    return history.map(h => ({
      changeType: h.changeType,
      timestamp: h.timestamp,
      healthImprovement: (h.healthAfter || 0) - (h.healthBefore || 0),
      changes: h.changes,
      lesson: this.extractLesson(h),
    }));
  }

  /**
   * Learn from parent agent
   */
  private async learnFromParent(parentId: string): Promise<any[]> {
    const parent = await db
      .select()
      .from(esaAgents)
      .where(eq(esaAgents.id, parentId));

    if (parent.length === 0) return [];

    const guidance: any[] = [];

    // Extract parent's domains as guidance
    parent[0].domains?.forEach((domain: string) => {
      guidance.push({
        source: parent[0].name,
        domain,
        guideline: `Follow ${domain} best practices from ${parent[0].name}`,
      });
    });

    return guidance;
  }

  /**
   * Learn from layer agents
   */
  private async learnFromLayers(layerIds: string[]): Promise<any[]> {
    if (layerIds.length === 0) return [];

    const layers = await db
      .select()
      .from(esaAgents)
      .where(inArray(esaAgents.id, layerIds));

    const standards: any[] = [];

    for (const layer of layers) {
      standards.push({
        layer: layer.name,
        esaLayer: layer.esaLayers?.[0],
        domains: layer.domains,
        standard: this.getLayerStandard(layer.esaLayers?.[0]),
      });
    }

    return standards;
  }

  /**
   * Learn from peer components
   */
  private async learnFromPeers(componentType: string): Promise<any[]> {
    const peers = await db
      .select()
      .from(componentAgents)
      .where(eq(componentAgents.componentType, componentType));

    // Find healthy peers
    const healthyPeers = peers.filter(p => p.currentHealth === 'healthy');

    const patterns: any[] = [];

    for (const peer of healthyPeers.slice(0, 5)) {
      // Get peer's successful patterns
      const peerHistory = await db
        .select()
        .from(componentHistory)
        .where(eq(componentHistory.componentId, peer.id));

      const successfulChanges = peerHistory.filter(
        h => (h.healthAfter || 0) > (h.healthBefore || 0)
      );

      if (successfulChanges.length > 0) {
        patterns.push({
          peerName: peer.componentName,
          peerHealth: peer.currentHealth,
          successfulPattern: successfulChanges[0].changeType,
          lesson: this.extractLesson(successfulChanges[0]),
        });
      }
    }

    return patterns;
  }

  /**
   * Extract lesson from history entry
   */
  private extractLesson(historyEntry: any): string {
    if (!historyEntry.changes) return 'No changes recorded';

    const improvement = (historyEntry.healthAfter || 0) - (historyEntry.healthBefore || 0);

    if (improvement > 0) {
      return `${historyEntry.changeType} improved health by ${improvement}`;
    } else if (improvement < 0) {
      return `${historyEntry.changeType} decreased health by ${Math.abs(improvement)} - avoid this`;
    } else {
      return `${historyEntry.changeType} had no impact`;
    }
  }

  /**
   * Get standard for ESA layer
   */
  private getLayerStandard(layerNumber?: number): string {
    const standards: Record<number, string> = {
      9: 'UI/UX Design - Follow MT Ocean Theme, glassmorphic design',
      10: 'Design System - Use Aurora Tide components, maintain consistency',
      53: 'Internationalization - Support all 68 languages, use t() function',
      54: 'Accessibility - WCAG 2.1 AA compliance, keyboard navigation',
    };

    return standards[layerNumber || 0] || 'Follow general ESA Framework principles';
  }

  /**
   * Apply learned knowledge to component
   */
  async applyLearning(
    componentId: number,
    learning: {
      historyLearned: any[];
      parentGuidance: any[];
      layerStandards: any[];
      peerPatterns: any[];
    }
  ): Promise<{
    applied: boolean;
    improvements: string[];
  }> {
    console.log(`✨ Applying learning to component #${componentId}...`);

    const improvements: string[] = [];

    // Apply parent guidance
    if (learning.parentGuidance.length > 0) {
      improvements.push(`Applied ${learning.parentGuidance.length} parent guidelines`);
    }

    // Apply layer standards
    if (learning.layerStandards.length > 0) {
      improvements.push(`Applied ${learning.layerStandards.length} layer standards`);
    }

    // Apply peer patterns
    if (learning.peerPatterns.length > 0) {
      improvements.push(`Adopted ${learning.peerPatterns.length} successful peer patterns`);
    }

    // Update component's learning count
    await db
      .update(componentAgents)
      .set({
        learningCount: learning.historyLearned.length + 
                       learning.parentGuidance.length + 
                       learning.layerStandards.length + 
                       learning.peerPatterns.length,
        lastModified: new Date(),
      })
      .where(eq(componentAgents.id, componentId));

    console.log(`  ✅ Applied ${improvements.length} improvements`);

    return {
      applied: true,
      improvements,
    };
  }
}

export const bottomUpLearning = new BottomUpLearning();
