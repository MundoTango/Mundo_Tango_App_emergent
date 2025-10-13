/**
 * Parallel Agent Orchestrator
 * MB.MD PHASE 5 - TRACK 19
 * 
 * Enables concurrent agent execution with worker pool pattern
 */

import { EventEmitter } from 'events';

interface AgentTask {
  id: string;
  agentId: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
  execute: () => Promise<any>;
  timeout?: number;
}

interface WorkerStats {
  id: number;
  busy: boolean;
  tasksCompleted: number;
  currentTask: string | null;
}

export class ParallelAgentOrchestrator extends EventEmitter {
  private taskQueue: AgentTask[] = [];
  private workers: WorkerStats[] = [];
  private maxWorkers = 4;
  private runningTasks = new Map<number, Promise<any>>();

  constructor(maxWorkers = 4) {
    super();
    this.maxWorkers = maxWorkers;
    this.initializeWorkers();
  }

  /**
   * Initialize worker pool
   */
  private initializeWorkers() {
    for (let i = 0; i < this.maxWorkers; i++) {
      this.workers.push({
        id: i,
        busy: false,
        tasksCompleted: 0,
        currentTask: null
      });
    }
    console.log(`⚡ [Parallel Orchestrator] Initialized ${this.maxWorkers} workers`);
  }

  /**
   * Schedule agent task
   */
  async scheduleTask(task: AgentTask): Promise<any> {
    console.log(`📋 [Orchestrator] Scheduling task ${task.id} (Agent #${task.agentId}, Priority: ${task.priority})`);
    
    // Add to priority queue
    this.taskQueue.push(task);
    this.sortTaskQueue();
    
    // Try to execute immediately if worker available
    return this.processQueue();
  }

  /**
   * Execute multiple agents in parallel
   */
  async executeParallel(tasks: AgentTask[]): Promise<any[]> {
    console.log(`🚀 [Orchestrator] Executing ${tasks.length} tasks in parallel...`);
    
    const promises = tasks.map(task => this.scheduleTask(task));
    return Promise.all(promises);
  }

  /**
   * Process task queue
   */
  private async processQueue(): Promise<any> {
    if (this.taskQueue.length === 0) {
      return null;
    }

    // Find available worker
    const worker = this.workers.find(w => !w.busy);
    if (!worker) {
      // All workers busy, task will be processed when worker becomes available
      return new Promise((resolve) => {
        this.once('worker-available', () => {
          this.processQueue().then(resolve);
        });
      });
    }

    // Get next task
    const task = this.taskQueue.shift();
    if (!task) return null;

    // Assign task to worker
    worker.busy = true;
    worker.currentTask = task.id;

    console.log(`⚙️ [Worker ${worker.id}] Executing task ${task.id} (Agent #${task.agentId})`);

    try {
      // Execute task with timeout
      const timeout = task.timeout || 30000;
      const result = await this.executeWithTimeout(task.execute(), timeout);
      
      worker.tasksCompleted++;
      worker.busy = false;
      worker.currentTask = null;

      console.log(`✅ [Worker ${worker.id}] Completed task ${task.id}`);
      
      // Emit worker available event
      this.emit('worker-available', worker.id);
      
      // Process next task
      this.processQueue();
      
      return result;
    } catch (error) {
      worker.busy = false;
      worker.currentTask = null;
      
      console.error(`❌ [Worker ${worker.id}] Task ${task.id} failed:`, error);
      
      this.emit('worker-available', worker.id);
      this.processQueue();
      
      throw error;
    }
  }

  /**
   * Execute task with timeout
   */
  private async executeWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Task timeout')), timeout)
      )
    ]);
  }

  /**
   * Sort task queue by priority
   */
  private sortTaskQueue() {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    this.taskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Get orchestrator statistics
   */
  getStats() {
    const busyWorkers = this.workers.filter(w => w.busy).length;
    const totalCompleted = this.workers.reduce((sum, w) => sum + w.tasksCompleted, 0);
    
    return {
      maxWorkers: this.maxWorkers,
      busyWorkers,
      availableWorkers: this.maxWorkers - busyWorkers,
      queuedTasks: this.taskQueue.length,
      totalCompleted,
      workers: this.workers.map(w => ({
        id: w.id,
        busy: w.busy,
        tasksCompleted: w.tasksCompleted,
        currentTask: w.currentTask
      }))
    };
  }

  /**
   * Clear task queue
   */
  clearQueue() {
    this.taskQueue = [];
    console.log('🧹 [Orchestrator] Task queue cleared');
  }
}

// Singleton instance
export const parallelOrchestrator = new ParallelAgentOrchestrator(4);
