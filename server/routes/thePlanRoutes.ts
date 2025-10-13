/**
 * ESA65: The Plan - Dynamic Story Card System Routes
 * H2AC Pattern: Human-to-Agent Communication via story cards
 */

import { Router } from 'express';
import { db } from '../db';
import { features, subFeatures, components, tasks } from '../../shared/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { requireAuth } from '../middleware/secureAuth';

const router = Router();

/**
 * GET /api/project-tracker/my-work
 * Fetch story cards assigned to current user based on their role
 */
router.get('/my-work', requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    
    // Determine user role from user object
    let userRole = 'frontend'; // default
    if (user.role === 'superadmin' || user.role === 'admin') {
      userRole = user.role;
    } else if (user.skills) {
      const skills = Array.isArray(user.skills) ? user.skills : [];
      if (skills.some((s: string) => ['Node.js', 'Python', 'Backend', 'API'].includes(s))) {
        userRole = 'backend';
      } else if (skills.some((s: string) => ['Design', 'UI', 'UX', 'Figma'].includes(s))) {
        userRole = 'designer';
      }
    }

    // Fetch features matching user role or assigned to user
    const myStories = await db
      .select()
      .from(features)
      .where(
        or(
          eq(features.assignedTo, userRole),
          eq(features.assignedTo, user.username || user.email)
        )
      )
      .orderBy(desc(features.updatedAt));

    res.json(myStories);
  } catch (error) {
    console.error('Error fetching user work:', error);
    res.status(500).json({ error: 'Failed to fetch work items' });
  }
});

/**
 * GET /api/project-tracker/story/:id
 * Fetch complete story hierarchy (Feature + SubFeatures + Components + Tasks)
 */
