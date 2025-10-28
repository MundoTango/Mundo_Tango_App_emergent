/**
 * Queue System for Scalability
 * Prevents rate limit errors and manages concurrent load
 * MB.MD: Support 1000s of concurrent users
 * Created: October 28, 2025
 */

interface QueueItem<T> {
  id: string;
  data: T;
  priority: number;
  addedAt: Date;
  retries: number;
}

interface QueueConfig {
  maxConcurrent: number;
  maxRetries: number;
  retryDelay: number; // ms
}

export class QueueSystem<T> {
  private queue: QueueItem<T>[] = [];
  private processing: Set<string> = new Set();
  private config: QueueConfig;
  
  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent || 10,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000
    };
  }
  
  /**
   * Add item to queue
   */
  async enqueue(id: string, data: T, priority: number = 0): Promise<void> {
    const item: QueueItem<T> = {
      id,
      data,
      priority,
      addedAt: new Date(),
      retries: 0
    };
    
    // Insert by priority (higher priority first)
    const insertIndex = this.queue.findIndex(i => i.priority < priority);
    if (insertIndex === -1) {
      this.queue.push(item);
    } else {
      this.queue.splice(insertIndex, 0, item);
    }
    
    console.log(`[Queue] Added ${id} (priority ${priority}), queue size: ${this.queue.length}`);
  }
  
  /**
   * Process queue with handler function
   */
  async processQueue(handler: (data: T) => Promise<void>): Promise<void> {
    while (this.queue.length > 0 || this.processing.size > 0) {
      // Start new tasks up to maxConcurrent
      while (
        this.queue.length > 0 &&
        this.processing.size < this.config.maxConcurrent
      ) {
        const item = this.queue.shift()!;
        this.processing.add(item.id);
        
        // Process in background
        this.processItem(item, handler).finally(() => {
          this.processing.delete(item.id);
        });
      }
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  /**
   * Process single item with retry logic
   */
  private async processItem(
    item: QueueItem<T>,
    handler: (data: T) => Promise<void>
  ): Promise<void> {
    try {
      console.log(`[Queue] Processing ${item.id}...`);
      await handler(item.data);
      console.log(`[Queue] ✅ Completed ${item.id}`);
    } catch (error) {
      console.error(`[Queue] ❌ Failed ${item.id}:`, error);
      
      // Retry logic
      if (item.retries < this.config.maxRetries) {
        item.retries++;
        console.log(`[Queue] Retrying ${item.id} (attempt ${item.retries})...`);
        
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        
        // Re-queue with lower priority
        this.queue.push(item);
      } else {
        console.error(`[Queue] Max retries exceeded for ${item.id}`);
      }
    }
  }
  
  /**
   * Get queue status
   */
  getStatus() {
    return {
      queued: this.queue.length,
      processing: this.processing.size,
      total: this.queue.length + this.processing.size
    };
  }
  
  /**
   * Get estimated wait time for new items
   */
  getEstimatedWait(): number {
    const avgProcessingTime = 30000; // 30 seconds average
    const queuePosition = this.queue.length;
    const batchesAhead = Math.ceil(queuePosition / this.config.maxConcurrent);
    
    return batchesAhead * avgProcessingTime;
  }
  
  /**
   * Clear all queued items
   */
  clear(): void {
    this.queue = [];
    console.log('[Queue] Cleared all queued items');
  }
}

/**
 * AI Request Queue - Prevents rate limit errors
 */
export class AIRequestQueue extends QueueSystem<{
  provider: string;
  model: string;
  messages: any[];
  onComplete: (response: any) => void;
  onError: (error: Error) => void;
}> {
  constructor() {
    super({
      maxConcurrent: 10, // 10 concurrent AI requests
      maxRetries: 3,
      retryDelay: 2000 // 2 second retry delay
    });
  }
  
  /**
   * Add AI request to queue
   */
  async queueRequest(
    id: string,
    provider: string,
    model: string,
    messages: any[],
    priority: number = 0
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.enqueue(id, {
        provider,
        model,
        messages,
        onComplete: resolve,
        onError: reject
      }, priority);
    });
  }
}

export const aiRequestQueue = new AIRequestQueue();
