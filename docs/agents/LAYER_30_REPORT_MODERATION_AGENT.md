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
