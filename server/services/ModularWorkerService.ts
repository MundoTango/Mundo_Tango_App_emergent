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
    this.register('memory.capture-learning', async (payload) => {
      return await agentLearningService.captureLearning(payload.learning);
    });

    this.register('memory.discover-patterns', async (payload) => {
      const learnings = await agentLearningService.getHighConfidenceLearnings(0.85);
      return { patterns: learnings, count: learnings.length };
    });

    this.register('cache.analyze-performance', async (payload) => {
      return await agentLearningService.analyzeCachePerformance(payload.timeRange);
    });

    this.register('events.detect-patterns', async (payload) => {
      return { message: 'Event pattern detection placeholder', payload };
    });

    this.register('social.analyze-engagement', async (payload) => {
      return { message: 'Social engagement analysis placeholder', payload };
    });

    this.register('cross-domain.share-learning', async (payload) => {
      const opportunities = await crossDomainLearning.findApplicationOpportunities(
        payload.pattern
      );
      return { opportunities, count: opportunities.length };
    });
  }

  register(operation: string, handler: WorkerHandler) {
    this.handlers.set(operation, handler);
    console.log(`[Worker ${this.workerPrefix}] Registered handler: ${operation}`);
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log(`[Worker ${this.workerPrefix}] Starting worker loop...`);

    while (this.isRunning) {
      try {
        const job = await agentJobRouter.dequeueJob(this.workerPrefix);

        if (job) {
          const handlerKey = `${job.module}.${job.operation}`;
          const handler = this.handlers.get(handlerKey);

          if (handler) {
            console.log(`[Worker ${this.workerPrefix}] Processing ${handlerKey}`);
            
            try {
              const result = await handler(job.payload);
              await agentJobRouter.completeJob(job.id!, result);
              console.log(`[Worker ${this.workerPrefix}] ✅ Completed ${handlerKey}`);
            } catch (error) {
              console.error(`[Worker ${this.workerPrefix}] ❌ Failed ${handlerKey}:`, error);
              await agentJobRouter.failJob(
                job.id!,
                (error as Error).message,
                job.attempts < job.maxAttempts
              );
            }
          } else {
            console.warn(`[Worker ${this.workerPrefix}] No handler for ${handlerKey}`);
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
    console.log(`[Worker ${this.workerPrefix}] Stopped`);
  }
}

export const memoryWorker = new ModularWorkerService('memory');
export const cacheWorker = new ModularWorkerService('cache');
export const eventsWorker = new ModularWorkerService('events');
export const socialWorker = new ModularWorkerService('social');
export const crossDomainWorker = new ModularWorkerService('cross-domain');
