import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { setUserContext } from '../middleware/tenantMiddleware';
import { db } from '../db';
import { groups, groupMembers, users, events, posts, hostHomes, recommendations, friends } from '../../shared/schema';
import { eq, and, or, sql, desc, ilike, gte, isNull, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { requireAbility } from '../auth/abilities';
import { getRecommendedGroups, suggestSimilarMembers } from '../services/groupRecommendationService';
import { getGroupHealth, getGroupInsights } from '../services/groupAnalyticsService';
import { CityPhotoService } from '../services/cityPhotoService';
import Fuse from 'fuse.js';

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

// Get global community statistics for sidebar
router.get('/community/global-stats', async (req, res) => {
  try {
    // Calculate total unique users across all city groups (prevents double-counting)
    const [globalPeopleStats] = await db
      .select({
        totalPeople: sql<number>`COUNT(DISTINCT ${groupMembers.userId})::int`,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groups.type, 'city'));

    const totalMembers = globalPeopleStats?.totalPeople || 0;

    // Get active event count (upcoming or currently happening events only)
    const now = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [eventStats] = await db
      .select({
        totalEvents: sql<number>`COUNT(*)::int`,
      })
      .from(events)
      .where(
        or(
          gte(events.endDate, now),
          and(
            isNull(events.endDate),
            gte(events.startDate, yesterday)
          )
        )
      );

    // Get total communities (city groups)
    const [communityStats] = await db
      .select({
        totalCommunities: sql<number>`COUNT(*)::int`,
      })
      .from(groups)
      .where(eq(groups.type, 'city'));

    // Get user's city count - aggregate ALL groups matching user's city (not just one)
    let yourCityCount = 0;
    if (req.user && (req.user as any).city) {
      const userCity = (req.user as any).city;
      const userCountry = (req.user as any).country;
      
      const [cityStats] = await db
        .select({
          totalMembers: sql<number>`COUNT(DISTINCT ${groupMembers.userId})::int`,
        })
        .from(groups)
        .leftJoin(groupMembers, eq(groupMembers.groupId, groups.id))
        .where(and(
          eq(groups.type, 'city'),
          eq(groups.city, userCity),
          userCountry ? eq(groups.country, userCountry) : sql`true`
        ));
      
      yourCityCount = cityStats?.totalMembers || 0;
    }

    res.json({
      success: true,
      data: {
        globalPeople: totalMembers,
        activeEvents: eventStats?.totalEvents || 0,
        communities: communityStats?.totalCommunities || 0,
        yourCity: yourCityCount
      }
    });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ error: 'Failed to fetch global statistics' });
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
    
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          ilike(groups.name, `%${search}%`),
          ilike(groups.description, `%${search}%`)
        )
      );
    }
    
    if (city) {
      conditions.push(eq(groups.city, city as string));
    }
    
    const allGroups = await db
      .select()
      .from(groups)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(groups.createdAt));
    
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
    
    // For city groups, calculate additional metrics
    let eventCount = null;
    let hostCount = null;
    let recommendationCount = null;
    
    if (group.type === 'city' && group.city) {
      // Count events in this city
      const cityEvents = await db.select()
        .from(events)
        .where(and(
          eq(events.city, group.city),
          group.country ? eq(events.country, group.country) : sql`true`
        ));
      eventCount = cityEvents.length;
      
      // Count hosts in this city
      const cityHosts = await db.select()
        .from(hostHomes)
        .where(eq(hostHomes.city, group.city));
      hostCount = cityHosts.length;
      
      // Count recommendations in this city
      const cityRecommendations = await db.select()
        .from(recommendations)
        .where(eq(recommendations.city, group.city));
      recommendationCount = cityRecommendations.length;
    }
    
    res.json({
      ...group,
      memberCount: members.length,
      eventCount,
      hostCount,
      recommendationCount
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

    const { name, description, city, isPrivate, slug } = req.body;
    
    const [newGroup] = await db.insert(groups).values({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      city,
      isPrivate: isPrivate || false,
      createdBy: user.id
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

// Get automated city cover photo
router.get('/groups/:groupId/cover-photo', setUserContext, async (req, res) => {
  try {
    const groupSlugOrId = req.params.groupId;
    
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

    // Only fetch photos for city groups
    if (group.type === 'city' && group.city) {
      const photo = await CityPhotoService.fetchCityPhoto(group.city, group.country || undefined);
      
      if (photo) {
        return res.json({ 
          url: photo.url,
          photographer: photo.photographer,
          source: photo.source
        });
      }
    }
    
    // Return null if no photo available
    res.json({ url: null });
  } catch (error) {
    console.error('Error fetching city cover photo:', error);
    res.status(500).json({ error: 'Failed to fetch cover photo' });
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
        const currentUserId = req.user?.id;
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
              name: users.name,
              username: users.username,
              profileImage: users.profileImage,
              tangoRoles: users.tangoRoles,
              leaderLevel: users.leaderLevel,
              followerLevel: users.followerLevel,
              city: users.city,
              state: users.state,
              country: users.country,
              friendshipStatus: sql<string>`CASE 
                WHEN ${friends.status} = 'accepted' THEN 'accepted'
                WHEN ${friends.id} IS NOT NULL THEN 'pending'
                ELSE 'none'
              END`,
              connectionType: sql<string>`CASE 
                WHEN ${friends.status} = 'accepted' THEN 'friend'
                ELSE NULL
              END`
            }
          })
          .from(posts)
          .innerJoin(users, eq(posts.userId, users.id))
          .leftJoin(friends, or(
            and(
              eq(friends.userId, currentUserId || 0),
              eq(friends.friendId, users.id)
            ),
            and(
              eq(friends.friendId, currentUserId || 0),
              eq(friends.userId, users.id)
            )
          ))
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
        const currentUserId = req.user?.id;
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
              name: users.name,
              username: users.username,
              profileImage: users.profileImage,
              tangoRoles: users.tangoRoles,
              leaderLevel: users.leaderLevel,
              followerLevel: users.followerLevel,
              city: users.city,
              state: users.state,
              country: users.country,
              friendshipStatus: sql<string>`CASE 
                WHEN ${friends.status} = 'accepted' THEN 'accepted'
                WHEN ${friends.id} IS NOT NULL THEN 'pending'
                ELSE 'none'
              END`,
              connectionType: sql<string>`CASE 
                WHEN ${friends.status} = 'accepted' THEN 'friend'
                ELSE NULL
              END`
            }
          })
          .from(posts)
          .innerJoin(users, eq(posts.userId, users.id))
          .leftJoin(friends, or(
            and(
              eq(friends.userId, currentUserId || 0),
              eq(friends.friendId, users.id)
            ),
            and(
              eq(friends.friendId, currentUserId || 0),
              eq(friends.userId, users.id)
            )
          ))
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
        const currentUserId = req.user?.id;
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
              name: users.name,
              username: users.username,
              firstName: users.firstName,
              lastName: users.lastName,
              profileImage: users.profileImage,
              city: users.city,
              country: users.country,
              tangoRoles: users.tangoRoles,
              friendshipStatus: sql<string>`CASE 
                WHEN ${friends.status} = 'accepted' THEN 'accepted'
                WHEN ${friends.id} IS NOT NULL THEN 'pending'
                ELSE 'none'
              END`
            },
            memberRole: groupMembers.role
          })
          .from(posts)
          .innerJoin(users, eq(posts.userId, users.id))
          .innerJoin(groupMembers, and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, posts.userId)
          ))
          .leftJoin(friends, or(
            and(
              eq(friends.userId, currentUserId || 0),
              eq(friends.friendId, users.id)
            ),
            and(
              eq(friends.friendId, currentUserId || 0),
              eq(friends.userId, users.id)
            )
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
        const currentUserId = req.user?.id;
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
              name: users.name,
              username: users.username,
              profileImage: users.profileImage,
              tangoRoles: users.tangoRoles,
              leaderLevel: users.leaderLevel,
              followerLevel: users.followerLevel,
              city: users.city,
              state: users.state,
              country: users.country,
              friendshipStatus: sql<string>`CASE 
                WHEN ${friends.status} = 'accepted' THEN 'accepted'
                WHEN ${friends.id} IS NOT NULL THEN 'pending'
                ELSE 'none'
              END`,
              connectionType: sql<string>`CASE 
                WHEN ${friends.status} = 'accepted' THEN 'friend'
                ELSE NULL
              END`
            }
          })
          .from(posts)
          .innerJoin(users, eq(posts.userId, users.id))
          .leftJoin(friends, or(
            and(
              eq(friends.userId, currentUserId || 0),
              eq(friends.friendId, users.id)
            ),
            and(
              eq(friends.friendId, currentUserId || 0),
              eq(friends.userId, users.id)
            )
          ))
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
    const currentUserId = req.user?.id;
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
          name: users.name,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
          city: users.city,
          country: users.country,
          tangoRoles: users.tangoRoles,
          friendshipStatus: sql<string>`CASE 
            WHEN ${friends.status} = 'accepted' THEN 'accepted'
            WHEN ${friends.id} IS NOT NULL THEN 'pending'
            ELSE 'none'
          END`
        }
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .leftJoin(friends, or(
        and(
          eq(friends.userId, currentUserId || 0),
          eq(friends.friendId, users.id)
        ),
        and(
          eq(friends.friendId, currentUserId || 0),
          eq(friends.userId, users.id)
        )
      ))
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

