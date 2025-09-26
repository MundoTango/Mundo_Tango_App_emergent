
// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 24: Social Features Agent - Friendship Detail Endpoints

import express from 'express';
import { authenticateUser } from '../middleware/auth';
import db from '../db';

const router = express.Router();

// Get detailed friendship information
router.get('/friendship/:friendId', authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const friendId = req.params.friendId;

    // Get friendship details with stats
    const friendshipQuery = `
      SELECT 
        f.*,
        u.id as user_id,
        u.name as user_name,
        u.profile_image as user_profile_image,
        u.city as user_city,
        u.country as user_country,
        u.bio as user_bio,
        (
          SELECT COUNT(*) FROM posts p 
          WHERE (p.user_id = ? AND p.id IN (
            SELECT post_id FROM post_likes WHERE user_id = ?
          )) OR (p.user_id = ? AND p.id IN (
            SELECT post_id FROM post_likes WHERE user_id = ?
          ))
        ) as total_dances,
        (
          SELECT COUNT(*) FROM event_rsvps er1
          JOIN event_rsvps er2 ON er1.event_id = er2.event_id
          WHERE er1.user_id = ? AND er2.user_id = ?
        ) as shared_events,
        (
          SELECT COUNT(*) FROM group_members gm1
          JOIN group_members gm2 ON gm1.group_id = gm2.group_id
          WHERE gm1.user_id = ? AND gm2.user_id = ?
        ) as shared_groups,
        COALESCE(
          (SELECT (COUNT(*) * 100 / 10) FROM posts p 
           WHERE p.user_id IN (?, ?) AND p.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
          ), 75
        ) as closeness_score
      FROM friends f
      JOIN users u ON u.id = ?
      WHERE f.user_id = ? AND f.friend_id = ? AND f.status = 'accepted'
      LIMIT 1
    `;

    const friendshipResult = await db.query(friendshipQuery, [
      userId, friendId, friendId, userId, // total_dances
      userId, friendId, // shared_events
      userId, friendId, // shared_groups
      userId, friendId, // closeness_score
      friendId, // user join
      userId, friendId // friendship where
    ]);

    if (!friendshipResult.length) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    const friendshipData = friendshipResult[0];
    
    res.json({
      id: friendshipData.id,
      user: {
        id: friendshipData.user_id,
        name: friendshipData.user_name,
        profileImage: friendshipData.user_profile_image,
        city: friendshipData.user_city,
        country: friendshipData.user_country,
        bio: friendshipData.user_bio,
      },
      friendsSince: friendshipData.created_at,
      connectionDegree: 1, // Direct friend
      stats: {
        totalDances: friendshipData.total_dances || 0,
        sharedEvents: friendshipData.shared_events || 0,
        sharedGroups: friendshipData.shared_groups || 0,
        closenessScore: friendshipData.closeness_score || 75,
      }
    });

  } catch (error) {
    console.error('Error fetching friendship details:', error);
    res.status(500).json({ error: 'Failed to fetch friendship details' });
  }
});

// Get mutual friends
router.get('/friendship/:friendId/mutual-friends', authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const friendId = req.params.friendId;

    const mutualFriendsQuery = `
      SELECT DISTINCT
        u.id,
        u.name,
        u.profile_image,
        u.city,
        u.country
      FROM friends f1
      JOIN friends f2 ON f1.friend_id = f2.friend_id
      JOIN users u ON u.id = f1.friend_id
      WHERE f1.user_id = ? 
        AND f2.user_id = ?
        AND f1.status = 'accepted'
        AND f2.status = 'accepted'
        AND f1.friend_id NOT IN (?, ?)
      LIMIT 20
    `;

    const mutualFriends = await db.query(mutualFriendsQuery, [
      userId, friendId, userId, friendId
    ]);

    res.json(mutualFriends);

  } catch (error) {
    console.error('Error fetching mutual friends:', error);
    res.status(500).json({ error: 'Failed to fetch mutual friends' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { friends, users } from '../../shared/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import { getUserId } from '../utils/authHelper';

const router = Router();

// Get user's friends
router.get('/api/friends', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    
    // Get all accepted friends
    const userFriends = await db
      .select()
      .from(friends)
      .leftJoin(users, eq(friends.friendId, users.id))
      .where(
        and(
          eq(friends.userId, userId),
          eq(friends.status, 'accepted')
        )
      );
    
    res.json(userFriends || []);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Get pending friend requests
router.get('/api/friends/requests', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    
    const requests = await db
      .select()
      .from(friends)
      .leftJoin(users, eq(friends.userId, users.id))
      .where(
        and(
          eq(friends.friendId, userId),
          eq(friends.status, 'pending')
        )
      );
    
    res.json(requests || []);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
});

// Send friend request
router.post('/api/friends/request', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    const { friendId } = req.body;
    
    const newRequest = await db
      .insert(friends)
      .values({
        userId: userId,
        friendId: parseInt(friendId),
        status: 'pending'
      })
      .returning();
    
    res.json(newRequest[0]);
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Accept/reject friend request
router.put('/api/friends/request/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req) || 7;
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    
    const updated = await db
      .update(friends)
      .set({ status })
      .where(
        and(
          eq(friends.id, parseInt(id)),
          eq(friends.friendId, userId)
        )
      )
      .returning();
    
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating friend request:', error);
    res.status(500).json({ error: 'Failed to update friend request' });
  }
});

export default router;