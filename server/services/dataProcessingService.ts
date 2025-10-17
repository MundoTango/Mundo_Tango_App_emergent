/**
 * ESA LIFE CEO 61x21 - Layer 12: Data Processing Service
 * Batch operations, transformations, data pipeline management
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

export interface DataProcessingJob {
  id: string;
  type: 'batch' | 'stream' | 'transform';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: any[];
  processor: string;
  progress: number;
  startTime?: Date;
  endTime?: Date;
  metrics: {
    itemsProcessed: number;
    itemsTotal: number;
    avgProcessingTime: number;
    errors: number;
  };
}

export interface DataTransformer {
  name: string;
  transform: (data: any) => Promise<any>;
  validate?: (data: any) => boolean;
  batchSize?: number;
}

class DataProcessingService extends EventEmitter {
  private jobs = new Map<string, DataProcessingJob>();
  private transformers = new Map<string, DataTransformer>();
  private activeJobs = new Set<string>();
  private maxConcurrentJobs = 5;

  constructor() {
    super();
    this.setupDefaultTransformers();
  }

  private setupDefaultTransformers() {
    // User data transformer
    this.registerTransformer({
      name: 'userProfileProcessor',
      transform: async (userData) => ({
        ...userData,
        processedAt: new Date(),
        avatar: userData.avatar || '/default-avatar.png',
        displayName: userData.displayName || `${userData.firstName} ${userData.lastName}`,
        slug: userData.username?.toLowerCase().replace(/[^a-z0-9]/g, '-')
      }),
      batchSize: 100
    });

    // Event data transformer
    this.registerTransformer({
      name: 'eventDataProcessor',
      transform: async (eventData) => ({
        ...eventData,
        searchableText: `${eventData.title} ${eventData.description} ${eventData.location}`.toLowerCase(),
        dateFormatted: new Date(eventData.date).toISOString(),
        categoryTags: eventData.categories?.map((c: string) => c.toLowerCase()) || [],
        coordinates: await this.geocodeLocation(eventData.location)
      }),
      batchSize: 50
    });

    // Post content transformer
    this.registerTransformer({
      name: 'postContentProcessor',
      transform: async (postData) => ({
        ...postData,
        contentLength: postData.content?.length || 0,
        hashtags: this.extractHashtags(postData.content),
        mentions: this.extractMentions(postData.content),
        readingTime: Math.ceil((postData.content?.length || 0) / 200), // words per minute
        sentiment: await this.analyzeSentiment(postData.content)
      }),
      batchSize: 200
    });
  }

  registerTransformer(transformer: DataTransformer) {
    this.transformers.set(transformer.name, transformer);
    console.log(`[ESA Layer 12] Registered transformer: ${transformer.name}`);
  }

  async createJob(type: DataProcessingJob['type'], data: any[], processorName: string): Promise<string> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const job: DataProcessingJob = {
      id: jobId,
      type,
      status: 'pending',
      data,
      processor: processorName,
      progress: 0,
      metrics: {
        itemsProcessed: 0,
        itemsTotal: data.length,
        avgProcessingTime: 0,
        errors: 0
      }
    };

    this.jobs.set(jobId, job);
    this.emit('jobCreated', job);
    
    // Start processing if under limit
    if (this.activeJobs.size < this.maxConcurrentJobs) {
      this.processJob(jobId);
    }

    return jobId;
  }

  private async processJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    this.activeJobs.add(jobId);
    job.status = 'processing';
    job.startTime = new Date();
    
    const transformer = this.transformers.get(job.processor);
    if (!transformer) {
      job.status = 'failed';
      this.activeJobs.delete(jobId);
      this.emit('jobFailed', job, 'Transformer not found');
      return;
    }

    try {
      const batchSize = transformer.batchSize || 50;
      const batches = this.chunkArray(job.data, batchSize);
      let totalProcessingTime = 0;

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchStart = performance.now();

        for (const item of batch) {
          try {
            if (transformer.validate && !transformer.validate(item)) {
              job.metrics.errors++;
              continue;
            }

            await transformer.transform(item);
            job.metrics.itemsProcessed++;
            
          } catch (error) {
            job.metrics.errors++;
            console.error(`[ESA Layer 12] Error processing item:`, error);
          }
        }

        const batchTime = performance.now() - batchStart;
        totalProcessingTime += batchTime;
        
        job.progress = Math.round((job.metrics.itemsProcessed / job.metrics.itemsTotal) * 100);
        job.metrics.avgProcessingTime = totalProcessingTime / job.metrics.itemsProcessed;
        
        this.emit('jobProgress', job);
        
        // Yield control to prevent blocking
        await new Promise(resolve => setImmediate(resolve));
      }

      job.status = 'completed';
      job.endTime = new Date();
      job.progress = 100;
      
      this.emit('jobCompleted', job);
      console.log(`[ESA Layer 12] Job ${jobId} completed: ${job.metrics.itemsProcessed}/${job.metrics.itemsTotal} items`);

    } catch (error) {
      job.status = 'failed';
      job.endTime = new Date();
      this.emit('jobFailed', job, error);
      console.error(`[ESA Layer 12] Job ${jobId} failed:`, error);
    } finally {
      this.activeJobs.delete(jobId);
      this.processNextJob();
    }
  }

  private processNextJob() {
    if (this.activeJobs.size >= this.maxConcurrentJobs) return;
    
    const pendingJob = Array.from(this.jobs.values())
      .find(job => job.status === 'pending');
    
    if (pendingJob) {
      this.processJob(pendingJob.id);
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private extractHashtags(content: string): string[] {
    if (!content) return [];
    const hashtags = content.match(/#[\w]+/g) || [];
    return hashtags.map(tag => tag.substring(1).toLowerCase());
  }

  private extractMentions(content: string): string[] {
    if (!content) return [];
    const mentions = content.match(/@[\w]+/g) || [];
    return mentions.map(mention => mention.substring(1).toLowerCase());
  }

  private async analyzeSentiment(content: string): Promise<'positive' | 'neutral' | 'negative'> {
    if (!content) return 'neutral';
    
    // Simple sentiment analysis (could be enhanced with ML models)
    const positiveWords = ['love', 'great', 'awesome', 'fantastic', 'wonderful', 'amazing', 'excellent'];
    const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'worst', 'disappointing', 'bad'];
    
    const words = content.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private async geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
    // Mock geocoding - in production would use Google Maps Geocoding API
    const mockCoordinates: Record<string, { lat: number; lng: number }> = {
      'buenos aires': { lat: -34.6118, lng: -58.3960 },
      'paris': { lat: 48.8566, lng: 2.3522 },
      'new york': { lat: 40.7128, lng: -74.0060 },
      'madrid': { lat: 40.4168, lng: -3.7038 },
      'barcelona': { lat: 41.3851, lng: 2.1734 }
    };
    
    const normalized = location?.toLowerCase().trim();
    return mockCoordinates[normalized] || null;
  }

  getJob(jobId: string): DataProcessingJob | undefined {
    return this.jobs.get(jobId);
  }

  getJobsByStatus(status: DataProcessingJob['status']): DataProcessingJob[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  getSystemMetrics() {
    return {
      totalJobs: this.jobs.size,
      activeJobs: this.activeJobs.size,
      completedJobs: this.getJobsByStatus('completed').length,
      failedJobs: this.getJobsByStatus('failed').length,
      pendingJobs: this.getJobsByStatus('pending').length,
      processingJobs: this.getJobsByStatus('processing').length,
      registeredTransformers: Array.from(this.transformers.keys())
    };
  }

  // Batch processing utilities
  async processBatchUsers(users: any[]) {
    return this.createJob('batch', users, 'userProfileProcessor');
  }

  async processBatchEvents(events: any[]) {
    return this.createJob('batch', events, 'eventDataProcessor');
  }

  async processBatchPosts(posts: any[]) {
    return this.createJob('batch', posts, 'postContentProcessor');
  }
}

export const dataProcessingService = new DataProcessingService();

// Export for Layer 57 (Automation Management) integration
export const setupDataProcessingAutomation = () => {
  // Daily cleanup of completed jobs older than 7 days
  setInterval(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oldJobs = Array.from(dataProcessingService['jobs'].entries())
      .filter(([_, job]) => job.status === 'completed' && job.endTime && job.endTime < sevenDaysAgo);
    
    oldJobs.forEach(([jobId]) => {
      dataProcessingService['jobs'].delete(jobId);
    });
    
    console.log(`[ESA Layer 12] Cleaned up ${oldJobs.length} old completed jobs`);
  }, 24 * 60 * 60 * 1000); // Daily cleanup
};