import { Router } from 'express';
import { db } from '../db';
import { friendRequests, users } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Get friend requests (sent and received)
router.get('/api/friend-requests', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { type } = req.query; // 'sent', 'received', or 'all'

    let query;
    
    if (type === 'sent') {
      query = db
        .select()
        .from(friendRequests)
        .where(eq(friendRequests.senderId, userId));
    } else if (type === 'received') {
      query = db
        .select()
        .from(friendRequests)
        .where(eq(friendRequests.receiverId, userId));
    } else {
      // All requests (sent or received)
      query = db
        .select()
        .from(friendRequests)
        .where(or(
          eq(friendRequests.senderId, userId),
          eq(friendRequests.receiverId, userId)
        ));
    }

    const requests = await query;

    res.json(requests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
});

// Send friend request
router.post('/api/friend-requests', requireAuth, async (req, res) => {
  try {
    const senderId = req.user!.id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: 'receiverId is required' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if request already exists
    const existing = await db
      .select()
      .from(friendRequests)
      .where(or(
        and(
          eq(friendRequests.senderId, senderId),
          eq(friendRequests.receiverId, receiverId)
        ),
        and(
          eq(friendRequests.senderId, receiverId),
          eq(friendRequests.receiverId, senderId)
        )
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    // Create friend request
    const [request] = await db
      .insert(friendRequests)
      .values({
        senderId,
        receiverId,
        status: 'pending'
      })
      .returning();

    res.status(201).json(request);
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Accept/reject friend request
router.patch('/api/friend-requests/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const requestId = parseInt(req.params.id);
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "accepted" or "rejected"' });
    }

    // Verify request exists and user is the receiver
    const [request] = await db
      .select()
      .from(friendRequests)
      .where(and(
        eq(friendRequests.id, requestId),
        eq(friendRequests.receiverId, userId),
        eq(friendRequests.status, 'pending')
      ))
      .limit(1);

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found or already processed' });
    }

    // Update status
    const [updated] = await db
      .update(friendRequests)
      .set({ status })
      .where(eq(friendRequests.id, requestId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Update friend request error:', error);
    res.status(500).json({ error: 'Failed to update friend request' });
  }
});

// Cancel friend request (sender only)
router.delete('/api/friend-requests/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const requestId = parseInt(req.params.id);

    // Verify request exists and user is the sender
    const [request] = await db
      .select()
      .from(friendRequests)
      .where(and(
        eq(friendRequests.id, requestId),
        eq(friendRequests.senderId, userId)
      ))
      .limit(1);

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    await db.delete(friendRequests).where(eq(friendRequests.id, requestId));

    res.json({ success: true });
  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({ error: 'Failed to cancel friend request' });
  }
});

export default router;
