// ESA Agent #67: GitHub Integration Service
// Bidirectional sync between Project Tracker and GitHub Issues/PRs

import { Octokit } from '@octokit/rest';
import { db } from '../db';
import { projectStories, projectTasks } from '../../shared/schema';
import { eq } from 'drizzle-orm';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
async function getGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

export class GitHubSyncService {
  private owner: string = '';
  private repo: string = '';

  configure(owner: string, repo: string) {
    this.owner = owner;
    this.repo = repo;
  }

  // Sync Story to GitHub Issue
  async syncStoryToIssue(storyId: number): Promise<{ success: boolean; issueNumber?: number; url?: string; error?: string }> {
    try {
      const octokit = await getGitHubClient();
      
      const [story] = await db.select().from(projectStories).where(eq(projectStories.id, storyId));
      if (!story) {
        return { success: false, error: 'Story not found' };
      }

      // If already synced, update the existing issue
      if (story.githubIssueNumber) {
        await octokit.rest.issues.update({
          owner: this.owner,
          repo: this.repo,
          issue_number: story.githubIssueNumber,
          title: `${story.key}: ${story.summary}`,
          body: this.formatStoryDescription(story),
          labels: story.labels || [],
        });

        return {
          success: true,
          issueNumber: story.githubIssueNumber,
          url: story.githubIssueUrl || undefined,
        };
      }

      // Create new GitHub issue
      const { data: issue } = await octokit.rest.issues.create({
        owner: this.owner,
        repo: this.repo,
        title: `${story.key}: ${story.summary}`,
        body: this.formatStoryDescription(story),
        labels: story.labels || [],
      });

      // Update story with GitHub metadata
      await db.update(projectStories)
        .set({
          githubIssueNumber: issue.number,
          githubIssueUrl: issue.html_url,
          githubRepoName: `${this.owner}/${this.repo}`,
          githubSyncedAt: new Date(),
        })
        .where(eq(projectStories.id, storyId));

      return {
        success: true,
        issueNumber: issue.number,
        url: issue.html_url,
      };
    } catch (error: any) {
      console.error('[GitHubSync] Error syncing story to issue:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync GitHub Issue to Story
  async syncIssueToStory(issueNumber: number): Promise<{ success: boolean; storyId?: number; error?: string }> {
    try {
      const octokit = await getGitHubClient();
      
      const { data: issue } = await octokit.rest.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
      });

      // Find existing story by GitHub issue number
      const [existingStory] = await db.select()
        .from(projectStories)
        .where(eq(projectStories.githubIssueNumber, issueNumber));

      if (existingStory) {
        // Update existing story
        await db.update(projectStories)
          .set({
            summary: this.extractSummaryFromIssue(issue.title),
            description: issue.body || null,
            status: issue.state === 'closed' ? 'done' : 'in_progress',
            githubSyncedAt: new Date(),
          })
          .where(eq(projectStories.id, existingStory.id));

        return { success: true, storyId: existingStory.id };
      }

      return { success: false, error: 'Story not found - create manually first, then sync' };
    } catch (error: any) {
      console.error('[GitHubSync] Error syncing issue to story:', error);
      return { success: false, error: error.message };
    }
  }

  // Link Task to Pull Request
  async linkTaskToPR(taskId: number, prNumber: number): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const octokit = await getGitHubClient();
      
      const { data: pr } = await octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
      });

      await db.update(projectTasks)
        .set({
          githubPrNumber: pr.number,
          githubPrUrl: pr.html_url,
          githubBranch: pr.head.ref,
          githubCommitSha: pr.head.sha,
          githubSyncedAt: new Date(),
        })
        .where(eq(projectTasks.id, taskId));

      return {
        success: true,
        url: pr.html_url,
      };
    } catch (error: any) {
      console.error('[GitHubSync] Error linking task to PR:', error);
      return { success: false, error: error.message };
    }
  }

  // Webhook handler for GitHub events
  async handleWebhook(payload: any): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const event = payload.action;
      
      if (payload.issue) {
        // Issue event
        const issueNumber = payload.issue.number;
        const [story] = await db.select()
          .from(projectStories)
          .where(eq(projectStories.githubIssueNumber, issueNumber));

        if (story) {
          const newStatus = payload.issue.state === 'closed' ? 'done' : 
                          payload.issue.state === 'open' ? 'in_progress' : story.status;

          await db.update(projectStories)
            .set({
              status: newStatus,
              githubSyncedAt: new Date(),
            })
            .where(eq(projectStories.id, story.id));

          return { success: true, message: `Story ${story.key} updated from GitHub issue` };
        }
      }

      if (payload.pull_request) {
        // PR event
        const prNumber = payload.pull_request.number;
        const [task] = await db.select()
          .from(projectTasks)
          .where(eq(projectTasks.githubPrNumber, prNumber));

        if (task) {
          const newStatus = payload.pull_request.merged ? 'done' :
                          payload.pull_request.state === 'closed' ? 'cancelled' : task.status;

          await db.update(projectTasks)
            .set({
              status: newStatus,
              githubCommitSha: payload.pull_request.head.sha,
              githubSyncedAt: new Date(),
            })
            .where(eq(projectTasks.id, task.id));

          return { success: true, message: `Task #${task.id} updated from GitHub PR` };
        }
      }

      return { success: true, message: 'Webhook processed (no matching entities)' };
    } catch (error: any) {
      console.error('[GitHubSync] Error handling webhook:', error);
      return { success: false, error: error.message };
    }
  }

  private formatStoryDescription(story: any): string {
    let body = story.description || '';
    
    body += `\n\n---\n`;
    body += `**Story:** ${story.key}\n`;
    body += `**Status:** ${story.status}\n`;
    body += `**Priority:** ${story.priority}\n`;
    if (story.storyPoints) body += `**Story Points:** ${story.storyPoints}\n`;
    if (story.assignedAgentId) body += `**Assigned Agent:** ${story.assignedAgentId}\n`;
    
    return body;
  }

  private extractSummaryFromIssue(title: string): string {
    // Remove "MUN-XX: " prefix if present
    return title.replace(/^[A-Z]+-\d+:\s*/, '');
  }
}

export const githubSyncService = new GitHubSyncService();
