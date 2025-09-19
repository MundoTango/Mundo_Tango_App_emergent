/**
 * ESA LIFE CEO Layer 14 - Cache Warming Service
 * Proactively warms cache with frequently accessed data
 */

import * as cron from 'node-cron';
import { cacheService } from './cache';
import { storage } from '../storage';

/**
 * Cache warming configuration
 */
interface WarmingJob {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
  enabled: boolean;
}

/**
 * Cache Warming Service
 */
class CacheWarmer {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private isRunning: boolean = false;

  /**
   * Define cache warming jobs
   */
  private warmingJobs: WarmingJob[] = [
    {
      name: 'city-groups',
      schedule: '0 */6 * * *', // Every 6 hours
      handler: this.warmCityGroups.bind(this),
      enabled: true
    },
    {
      name: 'user-profiles',
      schedule: '0 */12 * * *', // Every 12 hours
      handler: this.warmUserProfiles.bind(this),
      enabled: true
    },
    {
      name: 'event-listings',
      schedule: '*/30 * * * *', // Every 30 minutes
      handler: this.warmEventListings.bind(this),
      enabled: true
    },
    {
      name: 'popular-posts',
      schedule: '*/15 * * * *', // Every 15 minutes
      handler: this.warmPopularPosts.bind(this),
      enabled: true
    },
    {
      name: 'active-communities',
      schedule: '0 */3 * * *', // Every 3 hours
      handler: this.warmActiveCommunities.bind(this),
      enabled: true
    }
  ];

  /**
   * Start all cache warming jobs
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️  ESA Layer 14: Cache warming already running');
      return;
    }

    console.log('🔥 ESA Layer 14: Starting cache warming service...');

    // Schedule all enabled jobs
    for (const job of this.warmingJobs) {
      if (!job.enabled) continue;

      try {
        const task = cron.schedule(job.schedule, async () => {
          console.log(`🔥 ESA Layer 14: Running cache warming job: ${job.name}`);
          
          try {
            const startTime = Date.now();
            await job.handler();
            const duration = Date.now() - startTime;
            
            console.log(`✅ ESA Layer 14: Cache warming job ${job.name} completed in ${duration}ms`);
          } catch (error: any) {
            console.error(`❌ ESA Layer 14: Cache warming job ${job.name} failed:`, error.message);
          }
        }, {
          scheduled: true,
          timezone: "UTC"
        });

        this.jobs.set(job.name, task);
        console.log(`📅 ESA Layer 14: Scheduled cache warming job: ${job.name} (${job.schedule})`);

      } catch (error: any) {
        console.error(`❌ ESA Layer 14: Failed to schedule job ${job.name}:`, error.message);
      }
    }

    // Run initial warming immediately for critical data
    this.runInitialWarming();

    this.isRunning = true;
    console.log(`✅ ESA Layer 14: Cache warming service started with ${this.jobs.size} jobs`);
  }

  /**
   * Stop all cache warming jobs
   */
  stop(): void {
    if (!this.isRunning) return;

    console.log('🛑 ESA Layer 14: Stopping cache warming service...');

    for (const [name, task] of this.jobs) {
      task.stop();
      console.log(`⏹️  ESA Layer 14: Stopped job: ${name}`);
    }

    this.jobs.clear();
    this.isRunning = false;
    console.log('✅ ESA Layer 14: Cache warming service stopped');
  }

  /**
   * Run initial cache warming for critical data
   */
  private async runInitialWarming(): Promise<void> {
    console.log('🔥 ESA Layer 14: Running initial cache warming...');

    try {
      // Warm critical caches in parallel
      await Promise.all([
        this.warmCityGroups(),
        this.warmEventListings(),
        this.warmPopularPosts()
      ]);

      console.log('✅ ESA Layer 14: Initial cache warming completed');
    } catch (error: any) {
      console.error('⚠️  ESA Layer 14: Initial cache warming partially failed:', error.message);
    }
  }

  /**
   * Warm city groups cache
   */
  private async warmCityGroups(): Promise<void> {
    try {
      // Get all cities with groups
      const cities = await storage.getCitiesWithGroups?.() || [];
      
      if (!cities.length) {
        console.log('📍 ESA Layer 14: No city groups to warm');
        return;
      }

      // Cache city groups data
      const cacheItems = cities.map(city => ({
        key: `city:${city.id}:groups`,
        value: city,
        ttl: 21600 // 6 hours
      }));

      await cacheService.mset(cacheItems);

      // Cache aggregated city statistics
      const cityStats = {
        totalCities: cities.length,
        totalGroups: cities.reduce((sum, city) => sum + (city.groupsCount || 0), 0),
        totalMembers: cities.reduce((sum, city) => sum + (city.membersCount || 0), 0),
        lastUpdated: new Date().toISOString()
      };

      await cacheService.set('cities:stats', cityStats, 21600);
      
      console.log(`📍 ESA Layer 14: Warmed ${cities.length} city groups`);

    } catch (error: any) {
      console.error('❌ ESA Layer 14: Failed to warm city groups:', error.message);
    }
  }

