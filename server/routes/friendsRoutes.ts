// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 24: Social Features Agent - Friendship Detail Endpoints

import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { pool } from '../db';

const router = express.Router();

// Get detailed friendship information
router.get('/friendship/:friendId', authMiddleware, async (req, res) => {
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
          WHERE (p.user_id = $1 AND p.id IN (
            SELECT post_id FROM post_likes WHERE user_id = $2
          )) OR (p.user_id = $3 AND p.id IN (
            SELECT post_id FROM post_likes WHERE user_id = $4
          ))
        ) as total_dances,
        (
          SELECT COUNT(*) FROM event_rsvps er1
          JOIN event_rsvps er2 ON er1.event_id = er2.event_id
          WHERE er1.user_id = $5 AND er2.user_id = $6
        ) as shared_events,
        (
          SELECT COUNT(*) FROM group_members gm1
          JOIN group_members gm2 ON gm1.group_id = gm2.group_id
          WHERE gm1.user_id = $7 AND gm2.user_id = $8
        ) as shared_groups,
        COALESCE(
          (SELECT (COUNT(*) * 100 / 10) FROM posts p 
           WHERE p.user_id IN ($9, $10) AND p.created_at > NOW() - INTERVAL '30 days'
          ), 75
        ) as closeness_score
      FROM friends f
      JOIN users u ON u.id = $11
      WHERE f.user_id = $12 AND f.friend_id = $13 AND f.status = 'accepted'
      LIMIT 1
    `;

    const friendshipResult = await pool.query(friendshipQuery, [
      userId, friendId, friendId, userId, // total_dances
      userId, friendId, // shared_events
      userId, friendId, // shared_groups
      userId, friendId, // closeness_score
      friendId, // user join
      userId, friendId // friendship where
    ]);

    if (!friendshipResult.rows || friendshipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    const friendshipData = friendshipResult.rows[0];
    
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
router.get('/friendship/:friendId/mutual-friends', authMiddleware, async (req, res) => {
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
      WHERE f1.user_id = $1 
        AND f2.user_id = $2
        AND f1.status = 'accepted'
        AND f2.status = 'accepted'
        AND f1.friend_id NOT IN ($3, $4)
      LIMIT 20
    `;

    const mutualFriends = await pool.query(mutualFriendsQuery, [
      userId, friendId, userId, friendId
    ]);

    res.json(mutualFriends.rows || []);

  } catch (error) {
    console.error('Error fetching mutual friends:', error);
    res.status(500).json({ error: 'Failed to fetch mutual friends' });
  }
});

export default router;