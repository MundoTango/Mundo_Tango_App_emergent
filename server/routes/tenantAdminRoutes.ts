import { Router } from 'express';
import { db } from '../db';
import { tenants, tenantUsers } from '../../shared/schema';
import { eq, count } from 'drizzle-orm';
import { requireAdmin } from '../middleware/secureAuth';

const router = Router();

// Get all tenants (admin only)
router.get('/api/admin/tenants', requireAdmin, async (req, res) => {
  try {
    // Fetch all tenants with user count
    const allTenants = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        domain: tenants.domain,
        status: tenants.status,
        theme: tenants.theme,
        createdAt: tenants.createdAt,
      })
      .from(tenants);

    // Get user counts for each tenant
    const tenantsWithCounts = await Promise.all(
      allTenants.map(async (tenant) => {
        const userCountResult = await db
          .select({ count: count() })
          .from(tenantUsers)
          .where(eq(tenantUsers.tenantId, tenant.id));

        return {
          ...tenant,
          userCount: userCountResult[0]?.count || 0,
        };
      })
    );

    res.json(tenantsWithCounts);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tenants',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new tenant (admin only)
router.post('/api/admin/tenants', requireAdmin, async (req, res) => {
  try {
    const { name, slug, domain } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ 
        error: 'Name and slug are required' 
      });
    }

    // Check if slug already exists
    const existing = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ 
        error: 'A tenant with this slug already exists' 
      });
    }

    const [newTenant] = await db
      .insert(tenants)
      .values({
        name,
        slug,
        domain: domain || null,
        status: 'active',
        theme: 'ocean', // Default theme
      })
      .returning();

    res.status(201).json(newTenant);
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ 
      error: 'Failed to create tenant',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update tenant (admin only)
router.patch('/api/admin/tenants/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, domain, status, theme } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (domain !== undefined) updateData.domain = domain;
    if (status) updateData.status = status;
    if (theme) updateData.theme = theme;

    const [updatedTenant] = await db
      .update(tenants)
      .set(updateData)
      .where(eq(tenants.id, parseInt(id)))
      .returning();

    if (!updatedTenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json(updatedTenant);
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ 
      error: 'Failed to update tenant',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete tenant (admin only)
router.delete('/api/admin/tenants/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedTenant] = await db
      .delete(tenants)
      .where(eq(tenants.id, parseInt(id)))
      .returning();

    if (!deletedTenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({ 
      message: 'Tenant deleted successfully',
      tenant: deletedTenant
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ 
      error: 'Failed to delete tenant',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
