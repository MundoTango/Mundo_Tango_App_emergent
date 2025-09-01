import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { setUserContext } from '../middleware/tenantMiddleware';
import { db } from '../db';
import { groups, groupMembers, users } from '../../shared/schema';
import { eq, and, or, sql, desc, ilike } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Get city groups for world map
router.get('/community/city-groups', async (req, res) => {
  try {
    const cityGroups = await db.select({
      id: groups.id,
      name: groups.name,
      city: groups.city,
      country: groups.country,
      lat: groups.latitude,
      lng: groups.longitude,
      memberCount: groups.memberCount,
      description: groups.description
    })
    .from(groups)
    .where(eq(groups.type, 'city'))
    .orderBy(desc(groups.memberCount));
    
    res.json({ 
      success: true,
      data: cityGroups.filter(g => g.lat && g.lng) // Only return groups with coordinates
    });
  } catch (error) {
    console.error('Error fetching city groups:', error);
    res.status(500).json({ error: 'Failed to fetch city groups' });
  }
});

// Get all groups with membership status
router.get('/groups', isAuthenticated, async (req: any, res) => {
  try {
    const { search, city } = req.query;
    const userId = req.user?.claims?.sub;
    
    // Get user ID for membership check
    let currentUser = null;
    if (userId) {
      currentUser = await storage.getUserByReplitId(userId);
    }
    
    let query = db.select().from(groups);
    
    if (search) {
      query = query.where(
        or(
          ilike(groups.name, `%${search}%`),
          ilike(groups.description, `%${search}%`)
        )
      );
    }
    
    if (city) {
      query = query.where(eq(groups.city, city as string));
    }
    
    const allGroups = await query.orderBy(desc(groups.createdAt));
    
    // Add membership status for each group
    const groupsWithMembership = await Promise.all(
      allGroups.map(async (group) => {
        let membershipStatus = null;
        let isMember = false;
        
        if (currentUser) {
          // Check if user is a member of this group
          const membership = await db.select()
            .from(groupMembers)
            .where(and(
              eq(groupMembers.groupId, group.id),
              eq(groupMembers.userId, currentUser.id)
            ))
            .limit(1);
          
          if (membership.length > 0) {
            membershipStatus = membership[0].status === 'active' ? 'member' : membership[0].status;
            isMember = membership[0].status === 'active';
          }
        }
        
        return {
          ...group,
          membershipStatus,
          isMember,
          image_url: group.imageUrl || null,
          member_count: group.memberCount || 0
        };
      })
    );
    
    console.log('🔄 GROUPS API - Returning:', groupsWithMembership.length, 'groups');
    res.json(groupsWithMembership);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get user's groups
router.get('/groups/my', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const userGroups = await db.select({
      group: groups,
      memberRole: groupMembers.role
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, user.id))
    .orderBy(desc(groups.createdAt));
    
    res.json(userGroups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Failed to fetch user groups' });
  }
});

// Get single group
router.get('/groups/:groupId', setUserContext, async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    
    const [group] = await db.select()
      .from(groups)
      .where(eq(groups.id, groupId));
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Get member count
    const members = await db.select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));
    
    res.json({
      ...group,
      memberCount: members.length
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Create group
router.post('/groups', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { name, description, city, isPrivate } = req.body;
    
    const [newGroup] = await db.insert(groups).values({
      name,
      description,
      city,
      isPrivate: isPrivate || false,
      createdById: user.id
    }).returning();
    
    // Add creator as admin
    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId: user.id,
      role: 'admin'
    });
    
    res.json(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Join group
router.post('/groups/:groupId/join', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const groupId = parseInt(req.params.groupId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Check if already member
    const [existingMember] = await db.select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user.id)
      ));
    
    if (existingMember) {
      return res.status(400).json({ error: 'Already a member' });
    }
    
    await db.insert(groupMembers).values({
      groupId,
      userId: user.id,
      role: 'member'
    });
    
    res.json({ success: true, message: 'Joined group successfully' });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave group
router.post('/groups/:groupId/leave', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const groupId = parseInt(req.params.groupId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    await db.delete(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user.id)
      ));
    
    res.json({ success: true, message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Get group members
router.get('/groups/:groupId/members', setUserContext, async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    
    const members = await db.select({
      user: users,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt
    })
    .from(groupMembers)
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(desc(groupMembers.joinedAt));
    
    res.json(members);
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ error: 'Failed to fetch group members' });
  }
});

// Join group by slug
router.post('/user/join-group/:slug', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const groupSlug = req.params.slug;
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Find group by slug
    const [group] = await db.select()
      .from(groups)
      .where(eq(groups.slug, groupSlug));
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check if already member
    const [existingMember] = await db.select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, group.id),
        eq(groupMembers.userId, user.id)
      ));
    
    if (existingMember) {
      return res.status(400).json({ error: 'Already a member' });
    }
export default router;
    
    await db.insert(groupMembers).values({
      groupId: group.id,
      userId: user.id,
      role: 'member',
      status: 'active'
    });
    
    // Update member count
    await db.update(groups)
      .set({ memberCount: sql`${groups.memberCount} + 1` })
      .where(eq(groups.id, group.id));
    
    res.json({ success: true, message: 'Joined group successfully' });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave group by slug
router.post('/user/leave-group/:slug', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const groupSlug = req.params.slug;
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Find group by slug
    const [group] = await db.select()
      .from(groups)
      .where(eq(groups.slug, groupSlug));
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    await db.delete(groupMembers)
      .where(and(
        eq(groupMembers.groupId, group.id),
        eq(groupMembers.userId, user.id)
      ));
    
    // Update member count
    await db.update(groups)
      .set({ memberCount: sql`GREATEST(${groups.memberCount} - 1, 0)` })
      .where(eq(groups.id, group.id));
    
    res.json({ success: true, message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});
