/**
 * ESA LIFE CEO 61x21 - Layer 19: Content Management Service
 * Rich text, media, moderation, content workflows
 */

import { EventEmitter } from 'events';

export interface ContentItem {
  id: string;
  type: 'post' | 'comment' | 'event' | 'user_bio' | 'group_description';
  authorId: string;
  title?: string;
  content: string;
  mediaUrls: string[];
  metadata: {
    wordCount: number;
    readingTime: number;
    language: string;
    mentions: string[];
    hashtags: string[];
    links: string[];
  };
  moderation: {
    status: 'pending' | 'approved' | 'rejected' | 'flagged';
    score: number; // 0-100, higher is safer
    flags: string[];
    reviewedBy?: string;
    reviewedAt?: Date;
    autoModerated: boolean;
  };
  status: 'draft' | 'published' | 'archived' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ModerationRule {
  id: string;
  name: string;
  type: 'keyword' | 'pattern' | 'ai' | 'user_report';
  condition: string | RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'flag' | 'require_review' | 'auto_reject' | 'shadow_ban';
  description: string;
  enabled: boolean;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  content: string;
  mediaUrls: string[];
  changeReason?: string;
  createdAt: Date;
  createdBy: string;
}

export interface ModerationEvent {
  id: string;
  contentId: string;
  type: 'auto_flag' | 'user_report' | 'manual_review' | 'appeal';
  details: string;
  moderatorId?: string;
  reporterId?: string;
  timestamp: Date;
}

class ContentManagementService extends EventEmitter {
  private content = new Map<string, ContentItem>();
  private versions = new Map<string, ContentVersion[]>();
  private moderationRules = new Map<string, ModerationRule>();
  private moderationEvents = new Map<string, ModerationEvent[]>();
  
  // Content processing queue
  private processingQueue: ContentItem[] = [];
  private isProcessing = false;

  constructor() {
    super();
    this.setupModerationRules();
    this.startContentProcessor();
    console.log('[ESA Layer 19] Content management service initialized');
  }

  private setupModerationRules() {
    const rules: ModerationRule[] = [
      {
        id: 'profanity_filter',
        name: 'Profanity Filter',
        type: 'keyword',
        condition: 'damn|hell|shit|fuck|asshole|bitch',
        severity: 'medium',
        action: 'flag',
        description: 'Flags content with profanity for review',
        enabled: true
      },
      {
        id: 'spam_detection',
        name: 'Spam Detection',
        type: 'pattern',
        condition: /(.)\1{10,}|https?:\/\/[^\s]+.*https?:\/\/[^\s]+/i,
        severity: 'high',
        action: 'require_review',
        description: 'Detects repetitive text and multiple links',
        enabled: true
      },
      {
        id: 'harassment_keywords',
        name: 'Harassment Keywords',
        type: 'keyword',
        condition: 'hate|kill|die|stupid|idiot|loser|ugly',
        severity: 'high',
        action: 'require_review',
        description: 'Flags potential harassment content',
        enabled: true
      },
      {
        id: 'personal_info',
        name: 'Personal Information',
        type: 'pattern',
        condition: /\b\d{3}-?\d{2}-?\d{4}\b|\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/,
        severity: 'critical',
        action: 'auto_reject',
        description: 'Detects SSN and phone numbers',
        enabled: true
      },
      {
        id: 'excessive_caps',
        name: 'Excessive Caps',
        type: 'pattern',
        condition: /[A-Z]{20,}/,
        severity: 'low',
        action: 'flag',
        description: 'Flags content with excessive capitalization',
        enabled: true
      }
    ];

    rules.forEach(rule => {
      this.moderationRules.set(rule.id, rule);
    });

    console.log(`[ESA Layer 19] Loaded ${rules.length} moderation rules`);
  }

