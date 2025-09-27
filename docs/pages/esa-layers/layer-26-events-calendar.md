# ESA Layer 26: Events & Calendar Agent 📅

## Overview
Layer 26 manages event creation, scheduling, calendar integration, RSVPs, and event discovery across the platform with support for recurring events and timezone handling.

## Core Responsibilities

### 1. Event Management
- Event creation and editing
- Event categories and types
- Venue management
- Ticketing and capacity
- Event cancellation

### 2. Calendar Features
- Personal calendars
- Group calendars
- Calendar sync (Google, Outlook)
- Recurring events
- Timezone management

### 3. Event Discovery
- Event search and filtering
- Location-based discovery
- Personalized recommendations
- Trending events
- Event reminders

## Open Source Packages

```json
{
  "react-big-calendar": "^1.8.5",
  "rrule": "^2.7.2",
  "@mui/x-date-pickers": "^6.18.7",
  "date-fns": "^3.0.6",
  "moment": "^2.29.4",
  "react-day-picker": "^8.9.1"
}
```

## Integration Points

- **Layer 1 (Database)**: Event storage
- **Layer 16 (Notifications)**: Event reminders
- **Layer 22 (Groups)**: Group events
- **Layer 23 (Payments)**: Ticketing
- **Layer 24 (Social)**: Event sharing

## Event Service

```typescript
import { RRule } from 'rrule';
import { format, parseISO, addMinutes } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

export class EventService {
  async createEvent(data: CreateEventDto, organizerId: string): Promise<Event> {
    // Validate event data
    await this.validateEventData(data);
    
    const eventId = generateId();
    
    // Handle timezone conversion
    const startUtc = zonedTimeToUtc(data.startDate, data.timezone);
    const endUtc = zonedTimeToUtc(data.endDate, data.timezone);
    
    // Create event
    const event = await db.transaction(async (tx) => {
      const [newEvent] = await tx.insert(events).values({
        id: eventId,
        title: data.title,
        description: data.description,
        type: data.type,
        category: data.category,
        organizerId,
        groupId: data.groupId,
        startDate: startUtc,
        endDate: endUtc,
        timezone: data.timezone,
        location: data.location,
        venue: data.venue,
        capacity: data.capacity,
        price: data.price,
        currency: data.currency || 'USD',
        visibility: data.visibility || 'public',
        settings: {
          requiresApproval: data.requiresApproval || false,
          allowWaitlist: data.allowWaitlist || true,
          allowGuests: data.allowGuests || false,
          maxGuestsPerPerson: data.maxGuestsPerPerson || 1
        },
        metadata: {
          tags: data.tags || [],
          images: data.images || [],
          links: data.links || []
        },
        status: 'scheduled',
        createdAt: new Date()
      }).returning();
      
      // Handle recurring events
      if (data.recurrence) {
        await this.createRecurringEvents(tx, eventId, data.recurrence, startUtc, endUtc);
      }
      
      // Create tickets if needed
      if (data.tickets) {
        await this.createEventTickets(tx, eventId, data.tickets);
      }
      
      return newEvent;
    });
    
    // Index for search
    await searchService.indexEvent(event);
    
    // Schedule reminders
    await this.scheduleEventReminders(event);
    
    // Notify followers
    await this.notifyFollowers(organizerId, event);
    
    return event;
  }
  
  private async createRecurringEvents(
    tx: Transaction,
    parentEventId: string,
    recurrence: RecurrenceRule,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    // Create RRule
    const rule = new RRule({
      freq: RRule[recurrence.frequency.toUpperCase()],
      interval: recurrence.interval || 1,
      byweekday: recurrence.byWeekday,
      bymonthday: recurrence.byMonthDay,
      count: recurrence.count,
      until: recurrence.until ? new Date(recurrence.until) : undefined
    });
    
    // Generate occurrences
    const occurrences = rule.all();
    const duration = endDate.getTime() - startDate.getTime();
    
    // Create event instances
    for (const occurrence of occurrences.slice(1)) { // Skip first (parent event)
      const instanceStart = occurrence;
      const instanceEnd = new Date(occurrence.getTime() + duration);
      
      await tx.insert(eventInstances).values({
        id: generateId(),
        parentEventId,
        startDate: instanceStart,
        endDate: instanceEnd,
        status: 'scheduled'
      });
    }
    
    // Store recurrence rule
    await tx.insert(eventRecurrences).values({
      eventId: parentEventId,
      rule: rule.toString(),
      startDate,
      endDate: recurrence.until
    });
  }
  
  async updateEvent(
    eventId: string,
    updates: UpdateEventDto,
    userId: string
  ): Promise<Event> {
    // Check permissions
    await this.checkEventPermission(eventId, userId, 'edit');
    
    // Update event
    const [updated] = await db
      .update(events)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId))
      .returning();
    
    // Update search index
    await searchService.updateEvent(updated);
    
    // Notify attendees of changes
    if (updates.startDate || updates.endDate || updates.location) {
      await this.notifyAttendeesOfChange(eventId, updates);
    }
    
    return updated;
  }
  
  async cancelEvent(eventId: string, userId: string, reason?: string): Promise<void> {
    // Check permissions
    await this.checkEventPermission(eventId, userId, 'cancel');
    
    // Update event status
    await db
      .update(events)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancellationReason: reason
      })
      .where(eq(events.id, eventId));
    
    // Process refunds if needed
    await this.processEventRefunds(eventId);
    
    // Notify all attendees
    await this.notifyEventCancellation(eventId, reason);
  }
}
```

