// ESA Agent #67: GitHub Issue → Story Sync Service
// Automatically creates Stories from GitHub issues

import { Octokit } from '@octokit/rest';
import { db } from '../db';
import { projectStories, projectComments } from '../../shared/schema';
import { eq } from 'drizzle-orm';

interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  labels: Array<{ name: string }>;
  html_url: string;
  user: { login: string };
  created_at: string;
  updated_at: string;
}

export class GitHubStorySync {
  private octokit: Octokit | null = null;
  private owner: string = '';
  private repo: string = '';

  constructor() {
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      this.octokit = new Octokit({ auth: githubToken });
    }
  }

  /**
   * Configure repository to sync
   */
  configure(owner: string, repo: string) {
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Fetch all open GitHub issues and sync to Stories
   */
  async syncIssues(epicId?: number): Promise<{ synced: number; errors: string[] }> {
    if (!this.octokit) {
      throw new Error('GitHub token not configured. Set GITHUB_TOKEN environment variable.');
    }

    try {
      const { data: issues } = await this.octokit.issues.listForRepo({
        owner: this.owner,
        repo: this.repo,
        state: 'all',
        per_page: 100
      });

      const errors: string[] = [];
      let synced = 0;

      for (const issue of issues) {
        try {
          await this.syncIssueToStory(issue as GitHubIssue, epicId);
          synced++;
        } catch (error: any) {
          errors.push(`Issue #${issue.number}: ${error.message}`);
        }
      }

      return { synced, errors };
    } catch (error: any) {
      throw new Error(`Failed to fetch GitHub issues: ${error.message}`);
    }
  }

  /**
   * Sync single GitHub issue to Story
   */
  async syncIssueToStory(issue: GitHubIssue, epicId?: number): Promise<number> {
    const storyKey = `GH-${issue.number}`;
    
    // Check if story already exists
    const [existingStory] = await db
      .select()
      .from(projectStories)
      .where(eq(projectStories.key, storyKey))
      .limit(1);

    const storyData = {
      key: storyKey,
      epicId: epicId || null,
      summary: issue.title,
      description: issue.body || '',
      status: issue.state === 'open' ? 'to_do' : 'done',
      priority: this.extractPriority(issue.labels),
      labels: issue.labels.map(l => l.name),
      createdById: 1 // System user - can be mapped to GitHub user later
    };

    if (existingStory) {
      // Update existing story
      await db
        .update(projectStories)
        .set({
          summary: storyData.summary,
          description: storyData.description,
          status: storyData.status as any,
          priority: storyData.priority as any,
          labels: storyData.labels,
          updatedAt: new Date()
        })
        .where(eq(projectStories.id, existingStory.id));

      return existingStory.id;
    } else {
      // Create new story
      const [newStory] = await db
        .insert(projectStories)
        .values(storyData)
        .returning();

      // Add GitHub link as comment
      await db.insert(projectComments).values({
        storyId: newStory.id,
        userId: 1,
        comment: `🔗 GitHub Issue: ${issue.html_url}\n\nSynced from GitHub by Agent #67`
      });

      return newStory.id;
    }
  }

  /**
   * Extract priority from GitHub labels
   */
  private extractPriority(labels: Array<{ name: string }>): string {
    const labelNames = labels.map(l => l.name.toLowerCase());
    
    if (labelNames.includes('priority: critical') || labelNames.includes('critical')) {
      return 'critical';
    }
    if (labelNames.includes('priority: high') || labelNames.includes('high')) {
      return 'high';
    }
    if (labelNames.includes('priority: low') || labelNames.includes('low')) {
      return 'low';
    }
    return 'medium';
  }

  /**
   * Webhook handler for GitHub issue events
   */
  async handleWebhook(payload: any): Promise<void> {
    const { action, issue } = payload;

    if (!issue) {
      throw new Error('Invalid webhook payload: missing issue');
    }

    switch (action) {
      case 'opened':
      case 'reopened':
      case 'edited':
        await this.syncIssueToStory(issue);
        break;
      case 'closed':
        await this.closeStory(issue.number);
        break;
      case 'labeled':
      case 'unlabeled':
        await this.syncIssueToStory(issue);
        break;
    }
  }

  /**
   * Close story when GitHub issue is closed
   */
  private async closeStory(issueNumber: number): Promise<void> {
    const storyKey = `GH-${issueNumber}`;
    
    await db
      .update(projectStories)
      .set({ status: 'done', updatedAt: new Date() })
      .where(eq(projectStories.key, storyKey));
  }
}

export const githubStorySync = new GitHubStorySync();
