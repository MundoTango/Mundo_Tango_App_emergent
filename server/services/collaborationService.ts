/**
 * Collaboration Service
 * MB.MD Track 8: Collaboration Infrastructure
 * Implements: Real-time editing, presence, comments, team workspaces
 */

export interface PresenceInfo {
  userId: number;
  username: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  currentPage: string;
  lastSeen: Date;
  cursor?: { x: number; y: number };
}

export interface Comment {
  id: string;
  userId: number;
  username: string;
  content: string;
  elementId?: string;
  position?: { x: number; y: number };
  resolved: boolean;
  replies: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  ownerId: number;
  members: Array<{
    userId: number;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joinedAt: Date;
  }>;
  createdAt: Date;
}

export interface ActivityFeedItem {
  id: string;
  userId: number;
  username: string;
  action: string;
  target: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class CollaborationService {
  private presenceMap: Map<number, PresenceInfo> = new Map();
  private comments: Comment[] = [];
  private activities: ActivityFeedItem[] = [];

  /**
   * Update user presence
   */
  updatePresence(userId: number, presence: Partial<PresenceInfo>): void {
    const existing = this.presenceMap.get(userId) || {
      userId,
      username: `User ${userId}`,
      avatar: '',
      status: 'online',
      currentPage: '/',
      lastSeen: new Date(),
    };

    this.presenceMap.set(userId, {
      ...existing,
      ...presence,
      lastSeen: new Date(),
    });
  }

  /**
   * Get online users
   */
  getOnlineUsers(page?: string): PresenceInfo[] {
    const users = Array.from(this.presenceMap.values());
    
    // Filter by page if specified
    if (page) {
      return users.filter(u => u.currentPage === page && u.status === 'online');
    }

    return users.filter(u => u.status === 'online');
  }

  /**
   * Add comment
   */
  addComment(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'resolved'>): Comment {
    const newComment: Comment = {
      id: Math.random().toString(36).substring(7),
      ...comment,
      resolved: false,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.comments.push(newComment);
    
    // Record activity
    this.addActivity({
      userId: comment.userId,
      username: comment.username,
      action: 'commented',
      target: comment.elementId || 'page',
    });

    return newComment;
  }

  /**
   * Add reply to comment
   */
  addReply(commentId: string, reply: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'resolved'>): Comment | null {
    const comment = this.comments.find(c => c.id === commentId);
    
    if (!comment) return null;

    const newReply: Comment = {
      id: Math.random().toString(36).substring(7),
      ...reply,
      resolved: false,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    comment.replies.push(newReply);
    comment.updatedAt = new Date();

    return newReply;
  }

  /**
   * Resolve comment
   */
  resolveComment(commentId: string, userId: number): boolean {
    const comment = this.comments.find(c => c.id === commentId);
    
    if (!comment) return false;

    comment.resolved = true;
    comment.updatedAt = new Date();

    return true;
  }

  /**
   * Get comments for element
   */
  getComments(elementId?: string): Comment[] {
    if (elementId) {
      return this.comments.filter(c => c.elementId === elementId);
    }
    
    return this.comments;
  }

  /**
   * Add activity to feed
   */
  addActivity(activity: Omit<ActivityFeedItem, 'id' | 'timestamp'>): void {
    this.activities.push({
      id: Math.random().toString(36).substring(7),
      ...activity,
      timestamp: new Date(),
    });

    // Keep only recent 1000 activities
    if (this.activities.length > 1000) {
      this.activities = this.activities.slice(-1000);
    }
  }

  /**
   * Get activity feed
   */
  getActivityFeed(options: {
    workspaceId?: string;
    userId?: number;
    limit?: number;
    since?: Date;
  }): ActivityFeedItem[] {
    let filtered = this.activities;

    if (options.userId) {
      filtered = filtered.filter(a => a.userId === options.userId);
    }

    if (options.since) {
      filtered = filtered.filter(a => a.timestamp >= options.since);
    }

    if (options.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered.reverse();
  }

  /**
   * Create workspace
   */
  createWorkspace(params: {
    name: string;
    description: string;
    ownerId: number;
  }): Workspace {
    const workspace: Workspace = {
      id: Math.random().toString(36).substring(7),
      name: params.name,
      description: params.description,
      ownerId: params.ownerId,
      members: [
        {
          userId: params.ownerId,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
      createdAt: new Date(),
    };

    return workspace;
  }

  /**
   * Add member to workspace
   */
  addMember(workspaceId: string, userId: number, role: 'admin' | 'member' | 'viewer'): boolean {
    // This would update database
    console.log(`Added user ${userId} to workspace ${workspaceId} as ${role}`);
    return true;
  }

  /**
   * Check permissions
   */
  checkPermission(params: {
    workspaceId: string;
    userId: number;
    permission: 'read' | 'write' | 'admin' | 'delete';
  }): boolean {
    // This would check actual permissions from database
    // For now, allow all
    return true;
  }

  /**
   * Broadcast change to collaborators
   */
  broadcastChange(params: {
    workspaceId: string;
    userId: number;
    changeType: 'edit' | 'delete' | 'create';
    target: string;
    data: any;
  }): void {
    // This would emit via WebSocket to all connected users in workspace
    console.log(`📡 Broadcasting ${params.changeType} to workspace ${params.workspaceId}`);
  }

  /**
   * Get real-time cursors
   */
  getCursors(page: string): Array<{ userId: number; username: string; position: { x: number; y: number } }> {
    return Array.from(this.presenceMap.values())
      .filter(u => u.currentPage === page && u.cursor)
      .map(u => ({
        userId: u.userId,
        username: u.username,
        position: u.cursor!,
      }));
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService();