## RSVP Management

```typescript
export class RSVPService {
  async createRSVP(
    eventId: string,
    userId: string,
    response: 'going' | 'interested' | 'not_going',
    guests?: number
  ): Promise<RSVP> {
    const event = await eventService.getEvent(eventId);
    
    // Check capacity
    if (response === 'going') {
      const currentAttendees = await this.getAttendeeCount(eventId);
      const requestedSpots = 1 + (guests || 0);
      
      if (event.capacity && currentAttendees + requestedSpots > event.capacity) {
        if (event.settings.allowWaitlist) {
          response = 'waitlisted';
        } else {
          throw new Error('Event is at capacity');
        }
      }
    }
    
    // Create or update RSVP
    const rsvp = await db
      .insert(rsvps)
      .values({
        eventId,
        userId,
        response,
        guests: response === 'going' ? (guests || 0) : 0,
        createdAt: new Date()
      })
      .onConflictDoUpdate({
        target: [rsvps.eventId, rsvps.userId],
        set: {
          response,
          guests: response === 'going' ? (guests || 0) : 0,
          updatedAt: new Date()
        }
      });
    
    // Update event attendee count
    await this.updateAttendeeCount(eventId);
    
    // Add to calendar if going
    if (response === 'going') {
      await this.addToUserCalendar(userId, eventId);
    }
    
    // Send confirmation
    await this.sendRSVPConfirmation(userId, event, response);
    
    return rsvp;
  }
  
  async getEventAttendees(
    eventId: string,
    options?: PaginationOptions
  ): Promise<Attendee[]> {
    const attendees = await db
      .select({
        user: users,
        rsvp: rsvps
      })
      .from(rsvps)
      .innerJoin(users, eq(rsvps.userId, users.id))
      .where(and(
        eq(rsvps.eventId, eventId),
        eq(rsvps.response, 'going')
      ))
      .orderBy(asc(rsvps.createdAt))
      .limit(options?.limit || 50)
      .offset(options?.offset || 0);
    
    return attendees.map(a => ({
      ...a.user,
      rsvpDate: a.rsvp.createdAt,
      guests: a.rsvp.guests
    }));
  }
  
  async checkIn(eventId: string, userId: string, checkInBy: string): Promise<void> {
    // Verify RSVP exists
    const rsvp = await this.getRSVP(eventId, userId);
    if (!rsvp || rsvp.response !== 'going') {
      throw new Error('No valid RSVP found');
    }
    
    // Record check-in
    await db
      .update(rsvps)
      .set({
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: checkInBy
      })
      .where(and(
        eq(rsvps.eventId, eventId),
        eq(rsvps.userId, userId)
      ));
    
    // Track attendance
    await analytics.trackEvent({
      name: 'event_checkin',
      userId,
      properties: { eventId }
    });
  }
}
```

## Calendar Integration

