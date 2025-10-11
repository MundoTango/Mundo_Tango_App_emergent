// ESA Agent #65: Self-Hosted Project Tracker API Routes
// Replaces Jira with internal Epic/Story/Task management

import { Router } from 'express';
import { db } from '../db';
import { 
  projectEpics, 
  projectStories, 
  projectTasks, 
  projectSprints, 
  projectMilestones,
  projectComments,
  projectViews,
  projectWatchers,
  projectTrackerActivity,
  projectDependencies,
  users,
  insertProjectEpicSchema,
  insertProjectStorySchema,
  insertProjectTaskSchema,
  insertProjectSprintSchema,
  insertProjectCommentSchema,
  insertProjectViewSchema,
  insertProjectWatcherSchema,
  insertProjectTrackerActivitySchema,
  insertProjectDependencySchema
} from '../../shared/schema';
import { eq, desc, and, sql, or, count as drizzleCount } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

console.log('✅ ESA Agent #65: Project Tracker routes loaded successfully');

// ========== EPICS ==========

// TEST ROUTE - Verify route loading
router.get('/tracker/test', async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Project Tracker routes are working!' });
});

// Get all epics with story counts
router.get('/tracker/epics', async (req: Request, res: Response) => {
  try {
    const epics = await db
      .select({
        id: projectEpics.id,
        key: projectEpics.key,
        summary: projectEpics.summary,
        description: projectEpics.description,
        status: projectEpics.status,
        priority: projectEpics.priority,
        labels: projectEpics.labels,
        startDate: projectEpics.startDate,
        dueDate: projectEpics.dueDate,
        completedDate: projectEpics.completedDate,
        assignedToId: projectEpics.assignedToId,
        createdById: projectEpics.createdById,
        createdAt: projectEpics.createdAt,
        updatedAt: projectEpics.updatedAt,
        storyCount: sql<number>`COUNT(DISTINCT ${projectStories.id})::int`.as('storyCount')
      })
      .from(projectEpics)
      .leftJoin(projectStories, eq(projectStories.epicId, projectEpics.id))
      .groupBy(projectEpics.id)
      .orderBy(desc(projectEpics.createdAt));

    res.json({ success: true, data: epics });
  } catch (error: any) {
    console.error('Error fetching epics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single epic with stories (accepts both ID and key like "MUN-5")
router.get('/tracker/epics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    let epic;
    
    // Try to find by key first (safer for string params like "MUN-5")
    if (id.includes('-')) {
      // Has dash, must be a key like "MUN-5"
      [epic] = await db
        .select()
        .from(projectEpics)
        .where(eq(projectEpics.key, id));
    } else if (/^\d+$/.test(id)) {
      // Pure numeric, query by ID
      [epic] = await db
        .select()
        .from(projectEpics)
        .where(eq(projectEpics.id, parseInt(id, 10)));
    } else {
      // Neither, might be a malformed key, try as key anyway
      [epic] = await db
        .select()
        .from(projectEpics)
        .where(eq(projectEpics.key, id));
    }
    
    if (!epic) {
      return res.status(404).json({ success: false, error: 'Epic not found' });
    }
    
    const stories = await db
      .select()
      .from(projectStories)
      .where(eq(projectStories.epicId, epic.id))
      .orderBy(desc(projectStories.createdAt));
    
    res.json({ success: true, data: { ...epic, stories } });
  } catch (error: any) {
    console.error('❌ Error fetching epic with id:', req.params.id);
    console.error('❌ Error details:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create epic
router.post('/tracker/epics', async (req: Request, res: Response) => {
  try {
    const validated = insertProjectEpicSchema.parse({
      ...req.body,
      createdById: req.user?.id || 1 // Default to user 1 if not authenticated
    });
    
    const [newEpic] = await db
      .insert(projectEpics)
      .values(validated)
      .returning();
    
    res.json({ success: true, data: newEpic });
  } catch (error: any) {
    console.error('Error creating epic:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update epic (accepts both ID and key)
router.put('/tracker/epics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if parameter is a numeric ID or a string key
    const isNumericId = /^\d+$/.test(id);
    
    const [updatedEpic] = await db
      .update(projectEpics)
      .set({ ...updates, updatedAt: new Date() })
      .where(isNumericId ? eq(projectEpics.id, parseInt(id)) : eq(projectEpics.key, id))
      .returning();
    
    if (!updatedEpic) {
      return res.status(404).json({ success: false, error: 'Epic not found' });
    }
    
    res.json({ success: true, data: updatedEpic });
  } catch (error: any) {
    console.error('Error updating epic:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== STORIES ==========

// Get all stories with optional epic filter
router.get('/tracker/stories', async (req: Request, res: Response) => {
  try {
    const { epicId, sprintId, status } = req.query;
    
    const conditions = [];
    if (epicId) conditions.push(eq(projectStories.epicId, parseInt(epicId as string)));
    if (sprintId) conditions.push(eq(projectStories.sprintId, parseInt(sprintId as string)));
    if (status) conditions.push(eq(projectStories.status, status as string));
    
    const query = conditions.length > 0
      ? db.select().from(projectStories).where(and(...conditions))
      : db.select().from(projectStories);
    
    const stories = await query.orderBy(desc(projectStories.createdAt));
    
    res.json({ success: true, data: stories });
  } catch (error: any) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single story with tasks (accepts both ID and key like "MUN-6")
router.get('/tracker/stories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if parameter is a numeric ID or a string key
    const isNumericId = /^\d+$/.test(id);
    
    const [story] = await db
      .select()
      .from(projectStories)
      .where(isNumericId ? eq(projectStories.id, parseInt(id)) : eq(projectStories.key, id));
    
    if (!story) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }
    
    const tasks = await db
      .select()
      .from(projectTasks)
      .where(eq(projectTasks.storyId, story.id));
    
    const comments = await db
      .select({
        id: projectComments.id,
        storyId: projectComments.storyId,
        userId: projectComments.userId,
        comment: projectComments.comment,
        createdAt: projectComments.createdAt,
        updatedAt: projectComments.updatedAt,
        userName: users.name
      })
      .from(projectComments)
      .leftJoin(users, eq(users.id, projectComments.userId))
      .where(eq(projectComments.storyId, parseInt(id)))
      .orderBy(desc(projectComments.createdAt));
    
    res.json({ success: true, data: { ...story, tasks, comments } });
  } catch (error: any) {
    console.error('Error fetching story:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create story
router.post('/tracker/stories', async (req: Request, res: Response) => {
  try {
    const validated = insertProjectStorySchema.parse({
      ...req.body,
      createdById: req.user?.id || 1
    });
    
    const [newStory] = await db
      .insert(projectStories)
      .values(validated)
      .returning();
    
    res.json({ success: true, data: newStory });
  } catch (error: any) {
    console.error('Error creating story:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update story (accepts both ID and key)
router.put('/tracker/stories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if parameter is a numeric ID or a string key
    const isNumericId = /^\d+$/.test(id);
    
    const [updatedStory] = await db
      .update(projectStories)
      .set({ ...updates, updatedAt: new Date() })
      .where(isNumericId ? eq(projectStories.id, parseInt(id)) : eq(projectStories.key, id))
      .returning();
    
    if (!updatedStory) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }
    
    res.json({ success: true, data: updatedStory });
  } catch (error: any) {
    console.error('Error updating story:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== TASKS ==========

// Create task
router.post('/tracker/tasks', async (req: Request, res: Response) => {
  try {
    const validated = insertProjectTaskSchema.parse(req.body);
    
    const [newTask] = await db
      .insert(projectTasks)
      .values(validated)
      .returning();
    
    res.json({ success: true, data: newTask });
  } catch (error: any) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update task
router.put('/tracker/tasks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updatedTask] = await db
      .update(projectTasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projectTasks.id, parseInt(id)))
      .returning();
    
    if (!updatedTask) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    res.json({ success: true, data: updatedTask });
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== SPRINTS ==========

// Get all sprints
router.get('/tracker/sprints', async (req: Request, res: Response) => {
  try {
    const sprints = await db
      .select()
      .from(projectSprints)
      .orderBy(desc(projectSprints.startDate));
    
    res.json({ success: true, data: sprints });
  } catch (error: any) {
    console.error('Error fetching sprints:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create sprint
router.post('/tracker/sprints', async (req: Request, res: Response) => {
  try {
    const validated = insertProjectSprintSchema.parse(req.body);
    
    const [newSprint] = await db
      .insert(projectSprints)
      .values(validated)
      .returning();
    
    res.json({ success: true, data: newSprint });
  } catch (error: any) {
    console.error('Error creating sprint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== DASHBOARD METRICS ==========

// Get project tracker overview
router.get('/tracker/dashboard', async (req: Request, res: Response) => {
  try {
    // Epic metrics
    const epicStats = await db
      .select({
        status: projectEpics.status,
        count: sql<number>`COUNT(*)::int`
      })
      .from(projectEpics)
      .groupBy(projectEpics.status);
    
    // Story metrics
    const storyStats = await db
      .select({
        status: projectStories.status,
        count: sql<number>`COUNT(*)::int`,
        totalPoints: sql<number>`SUM(COALESCE(story_points, 0))::int`
      })
      .from(projectStories)
      .groupBy(projectStories.status);
    
    // Active sprint info
    const [activeSprint] = await db
      .select()
      .from(projectSprints)
      .where(eq(projectSprints.status, 'active'))
      .limit(1);
    
    res.json({
      success: true,
      data: {
        epics: epicStats,
        stories: storyStats,
        activeSprint: activeSprint || null,
        timestamp: new Date()
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add comment to story
router.post('/tracker/stories/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(400).json({ success: false, error: 'Comment is required' });
    }
    
    const [newComment] = await db
      .insert(projectComments)
      .values({
        storyId: parseInt(id),
        userId: req.user?.id || 1,
        comment
      })
      .returning();
    
    res.json({ success: true, data: newComment });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== SPRINTS (ESA Agent #63) ==========

// Get all sprints
router.get('/tracker/sprints', async (req: Request, res: Response) => {
  try {
    const sprints = await db
      .select()
      .from(projectSprints)
      .orderBy(desc(projectSprints.createdAt));

    res.json({ success: true, data: sprints });
  } catch (error: any) {
    console.error('Error fetching sprints:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create sprint
router.post('/tracker/sprints', async (req: Request, res: Response) => {
  try {
    const sprintData = insertProjectSprintSchema.parse(req.body);
    
    const [newSprint] = await db
      .insert(projectSprints)
      .values(sprintData)
      .returning();

    res.json({ success: true, data: newSprint });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('Error creating sprint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update sprint
router.put('/tracker/sprints/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updatedSprint] = await db
      .update(projectSprints)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projectSprints.id, parseInt(id)))
      .returning();

    if (!updatedSprint) {
      return res.status(404).json({ success: false, error: 'Sprint not found' });
    }

    res.json({ success: true, data: updatedSprint });
  } catch (error: any) {
    console.error('Error updating sprint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GITHUB SYNC (ESA Agent #67) ==========

// Sync Story to GitHub Issue
router.post('/tracker/stories/:id/sync-github', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { owner, repo } = req.body;
    
    if (!owner || !repo) {
      return res.status(400).json({ 
        success: false, 
        error: 'GitHub owner and repo are required' 
      });
    }

    const { githubSyncService } = await import('../services/GitHubSyncService');
    githubSyncService.configure(owner, repo);
    
    const result = await githubSyncService.syncStoryToIssue(parseInt(id));

    if (result.success) {
      res.json({ 
        success: true, 
        data: { issueNumber: result.issueNumber, url: result.url },
        message: `Story synced to GitHub issue #${result.issueNumber}`
      });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Error syncing story to GitHub:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Link Task to GitHub PR
router.post('/tracker/tasks/:id/link-pr', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { owner, repo, prNumber } = req.body;
    
    if (!owner || !repo || !prNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'GitHub owner, repo, and PR number are required' 
      });
    }

    const { githubSyncService } = await import('../services/GitHubSyncService');
    githubSyncService.configure(owner, repo);
    
    const result = await githubSyncService.linkTaskToPR(parseInt(id), prNumber);

    if (result.success) {
      res.json({ 
        success: true, 
        data: { url: result.url },
        message: `Task linked to GitHub PR #${prNumber}`
      });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Error linking task to PR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== COMMENTS (with attachments, @mentions, threading) ==========

// Get comments for a story
router.get('/tracker/stories/:storyId/comments', async (req: Request, res: Response) => {
  try {
    const comments = await db
      .select()
      .from(projectComments)
      .where(eq(projectComments.storyId, parseInt(req.params.storyId)))
      .orderBy(projectComments.createdAt);
    
    res.json({ success: true, data: comments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create comment
router.post('/tracker/stories/:storyId/comments', async (req: Request, res: Response) => {
  try {
    const validated = insertProjectCommentSchema.parse({
      ...req.body,
      storyId: parseInt(req.params.storyId),
      userId: req.user?.id || 1
    });
    
    const [newComment] = await db
      .insert(projectComments)
      .values(validated)
      .returning();
    
    // Track activity
    await db.insert(projectTrackerActivity).values({
      entityType: 'comment',
      entityId: newComment.id,
      action: 'commented',
      userId: req.user?.id || 1,
      metadata: { storyId: parseInt(req.params.storyId), mentions: validated.mentions || [] }
    });
    
    res.json({ success: true, data: newComment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== SAVED VIEWS/FILTERS ==========

// Get user's saved views
router.get('/tracker/views', async (req: Request, res: Response) => {
  try {
    const views = await db
      .select()
      .from(projectViews)
      .where(
        or(
          eq(projectViews.createdById, req.user?.id || 1),
          eq(projectViews.isShared, true)
        )
      )
      .orderBy(desc(projectViews.createdAt));
    
    res.json({ success: true, data: views });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create saved view
router.post('/tracker/views', async (req: Request, res: Response) => {
  try {
    const validated = insertProjectViewSchema.parse({
      ...req.body,
      createdById: req.user?.id || 1
    });
    
    const [newView] = await db
      .insert(projectViews)
      .values(validated)
      .returning();
    
    res.json({ success: true, data: newView });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete saved view
router.delete('/tracker/views/:id', async (req: Request, res: Response) => {
  try {
    await db
      .delete(projectViews)
      .where(
        and(
          eq(projectViews.id, parseInt(req.params.id)),
          eq(projectViews.createdById, req.user?.id || 1)
        )
      );
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== WATCHERS/SUBSCRIBERS ==========

// Get watchers for a story
router.get('/tracker/stories/:storyId/watchers', async (req: Request, res: Response) => {
  try {
    const watchers = await db
      .select()
      .from(projectWatchers)
      .where(eq(projectWatchers.storyId, parseInt(req.params.storyId)));
    
    res.json({ success: true, data: watchers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Watch a story
router.post('/tracker/stories/:storyId/watch', async (req: Request, res: Response) => {
  try {
    const [watcher] = await db
      .insert(projectWatchers)
      .values({
        storyId: parseInt(req.params.storyId),
        userId: req.user?.id || 1
      })
      .onConflictDoNothing()
      .returning();
    
    res.json({ success: true, data: watcher });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unwatch a story
router.delete('/tracker/stories/:storyId/watch', async (req: Request, res: Response) => {
  try {
    await db
      .delete(projectWatchers)
      .where(
        and(
          eq(projectWatchers.storyId, parseInt(req.params.storyId)),
          eq(projectWatchers.userId, req.user?.id || 1)
        )
      );
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== ACTIVITY FEED ==========

// Get activity for an entity
router.get('/tracker/activity/:entityType/:entityId', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    
    const activities = await db
      .select()
      .from(projectTrackerActivity)
      .where(
        and(
          eq(projectTrackerActivity.entityType, entityType),
          eq(projectTrackerActivity.entityId, parseInt(entityId))
        )
      )
      .orderBy(desc(projectTrackerActivity.createdAt))
      .limit(50);
    
    res.json({ success: true, data: activities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recent activity (global feed)
router.get('/tracker/activity', async (req: Request, res: Response) => {
  try {
    const activities = await db
      .select()
      .from(projectTrackerActivity)
      .orderBy(desc(projectTrackerActivity.createdAt))
      .limit(100);
    
    res.json({ success: true, data: activities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== DEPENDENCIES ==========

// Get dependencies for a story
router.get('/tracker/stories/:storyId/dependencies', async (req: Request, res: Response) => {
  try {
    const dependencies = await db
      .select()
      .from(projectDependencies)
      .where(eq(projectDependencies.storyId, parseInt(req.params.storyId)));
    
    res.json({ success: true, data: dependencies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add dependency
router.post('/tracker/stories/:storyId/dependencies', async (req: Request, res: Response) => {
  try {
    const validated = insertProjectDependencySchema.parse({
      storyId: parseInt(req.params.storyId),
      dependsOnStoryId: req.body.dependsOnStoryId,
      type: req.body.type || 'blocks'
    });
    
    const [dependency] = await db
      .insert(projectDependencies)
      .values(validated)
      .onConflictDoNothing()
      .returning();
    
    res.json({ success: true, data: dependency });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove dependency
router.delete('/tracker/dependencies/:id', async (req: Request, res: Response) => {
  try {
    await db
      .delete(projectDependencies)
      .where(eq(projectDependencies.id, parseInt(req.params.id)));
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GitHub webhook handler
router.post('/tracker/github/webhook', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    const { githubSyncService } = await import('../services/GitHubSyncService');
    const result = await githubSyncService.handleWebhook(payload);

    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Error processing GitHub webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
