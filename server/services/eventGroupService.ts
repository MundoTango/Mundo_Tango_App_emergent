import { db } from '../db';
import { groups, events } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

interface EventWithCity {
  id?: number;
  city?: string | null;
  country?: string | null;
  groupId?: number | null;
}

export async function autoAssociateEventWithCityGroup<T extends EventWithCity>(
  event: T
): Promise<T> {
  if (event.groupId) {
    return event;
  }

  if (!event.city) {
    return event;
  }

  try {
    const cityGroup = await db
      .select({ id: groups.id, name: groups.name })
      .from(groups)
      .where(
        and(
          eq(groups.type, 'city'),
          sql`LOWER(${groups.city}) = LOWER(${event.city})`,
          event.country 
            ? sql`LOWER(${groups.country}) = LOWER(${event.country})`
            : sql`TRUE`
        )
      )
      .limit(1);

    if (cityGroup.length > 0) {
      event.groupId = cityGroup[0].id;
      console.log('[EventGroup] Auto-associated event with city group:', {
        eventId: event.id,
        eventCity: event.city,
        groupId: cityGroup[0].id,
        groupName: cityGroup[0].name
      });
    }
  } catch (error) {
    console.error('[EventGroup] Failed to auto-associate:', error);
  }

  return event;
}

export async function backfillEventGroupAssociations(): Promise<{
  totalProcessed: number;
  associated: number;
  skipped: number;
  errors: number;
}> {
  const stats = {
    totalProcessed: 0,
    associated: 0,
    skipped: 0,
    errors: 0
  };

  try {
    const eventsWithoutGroup = await db
      .select()
      .from(events)
      .where(sql`${events.groupId} IS NULL AND ${events.city} IS NOT NULL`);

    console.log(`[EventGroup] Starting backfill for ${eventsWithoutGroup.length} events`);

    for (const event of eventsWithoutGroup) {
      stats.totalProcessed++;
      
      try {
        const originalGroupId = event.groupId;
        await autoAssociateEventWithCityGroup(event);
        
        if (event.groupId && event.groupId !== originalGroupId) {
          await db
            .update(events)
            .set({ groupId: event.groupId })
            .where(eq(events.id, event.id));
          
          stats.associated++;
        } else {
          stats.skipped++;
        }
      } catch (error) {
        stats.errors++;
        console.error('[EventGroup] Error processing event during backfill:', error);
      }
    }

    console.log('[EventGroup] Backfill complete:', stats);
  } catch (error) {
    console.error('[EventGroup] Backfill failed:', error);
    throw error;
  }

  return stats;
}
