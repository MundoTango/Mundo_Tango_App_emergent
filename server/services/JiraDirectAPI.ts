import axios, { AxiosInstance } from 'axios';

/**
 * Direct Jira API Client
 * Bypasses Replit connector for reliable authentication
 */
export class JiraDirectAPI {
  private client: AxiosInstance;
  private domain: string;
  private email: string;
  
  constructor() {
    const apiToken = process.env.JIRA_API_TOKEN;
    const email = process.env.JIRA_EMAIL;
    const domain = process.env.JIRA_DOMAIN;
    
    if (!apiToken || !email || !domain) {
      throw new Error('Missing Jira credentials: JIRA_EMAIL, JIRA_API_TOKEN, JIRA_DOMAIN required');
    }
    
    this.email = email;
    this.domain = domain;
    
    // Create authenticated Axios instance
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    
    this.client = axios.create({
      baseURL: `https://${domain}.atlassian.net/rest/api/3`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }
  
  /**
   * Test connection to Jira
   */
  async testConnection(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const response = await this.client.get('/myself');
      return {
        success: true,
        user: {
          accountId: response.data.accountId,
          displayName: response.data.displayName,
          emailAddress: response.data.emailAddress
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
  
  /**
   * Get project by key
   */
  async getProject(projectKey: string): Promise<any> {
    const response = await this.client.get(`/project/${projectKey}`);
    return response.data;
  }
  
  /**
   * Create Epic
   */
  async createEpic(projectKey: string, epicData: {
    summary: string;
    description: string;
  }): Promise<any> {
    const project = await this.getProject(projectKey);
    
    const payload = {
      fields: {
        project: {
          key: projectKey
        },
        summary: epicData.summary,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: epicData.description
                }
              ]
            }
          ]
        },
        issuetype: {
          name: 'Epic'
        }
      }
    };
    
    const response = await this.client.post('/issue', payload);
    return response.data;
  }
  
  /**
   * Create Story linked to Epic
   */
  async createStory(projectKey: string, storyData: {
    summary: string;
    description: string;
    epicKey?: string;
    labels?: string[];
  }): Promise<any> {
    const payload: any = {
      fields: {
        project: {
          key: projectKey
        },
        summary: storyData.summary,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: storyData.description
                }
              ]
            }
          ]
        },
        issuetype: {
          name: 'Story'
        }
      }
    };
    
    // Add Epic link if provided
    if (storyData.epicKey) {
      payload.fields.parent = {
        key: storyData.epicKey
      };
    }
    
    // Add labels if provided
    if (storyData.labels && storyData.labels.length > 0) {
      payload.fields.labels = storyData.labels;
    }
    
    const response = await this.client.post('/issue', payload);
    return response.data;
  }
  
  /**
   * Update issue status
   */
  async updateIssueStatus(issueKey: string, statusName: string): Promise<any> {
    // Get available transitions
    const transitionsResponse = await this.client.get(`/issue/${issueKey}/transitions`);
    const transitions = transitionsResponse.data.transitions;
    
    // Find transition that matches status
    const transition = transitions.find((t: any) => 
      t.to.name.toLowerCase() === statusName.toLowerCase()
    );
    
    if (!transition) {
      throw new Error(`Status "${statusName}" not found for issue ${issueKey}`);
    }
    
    // Execute transition
    const response = await this.client.post(`/issue/${issueKey}/transitions`, {
      transition: {
        id: transition.id
      }
    });
    
    return response.data;
  }
  
  /**
   * Add comment to issue
   */
  async addComment(issueKey: string, comment: string): Promise<any> {
    const payload = {
      body: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: comment
              }
            ]
          }
        ]
      }
    };
    
    const response = await this.client.post(`/issue/${issueKey}/comment`, payload);
    return response.data;
  }
  
  /**
   * Search issues with JQL
   */
  async searchIssues(jql: string, fields?: string[]): Promise<any[]> {
    const payload = {
      jql,
      fields: fields || ['summary', 'status', 'assignee', 'created', 'updated']
    };
    
    const response = await this.client.post('/search', payload);
    return response.data.issues;
  }
}
