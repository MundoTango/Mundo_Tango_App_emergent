import { db } from '../db';
import { groups, events } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { createLogger } from '../utils/logger';

const logger = createLogger('eventGroupService');

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
    logger.debug('Event has no city, skipping auto-association', { eventId: event.id });
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
      logger.info('Auto-associated event with city group', {
        eventId: event.id,
        eventCity: event.city,
        eventCountry: event.country,
        groupId: cityGroup[0].id,
        groupName: cityGroup[0].name
      });
    } else {
      logger.debug('No matching city group found for event', {
        eventId: event.id,
        city: event.city,
        country: event.country
      });
    }
  } catch (error) {
    logger.error('Failed to auto-associate event with city group', {
      eventId: event.id,
      city: event.city,
      country: event.country,
      error: error instanceof Error ? error.message : String(error)
    });
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

    logger.info(`Starting backfill for ${eventsWithoutGroup.length} events`);

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
        logger.error('Error processing event during backfill', {
          eventId: event.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    logger.info('Backfill complete', stats);
  } catch (error) {
    logger.error('Backfill failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }

  return stats;
}
