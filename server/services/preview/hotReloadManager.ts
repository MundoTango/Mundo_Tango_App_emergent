/**
 * TRACK 3A: Hot Reload Manager for Auto-Preview
 * MB.MD Vibe Coding - 100% Plan
 * 
 * Implements iframe hot-reload with <500ms updates
 * Pattern: Vite HMR + Socket.io events + cache-busting
 */

import type { Server as SocketIOServer } from 'socket.io';
import { watch } from 'chokidar';
import path from 'path';

export interface HotReloadConfig {
  watchPaths: string[];
  debounceMs: number;
  targetLatency: number; // Target: <500ms
}

export class HotReloadManager {
  private io: SocketIOServer;
  private watcher: any;
  private lastReload: number = 0;
  private config: HotReloadConfig;

  constructor(io: SocketIOServer, config: Partial<HotReloadConfig> = {}) {
    this.io = io;
    this.config = {
      watchPaths: config.watchPaths || ['client/src/**/*', 'server/**/*'],
      debounceMs: config.debounceMs || 300,
      targetLatency: config.targetLatency || 500
    };
  }

  /**
   * Start watching files for changes
   */
  start(): void {
    console.log('[HotReloadManager] Starting file watcher...');
    
    this.watcher = watch(this.config.watchPaths, {
      ignored: /(^|[\/\\])\../, // Ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100
      }
    });

    this.watcher
      .on('change', (filePath: string) => this.handleFileChange(filePath))
      .on('add', (filePath: string) => this.handleFileChange(filePath))
      .on('unlink', (filePath: string) => this.handleFileChange(filePath));

    console.log('[HotReloadManager] ✅ Watching:', this.config.watchPaths);
  }

  /**
   * Handle file change with debouncing
   */
  private handleFileChange(filePath: string): void {
    const now = Date.now();
    const timeSinceLastReload = now - this.lastReload;

    // Debounce rapid changes
    if (timeSinceLastReload < this.config.debounceMs) {
      return;
    }

    this.lastReload = now;
    const fileType = this.detectFileType(filePath);

    console.log(`[HotReloadManager] 🔥 File changed: ${filePath} (${fileType})`);

    // Emit hot-reload event to all connected clients
    this.io.emit('hot-reload', {
      type: fileType,
      filePath: path.relative(process.cwd(), filePath),
      timestamp: now,
      action: 'reload'
    });

    // Track latency
    const latency = Date.now() - now;
    if (latency > this.config.targetLatency) {
      console.warn(`[HotReloadManager] ⚠️ Latency ${latency}ms exceeds target ${this.config.targetLatency}ms`);
    } else {
      console.log(`[HotReloadManager] ✅ Hot reload triggered in ${latency}ms`);
    }
  }

  /**
   * Detect file type for smart reloading
   */
  private detectFileType(filePath: string): 'js' | 'css' | 'html' | 'other' {
    const ext = path.extname(filePath).toLowerCase();
    
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) return 'js';
    if (['.css', '.scss', '.sass'].includes(ext)) return 'css';
    if (['.html', '.htm'].includes(ext)) return 'html';
    return 'other';
  }

  /**
   * Manually trigger reload (for API-driven changes)
   */
  triggerReload(filePath?: string): void {
    console.log(`[HotReloadManager] 🔥 Manual reload triggered${filePath ? ` for ${filePath}` : ''}`);
    
    this.io.emit('hot-reload', {
      type: 'manual',
      filePath: filePath || 'unknown',
      timestamp: Date.now(),
      action: 'reload'
    });
  }

  /**
   * Stop watching files
   */
  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      console.log('[HotReloadManager] ❌ Stopped file watcher');
    }
  }
}
