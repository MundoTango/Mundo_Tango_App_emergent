# 🧪 MANDATORY TESTING PROTOCOL

**Applies to:** ALL agents (105+)  
**Enforcement:** BLOCKING - No task completion without evidence  
**Updated:** October 24, 2025 (Week 1 Rollout)

---

## THE 4 MANDATORY CHECKPOINTS

Every agent MUST follow these checkpoints before marking any task complete:

### ✅ CHECKPOINT 1: DATA INSPECTION
**Rule:** NEVER assume data structures. Always inspect first.
```typescript
console.log('🔍 DATA INSPECTION:', JSON.stringify(data, null, 2));
// Run it, see the output, THEN write conditional
```

### ✅ CHECKPOINT 2: UNIT TESTING  
**Rule:** Test individual functions in isolation.
- Test regex patterns with sample inputs
- Verify IF conditions with actual data
- Validate file operations with dummy files

### ✅ CHECKPOINT 3: INTEGRATION TESTING
**Rule:** Test the FULL user journey end-to-end.
- Run complete flow as user would
- Check server logs for errors
- Screenshot successful execution

### ✅ CHECKPOINT 4: ARCHITECT REVIEW
**Rule:** Architect reviews BEHAVIOR, not just code.
- Proof it runs (screenshot)
- Proof it works (before/after)
- Proof no crashes (logs)

**Full documentation:** `docs/TESTING_REQUIREMENTS_MANDATORY.md`

---

---

# Layer 17: Post Agent
**Division:** Core Layer | **Category:** Content Management  
**Complexity:** High | **Version:** 1.0 | **Last Updated:** October 19, 2025

## Agent Identity
**Role:** Post/Memory Content Management  
**Responsibility:** Handle post creation, updates, deletion, privacy controls, hashtag extraction, media attachments

**Key Files:** `server/routes/posts.ts`, `shared/schema.ts` (posts, postMedia, hashtags tables)

## Core Operations

### Create Post
```typescript
async function createPost(userId: number, data: InsertPost) {
  return await db.transaction(async (tx) => {
    // 1. Create post
    const [post] = await tx.insert(posts).values({
      ...data,
      userId,
    }).returning();

    // 2. Extract and save hashtags
    const tags = extractHashtags(data.content);
    for (const tag of tags) {
      await tx.insert(hashtags).values({
        name: tag,
        postId: post.id,
      });
    }

    // 3. Update user post count
    await tx.update(userProfiles)
      .set({ postCount: sql`${userProfiles.postCount} + 1` })
      .where(eq(userProfiles.userId, userId));

    // 4. Broadcast to followers (WebSocket)
    io.to(`user:${userId}:followers`).emit('post:created', post);

    return post;
  });
}
```

### Feed Queries
```typescript
// Personal feed (posts from followed users)
const feed = await db.query.posts.findMany({
  where: and(
    inArray(posts.userId, followedUserIds),
    eq(posts.isActive, true)
  ),
  orderBy: [desc(posts.createdAt)],
  limit: 20,
  with: {
    user: true,
    comments: { limit: 3 },
    reactions: true,
  },
});

// Public feed
const publicFeed = await db.query.posts.findMany({
  where: and(
    eq(posts.privacy, 'public'),
    eq(posts.isActive, true)
  ),
  orderBy: [desc(posts.createdAt)],
  limit: 20,
});
```

### Privacy Control
```typescript
async function canViewPost(post: Post, viewer: User): Promise<boolean> {
  if (post.privacy === 'public') return true;
  if (post.userId === viewer.id) return true;

  if (post.privacy === 'friends') {
    const connection = await db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, viewer.id),
        eq(follows.followingId, post.userId)
      ),
    });
    return !!connection;
  }

  return false;
}
```

## Best Practices
✅ Use transactions for multi-step operations  
✅ Extract hashtags automatically  
✅ Respect privacy settings  
✅ Broadcast real-time updates  
✅ Track engagement metrics  
❌ Don't allow unvalidated content  
❌ Don't expose private posts

**Related:** Layer 16 (User Agent), Layer 19 (Comment Agent), Layer 20 (Reaction Agent), Layer 27 (Hashtag Agent)
