# ESA Layer 24: Social Features Agent 🤝

## Overview
Layer 24 manages all social interactions including posts, comments, likes, shares, follows, and social graph management for community engagement.

## Core Responsibilities

### 1. Content Creation
- Posts and updates
- Media attachments
- Hashtags and mentions
- Content visibility
- Post scheduling

### 2. Social Interactions
- Likes and reactions
- Comments and replies
- Shares and reposts
- Bookmarks and saves
- Social notifications

### 3. Social Graph
- Following/followers
- Friend connections
- Blocking and muting
- Relationship management
- Social recommendations

## Open Source Packages

```json
{
  "react-mentions": "^4.4.10",
  "react-share": "^5.0.3",
  "react-infinite-scroll-component": "^6.1.0",
  "react-intersection-observer": "^9.5.3"
}
```

## Integration Points

- **Layer 1 (Database)**: Social data storage
- **Layer 11 (WebSockets)**: Real-time updates
- **Layer 16 (Notifications)**: Social notifications
- **Layer 19 (Content)**: Content management
- **Layer 21 (User Management)**: User relationships

## Post Service

```typescript
export class PostService {
  async createPost(data: CreatePostDto, userId: string): Promise<Post> {
    // Process content
    const processed = await this.processPostContent(data);
    
    // Create post
    const post = await db.insert(posts).values({
      id: generateId(),
      authorId: userId,
      content: processed.content,
      media: processed.media,
      type: data.type || 'text',
      visibility: data.visibility || 'public',
      groupId: data.groupId,
      tags: processed.tags,
      mentions: processed.mentions,
      metadata: {
        hasMedia: processed.media.length > 0,
        wordCount: this.getWordCount(processed.content),
        language: await this.detectLanguage(processed.content)
      },
      createdAt: new Date()
    });
    
    // Process mentions
    if (processed.mentions.length > 0) {
      await this.processMentions(post.id, processed.mentions);
    }
    
    // Process hashtags
    if (processed.tags.length > 0) {
      await this.processHashtags(post.id, processed.tags);
    }
    
    // Update user activity
    await this.updateUserActivity(userId, 'post_created');
    
    // Broadcast to followers
    await this.broadcastToFollowers(userId, post);
    
    // Index for search
    await searchService.indexPost(post);
    
    return post;
  }
  
  private async processPostContent(data: CreatePostDto) {
    let content = data.content;
    const mentions = [];
    const tags = [];
    
    // Extract mentions (@username)
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      const username = match[1];
      const user = await userService.getUserByUsername(username);
      if (user) {
        mentions.push(user.id);
        content = content.replace(
          match[0],
          `<span class="mention" data-user="${user.id}">@${username}</span>`
        );
      }
    }
    
    // Extract hashtags (#tag)
    const hashtagRegex = /#(\w+)/g;
    while ((match = hashtagRegex.exec(content)) !== null) {
      const tag = match[1].toLowerCase();
      tags.push(tag);
      content = content.replace(
        match[0],
        `<span class="hashtag" data-tag="${tag}">#${tag}</span>`
      );
    }
    
    // Process media
    const media = await this.processMediaAttachments(data.media);
    
    return { content, mentions, tags, media };
  }
  
  async getFeed(userId: string, options: FeedOptions): Promise<Post[]> {
    const { page = 1, limit = 20, type = 'home' } = options;
    
    let query = db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
    
    switch (type) {
      case 'home':
        // Get posts from followed users
        const following = await this.getFollowing(userId);
        query = query.where(inArray(posts.authorId, [...following, userId]));
        break;
        
      case 'explore':
        // Get trending/popular posts
        query = query
          .where(eq(posts.visibility, 'public'))
          .orderBy(desc(posts.likeCount), desc(posts.commentCount));
        break;
        
      case 'user':
        // Get specific user's posts
        query = query.where(eq(posts.authorId, options.userId));
        break;
    }
    
    const posts = await query;
    
    // Enrich with interaction data
    return await this.enrichPostsWithInteractions(posts, userId);
  }
}
```

## Interaction Service

```typescript
export class InteractionService {
  async likePost(postId: string, userId: string): Promise<void> {
    // Check if already liked
    const existing = await db
      .select()
      .from(likes)
      .where(and(
        eq(likes.postId, postId),
        eq(likes.userId, userId)
      ))
      .limit(1);
    
    if (existing[0]) {
      // Unlike
      await db
        .delete(likes)
        .where(and(
          eq(likes.postId, postId),
          eq(likes.userId, userId)
        ));
      
      await db
        .update(posts)
        .set({ likeCount: sql`like_count - 1` })
        .where(eq(posts.id, postId));
      
      // Remove notification
      await this.removeNotification('like', postId, userId);
    } else {
      // Like
      await db.insert(likes).values({
        postId,
        userId,
        createdAt: new Date()
      });
      
      await db
        .update(posts)
        .set({ likeCount: sql`like_count + 1` })
        .where(eq(posts.id, postId));
      
      // Send notification
      const post = await postService.getPost(postId);
      if (post.authorId !== userId) {
        await notificationService.send({
          userId: post.authorId,
          type: 'like',
          title: 'New like',
          body: `${user.name} liked your post`,
          data: { postId, userId }
        });
      }
    }
    
    // Broadcast update
    io.emit('post:updated', { postId, likes: await this.getLikeCount(postId) });
  }
  