  async createContent(
    authorId: string,
    type: ContentItem['type'],
    content: string,
    options: {
      title?: string;
      mediaUrls?: string[];
      publishImmediately?: boolean;
    } = {}
  ): Promise<string> {
    const contentId = `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const contentItem: ContentItem = {
      id: contentId,
      type,
      authorId,
      title: options.title,
      content,
      mediaUrls: options.mediaUrls || [],
      metadata: this.analyzeContent(content),
      moderation: {
        status: 'pending',
        score: 0,
        flags: [],
        autoModerated: false
      },
      status: options.publishImmediately ? 'published' : 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: options.publishImmediately ? new Date() : undefined
    };

    // Create initial version
    this.versions.set(contentId, [{
      id: `${contentId}-v1`,
      contentId,
      version: 1,
      content,
      mediaUrls: contentItem.mediaUrls,
      createdAt: new Date(),
      createdBy: authorId
    }]);

    this.content.set(contentId, contentItem);
    
    // Add to moderation queue
    this.processingQueue.push(contentItem);
    
    if (!this.isProcessing) {
      this.processContentQueue();
    }

    this.emit('contentCreated', contentItem);
    console.log(`[ESA Layer 19] Created content ${contentId} (${type}) by user ${authorId}`);

    return contentId;
  }

  async updateContent(
    contentId: string,
    updates: {
      content?: string;
      title?: string;
      mediaUrls?: string[];
    },
    editorId: string,
    reason?: string
  ): Promise<boolean> {
    const contentItem = this.content.get(contentId);
    if (!contentItem) return false;

    // Create new version
    const versions = this.versions.get(contentId) || [];
    const newVersion: ContentVersion = {
      id: `${contentId}-v${versions.length + 1}`,
      contentId,
      version: versions.length + 1,
      content: updates.content || contentItem.content,
      mediaUrls: updates.mediaUrls || contentItem.mediaUrls,
      changeReason: reason,
      createdAt: new Date(),
      createdBy: editorId
    };

    versions.push(newVersion);
    this.versions.set(contentId, versions);

    // Update content item
    if (updates.content) {
      contentItem.content = updates.content;
      contentItem.metadata = this.analyzeContent(updates.content);
      
      // Reset moderation status if content changed significantly
      contentItem.moderation.status = 'pending';
      contentItem.moderation.score = 0;
      contentItem.moderation.flags = [];
    }

    if (updates.title) contentItem.title = updates.title;
    if (updates.mediaUrls) contentItem.mediaUrls = updates.mediaUrls;
    
    contentItem.updatedAt = new Date();

    // Re-process through moderation if content changed
    if (updates.content) {
      this.processingQueue.push(contentItem);
      if (!this.isProcessing) {
        this.processContentQueue();
      }
    }

    this.emit('contentUpdated', contentItem, newVersion);
    console.log(`[ESA Layer 19] Updated content ${contentId} (v${newVersion.version})`);

    return true;
  }

  private analyzeContent(content: string) {
    const words = content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200)); // 200 WPM average
    
    const mentions = this.extractMentions(content);
    const hashtags = this.extractHashtags(content);
    const links = this.extractLinks(content);
    
    return {
      wordCount: words,
      readingTime,
      language: this.detectLanguage(content),
      mentions,
      hashtags,
      links
    };
  }

  private extractMentions(content: string): string[] {
    const mentions = content.match(/@[\w]+/g) || [];
    return mentions.map(m => m.substring(1).toLowerCase());
  }

  private extractHashtags(content: string): string[] {
    const hashtags = content.match(/#[\w]+/g) || [];
    return hashtags.map(h => h.substring(1).toLowerCase());
  }

  private extractLinks(content: string): string[] {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return content.match(urlRegex) || [];
  }

  private detectLanguage(content: string): string {
    // Simple language detection based on common words
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'tango', 'milonga', 'baile'];
    const englishWords = ['the', 'of', 'and', 'to', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'with', 'as', 'his', 'they', 'dance', 'tango'];
    
    const words = content.toLowerCase().split(/\s+/);
    const spanishScore = words.filter(w => spanishWords.includes(w)).length;
    const englishScore = words.filter(w => englishWords.includes(w)).length;
    
    if (spanishScore > englishScore) return 'es';
    if (englishScore > spanishScore) return 'en';
    return 'unknown';
  }

  private async processContentQueue() {
    if (this.isProcessing || this.processingQueue.length === 0) return;

    this.isProcessing = true;
    console.log(`[ESA Layer 19] Processing ${this.processingQueue.length} content items for moderation`);

    while (this.processingQueue.length > 0) {
      const contentItem = this.processingQueue.shift()!;
      await this.moderateContent(contentItem);
      
      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    this.isProcessing = false;
  }

  private async moderateContent(contentItem: ContentItem) {
    let score = 100; // Start with perfect score
    const flags: string[] = [];
    let requiresReview = false;
    let shouldReject = false;

    const fullText = `${contentItem.title || ''} ${contentItem.content}`.toLowerCase();

    // Apply moderation rules
    for (const rule of this.moderationRules.values()) {
      if (!rule.enabled) continue;

      let matched = false;

      if (rule.type === 'keyword') {
        const keywords = rule.condition.toString().split('|');
        matched = keywords.some(keyword => fullText.includes(keyword.toLowerCase()));
      } else if (rule.type === 'pattern') {
        const pattern = rule.condition as RegExp;
        matched = pattern.test(fullText);
      }

      if (matched) {
        flags.push(rule.name);
        
        // Adjust score based on severity
        const penalty = {
          low: 5,
          medium: 15,
          high: 30,
          critical: 50
        }[rule.severity];
        
        score -= penalty;

        // Determine action
        if (rule.action === 'require_review') {
          requiresReview = true;
        } else if (rule.action === 'auto_reject') {
          shouldReject = true;
          break;
        }

        // Log moderation event
        await this.logModerationEvent({
          id: `mod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          contentId: contentItem.id,
          type: 'auto_flag',
          details: `Triggered rule: ${rule.name}`,
          timestamp: new Date()
        });
      }
    }

    // Additional AI-based moderation (simulated)
    const aiScore = await this.aiModerationCheck(contentItem);
    if (aiScore < 0.7) {
      flags.push('AI Detection');
      score -= (1 - aiScore) * 20;
      requiresReview = true;
    }

    // Update moderation status
    contentItem.moderation.score = Math.max(0, score);
    contentItem.moderation.flags = flags;
    contentItem.moderation.autoModerated = true;

    if (shouldReject) {
      contentItem.moderation.status = 'rejected';
      contentItem.status = 'archived';
    } else if (requiresReview || score < 70) {
      contentItem.moderation.status = 'flagged';
    } else {
      contentItem.moderation.status = 'approved';
    }

    this.emit('contentModerated', contentItem);
    
    console.log(`[ESA Layer 19] Moderated content ${contentItem.id}: ${contentItem.moderation.status} (score: ${score})`);
    if (flags.length > 0) {
      console.log(`[ESA Layer 19] Flags: ${flags.join(', ')}`);
    }
  }

  private async aiModerationCheck(contentItem: ContentItem): Promise<number> {
    // Simulated AI moderation check
    // In production, this would call actual AI services like OpenAI Moderation API
    
    const riskFactors = {
      profanity: contentItem.content.match(/\b(damn|hell|shit|fuck)\b/gi)?.length || 0,
      aggression: contentItem.content.match(/\b(hate|kill|die|murder)\b/gi)?.length || 0,
      spam: contentItem.metadata.links.length > 3 ? 1 : 0,
      allCaps: (contentItem.content.match(/[A-Z]/g)?.length || 0) / contentItem.content.length
    };

    let score = 1.0;
    score -= riskFactors.profanity * 0.1;
    score -= riskFactors.aggression * 0.2;
    score -= riskFactors.spam * 0.3;
    score -= riskFactors.allCaps > 0.5 ? 0.2 : 0;

    return Math.max(0, Math.min(1, score));
  }

  async reportContent(contentId: string, reporterId: string, reason: string): Promise<boolean> {
    const contentItem = this.content.get(contentId);
    if (!contentItem) return false;

    // Log report event
    await this.logModerationEvent({
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      contentId,
      type: 'user_report',
      details: reason,
      reporterId,
      timestamp: new Date()
    });

    // Flag for review if not already flagged
    if (contentItem.moderation.status === 'approved') {
      contentItem.moderation.status = 'flagged';
      contentItem.moderation.flags.push('User Report');
    }

    this.emit('contentReported', contentId, reporterId, reason);
    console.log(`[ESA Layer 19] Content ${contentId} reported by user ${reporterId}: ${reason}`);

    return true;
  }

  async reviewContent(
    contentId: string, 
    moderatorId: string, 
    decision: 'approve' | 'reject',
    notes?: string
  ): Promise<boolean> {
    const contentItem = this.content.get(contentId);
    if (!contentItem) return false;

    contentItem.moderation.status = decision === 'approve' ? 'approved' : 'rejected';
    contentItem.moderation.reviewedBy = moderatorId;
    contentItem.moderation.reviewedAt = new Date();

    if (decision === 'reject') {
      contentItem.status = 'archived';
    } else if (contentItem.status === 'draft') {
      contentItem.status = 'published';
      contentItem.publishedAt = new Date();
    }

    // Log review event
    await this.logModerationEvent({
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      contentId,
      type: 'manual_review',
      details: `${decision.toUpperCase()}: ${notes || 'No notes'}`,
      moderatorId,
      timestamp: new Date()
    });

    this.emit('contentReviewed', contentItem, decision, moderatorId);
    console.log(`[ESA Layer 19] Content ${contentId} ${decision}d by moderator ${moderatorId}`);

    return true;
  }

  private async logModerationEvent(event: ModerationEvent) {
    const events = this.moderationEvents.get(event.contentId) || [];
    events.push(event);
    this.moderationEvents.set(event.contentId, events);
  }

  // Content retrieval methods
  async getContent(contentId: string): Promise<ContentItem | null> {
    return this.content.get(contentId) || null;
  }

  async getContentByAuthor(authorId: string, status?: ContentItem['status']): Promise<ContentItem[]> {
    return Array.from(this.content.values())
      .filter(item => item.authorId === authorId && (!status || item.status === status))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getContentForModeration(limit = 50): Promise<ContentItem[]> {
    return Array.from(this.content.values())
      .filter(item => item.moderation.status === 'flagged' || item.moderation.status === 'pending')
      .sort((a, b) => {
        // Prioritize by severity of flags and creation date
        const aSeverity = item => item.moderation.flags.length * 10 + (100 - item.moderation.score);
        const bSeverity = item => item.moderation.flags.length * 10 + (100 - item.moderation.score);
        return bSeverity(b) - aSeverity(a);
      })
      .slice(0, limit);
  }

  async getContentVersions(contentId: string): Promise<ContentVersion[]> {
    return this.versions.get(contentId) || [];
  }

  async getModerationEvents(contentId: string): Promise<ModerationEvent[]> {
    return this.moderationEvents.get(contentId) || [];
  }

  // Rich text processing
  processRichText(content: string): string {
    // Convert markdown-like syntax to HTML
    let processed = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');

    // Process mentions
    processed = processed.replace(/@([\w]+)/g, '<a href="/users/$1" class="mention">@$1</a>');
    
    // Process hashtags
    processed = processed.replace(/#([\w]+)/g, '<a href="/hashtags/$1" class="hashtag">#$1</a>');

    return processed;
  }

  getSystemStats() {
    const allContent = Array.from(this.content.values());
    const last24h = allContent.filter(c => 
      c.createdAt.getTime() > Date.now() - 24 * 60 * 60 * 1000
    );

    return {
      totalContent: allContent.length,
      last24Hours: last24h.length,
      byStatus: {
        draft: allContent.filter(c => c.status === 'draft').length,
        published: allContent.filter(c => c.status === 'published').length,
        archived: allContent.filter(c => c.status === 'archived').length,
        deleted: allContent.filter(c => c.status === 'deleted').length
      },
      byModerationStatus: {
        pending: allContent.filter(c => c.moderation.status === 'pending').length,
        approved: allContent.filter(c => c.moderation.status === 'approved').length,
        flagged: allContent.filter(c => c.moderation.status === 'flagged').length,
        rejected: allContent.filter(c => c.moderation.status === 'rejected').length
      },
      processingQueue: this.processingQueue.length,
      moderationRules: this.moderationRules.size,
      averageModerationScore: allContent.reduce((acc, c) => acc + c.moderation.score, 0) / allContent.length || 0
    };
  }
}

export const contentManagementService = new ContentManagementService();

// Export for Layer 57 (Automation Management) integration
export const setupContentAutomation = () => {
  // Clean up old deleted content every day
  setInterval(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [id, content] of contentManagementService['content'].entries()) {
      if (content.status === 'deleted' && content.updatedAt < thirtyDaysAgo) {
        contentManagementService['content'].delete(id);
        contentManagementService['versions'].delete(id);
        contentManagementService['moderationEvents'].delete(id);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[ESA Layer 19] Cleaned up ${cleaned} old deleted content items`);
    }
  }, 24 * 60 * 60 * 1000);

  // Monitor moderation queue every 10 minutes
  setInterval(() => {
    const stats = contentManagementService.getSystemStats();
    if (stats.byModerationStatus.pending + stats.byModerationStatus.flagged > 100) {
      console.log(`[ESA Layer 19] Moderation queue warning: ${stats.byModerationStatus.pending + stats.byModerationStatus.flagged} items pending review`);
    }
  }, 10 * 60 * 1000);
};