# Manual Test: RSVP Instant Updates & Navigation Breadcrumbs

## Context
Testing two critical fixes:
1. RSVP buttons now use correct QueryClient (staleTime: 0) for instant UI updates
2. Group tabs now preserve state in URL for proper back button navigation

## Test Steps

### Part 1: RSVP Instant Updates (No Page Refresh)
**Navigation**: Login → Community → Buenos Aires Group → Events Tab

1. **Setup**: Login and navigate to Buenos Aires group's Events tab
2. **Test RSVP Changes**:
   - Click "Going ✅" on an event
   - **VERIFY**: Button becomes active immediately, attendee count increases
   - Click "Interested ⭐"
   - **VERIFY**: Button becomes active immediately, attendee count adjusts
   - Click "Maybe ❓"
   - **VERIFY**: Button becomes active immediately
3. **Verify No Page Refresh**: Page should NOT reload/flicker during any RSVP change

### Part 2: Navigation Breadcrumbs Preserve Tab State
**Navigation**: Login → Community → Buenos Aires Group

1. **Default Tab**: Verify "Posts" tab is active by default
2. **Switch to Events**: Click "Events" tab
   - **VERIFY**: URL changes to include `?tab=events`
3. **Navigate to Event**: Click any event card
4. **Return via Back Button**: Click browser back button
   - **VERIFY**: Returns to Buenos Aires group page
   - **VERIFY**: "Events" tab is still active (NOT Posts)
   - **VERIFY**: URL still contains `?tab=events`

## Success Criteria
✅ RSVP buttons update instantly without page refresh
✅ Tab state preserved in URL query parameters
✅ Back button returns to correct tab
✅ No console errors during any interaction

## Technical Implementation
- App.tsx now imports correct queryClient from '@/lib/queryClient' (staleTime: 0)
- useEventRSVP hook has optimistic updates for both feed and group events
- GroupDetailPageMT uses handleTabChange() to update both state and URL