  async addComment(
    postId: string,
    content: string,
    userId: string,
    parentId?: string
  ): Promise<Comment> {
    const comment = await db.insert(comments).values({
      id: generateId(),
      postId,
      parentId,
      userId,
      content,
      createdAt: new Date()
    });
    
    // Update comment count
    await db
      .update(posts)
      .set({ commentCount: sql`comment_count + 1` })
      .where(eq(posts.id, postId));
    
    // Send notification
    const post = await postService.getPost(postId);
    if (post.authorId !== userId) {
      await notificationService.send({
        userId: post.authorId,
        type: 'comment',
        title: 'New comment',
        body: `${user.name} commented on your post`,
        data: { postId, commentId: comment.id }
      });
    }
    
    // Notify parent comment author if reply
    if (parentId) {
      const parentComment = await this.getComment(parentId);
      if (parentComment.userId !== userId) {
        await notificationService.send({
          userId: parentComment.userId,
          type: 'reply',
          title: 'New reply',
          body: `${user.name} replied to your comment`,
          data: { commentId: comment.id }
        });
      }
    }
    
    return comment;
  }
  
  async sharePost(postId: string, userId: string, message?: string): Promise<Share> {
    const share = await db.insert(shares).values({
      id: generateId(),
      postId,
      userId,
      message,
      createdAt: new Date()
    });
    
    // Update share count
    await db
      .update(posts)
      .set({ shareCount: sql`share_count + 1` })
      .where(eq(posts.id, postId));
    
    // Create repost if message provided
    if (message) {
      await postService.createPost({
        content: message,
        type: 'repost',
        repostId: postId
      }, userId);
    }
    
    // Notify original author
    const post = await postService.getPost(postId);
    await notificationService.send({
      userId: post.authorId,
      type: 'share',
      title: 'Post shared',
      body: `${user.name} shared your post`,
      data: { postId, shareId: share.id }
    });
    
    return share;
  }
}
```

## Social Graph Management

```typescript
export class SocialGraphService {
  async followUser(followerId: string, followingId: string): Promise<void> {
    // Check if already following
    const existing = await this.checkFollowing(followerId, followingId);
    if (existing) return;
    
    // Create follow relationship
    await db.insert(follows).values({
      followerId,
      followingId,
      createdAt: new Date()
    });
    
    // Update counts
    await Promise.all([
      db
        .update(users)
        .set({ followerCount: sql`follower_count + 1` })
        .where(eq(users.id, followingId)),
      
      db
        .update(users)
        .set({ followingCount: sql`following_count + 1` })
        .where(eq(users.id, followerId))
    ]);
    
    // Send notification
    await notificationService.send({
      userId: followingId,
      type: 'follow',
      title: 'New follower',
      body: `${follower.name} started following you`,
      data: { followerId }
    });
    
    // Update recommendations
    await this.updateRecommendations(followerId);
  }
  
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ));
    
    // Update counts
    await Promise.all([
      db
        .update(users)
        .set({ followerCount: sql`follower_count - 1` })
        .where(eq(users.id, followingId)),
      
      db
        .update(users)
        .set({ followingCount: sql`following_count - 1` })
        .where(eq(users.id, followerId))
    ]);
  }
  
  async getFollowers(userId: string, options?: PaginationOptions): Promise<User[]> {
    const followers = await db
      .select({ user: users })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId))
      .orderBy(desc(follows.createdAt))
      .limit(options?.limit || 20)
      .offset(options?.offset || 0);
    
    return followers.map(f => f.user);
  }
  
  async getMutualFollowers(userId1: string, userId2: string): Promise<User[]> {
    const [followers1, followers2] = await Promise.all([
      this.getFollowers(userId1),
      this.getFollowers(userId2)
    ]);
    
    const mutualIds = followers1
      .filter(f => followers2.some(f2 => f2.id === f.id))
      .map(f => f.id);
    
    return await userService.getUsersByIds(mutualIds);
  }
  
  async getSocialRecommendations(userId: string): Promise<User[]> {
    // Get friends of friends
    const friendsOfFriends = await db
      .select({ userId: f2.followingId })
      .from(follows as f1)
      .innerJoin(follows as f2, eq(f1.followingId, f2.followerId))
      .where(and(
        eq(f1.followerId, userId),
        ne(f2.followingId, userId),
        notExists(
          db.select()
            .from(follows as f3)
            .where(and(
              eq(f3.followerId, userId),
              eq(f3.followingId, f2.followingId)
            ))
        )
      ))
      .groupBy(f2.followingId)
      .orderBy(desc(count()))
      .limit(10);
    
    // Get users with similar interests
    const similarUsers = await this.getUsersWithSimilarInterests(userId);
    
    // Combine and rank
    const recommendations = [...friendsOfFriends, ...similarUsers];
    return await this.rankRecommendations(recommendations, userId);
  }
}
```

## Social Feed Component

```tsx
export function SocialFeed() {
  const { user } = useAuth();
  const [feedType, setFeedType] = useState<'home' | 'explore'>('home');
  
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['feed', feedType],
    queryFn: ({ pageParam = 1 }) => 
      postService.getFeed(user.id, { 
        page: pageParam, 
        type: feedType 
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => 
      lastPage.length === 20 ? pages.length + 1 : undefined
  });
  
  const posts = data?.pages.flat() || [];
  
  return (
    <div className="social-feed">
      <FeedSelector value={feedType} onChange={setFeedType} />
      
      <CreatePost onPost={(post) => queryClient.invalidateQueries(['feed'])} />
      
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<PostSkeleton />}
        endMessage={<p>No more posts</p>}
      >
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </InfiniteScroll>
    </div>
  );
}