  /**
   * Warm user profiles cache
   */
  private async warmUserProfiles(): Promise<void> {
    try {
      // Get recently active users
      const activeUsers = await storage.getRecentlyActiveUsers?.() || [];
      
      if (!activeUsers.length) {
        console.log('👤 ESA Layer 14: No active users to warm');
        return;
      }

      // Cache user profiles
      const cacheItems = activeUsers.map(user => ({
        key: `user:${user.id}:profile`,
        value: user,
        ttl: 43200 // 12 hours
      }));

      await cacheService.mset(cacheItems);
      
      console.log(`👤 ESA Layer 14: Warmed ${activeUsers.length} user profiles`);

    } catch (error: any) {
      console.error('❌ ESA Layer 14: Failed to warm user profiles:', error.message);
    }
  }

  /**
   * Warm event listings cache
   */
  private async warmEventListings(): Promise<void> {
    try {
      // Get upcoming events
      const upcomingEvents = await storage.getUpcomingEvents?.() || [];
      
      if (!upcomingEvents.length) {
        console.log('📅 ESA Layer 14: No upcoming events to warm');
        return;
      }

      // Cache individual events
      const cacheItems = upcomingEvents.map(event => ({
        key: `event:${event.id}`,
        value: event,
        ttl: 1800 // 30 minutes
      }));

      await cacheService.mset(cacheItems);

      // Cache events by city
      const eventsByCity = new Map<string, any[]>();
      for (const event of upcomingEvents) {
        if (event.cityId) {
          if (!eventsByCity.has(event.cityId)) {
            eventsByCity.set(event.cityId, []);
          }
          eventsByCity.get(event.cityId)!.push(event);
        }
      }

      // Cache city event lists
      const cityCacheItems = Array.from(eventsByCity.entries()).map(([cityId, events]) => ({
        key: `city:${cityId}:events`,
        value: events,
        ttl: 1800 // 30 minutes
      }));

      if (cityCacheItems.length > 0) {
        await cacheService.mset(cityCacheItems);
      }

      // Cache aggregated event statistics
      const eventStats = {
        totalEvents: upcomingEvents.length,
        citiesWithEvents: eventsByCity.size,
        nextEvent: upcomingEvents[0],
        lastUpdated: new Date().toISOString()
      };

      await cacheService.set('events:stats', eventStats, 1800);
      
      console.log(`📅 ESA Layer 14: Warmed ${upcomingEvents.length} events across ${eventsByCity.size} cities`);

    } catch (error: any) {
      console.error('❌ ESA Layer 14: Failed to warm event listings:', error.message);
    }
  }

  /**
   * Warm popular posts cache
   */
  private async warmPopularPosts(): Promise<void> {
    try {
      // Get popular posts from the last 7 days
      const popularPosts = await storage.getPopularPosts?.() || [];
      
      if (!popularPosts.length) {
        console.log('📝 ESA Layer 14: No popular posts to warm');
        return;
      }

      // Cache individual posts
      const cacheItems = popularPosts.map(post => ({
        key: `post:${post.id}`,
        value: post,
        ttl: 900 // 15 minutes
      }));

      await cacheService.mset(cacheItems);

      // Cache trending posts list
      await cacheService.set('posts:trending', popularPosts, 900);
      
      console.log(`📝 ESA Layer 14: Warmed ${popularPosts.length} popular posts`);

    } catch (error: any) {
      console.error('❌ ESA Layer 14: Failed to warm popular posts:', error.message);
    }
  }

  /**
   * Warm active communities cache
   */
  private async warmActiveCommunities(): Promise<void> {
    try {
      // Get active communities
      const communities = await storage.getActiveCommunities?.() || [];
      
      if (!communities.length) {
        console.log('🏘️ ESA Layer 14: No active communities to warm');
        return;
      }

      // Cache community data
      const cacheItems = communities.map(community => ({
        key: `community:${community.id}`,
        value: community,
        ttl: 10800 // 3 hours
      }));

      await cacheService.mset(cacheItems);

      // Cache community statistics
      const communityStats = {
        totalCommunities: communities.length,
        totalMembers: communities.reduce((sum, c) => sum + (c.memberCount || 0), 0),
        mostActive: communities[0],
        lastUpdated: new Date().toISOString()
      };

      await cacheService.set('communities:stats', communityStats, 10800);
      
      console.log(`🏘️ ESA Layer 14: Warmed ${communities.length} active communities`);

    } catch (error: any) {
      console.error('❌ ESA Layer 14: Failed to warm active communities:', error.message);
    }
  }

  /**
   * Manually trigger a specific warming job
   */
  async warmManual(jobName: string): Promise<void> {
    const job = this.warmingJobs.find(j => j.name === jobName);
    
    if (!job) {
      throw new Error(`Unknown warming job: ${jobName}`);
    }

    console.log(`🔥 ESA Layer 14: Manually warming ${jobName}...`);
    await job.handler();
  }

  /**
   * Warm all caches manually
   */
  async warmAll(): Promise<void> {
    console.log('🔥 ESA Layer 14: Manually warming all caches...');
    
    const results = await Promise.allSettled(
      this.warmingJobs.map(job => job.handler())
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ ESA Layer 14: Warming complete - ${successful} successful, ${failed} failed`);
  }

  /**
   * Get warming service status
   */
  getStatus(): {
    running: boolean;
    jobs: Array<{ name: string; schedule: string; enabled: boolean }>;
  } {
    return {
      running: this.isRunning,
      jobs: this.warmingJobs.map(j => ({
        name: j.name,
        schedule: j.schedule,
        enabled: j.enabled
      }))
    };
  }
}

// Export singleton instance
export const cacheWarmer = new CacheWarmer();
export default cacheWarmer;