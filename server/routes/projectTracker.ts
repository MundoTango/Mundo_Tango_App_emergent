// ESA Agent #65: Self-Hosted Project Tracker API Routes
// Replaces Jira with internal Epic/Story/Task management

import { Router } from 'express';
import { db } from '../db';
import { 
  projectSystems,
  projectAreas,
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
  insertProjectSystemSchema,
  insertProjectAreaSchema,
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

// ========== HIERARCHICAL TREE ==========

// Get complete hierarchical tree: System → Area → Epic → Story → Task
router.get('/tracker/tree', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.query;
    
    // Get all systems with their areas
    const systems = await db.select().from(projectSystems).orderBy(projectSystems.key);
    
    const tree = await Promise.all(systems.map(async (system) => {
      // Get areas for this system
      const areaConditions = [eq(projectAreas.systemId, system.id)];
      if (agentId) {
        areaConditions.push(eq(projectAreas.assignedAgentId, agentId as string));
      }
      const areas = await db.select().from(projectAreas).where(and(...areaConditions)).orderBy(projectAreas.key);
      
      const areasWithEpics = await Promise.all(areas.map(async (area) => {
        // Get epics for this area
        const epics = await db.select().from(projectEpics).where(eq(projectEpics.areaId, area.id)).orderBy(projectEpics.key);
        
        const epicsWithStories = await Promise.all(epics.map(async (epic) => {
          // Get stories for this epic
          let stories;
          if (agentId) {
            stories = await db.select().from(projectStories).where(
              and(
                eq(projectStories.epicId, epic.id),
                or(
                  eq(projectStories.assignedAgentId, agentId as string),
                  sql`${agentId} = ANY(${projectStories.teamAgentIds})`
                )
              )
            ).orderBy(projectStories.key);
          } else {
            stories = await db.select().from(projectStories).where(eq(projectStories.epicId, epic.id)).orderBy(projectStories.key);
          }
          
          const storiesWithTasks = await Promise.all(stories.map(async (story) => {
            // Get tasks for this story
            const taskConditions = [eq(projectTasks.storyId, story.id)];
            if (agentId) {
              taskConditions.push(eq(projectTasks.assignedAgentId, agentId as string));
            }
            const tasks = await db.select().from(projectTasks).where(and(...taskConditions)).orderBy(projectTasks.id);
            
            return { ...story, tasks, taskCount: tasks.length };
          }));
          
          return { ...epic, stories: storiesWithTasks, storyCount: stories.length };
        }));
        
        return { ...area, epics: epicsWithStories, epicCount: epics.length };
      }));
      
      return { ...system, areas: areasWithEpics, areaCount: areas.length };
    }));
    
    res.json({ success: true, data: tree });
  } catch (error: any) {
    console.error('Error fetching hierarchical tree:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== SYSTEMS ==========

// Get all systems
router.get('/tracker/systems', async (req: Request, res: Response) => {
  try {
    const systems = await db.select().from(projectSystems).orderBy(projectSystems.key);
    res.json({ success: true, data: systems });
  } catch (error: any) {
    console.error('Error fetching systems:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create system
router.post('/tracker/systems', async (req: Request, res: Response) => {
  try {
    const validated = insertProjectSystemSchema.parse(req.body);
    const [system] = await db.insert(projectSystems).values(validated).returning();
    res.json({ success: true, data: system });
  } catch (error: any) {
    console.error('Error creating system:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== AREAS ==========

// Get all areas (optionally by system)
router.get('/tracker/areas', async (req: Request, res: Response) => {
  try {
    const { systemId } = req.query;
    
    let areas;
    if (systemId) {
      areas = await db.select().from(projectAreas).where(eq(projectAreas.systemId, parseInt(systemId as string))).orderBy(projectAreas.key);
    } else {
      areas = await db.select().from(projectAreas).orderBy(projectAreas.key);
    }
    
    res.json({ success: true, data: areas });
  } catch (error: any) {
    console.error('Error fetching areas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create area
router.post('/tracker/areas', async (req: Request, res: Response) => {
  try {
    const validated = insertProjectAreaSchema.parse(req.body);
    const [area] = await db.insert(projectAreas).values(validated).returning();
    res.json({ success: true, data: area });
  } catch (error: any) {
    console.error('Error creating area:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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

// ========== OPEN SOURCE DEPLOYMENT (Agent #59 Lead) ==========

// Get platform-wide open source deployment status
router.get('/tracker/open-sources/status', async (req: Request, res: Response) => {
  try {
    // Mock data based on ESA_OPEN_SOURCE_100_DEPLOYMENT.md
    const openSources = [
      { name: 'LanceDB', status: '100%', layer: 26, fullyDeployed: true, responsibleAgent: 'Agent #26' },
      { name: 'Langfuse', status: 'partial', layer: 32, fullyDeployed: false, responsibleAgent: 'Agent #32' },
      { name: 'Arize Phoenix', status: '100%', layer: 48, fullyDeployed: true, responsibleAgent: 'Agent #48' },
      { name: 'Milvus SDK', status: 'partial', layer: 15, fullyDeployed: false, responsibleAgent: 'Agent #15' },
      { name: 'Dragonfly', status: 'not_deployed', layer: 14, fullyDeployed: false, responsibleAgent: 'Agent #14' },
      { name: 'Apache AGE', status: 'not_deployed', layer: 44, fullyDeployed: false, responsibleAgent: 'Agent #44' },
      { name: 'SigNoz', status: 'partial', layer: 48, fullyDeployed: false, responsibleAgent: 'Agent #48' },
      { name: 'Mem0', status: 'partial', layer: 36, fullyDeployed: false, responsibleAgent: 'Agent #36' },
      { name: 'DSPy', status: 'partial', layer: 45, fullyDeployed: false, responsibleAgent: 'Agent #45' },
      { name: 'Temporal', status: '100%', layer: 57, fullyDeployed: true, responsibleAgent: 'Agent #57' },
      { name: 'CrewAI', status: 'partial', layer: 35, fullyDeployed: false, responsibleAgent: 'Agent #35' },
      { name: 'Activepieces', status: '100%', layer: 20, fullyDeployed: true, responsibleAgent: 'Agent #20' },
      { name: 'Bun Test', status: '100%', layer: 51, fullyDeployed: true, responsibleAgent: 'Agent #51' },
      { name: 'Supabase Realtime', status: '100%', layer: 11, fullyDeployed: true, responsibleAgent: 'Agent #11' },
      { name: 'Knowledge Graph', status: '100%', layer: 44, fullyDeployed: true, responsibleAgent: 'Agent #44' },
      { name: 'LlamaIndex', status: '100%', layer: 36, fullyDeployed: true, responsibleAgent: 'Agent #36' },
      { name: 'OpenTelemetry', status: '100%', layer: 48, fullyDeployed: true, responsibleAgent: 'Agent #48' },
      { name: 'Realtime Optimization', status: '100%', layer: 11, fullyDeployed: true, responsibleAgent: 'Agent #11' },
    ];
    
    const totalChecked = openSources.length;
    const fullyDeployed = openSources.filter(os => os.fullyDeployed).length;
    const partialDeployed = openSources.filter(os => os.status === 'partial').length;
    const notDeployed = openSources.filter(os => os.status === 'not_deployed').length;
    
    res.json({
      success: true,
      data: {
        totalChecked,
        fullyDeployed,
        partialDeployed,
        notDeployed,
        percentage: Math.round((fullyDeployed / totalChecked) * 100),
        targetPercentage: 89, // 16/18 (excluding 2 unavailable)
        openSources
      }
    });
  } catch (error: any) {
    console.error('Error fetching open source status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get detailed open source inventory with 5-criteria breakdown
router.get('/tracker/open-sources/inventory', async (req: Request, res: Response) => {
  try {
    // Mock detailed inventory data
    const inventory = [
      {
        name: 'LanceDB',
        status: '100%',
        layer: 26,
        layerName: 'Agent AI',
        responsibleAgent: 'Agent #26',
        criteria: {
          installation: true,
          usage: true,
          monitoring: true,
          documentation: true,
          performance: true
        },
        usedIn: ['AI Features', 'Vector Search', 'Memory Systems'],
        trainingStory: null
      },
      {
        name: 'Mem0',
        status: 'partial',
        layer: 36,
        layerName: 'Memory Systems',
        responsibleAgent: 'Agent #36',
        criteria: {
          installation: true,
          usage: false,
          monitoring: false,
          documentation: true,
          performance: false
        },
        usedIn: ['AI Memory (planned)'],
        trainingStory: 'TRAIN-36-MEM0',
        issues: ['Not actively used', 'No monitoring', 'Performance unchecked']
      },
      {
        name: 'Dragonfly',
        status: 'not_deployed',
        layer: 14,
        layerName: 'Caching',
        responsibleAgent: 'Agent #14',
        criteria: {
          installation: false,
          usage: false,
          monitoring: false,
          documentation: false,
          performance: false
        },
        usedIn: [],
        trainingStory: 'TRAIN-14-DRAGONFLY',
        issues: ['Not installed', 'Requires Docker', 'Blocked by Replit environment']
      },
      // Add more as needed...
    ];
    
    res.json({
      success: true,
      data: inventory
    });
  } catch (error: any) {
    console.error('Error fetching open source inventory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get agent training queue
router.get('/tracker/open-sources/training-queue', async (req: Request, res: Response) => {
  try {
    const trainingQueue = [
      {
        id: 1,
        storyKey: 'TRAIN-36-MEM0',
        agentNumber: 36,
        openSource: 'Mem0',
        currentPhase: 3,
        totalPhases: 6,
        estimatedHours: 19,
        completedHours: 8,
        dueDate: 'Oct 15, 2025',
        status: 'in_progress'
      },
      {
        id: 2,
        storyKey: 'TRAIN-45-DSPY',
        agentNumber: 45,
        openSource: 'DSPy',
        currentPhase: 1,
        totalPhases: 6,
        estimatedHours: 19,
        completedHours: 2,
        dueDate: 'Oct 18, 2025',
        status: 'in_progress'
      },
      {
        id: 3,
        storyKey: 'TRAIN-35-CREWAI',
        agentNumber: 35,
        openSource: 'CrewAI',
        currentPhase: 2,
        totalPhases: 6,
        estimatedHours: 19,
        completedHours: 6,
        dueDate: 'Oct 16, 2025',
        status: 'in_progress'
      },
    ];
    
    res.json({
      success: true,
      data: trainingQueue
    });
  } catch (error: any) {
    console.error('Error fetching training queue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get consolidation recommendations pending CEO approval
router.get('/tracker/open-sources/consolidations', async (req: Request, res: Response) => {
  try {
    const consolidations = [
      {
        id: 1,
        duplicates: ['LanceDB', 'Milvus'],
        recommendation: 'Keep LanceDB, remove Milvus',
        reason: 'LanceDB is lighter, better documented, and actively used in 12 files. Milvus only used in 3 files.',
        domainChiefApproval: 'Chief #4 - APPROVED',
        ceoApproval: 'PENDING',
        estimatedEffort: '4 hours',
        createdAt: '2025-10-10',
        createdBy: 'Agent #59'
      },
    ];
    
    res.json({
      success: true,
      data: consolidations
    });
  } catch (error: any) {
    console.error('Error fetching consolidations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CEO approve/reject consolidation
router.post('/tracker/open-sources/approve-consolidation', async (req: Request, res: Response) => {
  try {
    const { consolidationId, approved, notes } = req.body;
    
    if (!consolidationId || typeof approved !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        error: 'consolidationId and approved (boolean) are required' 
      });
    }
    
    // TODO: Update database with CEO decision
    // For now, return success with mock data
    
    res.json({
      success: true,
      data: {
        consolidationId,
        ceoApproval: approved ? 'APPROVED' : 'REJECTED',
        ceoNotes: notes || '',
        decidedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error approving consolidation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
