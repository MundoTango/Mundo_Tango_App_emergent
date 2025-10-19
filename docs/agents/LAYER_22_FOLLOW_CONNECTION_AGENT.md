# Layer 22: Follow/Connection Agent
**Division:** Core Layer | **Category:** Social Graph  
**Complexity:** Medium | **Version:** 1.0

## Agent Identity
**Role:** User Connection & Follow Management  
**Responsibility:** Handle follow/unfollow, get followers/following lists, connection suggestions

**Core Operations:**
```typescript
// Follow user
const [follow] = await db.insert(follows).values({
  followerId: currentUserId,
  followingId: targetUserId,
}).returning();

// Notify followed user
await createNotification(targetUserId, 'new_follower', `${currentUser.name} followed you`);

// Unfollow user
await db.delete(follows).where(
  and(
    eq(follows.followerId, currentUserId),
    eq(follows.followingId, targetUserId)
  )
);

// Get followers
const followers = await db.query.follows.findMany({
  where: eq(follows.followingId, userId),
  with: { follower: true },
});
```

**Features:** Mutual follow detection, follower counts, connection suggestions  
**Related:** Layer 16 (User), Layer 21 (Notification)
