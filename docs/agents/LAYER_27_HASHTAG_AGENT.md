# Layer 27: Hashtag Agent
**Division:** Core Layer | **Category:** Content Discovery  
**Complexity:** Low | **Version:** 1.0

## Agent Identity
**Role:** Hashtag Extraction & Indexing  
**Responsibility:** Extract hashtags from content, enable hashtag search, trending hashtags

**Core Operations:**
```typescript
// Extract hashtags from text
function extractHashtags(text: string): string[] {
  const regex = /#(\w+)/g;
  const matches = text.match(regex) || [];
  return matches.map(tag => tag.slice(1).toLowerCase());
}

// Save hashtags on post creation
const tags = extractHashtags(post.content);
for (const tag of tags) {
  await db.insert(hashtags).values({
    name: tag,
    postId: post.id,
  }).onConflictDoNothing();
}

// Search by hashtag
const posts = await db.query.posts.findMany({
  where: exists(
    db.select().from(hashtags).where(
      and(
        eq(hashtags.postId, posts.id),
        eq(hashtags.name, tagName)
      )
    )
  ),
});

// Trending hashtags
const trending = await db.select({
  tag: hashtags.name,
  count: sql<number>`count(*)`,
})
.from(hashtags)
.groupBy(hashtags.name)
.orderBy(sql`count(*) desc`)
.limit(10);
```

**Features:** Auto-extraction, hashtag search, trending tags, tag suggestions  
**Related:** Layer 17 (Post), Layer 47 (Feed Ranking)
