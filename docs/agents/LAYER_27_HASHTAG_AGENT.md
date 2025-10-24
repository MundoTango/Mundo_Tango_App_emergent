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
