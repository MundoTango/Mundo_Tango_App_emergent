# Privacy Filtering System

## Overview
The privacy filtering system in the ESA LIFE CEO platform ensures that posts are only visible to authorized users based on privacy settings and friendship status. This is implemented through ESA Layer 22 (Group Management) and database-level filtering.

## Privacy Levels

### 1. Public Posts
- **Visibility**: All authenticated users
- **Database Filter**: No additional WHERE conditions
- **Use Cases**: General announcements, public memories, community updates

### 2. Friends-Only Posts
- **Visibility**: Only accepted friends of the poster
- **Database Filter**: JOIN with friendships table WHERE status = 'accepted'
- **Use Cases**: Personal updates, private memories, friend-specific content

### 3. Private Posts
- **Visibility**: Only the post creator
- **Database Filter**: WHERE posts.userId = currentUserId
- **Use Cases**: Personal notes, drafts, private reflections

## Implementation Details

### Database Layer (server/storage.ts)

#### getFeedPosts Method
The core filtering logic is implemented in the `getFeedPosts` method:

```typescript
async getFeedPosts(userId: number, limit: number, offset: number) {
  const feedPosts = await db
    .select({
      // Post fields
      post: posts,
      // User fields
      user: users,
      // Friendship status for privacy filtering
      friendshipStatus: friendships.status,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(
      friendships,
      and(
        or(
          and(
            eq(friendships.requesterId, userId),
            eq(friendships.addresseeId, posts.userId)
          ),
          and(
            eq(friendships.requesterId, posts.userId),
            eq(friendships.addresseeId, userId)
          )
        )
      )
    )
    .where(
      and(
        isNotNull(posts.content),
        or(
          // Show public posts
          eq(posts.privacy, 'public'),
          // Show own posts
          eq(posts.userId, userId),
          // Show friends' posts if friendship is accepted
          and(
            eq(posts.privacy, 'friends'),
            eq(friendships.status, 'accepted')
          )
        )
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}
```

### Key Components

#### 1. Friendship Validation
- Bidirectional friendship check (requester or addressee)
- Status must be 'accepted' for friends-only content
- Uses LEFT JOIN to include posts without friendship data

#### 2. WHERE Clause Logic
The WHERE clause uses nested OR/AND conditions:
- Always show public posts
- Always show user's own posts
- Show friends' posts only if friendship is accepted

#### 3. isNotNull Condition
- Filters out posts with null content
- Prevents empty posts from appearing in feed
- Required import: `import { isNotNull } from 'drizzle-orm'`

## API Layer Integration

### Posts Routes (server/routes/postsRoutes.ts)

The API layer adds additional context to filtered posts:

```typescript
router.get('/feed', async (req, res) => {
  const userId = req.user?.id;
  const posts = await storage.getFeedPosts(userId, limit, offset);
  
  // Enhance with friendship context
  const enhancedPosts = posts.map(post => ({
    ...post,
    isFriend: post.friendshipStatus === 'accepted',
    canInteract: post.privacy === 'public' || 
                 post.userId === userId || 
                 post.friendshipStatus === 'accepted'
  }));
  
  res.json(enhancedPosts);
});
```

## Frontend Display Logic

### ESAMemoryFeed Component

The feed component respects privacy indicators:

```jsx
function ESAMemoryFeed() {
  const { data: posts } = useQuery({
    queryKey: ['/api/posts/feed'],
  });
  
  return posts?.map(post => (
    <PostCard 
      key={post.id}
      post={post}
      showPrivacyBadge={true}
      enableInteractions={post.canInteract}
    />
  ));
}
```

### Privacy Badges
- 🌍 Public posts
- 👥 Friends-only posts
- 🔒 Private posts

## Performance Optimizations

### Database Indexes
Ensure these indexes exist for optimal performance:
```sql
CREATE INDEX idx_posts_privacy ON posts(privacy);
CREATE INDEX idx_posts_userid ON posts(userId);
CREATE INDEX idx_friendships_status ON friendships(status);
CREATE INDEX idx_friendships_users ON friendships(requesterId, addresseeId);
```

### Query Optimization
- Use LEFT JOIN for friendships to avoid filtering out public posts
- Index on createdAt for efficient ordering
- Limit/offset for pagination

## Caching Strategy

### Cache Keys
- Feed cache: `feed:user:${userId}:page:${page}`
- Invalidate on: New post, friendship change, privacy update

### Cache Duration
- Public posts: 5 minutes
- Friends posts: 2 minutes
- Private posts: No caching

## Security Considerations

### SQL Injection Prevention
- Use parameterized queries via Drizzle ORM
- Never concatenate user input into queries
- Validate userId is integer

### Privacy Leak Prevention
- Never expose friendship status in public APIs
- Don't reveal post existence to unauthorized users
- Return 404 instead of 403 for hidden posts

## Testing Scenarios

### Unit Tests
1. Public posts visible to all users
2. Friends posts visible only to accepted friends
3. Private posts visible only to creator
4. Pending friendships don't grant access
5. Blocked users can't see friends posts

### Integration Tests
1. Feed filtering with mixed privacy posts
2. Privacy changes update visibility immediately
3. Friendship acceptance grants access to previous posts
4. Unfriending removes access to friends-only posts

## Monitoring and Analytics

### Metrics to Track
- Average query time for filtered feeds
- Cache hit ratio for privacy-filtered queries
- Number of posts filtered by privacy level
- Friendship status distribution

### Alerts
- Query time > 500ms
- Cache hit ratio < 80%
- Excessive 404s indicating privacy issues

## Related Documentation
- [BeautifulPostCreator](../content/components/BeautifulPostCreator.md)
- [Friends System](./Friends.md)
- [ESA Layer 22 - Group Management](../esa-layers/layer-22-group-management.md)