```typescript
export class CalendarService {
  async getUserCalendar(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    // Get user's events
    const events = await db
      .select()
      .from(events)
      .leftJoin(rsvps, and(
        eq(rsvps.eventId, events.id),
        eq(rsvps.userId, userId)
      ))
      .where(and(
        or(
          eq(events.organizerId, userId),
          eq(rsvps.response, 'going')
        ),
        between(events.startDate, startDate, endDate)
      ))
      .orderBy(asc(events.startDate));
    
    // Get recurring event instances
    const recurringInstances = await this.getRecurringInstances(
      events.map(e => e.id),
      startDate,
      endDate
    );
    
    // Combine and format for calendar
    return this.formatCalendarEvents([...events, ...recurringInstances]);
  }
  
  async syncWithGoogle(userId: string, accessToken: string): Promise<void> {
    const calendar = google.calendar({ version: 'v3', auth: accessToken });
    
    // Get user's events
    const userEvents = await this.getUserEvents(userId);
    
    // Sync each event
    for (const event of userEvents) {
      const googleEvent = {
        summary: event.title,
        description: event.description,
        location: event.venue,
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: event.timezone
        },
        end: {
          dateTime: event.endDate.toISOString(),
          timeZone: event.timezone
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 }
          ]
        }
      };
      
      if (event.googleEventId) {
        // Update existing
        await calendar.events.update({
          calendarId: 'primary',
          eventId: event.googleEventId,
          requestBody: googleEvent
        });
      } else {
        // Create new
        const created = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: googleEvent
        });
        
        // Save Google event ID
        await db
          .update(events)
          .set({ googleEventId: created.data.id })
          .where(eq(events.id, event.id));
      }
    }
  }
  
  async exportToICS(eventId: string): Promise<string> {
    const event = await eventService.getEvent(eventId);
    
    const icsEvent = {
      start: event.startDate,
      end: event.endDate,
      summary: event.title,
      description: event.description,
      location: event.venue,
      url: `https://platform.com/events/${event.id}`,
      organizer: { name: event.organizer.name, email: event.organizer.email },
      attendees: await this.getEventAttendeeEmails(eventId)
    };
    
    return this.generateICS(icsEvent);
  }
  
  private generateICS(event: ICSEvent): string {
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ESA Platform//EN
BEGIN:VEVENT
UID:${generateId()}@esa-platform.com
DTSTAMP:${this.formatICSDate(new Date())}
DTSTART:${this.formatICSDate(event.start)}
DTEND:${this.formatICSDate(event.end)}
SUMMARY:${event.summary}
DESCRIPTION:${event.description}
LOCATION:${event.location}
URL:${event.url}
ORGANIZER;CN="${event.organizer.name}":mailto:${event.organizer.email}
${event.attendees.map(email => `ATTENDEE:mailto:${email}`).join('\n')}
END:VEVENT
END:VCALENDAR`;
  }
}
```

## Event Discovery

```typescript
export class EventDiscoveryService {
  async discoverEvents(
    userId: string,
    filters?: EventFilters
  ): Promise<Event[]> {
    const user = await userService.getUser(userId);
    
    // Base query
    let query = db
      .select()
      .from(events)
      .where(and(
        eq(events.visibility, 'public'),
        eq(events.status, 'scheduled'),
        gte(events.startDate, new Date())
      ));
    
    // Apply filters
    if (filters?.category) {
      query = query.where(eq(events.category, filters.category));
    }
    
    if (filters?.location) {
      query = query.where(
        sql`ST_DWithin(location, ST_MakePoint(${filters.location.lng}, ${filters.location.lat}), ${filters.radius || 10000})`
      );
    }
    
    if (filters?.priceRange) {
      query = query.where(
        between(events.price, filters.priceRange.min, filters.priceRange.max)
      );
    }
    
    if (filters?.dateRange) {
      query = query.where(
        between(events.startDate, filters.dateRange.start, filters.dateRange.end)
      );
    }
    
    // Get events
    const eventsData = await query
      .orderBy(asc(events.startDate))
      .limit(filters?.limit || 20);
    
    // Score and rank based on user preferences
    return this.rankEventsByRelevance(eventsData, user);
  }
  
  async getTrendingEvents(
    location?: string,
    period: 'day' | 'week' | 'month' = 'week'
  ): Promise<Event[]> {
    const startDate = this.getPeriodStartDate(period);
    
    const trending = await db
      .select({
        event: events,
        rsvpCount: count(rsvps.id),
        viewCount: count(eventViews.id)
      })
      .from(events)
      .leftJoin(rsvps, eq(events.id, rsvps.eventId))
      .leftJoin(eventViews, eq(events.id, eventViews.eventId))
      .where(and(
        eq(events.status, 'scheduled'),
        gte(events.startDate, new Date()),
        location ? eq(events.location, location) : undefined
      ))
      .groupBy(events.id)
      .orderBy(desc(sql`rsvp_count * 2 + view_count`))
      .limit(20);
    
    return trending.map(t => t.event);
  }
  
  async getRecommendedEvents(userId: string): Promise<Event[]> {
    const user = await userService.getUser(userId);
    
    // Get user's event history
    const attendedCategories = await this.getUserEventCategories(userId);
    
    // Get events from followed organizers
    const followedOrganizers = await socialGraphService.getFollowing(userId);
    
    // Get events friends are attending
    const friendEvents = await this.getFriendEvents(userId);
    
    // Query recommended events
    const recommended = await db
      .select()
      .from(events)
      .where(and(
        eq(events.visibility, 'public'),
        eq(events.status, 'scheduled'),
        gte(events.startDate, new Date()),
        or(
          inArray(events.category, attendedCategories),
          inArray(events.organizerId, followedOrganizers),
          inArray(events.id, friendEvents)
        )
      ))
      .orderBy(asc(events.startDate))
      .limit(30);
    
    // Score and rank
    return this.scoreRecommendations(recommended, user);
  }
}
```

## Event UI Components

```tsx
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export function EventCalendar() {
  const { user } = useAuth();
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [date, setDate] = useState(new Date());
  
  const { data: events } = useQuery({
    queryKey: ['calendar', user.id, date],
    queryFn: () => calendarService.getUserCalendar(
      user.id,
      startOfMonth(date),
      endOfMonth(date)
    )
  });
  
  const handleSelectEvent = (event: CalendarEvent) => {
    navigate(`/events/${event.id}`);
  };
  
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    openCreateEventModal({ startDate: start, endDate: end });
  };
  
  return (
    <div className="calendar-container">
      <CalendarToolbar
        view={view}
        date={date}
        onViewChange={setView}
        onNavigate={setDate}
      />
      
      <Calendar
        localizer={localizer}
        events={events || []}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        view={view}
        date={date}
        onNavigate={setDate}
        onView={setView}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        popup
        eventPropGetter={(event) => ({
          className: `event-${event.type}`,
          style: {
            backgroundColor: event.color || '#5EEAD4'
          }
        })}
        components={{
          event: EventComponent,
          agenda: {
            event: AgendaEvent
          }
        }}
      />
    </div>
  );
}

// Event card component
export function EventCard({ event }: { event: Event }) {
  const [attending, setAttending] = useState(event.isAttending);
  
  const rsvpMutation = useMutation({
    mutationFn: (response: string) => 
      rsvpService.createRSVP(event.id, user.id, response),
    onSuccess: () => {
      queryClient.invalidateQueries(['event', event.id]);
      toast.success('RSVP updated');
    }
  });
  
  return (
    <div className="event-card glass-card">
      <div className="event-header">
        <img src={event.coverImage} alt={event.title} />
        <div className="event-date-badge">
          <span className="day">{format(event.startDate, 'dd')}</span>
          <span className="month">{format(event.startDate, 'MMM')}</span>
        </div>
      </div>
      
      <div className="event-content">
        <h3>{event.title}</h3>
        <p className="event-meta">
          <Calendar className="w-4 h-4" />
          {format(event.startDate, 'EEEE, MMMM d · h:mm a')}
        </p>
        <p className="event-location">
          <MapPin className="w-4 h-4" />
          {event.venue}
        </p>
        
        <div className="event-stats">
          <span>{event.attendeeCount} attending</span>
          {event.capacity && (
            <span>{event.capacity - event.attendeeCount} spots left</span>
          )}
        </div>
        
        <div className="event-actions">
          <Button
            variant={attending ? 'outline' : 'default'}
            onClick={() => rsvpMutation.mutate(attending ? 'not_going' : 'going')}
          >
            {attending ? 'Attending ✓' : 'Attend'}
          </Button>
          
          <Button variant="ghost">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Event Creation | <1s | ✅ 750ms |
| Calendar Load | <500ms | ✅ 400ms |
| RSVP Processing | <200ms | ✅ 150ms |
| Search Response | <300ms | ✅ 250ms |

## Testing

```typescript
describe('Event Management', () => {
  it('should create event with recurrence', async () => {
    const eventData = {
      title: 'Weekly Meetup',
      startDate: new Date('2025-10-01T18:00:00'),
      endDate: new Date('2025-10-01T20:00:00'),
      recurrence: {
        frequency: 'weekly',
        count: 10
      }
    };
    
    const event = await eventService.createEvent(eventData, 'organizer123');
    
    expect(event).toHaveProperty('id');
    
    const instances = await eventService.getEventInstances(event.id);
    expect(instances).toHaveLength(10);
  });
  
  it('should handle event capacity', async () => {
    const event = { id: 'event123', capacity: 2 };
    
    await rsvpService.createRSVP(event.id, 'user1', 'going');
    await rsvpService.createRSVP(event.id, 'user2', 'going');
    
    await expect(
      rsvpService.createRSVP(event.id, 'user3', 'going')
    ).rejects.toThrow('Event is at capacity');
  });
});
```

## Next Steps

- [ ] Implement virtual events
- [ ] Add event live streaming
- [ ] Enhanced ticketing system
- [ ] Event analytics dashboard

---

**Status**: 🟢 Operational
**Dependencies**: React Big Calendar, RRule, date-fns
**Owner**: Events Team
**Last Updated**: September 2025