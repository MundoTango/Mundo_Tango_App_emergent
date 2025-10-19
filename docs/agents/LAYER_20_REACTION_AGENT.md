# Layer 20: Reaction Agent
**Division:** Core Layer | **Category:** Social Interaction  
**Complexity:** Low | **Version:** 1.0

## Agent Identity
**Role:** Like/Reaction Management  
**Responsibility:** Track likes/reactions on posts and comments, update reaction counts

**Core Operations:**
```typescript
// Toggle like
const existing = await db.query.reactions.findFirst({
  where: and(
    eq(reactions.postId, postId),
    eq(reactions.userId, userId)
  ),
});

if (existing) {
  await db.delete(reactions).where(eq(reactions.id, existing.id));
} else {
  await db.insert(reactions).values({ postId, userId, type: 'like' });
}

// Update count
await db.update(posts)
  .set({ likeCount: sql`${posts.likeCount} + ${existing ? -1 : 1}` })
  .where(eq(posts.id, postId));
```

**Features:** Like/unlike toggle, reaction counts, optimistic updates (client)  
**Related:** Layer 17 (Post), Layer 19 (Comment)
