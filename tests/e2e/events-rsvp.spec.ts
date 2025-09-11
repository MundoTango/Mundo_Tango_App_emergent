/**
 * ESA LIFE CEO 61×21 - Events Management & RSVP Tests
 * Tests event creation, RSVP flow, capacity limits, and access control
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const TEST_USERS = {
  organizer: {
    email: process.env.ORGANIZER_EMAIL || 'organizer@mundotango.com',
    password: process.env.ORGANIZER_PW || 'testpass123'
  },
  attendee1: {
    email: process.env.ATTENDEE1_EMAIL || 'attendee1@mundotango.com',
    password: process.env.ATTENDEE1_PW || 'testpass123'
  },
  attendee2: {
    email: process.env.ATTENDEE2_EMAIL || 'attendee2@mundotango.com',
    password: process.env.ATTENDEE2_PW || 'testpass123'
  },
  nonInvited: {
    email: process.env.NON_INVITED_EMAIL || 'noninvited@mundotango.com',
    password: process.env.NON_INVITED_PW || 'testpass123'
  }
};

// Helper function to login
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('input-email').fill(email);
  await page.getByTestId('input-password').fill(password);
  await page.getByTestId('button-submit').click();
  await expect(page).toHaveURL(/dashboard|feed|events/, { timeout: 10000 });
}

// Helper to create an event
async function createEvent(
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

test.describe('Events Management & RSVP', () => {
  test('Happy: Create event and users RSVP', async ({ browser }) => {
    // Organizer creates event
    const organizerCtx = await browser.newContext();
    const organizer = await organizerCtx.newPage();
    
    await loginUser(organizer, TEST_USERS.organizer.email, TEST_USERS.organizer.password);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    await createEvent(
      organizer,
      'Milonga Night at Salon Canning',
      dateStr,
      '21:00',
      'Salon Canning, Buenos Aires',
      '100',
      'public'
    );
    
    // Navigate to event page
    await organizer.getByTestId('card-event-Milonga Night at Salon Canning').click();
    await expect(organizer.getByTestId('text-event-title')).toContainText('Milonga Night at Salon Canning');
    await expect(organizer.getByTestId('text-attendee-count')).toContainText('1 / 100'); // Organizer is attending
    
    // First attendee RSVPs
    const attendee1Ctx = await browser.newContext();
    const attendee1 = await attendee1Ctx.newPage();
    
    await loginUser(attendee1, TEST_USERS.attendee1.email, TEST_USERS.attendee1.password);
    await attendee1.goto('/events');
    await attendee1.getByTestId('card-event-Milonga Night at Salon Canning').click();
    await attendee1.getByTestId('button-rsvp-yes').click();
    await expect(attendee1.getByText('RSVP confirmed')).toBeVisible();
    await expect(attendee1.getByTestId('button-cancel-rsvp')).toBeVisible();
    
    // Second attendee RSVPs
    const attendee2Ctx = await browser.newContext();
    const attendee2 = await attendee2Ctx.newPage();
    
    await loginUser(attendee2, TEST_USERS.attendee2.email, TEST_USERS.attendee2.password);
    await attendee2.goto('/events');
    await attendee2.getByTestId('card-event-Milonga Night at Salon Canning').click();
    await attendee2.getByTestId('button-rsvp-yes').click();
    await expect(attendee2.getByText('RSVP confirmed')).toBeVisible();
    
    // Verify attendee count updated
    await organizer.reload();
    await expect(organizer.getByTestId('text-attendee-count')).toContainText('3 / 100');
    
    // Check attendee list
    await organizer.getByTestId('button-view-attendees').click();
    await expect(organizer.getByText(TEST_USERS.attendee1.email.split('@')[0])).toBeVisible();
    await expect(organizer.getByText(TEST_USERS.attendee2.email.split('@')[0])).toBeVisible();
    
    // Cleanup
    await organizerCtx.close();
    await attendee1Ctx.close();
    await attendee2Ctx.close();
  });

  test('Edge: Event capacity limit enforced', async ({ browser }) => {
    const organizerCtx = await browser.newContext();
    const organizer = await organizerCtx.newPage();
    
    await loginUser(organizer, TEST_USERS.organizer.email, TEST_USERS.organizer.password);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    // Create event with small capacity
    await createEvent(
      organizer,
      'Exclusive Workshop',
      dateStr,
      '14:00',
      'Private Studio',
      '2', // Only 2 spots including organizer
      'public'
    );
    
    // First attendee RSVPs successfully
    const attendee1Ctx = await browser.newContext();
    const attendee1 = await attendee1Ctx.newPage();
    
    await loginUser(attendee1, TEST_USERS.attendee1.email, TEST_USERS.attendee1.password);
    await attendee1.goto('/events');
    await attendee1.getByTestId('card-event-Exclusive Workshop').click();
    await attendee1.getByTestId('button-rsvp-yes').click();
    await expect(attendee1.getByText('RSVP confirmed')).toBeVisible();
    
    // Second attendee cannot RSVP - event full
    const attendee2Ctx = await browser.newContext();
    const attendee2 = await attendee2Ctx.newPage();
    
    await loginUser(attendee2, TEST_USERS.attendee2.email, TEST_USERS.attendee2.password);
    await attendee2.goto('/events');
    await attendee2.getByTestId('card-event-Exclusive Workshop').click();
    await expect(attendee2.getByTestId('text-event-full')).toContainText('Event is full');
    await expect(attendee2.getByTestId('button-rsvp-yes')).toBeDisabled();
    await expect(attendee2.getByTestId('button-join-waitlist')).toBeVisible();
    
    // Join waitlist
    await attendee2.getByTestId('button-join-waitlist').click();
    await expect(attendee2.getByText('Added to waitlist')).toBeVisible();
    
    await organizerCtx.close();
    await attendee1Ctx.close();
    await attendee2Ctx.close();
  });

  test('Happy: Cancel RSVP and update count', async ({ browser }) => {
    const attendeeCtx = await browser.newContext();
    const attendee = await attendeeCtx.newPage();
    
    await loginUser(attendee, TEST_USERS.attendee1.email, TEST_USERS.attendee1.password);
    
    // Find an event to RSVP
    await attendee.goto('/events');
    const eventCard = attendee.getByTestId('card-event').first();
    await eventCard.click();
    
    // RSVP to event
    if (await attendee.getByTestId('button-rsvp-yes').isVisible()) {
      await attendee.getByTestId('button-rsvp-yes').click();
      await expect(attendee.getByText('RSVP confirmed')).toBeVisible();
    }
    
    // Get initial count
    const initialCount = await attendee.getByTestId('text-attendee-count').textContent();
    
    // Cancel RSVP
    await attendee.getByTestId('button-cancel-rsvp').click();
    await attendee.getByTestId('button-confirm-cancel').click();
    await expect(attendee.getByText('RSVP cancelled')).toBeVisible();
    await expect(attendee.getByTestId('button-rsvp-yes')).toBeVisible();
    
    // Verify count decreased
    const newCount = await attendee.getByTestId('text-attendee-count').textContent();
    const initial = parseInt(initialCount?.split(' / ')[0] || '0');
    const updated = parseInt(newCount?.split(' / ')[0] || '0');
    expect(updated).toBe(initial - 1);
    
    await attendeeCtx.close();
  });

  test('Edge: Past event cannot be joined', async ({ page }) => {
    await loginUser(page, TEST_USERS.organizer.email, TEST_USERS.organizer.password);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    // Create past event
    await createEvent(
      page,
      'Past Milonga',
      dateStr,
      '20:00',
      'Old Venue',
      '50',
      'public'
    );
    
    // Navigate to past event
    await page.getByTestId('card-event-Past Milonga').click();
    
    // Should show event ended
    await expect(page.getByTestId('text-event-status')).toContainText('Event ended');
    await expect(page.getByTestId('button-rsvp-yes')).toHaveCount(0);
    await expect(page.getByTestId('text-past-event-notice')).toBeVisible();
  });

  test('Failure: Private event access control', async ({ browser }) => {
    // Organizer creates private event
    const organizerCtx = await browser.newContext();
    const organizer = await organizerCtx.newPage();
    
    await loginUser(organizer, TEST_USERS.organizer.email, TEST_USERS.organizer.password);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    await createEvent(
      organizer,
      'Private Tango Class',
      dateStr,
      '18:00',
      'Private Studio',
      '20',
      'private'
    );
    
    // Get event URL
    await organizer.getByTestId('card-event-Private Tango Class').click();
    const eventUrl = organizer.url();
    const eventId = eventUrl.split('/').pop();
    
    // Non-invited user tries to access
    const nonInvitedCtx = await browser.newContext();
    const nonInvited = await nonInvitedCtx.newPage();
    
    await loginUser(nonInvited, TEST_USERS.nonInvited.email, TEST_USERS.nonInvited.password);
    
    // Should not see private event in list
    await nonInvited.goto('/events');
    await expect(nonInvited.getByTestId('card-event-Private Tango Class')).toHaveCount(0);
    
    // Direct access should be blocked
    await nonInvited.goto(`/events/${eventId}`);
    await expect(nonInvited.getByText(/private event|access denied/i)).toBeVisible();
    await expect(nonInvited.getByTestId('button-rsvp-yes')).toHaveCount(0);
    
    await organizerCtx.close();
    await nonInvitedCtx.close();
  });

  test('Happy: Recurring event creation', async ({ page }) => {
    await loginUser(page, TEST_USERS.organizer.email, TEST_USERS.organizer.password);
    
    await page.goto('/events');
    await page.getByTestId('button-create-event').click();
    
    // Fill basic event details
    await page.getByTestId('input-event-title').fill('Weekly Practica');
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
    await expect(page.getByText('4 events created successfully')).toBeVisible();
    
    // Verify all 4 events were created
    await page.goto('/events');
    const weeklyPracticas = page.getByTestId('card-event').filter({ hasText: 'Weekly Practica' });
    await expect(weeklyPracticas).toHaveCount(4);
  });

  test('Edge: Event edit updates RSVPs', async ({ browser }) => {
    const organizerCtx = await browser.newContext();
    const organizer = await organizerCtx.newPage();
    
    await loginUser(organizer, TEST_USERS.organizer.email, TEST_USERS.organizer.password);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    await createEvent(
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
    
    await loginUser(attendee, TEST_USERS.attendee1.email, TEST_USERS.attendee1.password);
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
    await loginUser(page, TEST_USERS.organizer.email, TEST_USERS.organizer.password);
    
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