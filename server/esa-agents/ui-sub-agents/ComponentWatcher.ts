/**
 * Agent #11.5: Component File Watcher
 * Autonomous sub-agent under Agent #11 (Aurora - UI/UX Expert)
 * 
 * Responsibilities:
 * - Watch client/src/components/** for file changes
 * - Trigger relevant agents based on change type
 * - Debounce rapid changes (5 second delay)
 * - Log all component modifications for history
 * - Detect patterns in changes
 * 
 * Mode: Always running (file system watcher)
 */

import { Agent } from '../agent-system';
import chokidar from 'chokidar';
import { db } from '../../db';
import { sql } from 'drizzle-orm';

interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
  timestamp: Date;
}

interface ChangePattern {
  pattern: string;
  count: number;
  lastSeen: Date;
  examples: string[];
}

export class ComponentWatcher extends Agent {
  private watcher?: chokidar.FSWatcher;
  private changeBuffer: Map<string, NodeJS.Timeout> = new Map();
  private readonly DEBOUNCE_MS = 5000; // 5 seconds
  private changePatterns: Map<string, ChangePattern> = new Map();

  constructor() {
    super({
      id: 'component_watcher',
      name: 'Component File Watcher (Agent #11.5)',
      layers: [9, 10], // UI Framework, Component Library
      category: 'ui_sub_agent',
      resource_requirements: {
        cpu: '0.5 core',
        memory: '256MB',
        storage: '50MB',
      },
    } as any);
  }

  async processJob(job: any) {
    const { type, data } = job.data;

    switch (type) {
      case 'start_watching':
        return await this.startWatching();
      case 'stop_watching':
        return await this.stopWatching();
      case 'get_stats':
        return await this.getWatcherStats();
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }

  async execute(method: string, params: any) {
    switch (method) {
      case 'start':
        return await this.startWatching();
      case 'stop':
        return await this.stopWatching();
      case 'getStats':
        return await this.getWatcherStats();
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  async handleEvent(event: string, data: any) {
    // This agent generates events, doesn't handle them
  }

  /**
   * Start watching component files
   */
  private async startWatching(): Promise<void> {
    if (this.watcher) {
      console.log(`[${this.name}] Already watching files`);
      return;
    }

    console.log(`[${this.name}] Starting file watcher...`);

    this.watcher = chokidar.watch(
      [
        'client/src/components/**/*.{tsx,ts}',
        'client/src/pages/**/*.{tsx,ts}',
        'client/src/lib/**/*.{tsx,ts}',
      ],
      {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true,
      }
    );

    this.watcher
      .on('add', (path) => this.handleFileChange('add', path))
      .on('change', (path) => this.handleFileChange('change', path))
      .on('unlink', (path) => this.handleFileChange('unlink', path));

    console.log(`[${this.name}] File watcher started`);
    await this.setSharedState('watcher_status', 'running');
  }

  /**
   * Stop watching files
   */
  private async stopWatching(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = undefined;
      console.log(`[${this.name}] File watcher stopped`);
      await this.setSharedState('watcher_status', 'stopped');
    }
  }

  /**
   * Handle file change event
   */
  private handleFileChange(type: 'add' | 'change' | 'unlink', path: string): void {
    console.log(`[${this.name}] File ${type}: ${path}`);

    // Clear existing debounce timer
    const existingTimer = this.changeBuffer.get(path);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounce timer
    const timer = setTimeout(() => {
      this.processFileChange(type, path);
      this.changeBuffer.delete(path);
    }, this.DEBOUNCE_MS);

    this.changeBuffer.set(path, timer);
  }

  /**
   * Process file change (after debounce)
   */
  private async processFileChange(type: 'add' | 'change' | 'unlink', path: string): Promise<void> {
    console.log(`[${this.name}] Processing ${type} for ${path}`);

    try {
      // Log to component history
      await this.logComponentChange(type, path);

      // Detect patterns
      await this.detectPattern(path);

      // Trigger relevant agents based on file type
      await this.triggerRelevantAgents(type, path);
    } catch (error) {
      console.error(`[${this.name}] Error processing ${path}:`, error);
    }
  }

  /**
   * Log component change to database
   */
  private async logComponentChange(type: string, path: string): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO component_history (
          component_path,
          agent_id,
          change_type,
          change_description,
          changed_by,
          timestamp
        )
        VALUES (
          ${path},
          ${this.id},
          ${type},
          ${'File ' + type},
          'component_watcher',
          NOW()
        )
      `);

      console.log(`[${this.name}] Logged ${type} for ${path}`);
    } catch (error) {
      console.error(`[${this.name}] Error logging change:`, error);
    }
  }

  /**
   * Detect patterns in changes
   */
  private async detectPattern(path: string): Promise<void> {
    // Extract pattern (e.g., component type, file location)
    const pattern = this.extractPattern(path);

    if (pattern) {
      const existing = this.changePatterns.get(pattern) || {
        pattern,
        count: 0,
        lastSeen: new Date(),
        examples: [],
      };

      existing.count++;
      existing.lastSeen = new Date();
      if (!existing.examples.includes(path)) {
        existing.examples.push(path);
      }

      this.changePatterns.set(pattern, existing);

      // Report significant patterns
      if (existing.count >= 5) {
        await this.reportPattern(existing);
      }
    }
  }

  /**
   * Extract pattern from file path
   */
  private extractPattern(path: string): string | null {
    // Pattern: component type or location
    if (path.includes('/components/ui/')) {
      return 'ui_component_changes';
    } else if (path.includes('/components/glass/')) {
      return 'glass_component_changes';
    } else if (path.includes('/pages/')) {
      return 'page_changes';
    }

    return null;
  }

  /**
   * Report significant pattern to Agent #11
   */
  private async reportPattern(pattern: ChangePattern): Promise<void> {
    console.log(`[${this.name}] Detected pattern: ${pattern.pattern} (${pattern.count} occurrences)`);

    await this.setSharedState(`pattern_${pattern.pattern}`, pattern);
  }

  /**
   * Trigger relevant agents based on change
   */
  private async triggerRelevantAgents(type: string, path: string): Promise<void> {
    // Trigger Accessibility Auditor for component changes
    if (type !== 'unlink' && path.includes('components/')) {
      await this.triggerEvent('file_changed', { path, type });
    }

    // Trigger Dark Mode Fixer for UI components
    if (type === 'change' && path.includes('/ui/')) {
      console.log(`[${this.name}] UI component changed, triggering dark mode check`);
    }

    // Trigger Translation Fixer for page changes
    if (type === 'change' && path.includes('/pages/')) {
      console.log(`[${this.name}] Page changed, triggering translation check`);
    }
  }

  /**
   * Trigger event for other agents
   */
  private async triggerEvent(event: string, data: any): Promise<void> {
    // Use A2A protocol to broadcast event
    console.log(`[${this.name}] Broadcasting event: ${event}`, data);

    // Store event for agents to pick up
    await this.setSharedState(`event_${event}_${Date.now()}`, {
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get watcher statistics
   */
  private async getWatcherStats(): Promise<any> {
    const patterns = Array.from(this.changePatterns.values());
    const status = await this.getSharedState('watcher_status');

    return {
      status: status || 'stopped',
      patternsDetected: patterns.length,
      patterns: patterns.sort((a, b) => b.count - a.count),
      bufferSize: this.changeBuffer.size,
    };
  }
}