router.get('/story/:id', requireAuth, async (req, res) => {
  try {
    const featureId = parseInt(req.params.id);

    // Fetch feature with all nested levels
    const feature = await db.query.features.findFirst({
      where: eq(features.id, featureId),
      with: {
        subFeatures: {
          with: {
            components: {
              with: {
                tasks: true,
              },
            },
          },
        },
      },
    });

    if (!feature) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json({ feature });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

/**
 * POST /api/project-tracker/feature
 * Create new feature (Level 1) from audit findings
 */
router.post('/feature', requireAuth, async (req, res) => {
  try {
    const { title, description, pageAgentId, journeyAgentId, category, assignedTo } = req.body;

    // Check if feature already exists for this page agent
    const existing = await db
      .select()
      .from(features)
      .where(
        and(
          eq(features.pageAgentId, pageAgentId),
          eq(features.title, title)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing instead of creating duplicate
      const [updated] = await db
        .update(features)
        .set({ 
          description, 
          assignedTo, 
          updatedAt: new Date() 
        })
        .where(eq(features.id, existing[0].id))
        .returning();

      return res.json({ feature: updated, updated: true });
    }

    // Create new feature
    const [newFeature] = await db
      .insert(features)
      .values({
        title,
        description,
        pageAgentId,
        journeyAgentId,
        category,
        assignedTo,
        status: 'backlog',
      })
      .returning();

    res.json({ feature: newFeature, updated: false });
  } catch (error) {
    console.error('Error creating feature:', error);
    res.status(500).json({ error: 'Failed to create feature' });
  }
});

/**
 * POST /api/project-tracker/sub-feature
 * Create sub-feature (Level 2) under a feature
 */
router.post('/sub-feature', requireAuth, async (req, res) => {
  try {
    const { featureId, title, whatWasBuilt, whatNeedsReview } = req.body;

    const [newSubFeature] = await db
      .insert(subFeatures)
      .values({
        featureId,
        title,
        whatWasBuilt,
        whatNeedsReview,
        status: 'pending',
      })
      .returning();

    res.json({ subFeature: newSubFeature });
  } catch (error) {
    console.error('Error creating sub-feature:', error);
    res.status(500).json({ error: 'Failed to create sub-feature' });
  }
});

/**
 * POST /api/project-tracker/component
 * Create component (Level 3) under a sub-feature
 */
router.post('/component', requireAuth, async (req, res) => {
  try {
    const { subFeatureId, title, fileLocation, instructions, codeExample } = req.body;

    // Check for existing component at same file location
    const existing = await db
      .select()
      .from(components)
      .where(
        and(
          eq(components.subFeatureId, subFeatureId),
          eq(components.fileLocation, fileLocation)
        )
      )
      .limit(1);

    if (existing.length > 0 && existing[0].status === 'done') {
      // Don't recreate fixed components
      return res.json({ component: existing[0], skipped: true });
    } else if (existing.length > 0) {
      // Update existing component with new instructions
      const [updated] = await db
        .update(components)
        .set({ 
          instructions, 
          codeExample, 
          updatedAt: new Date() 
        })
        .where(eq(components.id, existing[0].id))
        .returning();

      return res.json({ component: updated, updated: true });
    }

    // Create new component
    const [newComponent] = await db
      .insert(components)
      .values({
        subFeatureId,
        title,
        fileLocation,
        instructions,
        codeExample,
        status: 'pending',
      })
      .returning();

    res.json({ component: newComponent, updated: false });
  } catch (error) {
    console.error('Error creating component:', error);
    res.status(500).json({ error: 'Failed to create component' });
  }
});

/**
 * POST /api/project-tracker/task
 * Create task (Level 4) under a component
 */
router.post('/task', requireAuth, async (req, res) => {
  try {
    const { componentId, title, agentResponsible, estimatedTime } = req.body;

    const [newTask] = await db
      .insert(tasks)
      .values({
        componentId,
        title,
        agentResponsible,
        estimatedTime,
        status: 'todo',
      })
      .returning();

    res.json({ task: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

/**
 * PATCH /api/project-tracker/task/:id
 * Update task status (mark as done, in-progress, etc.)
 */
router.patch('/task/:id', requireAuth, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { status } = req.body;

    const [updatedTask] = await db
      .update(tasks)
      .set({ 
        status, 
        completedAt: status === 'done' ? new Date() : null 
      })
      .where(eq(tasks.id, taskId))
      .returning();

    // Check if all tasks in component are done, auto-update component
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        component: {
          with: {
            tasks: true,
          },
        },
      },
    });

    if (task && task.component) {
      const allTasksDone = task.component.tasks.every(t => t.status === 'done');
      
      if (allTasksDone) {
        await db
          .update(components)
          .set({ status: 'done', updatedAt: new Date() })
          .where(eq(components.id, task.component.id));
      }
    }

    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * POST /api/project-tracker/audit-to-story
 * Transform audit findings into story cards (The Plan automation)
 */
router.post('/audit-to-story', requireAuth, async (req, res) => {
  try {
    const { 
      pageAgent, 
      journeyAgent, 
      auditPhase, 
      findings 
    } = req.body;

    // Create or update feature for this page
    const featureTitle = `Fix ${pageAgent} Issues`;
    const [feature] = await db
      .insert(features)
      .values({
        title: featureTitle,
        description: `Audit findings from Phase ${auditPhase}`,
        pageAgentId: pageAgent,
        journeyAgentId: journeyAgent,
        category: findings.category || 'frontend',
        assignedTo: findings.category === 'backend' ? 'backend' : 'frontend',
        status: 'backlog',
      })
      .onConflictDoUpdate({
        target: [features.pageAgentId, features.title],
        set: { updatedAt: new Date() }
      })
      .returning();

    // Create sub-feature for audit phase
    const [subFeature] = await db
      .insert(subFeatures)
      .values({
        featureId: feature.id,
        title: `Phase ${auditPhase}: ${findings.phaseName}`,
        whatWasBuilt: findings.whatWasBuilt,
        whatNeedsReview: findings.whatNeedsReview,
      })
      .returning();

    // Create components for each issue
    const createdComponents = [];
    for (const issue of findings.issues || []) {
      const [component] = await db
        .insert(components)
        .values({
          subFeatureId: subFeature.id,
          title: issue.title,
          fileLocation: `${issue.file}:${issue.line}`,
          instructions: issue.instructions,
          codeExample: issue.codeExample,
        })
        .returning();

      createdComponents.push(component);

      // Create tasks for component
      for (const taskData of issue.tasks || []) {
        await db
          .insert(tasks)
          .values({
            componentId: component.id,
            title: taskData.title,
            agentResponsible: taskData.agents,
          });
      }
    }

    res.json({ 
      success: true, 
      feature, 
      subFeature, 
      componentsCreated: createdComponents.length 
    });
  } catch (error) {
    console.error('Error creating story from audit:', error);
    res.status(500).json({ error: 'Failed to create story cards' });
  }
});

export default router;
