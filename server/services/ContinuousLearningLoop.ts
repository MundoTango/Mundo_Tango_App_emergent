import { agentLearningService } from './AgentLearningCaptureService';
import { crossDomainLearning } from './CrossDomainLearningService';
import { autoDocEngine } from './AutoDocumentationEngine';
import * as fs from 'fs/promises';
import * as path from 'path';

export class ContinuousLearningLoop {
  private running = false;
  private loopInterval = 60000; // 1 minute

  async start() {
    if (this.running) {
      console.log('[Learning Loop] Already running');
      return;
    }

    this.running = true;
    console.log('[Learning Loop] Started - continuous learning active');

    await this.captureInitialKnowledge();

    while (this.running) {
      try {
        await this.executeOneCycle();
        await this.sleep(this.loopInterval);
      } catch (error) {
        console.error('[Learning Loop] Cycle error:', error);
        await this.sleep(5000);
      }
    }
  }

  stop() {
    this.running = false;
    console.log('[Learning Loop] Stopped');
  }

  private async executeOneCycle() {
    console.log('[Learning Loop] Executing learning cycle...');

    const knowledge = await this.indexDocumentation();
    
    const patterns = await this.extractPatterns(knowledge);
    
    const opportunities = await this.detectOpportunities(patterns);

    if (opportunities.length > 0) {
      console.log(`[Learning Loop] Found ${opportunities.length} application opportunities`);
      
      for (const opp of opportunities) {
        const result = await crossDomainLearning.applyRemoteLearning(
          opp.domain,
          opp.pattern
        );

        if ('success' in result && result.success && 'metrics' in result && result.metrics) {
          console.log(`[Learning Loop] Successfully applied ${opp.pattern.pattern} to ${opp.domain}`);
        }
      }
    }

    await this.reindexAgentMemory();
  }

  private async captureInitialKnowledge() {
    console.log('[Learning Loop] Capturing initial cache standardization knowledge...');
    
    try {
      await agentLearningService.captureExistingCachePatterns();
      
      const highConfidence = await agentLearningService.getHighConfidenceLearnings(0.9);
      
      for (const learning of highConfidence) {
        await crossDomainLearning.broadcastLearning(learning);
      }

      console.log(`[Learning Loop] ✅ Initial knowledge captured and broadcasted`);
    } catch (error) {
      console.error('[Learning Loop] Failed to capture initial knowledge:', error);
    }
  }

  private async indexDocumentation(): Promise<string[]> {
    const docsPaths = [
      'docs/pages/architecture',
      'docs/pages/esa-agents',
      'docs/pages/design-systems',
      'docs/pages/learnings'
    ];

    const knowledge: string[] = [];

    for (const docPath of docsPaths) {
      try {
        const fullPath = path.join(process.cwd(), docPath);
        const files = await fs.readdir(fullPath);
        
        for (const file of files) {
          if (file.endsWith('.md')) {
            const content = await fs.readFile(path.join(fullPath, file), 'utf-8');
            knowledge.push(content);
          }
        }
      } catch (error) {
        // Directory might not exist yet
      }
    }

    return knowledge;
  }

  private async extractPatterns(knowledge: string[]): Promise<any[]> {
    const patterns: any[] = [];

    for (const doc of knowledge) {
      if (doc.includes('## Problem') && doc.includes('## Solution')) {
        const patternMatch = doc.match(/# (.+)\n/);
        const confidenceMatch = doc.match(/\*\*Confidence:\*\* (.+)%/);
        
        if (patternMatch) {
          patterns.push({
            pattern: patternMatch[1],
            confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) / 100 : 0.8,
            source: 'documentation'
          });
        }
      }
    }

    return patterns;
  }

  private async detectOpportunities(patterns: any[]): Promise<any[]> {
    const opportunities: any[] = [];
    const learnings = await agentLearningService.getHighConfidenceLearnings(0.85);

    for (const learning of learnings) {
      const domains = learning.agentDomains as string[] || [];
      
      for (const domain of domains) {
        const applied = learning.appliedTo as any;
        if (!applied || !applied[domain]) {
          opportunities.push({
            pattern: learning,
            domain,
            files: applied?.files || [],
            reason: 'high-confidence-unapplied'
          });
        }
      }
    }

    return opportunities;
  }

  private async reindexAgentMemory() {
    console.log('[Learning Loop] Re-indexing agent memory...');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const learningLoop = new ContinuousLearningLoop();
