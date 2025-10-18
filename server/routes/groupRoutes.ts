/**
 * Mundo Tango ESA LIFE CEO - Group Routes
 * Phase 11 Parallel: Updated with secure pattern (direct DB + error handling + Zod validation)
 */

import { Router, Response, NextFunction } from 'express';
import { db } from '../db';
import { groups, groupMembers, users, insertGroupSchema } from '../../shared/schema';
import { eq, and, or, sql, desc, ilike } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { success, error as errorResponse, ValidationError, AuthenticationError, NotFoundError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createGroupSchema = insertGroupSchema.pick({
  name: true,
  description: true,
  city: true,
  isPrivate: true
});

// Get city groups for world map
router.get('/community/city-groups', async (req, res, next: NextFunction) => {
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
    
    res.json(success(
      cityGroups.filter(g => g.lat && g.lng),
      'City groups fetched successfully'
    ));
  } catch (error) {
    next(error);
  }
});

// Get all groups
router.get('/groups', async (req, res, next: NextFunction) => {
  try {
    const { search, city } = req.query;
    
    let query = db.select().from(groups);
    
    // Conditional query building (avoid undefined in where())
    const conditions = [];
    
    if (search && typeof search === 'string') {
      conditions.push(
        or(
          ilike(groups.name, `%${search}%`),
          ilike(groups.description, `%${search}%`)
        )
      );
    }
    
    if (city && typeof city === 'string') {
      conditions.push(eq(groups.city, city));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const allGroups = await query.orderBy(desc(groups.createdAt));
    
    res.json(success(allGroups, 'Groups fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Get user's groups
router.get('/groups/my', isAuthenticated, async (req: any, res, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    const userGroups = await db.select({
      group: groups,
      memberRole: groupMembers.role
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, user[0].id))
    .orderBy(desc(groups.createdAt));
    
    res.json(success(userGroups, 'User groups fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Get single group (by ID or slug)
router.get('/groups/:groupIdentifier', async (req, res, next: NextFunction) => {
  try {
    const identifier = req.params.groupIdentifier;
    let group;
    
    // Check if identifier is numeric (ID) or string (slug)
    if (/^\d+$/.test(identifier)) {
      const groupId = parseInt(identifier);
      [group] = await db.select()
        .from(groups)
        .where(eq(groups.id, groupId))
        .limit(1);
    } else {
      [group] = await db.select()
        .from(groups)
        .where(eq(groups.slug, identifier))
        .limit(1);
    }
    
    if (!group) {
      throw new NotFoundError('Group not found');
    }
    
    // Get member count
    const members = await db.select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, group.id));
    
    res.json(success({
      ...group,
      memberCount: members.length
    }, 'Group fetched successfully'));
  } catch (error) {
    next(error);
  }
});

// Create group (with Zod validation)
router.post('/groups', isAuthenticated, async (req: any, res, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    // Validate request body
    const validationResult = createGroupSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(`Invalid group data: ${validationResult.error.message}`);
    }

    const { name, description, city, isPrivate } = validationResult.data;
    
    const [newGroup] = await db.insert(groups).values({
      name,
      description,
      city,
      isPrivate: isPrivate || false,
      createdById: user[0].id
    }).returning();
    
    // Add creator as admin
    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId: user[0].id,
      role: 'admin'
    });
    
    res.json(success(newGroup, 'Group created successfully'));
  } catch (error) {
    next(error);
  }
});

// Join group
router.post('/groups/:groupId/join', isAuthenticated, async (req: any, res, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    const groupId = parseInt(req.params.groupId);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    if (isNaN(groupId)) {
      throw new ValidationError('Invalid group ID');
    }
    
    // Check if already member
    const [existingMember] = await db.select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user[0].id)
      ))
      .limit(1);
    
    if (existingMember) {
      throw new ValidationError('Already a member of this group');
    }
    
    await db.insert(groupMembers).values({
      groupId,
      userId: user[0].id,
      role: 'member'
    });
    
    res.json(success({ groupId }, 'Joined group successfully'));
  } catch (error) {
    next(error);
  }
});

// Leave group
router.post('/groups/:groupId/leave', isAuthenticated, async (req: any, res, next: NextFunction) => {
  try {
    const userId = req.user.claims.sub;
    const user = await db.select().from(users).where(eq(users.replitId, userId)).limit(1);
    const groupId = parseInt(req.params.groupId);
    
    if (!user[0] || !user[0].isActive) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    if (isNaN(groupId)) {
      throw new ValidationError('Invalid group ID');
    }
    
    const deleted = await db.delete(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user[0].id)
      ))
      .returning();
    
    if (deleted.length === 0) {
      throw new NotFoundError('Membership not found');
    }
    
    res.json(success({ groupId }, 'Left group successfully'));
  } catch (error) {
    next(error);
  }
});

// Get group members
router.get('/groups/:groupId/members', async (req, res, next: NextFunction) => {
  try {
    const groupId = parseInt(req.params.groupId);
    
    if (isNaN(groupId)) {
      throw new ValidationError('Invalid group ID');
    }
    
    const members = await db.select({
      id: users.id,
      name: users.name,
      username: users.username,
      profileImage: users.profileImage,
      role: groupMembers.role,
      joinedAt: groupMembers.createdAt
    })
    .from(groupMembers)
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(desc(groupMembers.createdAt));
    
    res.json(success(members, 'Group members fetched successfully'));
  } catch (error) {
    next(error);
  }
});

export default router;
