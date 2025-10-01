import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { setUserContext } from '../middleware/tenantMiddleware';
import { db } from '../db';
import { groups, groupMembers, users, events } from '../../shared/schema';
import { eq, and, or, sql, desc, ilike } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// OPTIMIZED: Get rankings (city or region) with aggregated stats
router.get('/community/rankings', async (req, res) => {
  try {
    const { view = 'city', sortBy = 'members', filterBy = 'people' } = req.query;
    
    if (view === 'region') {
      // Region/Country aggregation - compute per-city counts first, then aggregate by country
      // Step 1: Get per-city member and event counts
      const cityCounts = await db
        .select({
          country: groups.country,
          groupId: groups.id,
          city: groups.city,
          memberCount: sql<number>`CASE WHEN COUNT(DISTINCT ${groupMembers.id}) > 0 THEN COUNT(DISTINCT ${groupMembers.id}) ELSE COALESCE(${groups.memberCount}, 0) END::int`,
          eventCount: sql<number>`COUNT(DISTINCT ${events.id})::int`,
        })
        .from(groups)
        .leftJoin(groupMembers, eq(groupMembers.groupId, groups.id))
        .leftJoin(events, and(
          eq(events.city, groups.city),
          eq(events.country, groups.country)
        ))
        .where(and(
          eq(groups.type, 'city'),
          sql`${groups.country} IS NOT NULL`,
          sql`${groups.latitude} IS NOT NULL`,
          sql`${groups.longitude} IS NOT NULL`
        ))
        .groupBy(groups.id, groups.country, groups.city, groups.memberCount);
      
      // Step 2: Aggregate by country
      const regionMap = new Map<string, { memberCount: number; eventCount: number; cityCount: number }>();
      cityCounts.forEach(city => {
        const existing = regionMap.get(city.country!) || { memberCount: 0, eventCount: 0, cityCount: 0 };
        regionMap.set(city.country!, {
          memberCount: existing.memberCount + city.memberCount,
          eventCount: existing.eventCount + city.eventCount,
          cityCount: existing.cityCount + 1
        });
      });
      
      // Step 3: Convert to array and sort based on filter
      const regionRankings = Array.from(regionMap.entries())
        .map(([country, stats]) => ({
          region: country,
          memberCount: stats.memberCount,
          eventCount: stats.eventCount,
          cityCount: stats.cityCount
        }))
        .sort((a, b) => {
          if (filterBy === 'events') {
            return b.eventCount - a.eventCount;
          }
          return b.memberCount - a.memberCount;
        });
      
      res.json({
        success: true,
        view: 'region',
        data: regionRankings.map((r, index) => ({
          rank: index + 1,
          name: r.region,
          memberCount: r.memberCount,
          eventCount: r.eventCount,
          cityCount: r.cityCount
        }))
      });
    } else {
      // City rankings with member and event counts
      const sortColumn = filterBy === 'events' 
        ? sql<number>`COUNT(DISTINCT ${events.id})`
        : sql<number>`CASE WHEN COUNT(DISTINCT ${groupMembers.id}) > 0 THEN COUNT(DISTINCT ${groupMembers.id}) ELSE COALESCE(${groups.memberCount}, 0) END`;
      
      const cityRankings = await db
        .select({
          id: groups.id,
          name: groups.name,
          city: groups.city,
          country: groups.country,
          lat: groups.latitude,
          lng: groups.longitude,
          memberCount: sql<number>`CASE WHEN COUNT(DISTINCT ${groupMembers.id}) > 0 THEN COUNT(DISTINCT ${groupMembers.id}) ELSE COALESCE(${groups.memberCount}, 0) END::int`,
          eventCount: sql<number>`COUNT(DISTINCT ${events.id})::int`,
        })
        .from(groups)
        .leftJoin(groupMembers, eq(groupMembers.groupId, groups.id))
        .leftJoin(events, and(
          eq(events.city, groups.city),
          eq(events.country, groups.country)
        ))
        .where(and(
          eq(groups.type, 'city'),
          sql`${groups.latitude} IS NOT NULL`,
          sql`${groups.longitude} IS NOT NULL`
        ))
        .groupBy(groups.id, groups.name, groups.city, groups.country, groups.latitude, groups.longitude, groups.memberCount)
        .orderBy(desc(sortColumn));
      
      res.json({
        success: true,
        view: 'city',
        data: cityRankings.map((c, index) => ({
          rank: index + 1,
          id: c.id,
          name: c.name,
          city: c.city,
          country: c.country,
          lat: c.lat,
          lng: c.lng,
          memberCount: c.memberCount,
          eventCount: c.eventCount
        }))
      });
    }
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

// OPTIMIZED: Get city groups for world map with aggregated stats (fixes N+1 query issue)
router.get('/community/city-groups', async (req, res) => {
  try {
    // Single aggregated query instead of N+1 queries
    const cityGroupsWithStats = await db
      .select({
        id: groups.id,
        name: groups.name,
        city: groups.city,
        country: groups.country,
        lat: groups.latitude,
        lng: groups.longitude,
        slug: groups.slug,
        fallbackMemberCount: groups.memberCount,
        description: groups.description,
        memberCount: sql<number>`CASE WHEN COUNT(DISTINCT ${groupMembers.id}) > 0 THEN COUNT(DISTINCT ${groupMembers.id}) ELSE COALESCE(${groups.memberCount}, 0) END::int`,
      })
      .from(groups)
      .leftJoin(groupMembers, eq(groupMembers.groupId, groups.id))
      .where(and(
        eq(groups.type, 'city'),
        sql`${groups.latitude} IS NOT NULL`,
        sql`${groups.longitude} IS NOT NULL`
      ))
      .groupBy(groups.id, groups.name, groups.city, groups.country, groups.latitude, groups.longitude, groups.slug, groups.memberCount, groups.description)
      .orderBy(desc(sql`CASE WHEN COUNT(DISTINCT ${groupMembers.id}) > 0 THEN COUNT(DISTINCT ${groupMembers.id}) ELSE COALESCE(${groups.memberCount}, 0) END`));
    
    const formattedData = cityGroupsWithStats.map(group => ({
      id: group.id,
      name: group.name,
      city: group.city,
      country: group.country,
      lat: group.lat,
      lng: group.lng,
      slug: group.slug,
      memberCount: group.memberCount,
      totalUsers: group.memberCount,
      description: group.description,
      eventCount: 0,
      hostCount: 0,
      recommendationCount: 0
    }));
    
    res.json({ 
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching city groups:', error);
    res.status(500).json({ error: 'Failed to fetch city groups' });
  }
});

// Get all groups
router.get('/groups', setUserContext, async (req, res) => {
  try {
    const { search, city } = req.query;
    
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
    
    res.json(allGroups);
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

// Get single group (by ID or slug)
router.get('/groups/:groupIdentifier', setUserContext, async (req, res) => {
  try {
    const identifier = req.params.groupIdentifier;
    let group;
    
    // Check if identifier is numeric (ID) or string (slug)
    if (/^\d+$/.test(identifier)) {
      // It's a numeric ID
      const groupId = parseInt(identifier);
      [group] = await db.select()
        .from(groups)
        .where(eq(groups.id, groupId));
    } else {
      // It's a slug
      [group] = await db.select()
        .from(groups)
        .where(eq(groups.slug, identifier));
    }
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Get member count
    const members = await db.select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, group.id));
    
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

// Get group posts with membership/residency filtering
router.get('/groups/:groupId/posts', setUserContext, async (req, res) => {
  try {
    const groupSlugOrId = req.params.groupId;
    const { filter = 'all', page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Import posts table
    const { posts } = await import('../../shared/schema');

    // Get group details by slug or ID
    const parsedId = parseInt(groupSlugOrId);
    const [group] = await db.select()
      .from(groups)
      .where(
        isNaN(parsedId) 
          ? eq(groups.slug, groupSlugOrId)
          : eq(groups.id, parsedId)
      );

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const groupId = group.id;

    if (group.type === 'city') {
      // City Group Filtering: Residents vs Visitors
      if (filter === 'residents') {
        // Get posts by users living in this city
        const residentPosts = await db
          .select({
            id: posts.id,
            userId: posts.userId,
            content: posts.content,
            imageUrl: posts.imageUrl,
            videoUrl: posts.videoUrl,
            mediaEmbeds: posts.mediaEmbeds,
            mentions: posts.mentions,
            location: posts.location,
            visibility: posts.visibility,
            likesCount: posts.likesCount,
            commentsCount: posts.commentsCount,
            createdAt: posts.createdAt,
            user: {
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              profileImage: users.profileImage,
              city: users.city
            }
          })
          .from(posts)
          .innerJoin(users, eq(posts.userId, users.id))
          .where(
            and(
              or(
                sql`${posts.content} LIKE ${'%city:' + group.slug + '%'}`,
                sql`${posts.content} LIKE ${'%group:' + group.slug + '%'}`
              ),
              sql`${users.city} = ${group.city}` // User's city matches group's city
            )
          )
          .orderBy(desc(posts.createdAt))
          .limit(parseInt(limit as string))
          .offset(offset);

        return res.json({ success: true, data: residentPosts });
      } else if (filter === 'visitors') {
        // Get posts by users NOT living in this city
        const visitorPosts = await db
          .select({
            id: posts.id,
            userId: posts.userId,
            content: posts.content,
            imageUrl: posts.imageUrl,
            videoUrl: posts.videoUrl,
            mediaEmbeds: posts.mediaEmbeds,
            mentions: posts.mentions,
            location: posts.location,
            visibility: posts.visibility,
            likesCount: posts.likesCount,
            commentsCount: posts.commentsCount,
            createdAt: posts.createdAt,
            user: {
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              profileImage: users.profileImage,
              city: users.city
            }
          })
          .from(posts)
          .innerJoin(users, eq(posts.userId, users.id))
          .where(
            and(
              or(
                sql`${posts.content} LIKE ${'%city:' + group.slug + '%'}`,
                sql`${posts.content} LIKE ${'%group:' + group.slug + '%'}`
              ),
              or(
                sql`${users.city} IS NULL`,
                sql`${users.city} != ${group.city}`
              )
            )
          )
          .orderBy(desc(posts.createdAt))
          .limit(parseInt(limit as string))
          .offset(offset);

        return res.json({ success: true, data: visitorPosts });
      }
    } else {
      // Professional Group Filtering: Members vs Non-members
      if (filter === 'members') {
        // Get posts by group members
        const memberPosts = await db
          .select({
            id: posts.id,
            userId: posts.userId,
            content: posts.content,
            imageUrl: posts.imageUrl,
            videoUrl: posts.videoUrl,
            mediaEmbeds: posts.mediaEmbeds,
            mentions: posts.mentions,
            location: posts.location,
            visibility: posts.visibility,
            likesCount: posts.likesCount,
            commentsCount: posts.commentsCount,
            createdAt: posts.createdAt,
            user: {
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              profileImage: users.profileImage
            },
            memberRole: groupMembers.role
          })
          .from(posts)
          .innerJoin(users, eq(posts.userId, users.id))
          .innerJoin(groupMembers, and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, posts.userId)
          ))
          .where(
            sql`${posts.content} LIKE ${'%group:' + group.slug + '%'}`
          )
          .orderBy(desc(posts.createdAt))
          .limit(parseInt(limit as string))
          .offset(offset);

        return res.json({ success: true, data: memberPosts });
      } else if (filter === 'non-members') {
        // Get posts by non-members who mentioned the group
        const nonMemberPosts = await db
          .select({
            id: posts.id,
            userId: posts.userId,
            content: posts.content,
            imageUrl: posts.imageUrl,
            videoUrl: posts.videoUrl,
            mediaEmbeds: posts.mediaEmbeds,
            mentions: posts.mentions,
            location: posts.location,
            visibility: posts.visibility,
            likesCount: posts.likesCount,
            commentsCount: posts.commentsCount,
            createdAt: posts.createdAt,
            user: {
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              profileImage: users.profileImage
            }
          })
          .from(posts)
          .innerJoin(users, eq(posts.userId, users.id))
          .where(
            and(
              sql`${posts.content} LIKE ${'%group:' + group.slug + '%'}`,
              sql`NOT EXISTS (
                SELECT 1 FROM ${groupMembers} 
                WHERE ${groupMembers.groupId} = ${groupId} 
                AND ${groupMembers.userId} = ${posts.userId}
              )`
            )
          )
          .orderBy(desc(posts.createdAt))
          .limit(parseInt(limit as string))
          .offset(offset);

        return res.json({ success: true, data: nonMemberPosts });
      }
    }

    // Default: Get all posts mentioning the group
    const allPosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        mediaEmbeds: posts.mediaEmbeds,
        mentions: posts.mentions,
        location: posts.location,
        visibility: posts.visibility,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage
        }
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(
        or(
          sql`${posts.content} LIKE ${'%city:' + group.slug + '%'}`,
          sql`${posts.content} LIKE ${'%group:' + group.slug + '%'}`
        )
      )
      .orderBy(desc(posts.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    return res.json({ success: true, data: allPosts });
  } catch (error) {
    console.error('Error fetching group posts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch group posts' });
  }
});

export default router;