// Get group events
router.get('/groups/:groupId/events', setUserContext, async (req, res) => {
  try {
    const groupSlugOrId = req.params.groupId;
    const { page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

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
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    const groupId = group.id;

    // Fetch events for this group with organizer information
    const groupEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        imageUrl: events.imageUrl,
        eventType: events.eventType,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        venue: events.venue,
        address: events.address,
        city: events.city,
        country: events.country,
        price: events.price,
        currency: events.currency,
        ticketUrl: events.ticketUrl,
        maxAttendees: events.maxAttendees,
        currentAttendees: events.currentAttendees,
        isPublic: events.isPublic,
        level: events.level,
        status: events.status,
        isRecurring: events.isRecurring,
        recurringPattern: events.recurringPattern,
        createdAt: events.createdAt,
        organizer: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage
        }
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.groupId, groupId))
      .orderBy(desc(events.startDate))
      .limit(parseInt(limit as string))
      .offset(offset);

    return res.json({ success: true, data: groupEvents });
  } catch (error) {
    console.error('Error fetching group events:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch group events' });
  }
});

// ========== USER-NAMESPACED ENDPOINTS FOR FRONTEND COMPATIBILITY ==========
// These endpoints map to the existing group endpoints but use slug-based routing

// User join group by slug
router.post('/user/join-group/:slug', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const slug = req.params.slug;
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Get group by slug
    const [group] = await db.select()
      .from(groups)
      .where(eq(groups.slug, slug));
    
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
    
    await db.insert(groupMembers).values({
      groupId: group.id,
      userId: user.id,
      role: 'member'
    });
    
    res.json({ success: true, message: 'Joined group successfully' });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// User leave group by slug
router.post('/user/leave-group/:slug', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const slug = req.params.slug;
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Get group by slug
    const [group] = await db.select()
      .from(groups)
      .where(eq(groups.slug, slug));
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    await db.delete(groupMembers)
      .where(and(
        eq(groupMembers.groupId, group.id),
        eq(groupMembers.userId, user.id)
      ));
    
    res.json({ success: true, message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// User follow city by slug - maps to join group
router.post('/user/follow-city/:slug', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const slug = req.params.slug;
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Get city group by slug
    const [group] = await db.select()
      .from(groups)
      .where(and(
        eq(groups.slug, slug),
        eq(groups.type, 'city')
      ));
    
    if (!group) {
      return res.status(404).json({ error: 'City group not found' });
    }
    
    // Check if already following (member)
    const [existingMember] = await db.select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, group.id),
        eq(groupMembers.userId, user.id)
      ));
    
    if (existingMember) {
      return res.status(400).json({ error: 'Already following this city' });
    }
    
    await db.insert(groupMembers).values({
      groupId: group.id,
      userId: user.id,
      role: 'member'
    });
    
    res.json({ success: true, message: 'Following city successfully' });
  } catch (error) {
    console.error('Error following city:', error);
    res.status(500).json({ error: 'Failed to follow city' });
  }
});

