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
  users,
  insertProjectEpicSchema,
  insertProjectStorySchema,
  insertProjectTaskSchema,
  insertProjectSprintSchema
} from '../../shared/schema';
import { eq, desc, and, sql, or, count as drizzleCount } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// ========== EPICS ==========

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

// Get single epic with stories
router.get('/tracker/epics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [epic] = await db
      .select()
      .from(projectEpics)
      .where(eq(projectEpics.id, parseInt(id)));
    
    if (!epic) {
      return res.status(404).json({ success: false, error: 'Epic not found' });
    }
    
    const stories = await db
      .select()
      .from(projectStories)
      .where(eq(projectStories.epicId, parseInt(id)))
      .orderBy(desc(projectStories.createdAt));
    
    res.json({ success: true, data: { ...epic, stories } });
  } catch (error: any) {
    console.error('Error fetching epic:', error);
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

// Update epic
router.put('/tracker/epics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updatedEpic] = await db
      .update(projectEpics)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projectEpics.id, parseInt(id)))
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

// Get single story with tasks
router.get('/tracker/stories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [story] = await db
      .select()
      .from(projectStories)
      .where(eq(projectStories.id, parseInt(id)));
    
    if (!story) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }
    
    const tasks = await db
      .select()
      .from(projectTasks)
      .where(eq(projectTasks.storyId, parseInt(id)));
    
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

// Update story
router.put('/tracker/stories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updatedStory] = await db
      .update(projectStories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projectStories.id, parseInt(id)))
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

// Sync GitHub issues to stories
router.post('/tracker/github/sync', async (req: Request, res: Response) => {
  try {
    const { owner, repo, epicId } = req.body;
    
    if (!owner || !repo) {
      return res.status(400).json({ 
        success: false, 
        error: 'GitHub owner and repo are required' 
      });
    }

    // Import GitHubStorySync service
    const { githubStorySync } = await import('../services/GitHubStorySync');
    
    githubStorySync.configure(owner, repo);
    const result = await githubStorySync.syncIssues(epicId);

    res.json({ 
      success: true, 
      data: result,
      message: `Synced ${result.synced} issues. ${result.errors.length} errors.`
    });
  } catch (error: any) {
    console.error('Error syncing GitHub issues:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GitHub webhook handler
router.post('/tracker/github/webhook', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    // Import GitHubStorySync service
    const { githubStorySync } = await import('../services/GitHubStorySync');
    
    await githubStorySync.handleWebhook(payload);

    res.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error: any) {
    console.error('Error processing GitHub webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
