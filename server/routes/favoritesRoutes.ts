import { Router } from 'express';
import { db } from '../db';
import { favorites } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/secureAuth';

const router = Router();

// Get user's favorites (with optional type filter)
router.get('/api/favorites', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { type } = req.query;

    let query = db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId));

    if (type) {
      query = db
        .select()
        .from(favorites)
        .where(and(
          eq(favorites.userId, userId),
          eq(favorites.itemType, type as string)
        ));
    }

    const userFavorites = await query;

    res.json(userFavorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add favorite
router.post('/api/favorites', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { itemId, itemType } = req.body;

    if (!itemId || !itemType) {
      return res.status(400).json({ error: 'itemId and itemType are required' });
    }

    // Check if already favorited
    const existing = await db
      .select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.itemId, itemId),
        eq(favorites.itemType, itemType)
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already favorited' });
    }

    // Add favorite
    const [favorite] = await db
      .insert(favorites)
      .values({
        userId,
        itemId,
        itemType
      })
      .returning();

    res.status(201).json(favorite);
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove favorite
router.delete('/api/favorites/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const favoriteId = parseInt(req.params.id);

    // Verify ownership
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(
        eq(favorites.id, favoriteId),
        eq(favorites.userId, userId)
      ))
      .limit(1);

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    await db.delete(favorites).where(eq(favorites.id, favoriteId));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
});

// Bulk delete favorites
router.post('/api/favorites/bulk-delete', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    // Delete only user's favorites
    const deleted = await db
      .delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        // @ts-ignore - inArray not typed correctly
        db.sql`${favorites.id} = ANY(${ids})`
      ));

    res.json({ success: true, deleted });
  } catch (error) {
    console.error('Bulk delete favorites error:', error);
    res.status(500).json({ error: 'Failed to bulk delete favorites' });
  }
});

export default router;
