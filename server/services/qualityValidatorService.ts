import OpenAI from 'openai';
import { db } from '../db';
import { qualityPatterns, solutionTracking, agents } from '../../shared/schema';
import { eq, desc, sql, ilike, and, or } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Issue {
  description: string;
  type?: string;
  context?: string;
  stackTrace?: string;
  affectedComponents?: string[];
}

export interface RootCauseAnalysis {
  issue: string;
  rootCause: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedFix: string;
  preventiveMeasures: string[];
  relatedPatterns: Pattern[];
  confidence: number;
}

export interface Pattern {
  id: number;
  pattern: string;
  issueType: string;
  rootCause: string;
  solutions: Solution[];
  codeExamples: CodeExample[];
  effectiveness: number;
  timesReused: number;
  similarityScore?: number;
}

export interface Solution {
  id: string;
  description: string;
  steps: string[];
  codeExample?: string;
  estimatedTime: string;
  complexity: 'low' | 'medium' | 'high';
}

export interface CodeExample {
  language: string;
  code: string;
  description: string;
}

export interface AgentResponse {
  agentId: string;
  agentName: string;
  response: string;
  confidence: number;
  timestamp: Date;
}

export class QualityValidatorService {
  
  /**
   * Analyze issue and find root cause using AI
   */
  async analyzeIssue(issue: Issue): Promise<RootCauseAnalysis> {
    try {
      // Step 1: Use OpenAI to analyze root cause
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are Agent #79 (Quality Validator) - an expert at diagnosing software issues and finding root causes.

Analyze the issue and provide a comprehensive analysis with:
1. Root cause (technical reason)
2. Category (performance, security, UX, logic, integration, etc.)
3. Severity (low, medium, high, critical)
4. Suggested fix (specific solution with steps)
5. Preventive measures (avoid future occurrences)
6. Confidence score (0-1)

Return JSON format only.`
          },
          {
            role: 'user',
            content: `Issue Description: ${issue.description}
${issue.type ? `Issue Type: ${issue.type}` : ''}
${issue.context ? `Context: ${issue.context}` : ''}
${issue.stackTrace ? `Stack Trace: ${issue.stackTrace}` : ''}
${issue.affectedComponents ? `Affected Components: ${issue.affectedComponents.join(', ')}` : ''}

Analyze the root cause and provide comprehensive solution.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');

      // Step 2: Find similar patterns from database
      const relatedPatterns = await this.findSimilarPatterns(issue);

      return {
        issue: issue.description,
        rootCause: analysis.rootCause || 'Unable to determine root cause',
        category: analysis.category || 'unknown',
        severity: analysis.severity || 'medium',
        suggestedFix: analysis.suggestedFix || 'No fix suggested',
        preventiveMeasures: analysis.preventiveMeasures || [],
        relatedPatterns: relatedPatterns.slice(0, 5),
        confidence: analysis.confidence || 0.7
      };
    } catch (error) {
      console.error('[Quality Validator] Analysis error:', error);
      throw new Error('Failed to analyze issue');
    }
  }

  /**
   * Find similar patterns in history using semantic search
   */
  async findSimilarPatterns(issue: Issue): Promise<Pattern[]> {
    try {
      // Get all patterns from database
      const allPatterns = await db
        .select()
        .from(qualityPatterns)
        .orderBy(desc(qualityPatterns.effectiveness))
        .limit(50);

      // Calculate similarity scores (simple keyword matching for now)
      const patternsWithScores = allPatterns.map(pattern => ({
        ...pattern,
        similarityScore: this.calculateSimilarity(
          issue.description.toLowerCase(),
          (pattern.pattern + ' ' + pattern.rootCause).toLowerCase()
        )
      }));

      // Filter and sort by similarity
      return patternsWithScores
        .filter(p => p.similarityScore > 0.5)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .map(p => ({
          id: p.id,
          pattern: p.pattern,
          issueType: p.issueType,
          rootCause: p.rootCause,
          solutions: Array.isArray(p.solutions) ? p.solutions as Solution[] : [],
          codeExamples: Array.isArray(p.codeExamples) ? p.codeExamples as CodeExample[] : [],
          effectiveness: p.effectiveness,
          timesReused: p.timesReused,
          similarityScore: p.similarityScore
        }));
    } catch (error) {
      console.error('[Quality Validator] Pattern search error:', error);
      return [];
    }
  }