router.get('/groups/search', async (req, res) => {
  try {
    const { q, city, roleType, minMembers, maxMembers, visibility } = req.query;
    
    console.log('🔍 Group Search:', { q, city, roleType, minMembers, maxMembers, visibility });
    
    let query = db.select().from(groups).where(eq(groups.type, 'city'));
    
    let conditions: any[] = [eq(groups.type, 'city')];
    
    if (city) {
      conditions.push(ilike(groups.city, `%${city}%`));
    }
    
    if (roleType) {
      conditions.push(eq(groups.roleType, roleType as string));
    }
    
    if (minMembers) {
      conditions.push(gte(groups.memberCount, parseInt(minMembers as string)));
    }
    
    if (maxMembers) {
      const maxVal = parseInt(maxMembers as string);
      conditions.push(sql`${groups.memberCount} <= ${maxVal}`);
    }
    
    if (visibility && visibility !== 'all') {
      const isPublic = visibility === 'public';
      conditions.push(eq(groups.isPrivate, !isPublic));
    }
    
    const allGroups = await db
      .select()
      .from(groups)
      .where(and(...conditions))
      .limit(100);
    
    let results = allGroups;
    
    if (q) {
      const fuse = new Fuse(allGroups, {
        keys: ['name', 'description', 'city', 'country'],
        threshold: 0.4,
        includeScore: true
      });
      
      const fuseResults = fuse.search(q as string);
      results = fuseResults.map(r => ({
        ...r.item,
        relevance: 1 - (r.score || 0)
      }));
    }
    
    const limited = results.slice(0, 20);
    
    console.log(`✅ Search returned ${limited.length} results`);
    
    res.json({
      success: true,
      data: limited,
      total: results.length
    });
  } catch (error) {
    console.error('Error searching groups:', error);
    res.status(500).json({ success: false, error: 'Failed to search groups' });
  }
});

