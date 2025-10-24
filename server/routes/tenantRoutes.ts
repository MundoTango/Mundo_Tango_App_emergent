import { Router } from 'express';
import { db } from '../db';
import { tenants, tenantUsers, userViewPreferences, users, posts, events, groups, contentSharing, userJourneys, journeyActivities } from '@shared/schema';
import { eq, and, inArray, or, sql } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { tenantMiddleware, requireTenant, requireTenantAdmin } from '../middleware/tenantMiddleware';
import { getUserId, requireSuperAdmin, flexibleAuth } from '../utils/authHelper';
import { z } from 'zod';

const router = Router();

// Get all tenants (public endpoint)
router.get('/tenants', async (req, res) => {
  try {
    const allTenants = await db
      .select()
      .from(tenants)
      .where(eq(tenants.is_active, true));

    res.json({
      success: true,
      tenants: allTenants
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// Get user's tenants with membership info
router.get('/tenants/user', flexibleAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user's tenant memberships with tenant info
    const userTenantData = await db
      .select({
        // Tenant fields
        id: tenants.id,
        slug: tenants.slug,
        name: tenants.name,
        description: tenants.description,
        logo_url: tenants.logo_url,
        primary_color: tenants.primary_color,
        secondary_color: tenants.secondary_color,
        domain: tenants.domain,
        is_active: tenants.is_active,
        settings: tenants.settings,
        created_at: tenants.created_at,
        updated_at: tenants.updated_at,
        // Membership fields
        membership: {
          role: tenantUsers.role,
          is_admin: tenantUsers.is_admin,
          display_in_feed: tenantUsers.display_in_feed,
          notification_preferences: tenantUsers.notification_preferences,
          expertise_level: tenantUsers.expertise_level,
          interests: tenantUsers.interests,
          created_at: tenantUsers.created_at
        }
      })
      .from(tenantUsers)
      .innerJoin(tenants, eq(tenantUsers.tenant_id, tenants.id))
      .where(and(
        eq(tenantUsers.user_id, Number(userId)),
        eq(tenants.is_active, true)
      ));

    res.json({
      success: true,
      tenants: userTenantData
    });
  } catch (error) {
    console.error('Error fetching user tenants:', error);
    res.status(500).json({ error: 'Failed to fetch user tenants' });
  }
});

// Get or create user view preferences
router.get('/tenants/view-preferences', flexibleAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let [preferences] = await db
      .select()
      .from(userViewPreferences)
      .where(eq(userViewPreferences.user_id, Number(userId)))
      .limit(1);

    // If no preferences exist, create default ones
    if (!preferences) {
      const [newPreferences] = await db
        .insert(userViewPreferences)
        .values({
          user_id: Number(userId),
          view_mode: 'single_community',
          selected_tenant_ids: [],
          custom_filters: {}
        })
        .returning();
      preferences = newPreferences;
    }

    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Error fetching view preferences:', error);
    res.status(500).json({ error: 'Failed to fetch view preferences' });
  }
});

// Update user view preferences
router.put('/tenants/view-preferences', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updateSchema = z.object({
      view_mode: z.enum(['single_community', 'all_communities', 'custom']).optional(),
      selected_tenant_id: z.string().uuid().optional(),
      selected_tenant_ids: z.array(z.string().uuid()).optional(),
      custom_filters: z.record(z.any()).optional()
    });

    const data = updateSchema.parse(req.body);

    const [updatedPreferences] = await db
      .insert(userViewPreferences)
      .values({
        user_id: Number(userId),
        view_mode: data.view_mode || 'single_community',
        selected_tenant_id: data.selected_tenant_id,
        selected_tenant_ids: data.selected_tenant_ids || [],
        custom_filters: data.custom_filters || {}
      })
      .onConflictDoUpdate({
        target: userViewPreferences.user_id,
        set: {
          view_mode: data.view_mode,
          selected_tenant_id: data.selected_tenant_id,
          selected_tenant_ids: data.selected_tenant_ids,
          custom_filters: data.custom_filters
        }
      })
      .returning();

    res.json({
      success: true,
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Error updating view preferences:', error);
    res.status(500).json({ error: 'Failed to update view preferences' });
  }
});

// Get cross-community content
router.get('/tenants/cross-community/content', isAuthenticated, tenantMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { content_type = 'posts', tenant_ids, limit = 20, offset = 0 } = req.query;

    // Get user's tenant memberships
    const userTenantIds = await db
      .select({ tenant_id: tenantUsers.tenant_id })
      .from(tenantUsers)
      .where(eq(tenantUsers.user_id, Number(userId)));

    const memberTenantIds = userTenantIds.map(t => t.tenant_id);

    // Parse tenant_ids from query
    let queryTenantIds = memberTenantIds;
    if (tenant_ids) {
      const requestedIds = Array.isArray(tenant_ids) ? tenant_ids.map(id => String(id)) : [String(tenant_ids)];
      // Filter to only tenants user is a member of
      queryTenantIds = requestedIds.filter(id => memberTenantIds.includes(id));
    }

    let content: any[] = [];

    switch (content_type) {
      case 'posts':
        // Posts don't have tenant_id in the current schema
        // This would need to be added to support multi-tenant posts
        content = [];
        break;

      case 'events':
        // Events don't have tenant_id in the current schema
        // This would need to be added to support multi-tenant events
        content = [];
        break;

      // Memories case removed - table not yet implemented
      case 'memories':
        content = [];
        break;
    }

    res.json({
      success: true,
      content,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: content.length
      }
    });
  } catch (error) {
    console.error('Error fetching cross-community content:', error);
    res.status(500).json({ error: 'Failed to fetch cross-community content' });
  }
});

