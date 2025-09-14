/**
 * ESA LIFE CEO 61×21 - Events Management & RSVP Tests
 * Tests event creation, RSVP flow, capacity limits, and access control
 * Uses real database connections and test data
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { 
  createTestUser, 
  createTestEvent,
  cleanupAllTestData,
  verifyDatabaseConnection,
  closeDatabaseConnection,
  TestUser,
  testDb
} from './test-setup';
import { events, eventAttendees } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Test users that will be created in the database
let testUsers: {
  organizer: TestUser;
  attendee1: TestUser;
  attendee2: TestUser;
  nonInvited: TestUser;
} | null = null;

// Setup before all tests - create real database users
test.beforeAll(async () => {
  console.log('🚀 Setting up test users in database...');
  
  // Verify database connection
  const isConnected = await verifyDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed - cannot run tests');
  }
  
  // Clean up any existing test data first
  await cleanupAllTestData();
  
  // Create test users with real database records
  testUsers = {
    organizer: await createTestUser({
      email: `organizer-${Date.now()}@mundotango-test.com`,
      password: 'OrganizerPass123!',
      name: 'Event Organizer',
      username: `organizer${Date.now()}`,
      city: 'Buenos Aires',
      country: 'Argentina',
      tangoRoles: ['leader', 'follower']
    }),
    attendee1: await createTestUser({
      email: `attendee1-${Date.now()}@mundotango-test.com`,
      password: 'AttendeePass123!',
      name: 'First Attendee',
      username: `attendee1-${Date.now()}`,
      city: 'Buenos Aires',
      country: 'Argentina',
      tangoRoles: ['follower']
    }),
    attendee2: await createTestUser({
      email: `attendee2-${Date.now()}@mundotango-test.com`,
      password: 'AttendeePass123!',
      name: 'Second Attendee',
      username: `attendee2-${Date.now()}`,
      city: 'Montevideo',
      country: 'Uruguay',
      tangoRoles: ['leader']
    }),
    nonInvited: await createTestUser({
      email: `noninvited-${Date.now()}@mundotango-test.com`,
      password: 'NonInvitedPass123!',
      name: 'Non Invited User',
      username: `noninvited-${Date.now()}`,
      city: 'Santiago',
      country: 'Chile',
      tangoRoles: ['follower', 'leader']
    })
  };
  
  console.log('✅ Test users created successfully');
});

// Cleanup after all tests
test.afterAll(async () => {
  console.log('🧹 Cleaning up test data...');
  await cleanupAllTestData();
  await closeDatabaseConnection();
  console.log('✅ Test cleanup completed');
});

// Helper function to login with real authentication
async function loginUser(page: Page, user: TestUser) {
  await page.goto('/login');
  await page.getByTestId('input-email').fill(user.email);
  await page.getByTestId('input-password').fill(user.password);
  await page.getByTestId('button-submit').click();
  
  // Wait for successful login - check for redirect or success indicator
  await expect(page).toHaveURL(/dashboard|feed|events/, { timeout: 10000 });
  
  // Verify user is logged in by checking for user menu or profile element
  await expect(page.getByTestId('user-menu')).toBeVisible({ timeout: 5000 });
}

// Helper to create an event through the UI
async function createEventUI(
  page: Page,
  title: string,
  date: string,
  time: string,
  venue: string,
  capacity: string,
  visibility: 'public' | 'private' = 'public'
) {
  await page.goto('/events');
  await page.getByTestId('button-create-event').click();
  await page.getByTestId('input-event-title').fill(title);
  await page.getByTestId('input-event-date').fill(date);
  await page.getByTestId('input-event-time').fill(time);
  await page.getByTestId('input-event-venue').fill(venue);
  await page.getByTestId('input-event-capacity').fill(capacity);
  await page.getByTestId('select-event-visibility').selectOption(visibility);
  await page.getByTestId('textarea-event-description').fill('Join us for an amazing tango event!');
  await page.getByTestId('button-submit-event').click();
  await expect(page.getByText('Event created successfully')).toBeVisible();
}

test.describe('Events Management & RSVP with Real Database', () => {
  test('Happy: Create event and users RSVP with real users', async ({ browser }) => {
    if (!testUsers) throw new Error('Test users not initialized');
    
    // Organizer creates event
    const organizerCtx = await browser.newContext();
    const organizer = await organizerCtx.newPage();
    
    await loginUser(organizer, testUsers.organizer);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const eventTitle = `Milonga Night ${Date.now()}`;
    
    await createEventUI(
      organizer,
      eventTitle,
      dateStr,
      '21:00',
      'Salon Canning, Buenos Aires',
      '100',
      'public'
    );
    
    // Navigate to event page
    await organizer.getByTestId(`card-event-${eventTitle}`).click();
    await expect(organizer.getByTestId('text-event-title')).toContainText(eventTitle);
    await expect(organizer.getByTestId('text-attendee-count')).toContainText('1 / 100'); // Organizer is attending
    
    // First attendee RSVPs
    const attendee1Ctx = await browser.newContext();
    const attendee1 = await attendee1Ctx.newPage();
    
    await loginUser(attendee1, testUsers.attendee1);
    await attendee1.goto('/events');
    await attendee1.getByTestId(`card-event-${eventTitle}`).click();
    await attendee1.getByTestId('button-rsvp-yes').click();
    await expect(attendee1.getByText('RSVP confirmed')).toBeVisible();
    await expect(attendee1.getByTestId('button-cancel-rsvp')).toBeVisible();
    
    // Verify in database that RSVP was recorded
    const rsvpRecord = await testDb
      .select()
      .from(eventAttendees)
      .where(eq(eventAttendees.userId, testUsers.attendee1.id))
      .limit(1);
    
    expect(rsvpRecord.length).toBe(1);
    expect(rsvpRecord[0].status).toBe('attending');
    
    // Second attendee RSVPs
    const attendee2Ctx = await browser.newContext();
    const attendee2 = await attendee2Ctx.newPage();
    
    await loginUser(attendee2, testUsers.attendee2);
    await attendee2.goto('/events');
    await attendee2.getByTestId(`card-event-${eventTitle}`).click();
    await attendee2.getByTestId('button-rsvp-yes').click();
    await expect(attendee2.getByText('RSVP confirmed')).toBeVisible();
    
    // Verify attendee count updated
    await organizer.reload();
    await expect(organizer.getByTestId('text-attendee-count')).toContainText('3 / 100');
    
    // Check attendee list shows real usernames
    await organizer.getByTestId('button-view-attendees').click();
    await expect(organizer.getByText(testUsers.attendee1.name)).toBeVisible();
    await expect(organizer.getByText(testUsers.attendee2.name)).toBeVisible();
    
    // Cleanup
    await organizerCtx.close();
    await attendee1Ctx.close();
    await attendee2Ctx.close();
  });

  test('Edge: Event capacity limit enforced with database validation', async ({ browser }) => {
    if (!testUsers) throw new Error('Test users not initialized');
    
    const organizerCtx = await browser.newContext();
    const organizer = await organizerCtx.newPage();
    
    await loginUser(organizer, testUsers.organizer);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const eventTitle = `Exclusive Workshop ${Date.now()}`;
    
    // Create event with small capacity
    await createEventUI(
      organizer,
      eventTitle,
      dateStr,
      '14:00',
      'Private Studio',
      '2', // Only 2 spots including organizer
      'public'
    );
    
    // Verify event was created in database
    const [dbEvent] = await testDb
      .select()
      .from(events)
      .where(eq(events.title, eventTitle))
      .limit(1);
    
    expect(dbEvent).toBeDefined();
    expect(dbEvent.maxAttendees).toBe(2);
    
    // First attendee RSVPs successfully
    const attendee1Ctx = await browser.newContext();
    const attendee1 = await attendee1Ctx.newPage();
    
    await loginUser(attendee1, testUsers.attendee1);
    await attendee1.goto('/events');
    await attendee1.getByTestId(`card-event-${eventTitle}`).click();
    await attendee1.getByTestId('button-rsvp-yes').click();
    await expect(attendee1.getByText('RSVP confirmed')).toBeVisible();
    
    // Second attendee cannot RSVP - event full
    const attendee2Ctx = await browser.newContext();
    const attendee2 = await attendee2Ctx.newPage();
    
    await loginUser(attendee2, testUsers.attendee2);
    await attendee2.goto('/events');
    await attendee2.getByTestId(`card-event-${eventTitle}`).click();
    await expect(attendee2.getByTestId('text-event-full')).toContainText('Event is full');
    await expect(attendee2.getByTestId('button-rsvp-yes')).toBeDisabled();
    await expect(attendee2.getByTestId('button-join-waitlist')).toBeVisible();
    
    // Join waitlist
    await attendee2.getByTestId('button-join-waitlist').click();
    await expect(attendee2.getByText('Added to waitlist')).toBeVisible();
    
    // Verify waitlist status in database
    const [waitlistRecord] = await testDb
      .select()
      .from(eventAttendees)
      .where(eq(eventAttendees.userId, testUsers.attendee2.id))
      .limit(1);
    
    expect(waitlistRecord?.status).toBe('waitlisted');
    
    await organizerCtx.close();
    await attendee1Ctx.close();
    await attendee2Ctx.close();
  });

  test('Happy: Cancel RSVP updates database and count', async ({ browser }) => {
    if (!testUsers) throw new Error('Test users not initialized');
    
    // First create an event in the database
    const dbEvent = await createTestEvent(testUsers.organizer.id, {
      title: `Cancelable Event ${Date.now()}`,
      capacity: 50
    });
    
    const attendeeCtx = await browser.newContext();
    const attendee = await attendeeCtx.newPage();
    
    await loginUser(attendee, testUsers.attendee1);
    
    // Navigate to the event
    await attendee.goto(`/events/${dbEvent.id}`);
    
    // RSVP to event
    await attendee.getByTestId('button-rsvp-yes').click();
    await expect(attendee.getByText('RSVP confirmed')).toBeVisible();
    
    // Verify RSVP in database
    const [rsvpBefore] = await testDb
      .select()
      .from(eventAttendees)
      .where(eq(eventAttendees.userId, testUsers.attendee1.id))
      .limit(1);
    
    expect(rsvpBefore?.status).toBe('attending');
    
    // Get initial count
    const initialCount = await attendee.getByTestId('text-attendee-count').textContent();
    
    // Cancel RSVP
    await attendee.getByTestId('button-cancel-rsvp').click();
    await attendee.getByTestId('button-confirm-cancel').click();
    await expect(attendee.getByText('RSVP cancelled')).toBeVisible();
    await expect(attendee.getByTestId('button-rsvp-yes')).toBeVisible();
    
    // Verify cancellation in database
    const [rsvpAfter] = await testDb
      .select()
      .from(eventAttendees)
      .where(eq(eventAttendees.userId, testUsers.attendee1.id))
      .limit(1);
    
    expect(rsvpAfter?.status).toBe('cancelled');
    
    // Verify count decreased
    const newCount = await attendee.getByTestId('text-attendee-count').textContent();
    const initial = parseInt(initialCount?.split(' / ')[0] || '0');
    const updated = parseInt(newCount?.split(' / ')[0] || '0');
    expect(updated).toBe(initial - 1);
    
    await attendeeCtx.close();
  });

  test('Edge: Past event cannot be joined - database validation', async ({ page }) => {
    if (!testUsers) throw new Error('Test users not initialized');
    
    await loginUser(page, testUsers.organizer);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    const eventTitle = `Past Milonga ${Date.now()}`;
    
    // Create past event through UI (or directly in DB)
    const pastEvent = await createTestEvent(testUsers.organizer.id, {
      title: eventTitle,
      date: yesterday,
      capacity: 50
    });
    
    // Navigate to past event
    await page.goto(`/events/${pastEvent.id}`);
    
    // Should show event ended
    await expect(page.getByTestId('text-event-status')).toContainText('Event ended');
    await expect(page.getByTestId('button-rsvp-yes')).toHaveCount(0);
    await expect(page.getByTestId('text-past-event-notice')).toBeVisible();
  });

  test('Failure: Private event access control with real permissions', async ({ browser }) => {
    if (!testUsers) throw new Error('Test users not initialized');
    
    // Create private event directly in database
    const privateEvent = await createTestEvent(testUsers.organizer.id, {
      title: `Private Tango Class ${Date.now()}`,
      capacity: 20,
      visibility: 'private'
    });
    
    // Non-invited user tries to access
    const nonInvitedCtx = await browser.newContext();
    const nonInvited = await nonInvitedCtx.newPage();
    
    await loginUser(nonInvited, testUsers.nonInvited);
    
    // Should not see private event in list
    await nonInvited.goto('/events');
    await expect(nonInvited.getByTestId(`card-event-${privateEvent.title}`)).toHaveCount(0);
    
    // Direct access should be blocked
    await nonInvited.goto(`/events/${privateEvent.id}`);
    await expect(nonInvited.getByText(/private event|access denied/i)).toBeVisible();
    await expect(nonInvited.getByTestId('button-rsvp-yes')).toHaveCount(0);
    
    // Verify in database that user has no access
    const [accessRecord] = await testDb
      .select()
      .from(eventAttendees)
      .where(eq(eventAttendees.userId, testUsers.nonInvited.id))
      .limit(1);
    
    expect(accessRecord).toBeUndefined();
    
    await nonInvitedCtx.close();
  });

  test('Happy: Recurring event creation with database records', async ({ page }) => {
    if (!testUsers) throw new Error('Test users not initialized');
    
    await loginUser(page, testUsers.organizer);
    
    await page.goto('/events');
    await page.getByTestId('button-create-event').click();
    
    const eventTitle = `Weekly Practica ${Date.now()}`;
    
    // Fill basic event details
    await page.getByTestId('input-event-title').fill(eventTitle);
    await page.getByTestId('input-event-venue').fill('Dance Studio');
    await page.getByTestId('input-event-capacity').fill('30');
    
    // Enable recurring
    await page.getByTestId('checkbox-recurring').check();
    await expect(page.getByTestId('section-recurring-options')).toBeVisible();
    
    // Set weekly recurrence
    await page.getByTestId('select-recurrence-type').selectOption('weekly');
    await page.getByTestId('input-recurrence-count').fill('4'); // 4 weeks
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // Next week
    await page.getByTestId('input-event-date').fill(startDate.toISOString().split('T')[0]);
    await page.getByTestId('input-event-time').fill('19:00');
    
    await page.getByTestId('button-submit-event').click();
    await expect(page.getByText(/4 events created/i)).toBeVisible();
    
    // Verify in database that 4 events were created
    const recurringEvents = await testDb
      .select()
      .from(events)
      .where(eq(events.title, eventTitle));
    
    expect(recurringEvents.length).toBe(4);
    
    // Verify dates are weekly
    const dates = recurringEvents.map(e => e.date ? new Date(e.date).getTime() : 0).filter(d => d > 0).sort();
    for (let i = 1; i < dates.length; i++) {
      const daysDiff = (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeCloseTo(7, 0); // Should be 7 days apart
    }
  });

  test('Edge: Event edit updates RSVPs', async ({ browser }) => {
    const organizerCtx = await browser.newContext();
    const organizer = await organizerCtx.newPage();
    
    if (!testUsers) throw new Error('Test users not initialized');
    
    await loginUser(organizer, testUsers.organizer);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    await createEventUI(
      organizer,
      'Changeable Event',
      dateStr,
      '20:00',
      'Initial Venue',
      '50',
      'public'
    );
    
    // Attendee RSVPs
    const attendeeCtx = await browser.newContext();
    const attendee = await attendeeCtx.newPage();
    
    await loginUser(attendee, testUsers.attendee1);
    await attendee.goto('/events');
    await attendee.getByTestId('card-event-Changeable Event').click();
    await attendee.getByTestId('button-rsvp-yes').click();
    
    // Organizer edits event venue
    await organizer.getByTestId('card-event-Changeable Event').click();
    await organizer.getByTestId('button-edit-event').click();
    await organizer.getByTestId('input-event-venue').clear();
    await organizer.getByTestId('input-event-venue').fill('New Venue Location');
    await organizer.getByTestId('button-save-event').click();
    await expect(organizer.getByText('Event updated successfully')).toBeVisible();
    
    // Attendee should see notification about change
    await attendee.reload();
    await expect(attendee.getByTestId('alert-event-updated')).toContainText('Event details have been updated');
    await expect(attendee.getByText('New Venue Location')).toBeVisible();
    
    await organizerCtx.close();
    await attendeeCtx.close();
  });

  test('Happy: Event categories and filtering', async ({ page }) => {
    if (!testUsers) throw new Error('Test users not initialized');
    
    await loginUser(page, testUsers.organizer);
    
    // Create events with different categories
    const categories = ['Milonga', 'Workshop', 'Performance', 'Practice'];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    for (const category of categories) {
      await page.goto('/events');
      await page.getByTestId('button-create-event').click();
      await page.getByTestId('input-event-title').fill(`${category} Event`);
      await page.getByTestId('input-event-date').fill(dateStr);
      await page.getByTestId('input-event-time').fill('20:00');
      await page.getByTestId('input-event-venue').fill('Venue');
      await page.getByTestId('input-event-capacity').fill('50');
      await page.getByTestId('select-event-category').selectOption(category.toLowerCase());
      await page.getByTestId('button-submit-event').click();
    }
    
    // Filter by category
    await page.goto('/events');
    await page.getByTestId('select-filter-category').selectOption('workshop');
    
    // Should only show workshop events
    const visibleEvents = page.getByTestId('card-event');
    await expect(visibleEvents).toHaveCount(1);
    await expect(visibleEvents.first()).toContainText('Workshop Event');
    
    // Clear filter
    await page.getByTestId('button-clear-filters').click();
    await expect(visibleEvents).toHaveCount(4);
  });
});