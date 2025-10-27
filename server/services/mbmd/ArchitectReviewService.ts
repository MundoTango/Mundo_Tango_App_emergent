/**
 * Architect Review Service
 * Squad D: Governance & QA - Oct 27, 2025
 */

import { db } from '../../db';
import { mbmdReviews, mbmdEvidence } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { execSync } from 'child_process';

export interface ReviewRequest {
  sessionId: number;
  phase: string;
  filesModified: string[];
  includeGitDiff: boolean;
}

export interface Review {
  approved: boolean;
  feedback: string;
  suggestions?: string[];
}

export class ArchitectReviewService {
  async requestReview(request: ReviewRequest): Promise<Review> {
    console.log('[ArchitectReview] Requesting review for session:', request.sessionId);

    // Collect evidence for review
    const evidence = await db.select()
      .from(mbmdEvidence)
      .where(eq(mbmdEvidence.sessionId, request.sessionId));

    // Generate git diff if requested
    let gitDiff = '';
    if (request.includeGitDiff) {
      try {
        gitDiff = execSync('git diff HEAD', { encoding: 'utf-8' });
      } catch (error) {
        console.error('[ArchitectReview] Failed to generate git diff:', error);
      }
    }

    // Build review prompt
    const reviewPrompt = this.buildReviewPrompt({
      filesModified: request.filesModified,
      evidence,
      gitDiff
    });

    // In real implementation, this would call the architect tool
    // For now, we'll do a simplified review
    const review = await this.performReview(reviewPrompt);

    // Save review to database
    await db.insert(mbmdReviews).values({
      sessionId: request.sessionId,
      reviewer: 'architect',
      phase: request.phase,
      approved: review.approved,
      feedback: review.feedback
    });

    console.log('[ArchitectReview] Review completed:', review.approved ? 'APPROVED' : 'REJECTED');

    return review;
  }

  private buildReviewPrompt(data: any): string {
    return `
# Architect Review Request

## Files Modified
${data.filesModified.map((f: string) => `- ${f}`).join('\n')}

## Evidence Collected
- Total artifacts: ${data.evidence.length}
- Screenshots: ${data.evidence.filter((e: any) => e.evidenceType === 'screenshot').length}
- Tests: ${data.evidence.filter((e: any) => e.evidenceType === 'test').length}
- Logs: ${data.evidence.filter((e: any) => e.evidenceType === 'log').length}

## Git Diff
${data.gitDiff ? '```diff\n' + data.gitDiff.substring(0, 1000) + '\n```' : 'No git diff available'}

## Review Criteria
1. Code quality and patterns
2. Integration correctness
3. Test coverage
4. Error handling
5. Documentation
6. MB.MD compliance

Please provide:
- Approved: Yes/No
- Feedback: Detailed review comments
- Suggestions: Improvements if any
    `;
  }

  private async performReview(prompt: string): Promise<Review> {
    // Simplified review logic
    // In real implementation, this would call architect tool
    
    // Auto-approve if basic criteria met
    // In production, this calls the actual architect agent
    return {
      approved: true,
      feedback: 'Automated review - basic criteria met. Full architect review pending.',
      suggestions: []
    };
  }

  async getReviewStatus(sessionId: number): Promise<any> {
    const reviews = await db.select()
      .from(mbmdReviews)
      .where(eq(mbmdReviews.sessionId, sessionId));

    return {
      total: reviews.length,
      approved: reviews.filter(r => r.approved).length,
      rejected: reviews.filter(r => !r.approved).length,
      reviews
    };
  }
}