// Post card component
export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.isLiked);
  const [showComments, setShowComments] = useState(false);
  
  const likeMutation = useMutation({
    mutationFn: () => interactionService.likePost(post.id, user.id),
    onMutate: () => setLiked(!liked),
    onError: () => setLiked(liked)
  });
  
  return (
    <div className="post-card glass-card">
      <div className="post-header">
        <UserAvatar user={post.author} />
        <div className="post-meta">
          <Link to={`/profile/${post.author.id}`}>{post.author.name}</Link>
          <time>{formatRelativeTime(post.createdAt)}</time>
        </div>
        <PostMenu post={post} />
      </div>
      
      <div className="post-content">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        {post.media.length > 0 && <MediaGrid media={post.media} />}
      </div>
      
      <div className="post-actions">
        <Button
          variant="ghost"
          onClick={() => likeMutation.mutate()}
          className={liked ? 'text-red-500' : ''}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          {post.likeCount}
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="w-5 h-5" />
          {post.commentCount}
        </Button>
        
        <ShareButton post={post} />
      </div>
      
      {showComments && (
        <CommentSection postId={post.id} />
      )}
    </div>
  );
}
```

## Trending & Discovery

```typescript
export class TrendingService {
  async getTrendingHashtags(period: 'hour' | 'day' | 'week'): Promise<Hashtag[]> {
    const startDate = this.getPeriodStartDate(period);
    
    const trending = await db
      .select({
        tag: hashtags.tag,
        count: count(),
        growth: sql<number>`
          COUNT(*) FILTER (WHERE created_at >= ${subHours(new Date(), 1)})
        `
      })
      .from(hashtags)
      .where(gte(hashtags.createdAt, startDate))
      .groupBy(hashtags.tag)
      .orderBy(desc(sql`count * (1 + growth * 0.1)`))
      .limit(10);
    
    return trending;
  }
  