// Create content sharing request
router.post('/tenants/content/share', isAuthenticated, tenantMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const shareSchema = z.object({
      content_type: z.enum(['post', 'event', 'group', 'memory']),
      content_id: z.string().uuid(),
      source_tenant_id: z.string().uuid(),
      target_tenant_ids: z.array(z.string().uuid())
    });

    const data = shareSchema.parse(req.body);

    // Check if user is member of source tenant
    const [membership] = await db
      .select()
      .from(tenantUsers)
      .where(and(
        eq(tenantUsers.user_id, Number(userId)),
        eq(tenantUsers.tenant_id, data.source_tenant_id)
      ))
      .limit(1);

    if (!membership) {
      return res.status(403).json({ error: 'You must be a member of the source community' });
    }

    // Create sharing records
    const sharingRecords = data.target_tenant_ids.map(targetId => ({
      content_type: data.content_type,
      content_id: data.content_id,
      source_tenant_id: data.source_tenant_id,
      shared_tenant_id: targetId,
      shared_by: Number(userId),
      is_approved: membership.is_admin // Auto-approve if user is admin
    }));

    const created = await db
      .insert(contentSharing)
      .values(sharingRecords)
      .onConflictDoNothing()
      .returning();

    res.json({
      success: true,
      shares: created
    });
  } catch (error) {
    console.error('Error creating content share:', error);
    res.status(500).json({ error: 'Failed to create content share' });
  }
});

// User journey endpoints
router.get('/tenants/journeys', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const journeys = await db
      .select()
      .from(userJourneys)
      .where(eq(userJourneys.user_id, Number(userId)))
      .orderBy(userJourneys.created_at);

    res.json({
      success: true,
      journeys
    });
  } catch (error) {
    console.error('Error fetching journeys:', error);
    res.status(500).json({ error: 'Failed to fetch journeys' });
  }
});

router.post('/tenants/journeys', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const journeySchema = z.object({
      title: z.string(),
      description: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      locations: z.array(z.any()).optional(),
      tenantIds: z.array(z.string().uuid()).optional(),
      journeyType: z.enum(['travel', 'learning', 'experience']).optional(),
      isPublic: z.boolean().optional()
    });

    const data = journeySchema.parse(req.body);

    const [journey] = await db
      .insert(userJourneys)
      .values({
        user_id: Number(userId),
        title: data.title,
        description: data.description,
        start_date: data.startDate,
        end_date: data.endDate,
        locations: data.locations,
        tenant_ids: data.tenantIds,
        journey_type: data.journeyType,
        is_public: data.isPublic ?? false,
        status: 'planning',
        settings: {}
      })
      .returning();

    res.json({
      success: true,
      journey
    });
  } catch (error) {
    console.error('Error creating journey:', error);
    res.status(500).json({ error: 'Failed to create journey' });
  }
});

// Journey activities
router.post('/tenants/journeys/:journeyId/activities', isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { journeyId } = req.params;

    // Verify user owns the journey
    const [journey] = await db
      .select()
      .from(userJourneys)
      .where(and(
        eq(userJourneys.id, journeyId),
        eq(userJourneys.user_id, Number(userId))
      ))
      .limit(1);

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    const activitySchema = z.object({
      tenantId: z.string().uuid().optional(),
      activityType: z.string(),
      title: z.string(),
      description: z.string().optional(),
      location: z.any().optional(),
      startDatetime: z.string().optional(),
      endDatetime: z.string().optional(),
      externalUrl: z.string().optional(),
      contentReferenceId: z.string().uuid().optional(),
      contentReferenceType: z.string().optional()
    });

    const data = activitySchema.parse(req.body);

    const [activity] = await db
      .insert(journeyActivities)
      .values({
        journey_id: journeyId,
        tenant_id: data.tenantId,
        activity_type: data.activityType,
        title: data.title,
        description: data.description,
        location: data.location,
        start_datetime: data.startDatetime,
        end_datetime: data.endDatetime,
        external_url: data.externalUrl,
        content_reference_id: data.contentReferenceId,
        content_reference_type: data.contentReferenceType,
        settings: {}
      })
      .returning();

    res.json({
      success: true,
      activity
    });
  } catch (error) {
    console.error('Error creating journey activity:', error);
    res.status(500).json({ error: 'Failed to create journey activity' });
  }
});

// Tenant admin endpoints
router.put('/tenants/:tenantId', requireTenantAdmin, async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const updateSchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      logo_url: z.string().optional(),
      primary_color: z.string().optional(),
      secondary_color: z.string().optional(),
      settings: z.record(z.any()).optional()
    });

    const data = updateSchema.parse(req.body);

    const [updated] = await db
      .update(tenants)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    res.json({
      success: true,
      tenant: updated
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

export default router;