  /**
   * Suggest solutions based on root cause
   */
  async suggestSolutions(rootCause: string): Promise<Solution[]> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a solution architect. Provide 2-3 practical solutions for the given root cause.
Each solution should include:
- Clear description
- Step-by-step implementation
- Code example (if applicable)
- Estimated time
- Complexity level

Return JSON array of solutions.`
          },
          {
            role: 'user',
            content: `Root Cause: ${rootCause}\n\nProvide practical solutions.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      return result.solutions || [];
    } catch (error) {
      console.error('[Quality Validator] Solution suggestion error:', error);
      return [];
    }
  }

  /**
   * Ask relevant peer agents for help (A2A communication)
   */
  async askPeerAgents(question: string, issueType?: string): Promise<AgentResponse[]> {
    try {
      // Find relevant agents based on issue type
      const relevantAgents = await db
        .select()
        .from(agents)
        .where(
          and(
            eq(agents.status, 'active'),
            issueType 
              ? ilike(agents.capabilities, `%${issueType}%`)
              : sql`true`
          )
        )
        .limit(5);

      console.log(`[Agent #79] Consulting ${relevantAgents.length} peer agents for: ${question.substring(0, 50)}...`);

      // Simulate agent responses (in production, use A2A protocol)
      const responses: AgentResponse[] = relevantAgents.map(agent => ({
        agentId: agent.id,
        agentName: agent.name,
        response: `Agent ${agent.name} suggests analyzing the ${issueType || 'issue'} from ${agent.type} perspective`,
        confidence: 0.75 + Math.random() * 0.2,
        timestamp: new Date()
      }));

      return responses;
    } catch (error) {
      console.error('[Quality Validator] Peer agent consultation error:', error);
      return [];
    }
  }

  /**
   * Search pattern library with semantic matching
   */
  async searchPatternLibrary(query: string): Promise<Pattern[]> {
    try {
      const patterns = await db
        .select()
        .from(qualityPatterns)
        .where(
          or(
            ilike(qualityPatterns.pattern, `%${query}%`),
            ilike(qualityPatterns.rootCause, `%${query}%`),
            ilike(qualityPatterns.issueType, `%${query}%`)
          )
        )
        .orderBy(desc(qualityPatterns.effectiveness))
        .limit(20);

      return patterns.map(p => ({
        id: p.id,
        pattern: p.pattern,
        issueType: p.issueType,
        rootCause: p.rootCause,
        solutions: Array.isArray(p.solutions) ? p.solutions as Solution[] : [],
        codeExamples: Array.isArray(p.codeExamples) ? p.codeExamples as CodeExample[] : [],
        effectiveness: p.effectiveness,
        timesReused: p.timesReused
      }));
    } catch (error) {
      console.error('[Quality Validator] Library search error:', error);
      return [];
    }
  }

  /**
   * Track solution effectiveness and reuse
   */
  async trackSolutionReuse(solutionData: {
    solutionId: number;
    reusedBy: string;
    issueContext: string;
    successful: boolean;
    feedback?: string;
  }): Promise<void> {
    try {
      // Record the reuse
      await db.insert(solutionTracking).values({
        solutionId: solutionData.solutionId,
        reusedBy: solutionData.reusedBy,
        issueContext: solutionData.issueContext,
        successful: solutionData.successful,
        feedback: solutionData.feedback,
        metadata: { timestamp: new Date().toISOString() }
      });

      // Update pattern effectiveness
      const pattern = await db
        .select()
        .from(qualityPatterns)
        .where(eq(qualityPatterns.id, solutionData.solutionId))
        .limit(1);

      if (pattern.length > 0) {
        const currentPattern = pattern[0];
        const newTimesReused = (currentPattern.timesReused ?? 0) + 1;
        const currentTotal = (currentPattern.effectiveness ?? 0) * (currentPattern.timesReused ?? 0);
        const newEffectiveness = (currentTotal + (solutionData.successful ? 1 : 0)) / newTimesReused;

        await db
          .update(qualityPatterns)
          .set({
            timesReused: newTimesReused,
            effectiveness: newEffectiveness,
            updatedAt: new Date()
          })
          .where(eq(qualityPatterns.id, solutionData.solutionId));

        console.log(`[Agent #79] Solution #${solutionData.solutionId} effectiveness updated: ${Math.round(newEffectiveness * 100)}%`);
      }
    } catch (error) {
      console.error('[Quality Validator] Track solution error:', error);
      throw new Error('Failed to track solution reuse');
    }
  }

  /**
   * Add new pattern to library
   */
  async addPattern(patternData: {
    pattern: string;
    issueType: string;
    rootCause: string;
    solutions: Solution[];
    codeExamples?: CodeExample[];
    agentId?: string;
    category?: string;
    tags?: string[];
  }): Promise<Pattern> {
    try {
      const [newPattern] = await db
        .insert(qualityPatterns)
        .values({
          pattern: patternData.pattern,
          issueType: patternData.issueType,
          rootCause: patternData.rootCause,
          solutions: patternData.solutions,
          codeExamples: patternData.codeExamples || [],
          agentId: patternData.agentId,
          category: patternData.category,
          tags: patternData.tags,
          effectiveness: 0,
          timesReused: 0
        })
        .returning();

      return {
        id: newPattern.id,
        pattern: newPattern.pattern,
        issueType: newPattern.issueType,
        rootCause: newPattern.rootCause,
        solutions: Array.isArray(newPattern.solutions) ? newPattern.solutions as Solution[] : [],
        codeExamples: Array.isArray(newPattern.codeExamples) ? newPattern.codeExamples as CodeExample[] : [],
        effectiveness: newPattern.effectiveness,
        timesReused: newPattern.timesReused
      };
    } catch (error) {
      console.error('[Quality Validator] Add pattern error:', error);
      throw new Error('Failed to add pattern');
    }
  }

  /**
   * Get solution statistics
   */
  async getSolutionStats(solutionId: number) {
    try {
      const stats = await db
        .select({
          totalUses: sql<number>`count(*)`,
          successRate: sql<number>`avg(case when ${solutionTracking.successful} then 1 else 0 end)`,
          uniqueUsers: sql<number>`count(distinct ${solutionTracking.reusedBy})`
        })
        .from(solutionTracking)
        .where(eq(solutionTracking.solutionId, solutionId));

      return stats[0] || { totalUses: 0, successRate: 0, uniqueUsers: 0 };
    } catch (error) {
      console.error('[Quality Validator] Stats error:', error);
      return { totalUses: 0, successRate: 0, uniqueUsers: 0 };
    }
  }

  /**
   * Helper: Calculate text similarity (simple keyword matching)
   * Production: Use vector embeddings with LanceDB
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(word => words2.includes(word));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);
    
    return Math.min(similarity * 2, 1);
  }
}

export const qualityValidatorService = new QualityValidatorService();