router.get('/groups/recommendations', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    
    console.log(`🤖 Getting recommendations for user ${user.id}`);
    
    const recommendations = await getRecommendedGroups(user.id);
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to get recommendations' });
  }
});

router.get('/groups/:id/similar-members', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const groupId = parseInt(req.params.id);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    
    console.log(`🤖 Getting similar members for group ${groupId}, user ${user.id}`);
    
    const similarMembers = await suggestSimilarMembers(groupId, user.id);
    
    res.json({
      success: true,
      data: similarMembers
    });
  } catch (error) {
    console.error('Error getting similar members:', error);
    res.status(500).json({ success: false, error: 'Failed to get similar members' });
  }
});

router.get('/groups/:id/analytics', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    const groupId = parseInt(req.params.id);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    
    const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
    
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }
    
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, user.id)
      ))
      .limit(1);
    
    if (!membership || (membership.role !== 'admin' && membership.role !== 'moderator')) {
      return res.status(403).json({ success: false, error: 'Only admins and moderators can view analytics' });
    }
    
    console.log(`📊 Getting analytics for group ${groupId}`);
    
    const health = await getGroupHealth(groupId);
    const insights = await getGroupInsights(groupId);
    
    res.json({
      success: true,
      data: {
        health,
        insights
      }
    });
  } catch (error) {
    console.error('Error getting group analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
});

export default router;