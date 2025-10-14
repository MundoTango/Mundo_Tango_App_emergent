import { Router } from 'express';
import { db } from '../db';
import { reactions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/secureAuth';

const router = Router();

// Get reactions for a post
router.get('/api/posts/:postId/reactions', async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);

    const postReactions = await db
      .select()
      .from(reactions)
      .where(eq(reactions.postId, postId));

    // Group by reaction type
    const grouped = postReactions.reduce((acc: any, reaction) => {
      const type = reaction.type;
      if (!acc[type]) {
        acc[type] = {
          type,
          count: 0,
          users: []
        };
      }
      acc[type].count++;
      acc[type].users.push({
        id: reaction.userId,
        reactionId: reaction.id
      });
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({ error: 'Failed to fetch reactions' });
  }
});

// Add reaction
router.post('/api/reactions', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { postId, type } = req.body;

    if (!postId || !type) {
      return res.status(400).json({ error: 'postId and type are required' });
    }

    // Remove any existing reaction from this user on this post
    await db
      .delete(reactions)
      .where(and(
        eq(reactions.userId, userId),
        eq(reactions.postId, postId)
      ));

    // Add new reaction
    const [reaction] = await db
      .insert(reactions)
      .values({
        userId,
        postId,
        type
      })
      .returning();

    res.status(201).json(reaction);
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Remove reaction
router.delete('/api/reactions/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const reactionId = parseInt(req.params.id);

    // Verify ownership
    const [reaction] = await db
      .select()
      .from(reactions)
      .where(and(
        eq(reactions.id, reactionId),
        eq(reactions.userId, userId)
      ))
      .limit(1);

    if (!reaction) {
      return res.status(404).json({ error: 'Reaction not found' });
    }

    await db.delete(reactions).where(eq(reactions.id, reactionId));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete reaction error:', error);
    res.status(500).json({ error: 'Failed to delete reaction' });
  }
});

// Get user's reactions (for profile view)
router.get('/api/users/:userId/reactions', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const userReactions = await db
      .select()
      .from(reactions)
      .where(eq(reactions.userId, userId))
      .limit(100); // Limit to recent 100

    res.json(userReactions);
  } catch (error) {
    console.error('Get user reactions error:', error);
    res.status(500).json({ error: 'Failed to fetch user reactions' });
  }
});

export default router;
