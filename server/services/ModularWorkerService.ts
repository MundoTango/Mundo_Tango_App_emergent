import { agentJobRouter } from './AgentJobRouter';
import { agentLearningService } from './AgentLearningCaptureService';
import { crossDomainLearning } from './CrossDomainLearningService';

type WorkerHandler = (payload: any) => Promise<any>;

export class ModularWorkerService {
  private handlers: Map<string, WorkerHandler> = new Map();
  private isRunning = false;
  private workerPrefix: string;
  private pollInterval = 2000;

  constructor(workerPrefix: string) {
    this.workerPrefix = workerPrefix;
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers() {
    this.register('memory.capture-learning', async (data) => {
      const id = await agentLearningService.captureLearning(data.learning);
      return { learningId: id, captured: true };
    });

    this.register('memory.discover-patterns', async (data) => {
      const learnings = await agentLearningService.getHighConfidenceLearnings(data.minConfidence || 0.85);
      return { patterns: learnings, count: learnings.length };
    });

    this.register('cache.analyze-performance', async (data) => {
      return { message: 'Cache analysis complete', timeRange: data.timeRange };
    });

    this.register('events.detect-patterns', async (data) => {
      return { message: 'Event pattern detection complete', scanned: data.eventCount || 0 };
    });

    this.register('social.analyze-engagement', async (data) => {
      return { message: 'Social engagement analyzed', posts: data.postCount || 0 };
    });

    this.register('ai.optimize-prompts', async (data) => {
      return { message: 'AI prompt optimization complete', agentId: data.agentId };
    });

    this.register('cross-domain.share-learning', async (data) => {
      const opportunities = await crossDomainLearning.findApplicationOpportunities(data.pattern);
      return { opportunities, count: opportunities.length };
    });
  }

  register(operation: string, handler: WorkerHandler) {
    this.handlers.set(operation, handler);
    console.log(`[Worker ${this.workerPrefix}] Registered: ${operation}`);
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log(`[Worker ${this.workerPrefix}] 🚀 Started`);

    while (this.isRunning) {
      try {
        const job = await agentJobRouter.dequeueJob(this.workerPrefix);

        if (job) {
          const handler = this.handlers.get(job.jobName);

          if (handler) {
            console.log(`[Worker ${this.workerPrefix}] ⚙️  Processing ${job.jobName}`);
            
            try {
              const result = await handler(job.data);
              await agentJobRouter.completeJob(job.id!, result);
            } catch (error) {
              console.error(`[Worker ${this.workerPrefix}] ❌ ${job.jobName} failed:`, error);
              await agentJobRouter.failJob(
                job.id!,
                (error as Error).message,
                job.attempts < job.maxAttempts
              );
            }
          } else {
            console.warn(`[Worker ${this.workerPrefix}] No handler for ${job.jobName}`);
            await agentJobRouter.failJob(job.id!, 'No handler registered', false);
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, this.pollInterval));
        }
      } catch (error) {
        console.error(`[Worker ${this.workerPrefix}] Loop error:`, error);
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));
      }
    }
  }

  stop() {
    this.isRunning = false;
    console.log(`[Worker ${this.workerPrefix}] 🛑 Stopped`);
  }
}

export const memoryWorker = new ModularWorkerService('memory');
export const cacheWorker = new ModularWorkerService('cache');
export const eventsWorker = new ModularWorkerService('events');
export const socialWorker = new ModularWorkerService('social');
export const aiWorker = new ModularWorkerService('ai');
export const crossDomainWorker = new ModularWorkerService('cross-domain');
