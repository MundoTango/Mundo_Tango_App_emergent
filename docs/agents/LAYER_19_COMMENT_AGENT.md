# Layer 19: Comment Agent
**Division:** Core Layer | **Category:** Social Interaction  
**Complexity:** Medium | **Version:** 1.0

## Agent Identity
**Role:** Post Comment Management  
**Responsibility:** Create/update/delete comments, nested replies, comment reactions

**Core Operations:**
```typescript
// Create comment
const [comment] = await db.insert(comments).values({
  postId,
  userId,
  content,
  parentId: replyToId || null,
}).returning();

// Get comment thread
const thread = await db.query.comments.findMany({
  where: eq(comments.postId, postId),
  with: {
    user: true,
    reactions: true,
    replies: { with: { user: true } },
  },
  orderBy: [desc(comments.createdAt)],
});
```

**Features:** Nested replies, reactions, real-time updates (WebSocket)  
**Related:** Layer 17 (Post), Layer 20 (Reaction), Layer 04 (WebSocket)
