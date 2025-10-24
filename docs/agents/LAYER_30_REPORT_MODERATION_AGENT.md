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

# Layer 30: Report/Moderation Agent
**Division:** Core Layer | **Category:** Content Moderation  
**Complexity:** Medium | **Version:** 1.0

## Agent Identity
**Role:** Content Reporting & Moderation  
**Responsibility:** Handle content reports, moderation workflow, admin actions, content removal

**Core Operations:**
```typescript
// Create report
const [report] = await db.insert(postReports).values({
  postId,
  reportedBy: userId,
  reason, // 'spam', 'inappropriate', 'harassment', etc.
  description,
}).returning();

// Notify moderators
await triggerN8NWorkflow('moderation-alert', {
  reportId: report.id,
  postId,
  reason,
  reportedBy: userId,
});

// Moderator action
async function moderatePost(reportId: number, action: 'approve' | 'remove', moderatorId: number) {
  const report = await db.query.postReports.findFirst({
    where: eq(postReports.id, reportId),
  });

  if (action === 'remove') {
    // Soft delete post
    await db.update(posts)
      .set({ isActive: false, moderatedAt: new Date() })
      .where(eq(posts.id, report.postId));
  }

  // Update report status
  await db.update(postReports)
    .set({
      status: action === 'approve' ? 'dismissed' : 'removed',
      moderatedBy: moderatorId,
      updatedAt: new Date(),
  }).where(eq(postReports.id, reportId));
}
```

**Report Types:** Spam, inappropriate content, harassment, false information, copyright violation  
**Features:** Report submission, moderator queue, admin actions, automated alerts (n8n)  
**Related:** Layer 17 (Post), Layer 16 (User), n8n Integration
