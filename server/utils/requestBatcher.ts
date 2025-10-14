import DataLoader from 'dataloader';
import { storage } from '../storage';

// DataLoader pattern for batching database requests
export class RequestBatcher {
  private userLoader: DataLoader<number, any>;
  private postLoader: DataLoader<number, any>;
  private groupLoader: DataLoader<number, any>;
  private eventLoader: DataLoader<number, any>;

  constructor() {
    // User batching
    this.userLoader = new DataLoader(async (userIds: readonly number[]) => {
      const users = await storage.getUsersByIds(Array.from(userIds));
      const userMap = new Map(users.map(u => [u.id, u]));
      return userIds.map(id => userMap.get(id) || null);
    }, {
      maxBatchSize: 100,
      batchScheduleFn: callback => setTimeout(callback, 10) // 10ms batching window
    });

    // Post batching
    this.postLoader = new DataLoader(async (postIds: readonly number[]) => {
      const posts = await storage.getPostsByIds(Array.from(postIds));
      const postMap = new Map(posts.map(p => [p.id, p]));
      return postIds.map(id => postMap.get(id) || null);
    }, { maxBatchSize: 100 });

    // Group batching
    this.groupLoader = new DataLoader(async (groupIds: readonly number[]) => {
      const groups = await storage.getGroupsByIds(Array.from(groupIds));
      const groupMap = new Map(groups.map(g => [g.id, g]));
      return groupIds.map(id => groupMap.get(id) || null);
    }, { maxBatchSize: 100 });

    // Event batching
    this.eventLoader = new DataLoader(async (eventIds: readonly number[]) => {
      const events = await storage.getEventsByIds(Array.from(eventIds));
      const eventMap = new Map(events.map(e => [e.id, e]));
      return eventIds.map(id => eventMap.get(id) || null);
    }, { maxBatchSize: 100 });
  }

  async getUser(userId: number) {
    return this.userLoader.load(userId);
  }

  async getPost(postId: number) {
    return this.postLoader.load(postId);
  }

  async getGroup(groupId: number) {
    return this.groupLoader.load(groupId);
  }

  async getEvent(eventId: number) {
    return this.eventLoader.load(eventId);
  }

  // Clear cache for specific entity
  clearUser(userId: number) {
    this.userLoader.clear(userId);
  }

  clearPost(postId: number) {
    this.postLoader.clear(postId);
  }

  clearGroup(groupId: number) {
    this.groupLoader.clear(groupId);
  }

  clearEvent(eventId: number) {
    this.eventLoader.clear(eventId);
  }

  // Clear all caches
  clearAll() {
    this.userLoader.clearAll();
    this.postLoader.clearAll();
    this.groupLoader.clearAll();
    this.eventLoader.clearAll();
  }

  // Prime cache with data
  primeUser(user: any) {
    this.userLoader.prime(user.id, user);
  }

  primePost(post: any) {
    this.postLoader.prime(post.id, post);
  }

  primeGroup(group: any) {
    this.groupLoader.prime(group.id, group);
  }

  primeEvent(event: any) {
    this.eventLoader.prime(event.id, event);
  }
}

// Singleton instance
export const requestBatcher = new RequestBatcher();

// Middleware to attach batcher to request
export function attachBatcher(req: any, res: any, next: any) {
  req.batcher = requestBatcher;
  next();
}