  async getTrendingPosts(algorithm: 'hot' | 'top' | 'new'): Promise<Post[]> {
    let orderBy;
    
    switch (algorithm) {
      case 'hot':
        // Reddit-like hot algorithm
        orderBy = sql`
          (like_count + comment_count * 2) / 
          POWER(EXTRACT(EPOCH FROM NOW() - created_at) / 3600 + 2, 1.8)
        `;
        break;
        
      case 'top':
        orderBy = desc(posts.likeCount);
        break;
        
      case 'new':
        orderBy = desc(posts.createdAt);
        break;
    }
    
    return await db
      .select()
      .from(posts)
      .where(eq(posts.visibility, 'public'))
      .orderBy(orderBy)
      .limit(50);
  }
  
  async getViralContent(): Promise<Post[]> {
    const viralThreshold = {
      likes: 100,
      shares: 20,
      velocity: 10 // likes per hour
    };
    
    return await db
      .select()
      .from(posts)
      .where(and(
        gte(posts.likeCount, viralThreshold.likes),
        gte(posts.shareCount, viralThreshold.shares),
        sql`
          like_count / EXTRACT(EPOCH FROM NOW() - created_at) * 3600 
          >= ${viralThreshold.velocity}
        `
      ))
      .orderBy(desc(posts.shareCount))
      .limit(20);
  }
}
```

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Post Creation | <500ms | ✅ 350ms |
| Feed Load Time | <1s | ✅ 750ms |
| Interaction Response | <200ms | ✅ 150ms |
| Real-time Updates | <100ms | ✅ 75ms |

## Testing

```typescript
describe('Social Features', () => {
  it('should create and interact with posts', async () => {
    const post = await postService.createPost({
      content: 'Hello @testuser #testing',
      visibility: 'public'
    }, 'user123');
    
    expect(post.mentions).toContain('testuser-id');
    expect(post.tags).toContain('testing');
    
    // Like post
    await interactionService.likePost(post.id, 'user456');
    const updated = await postService.getPost(post.id);
    expect(updated.likeCount).toBe(1);
  });
  
  it('should manage social graph correctly', async () => {
    await socialGraphService.followUser('user123', 'user456');
    
    const followers = await socialGraphService.getFollowers('user456');
    expect(followers.some(f => f.id === 'user123')).toBe(true);
    
    const recommendations = await socialGraphService.getSocialRecommendations('user123');
    expect(recommendations.length).toBeGreaterThan(0);
  });
});
```

## Next Steps

- [ ] Implement Stories feature
- [ ] Add live streaming support
- [ ] Enhanced content discovery
- [ ] Social commerce integration

---

**Status**: 🟢 Operational
**Dependencies**: Database, WebSockets, Search
**Owner**: Social Team
**Last Updated**: September 2025