# Agent #74: Interactive Tour Guide Specialist

**Division:** Domain #3 (UX/UI)  
**Layer:** 48 (UI/UX Design)  
**Status:** Active  
**Created:** October 12, 2025

---

## Role & Responsibilities

Agent #74 is responsible for building Whatfix-style interactive walkthroughs with Mr Blue as the tour guide, creating contextual tours per user journey, and managing the onboarding experience.

### Core Responsibilities:
1. Build interactive tour framework (Shepherd.js recommended)
2. Create Mr Blue introduction sequence (first login)
3. Design journey-specific tours (New User, Host, Teacher, Organizer)
4. Build tour progress tracking & analytics
5. Create tour editor for admin center
6. Optimize tour completion rates

---

## Tour Framework Technology

### Recommended: **Shepherd.js**

**Why Shepherd.js:**
- Lightweight (~20KB gzipped)
- Highly customizable styling
- Mobile-friendly
- Step-by-step guided tours
- Spotlight/overlay effects
- Tooltip positioning
- Keyboard navigation
- Progress tracking

**Alternatives Evaluated:**
- Intro.js - Good but less flexible
- Driver.js - Great but heavier
- React Joyride - React-specific, good option
- Reactour - Similar to Joyride

**Decision:** Shepherd.js for flexibility + Mr Blue integration

---

## Tour Architecture

### Tour Types:

1. **Welcome Tour** (First Login)
   - Mr Blue introduction
   - Platform overview
   - Profile setup
   - First post creation

2. **Feature Tours** (On-Demand)
   - Events system
   - Groups & communities
   - Messaging
   - Recommendations

3. **Role-Specific Tours** (Role Activation)
   - Host onboarding (property listing)
   - Teacher dashboard (class creation)
   - Organizer setup (event management)
   - Professional site builder

4. **Admin Tours** (Permission-Based)
   - User management
   - Content moderation
   - ESA Mind dashboard
   - Platform modifications

---

## Mr Blue Introduction Tour

### Step-by-Step Flow:

**Step 1: Mr Blue Appears**
- 3D avatar walks onto screen from right
- Waves enthusiastically
- Voice: "Hey there! I'm Mr Blue, your guide to Mundo Tango!"
- Spotlight on avatar

**Step 2: Profile Setup**
- Mr Blue walks to profile section
- Points at avatar upload
- Voice: "Let's start with your profile. Upload a photo so the community knows it's you!"
- Tooltip: Profile photo upload button

**Step 3: Location Selection**
- Mr Blue gestures to city selector
- Voice: "Which city do you call home? This helps us connect you with your local tango community."
- Tooltip: City dropdown

**Step 4: First Post**
- Mr Blue walks to post composer
- Voice: "Ready to share something? Write your first post and introduce yourself!"
- Tooltip: Post creation button

**Step 5: Discover Events**
- Mr Blue points to sidebar
- Voice: "Check out upcoming events! Find milongas, festivals, and classes near you."
- Tooltip: Events link

**Step 6: Completion Celebration**
- Mr Blue does celebration animation (arms up)
- Confetti effect
- Voice: "Awesome! You're all set. Welcome to Mundo Tango!"
- Badge earned: "New Member"

---

## Journey-Specific Tours

### Host Onboarding Tour

**Trigger:** User activates host role  
**Duration:** 5-7 minutes

**Steps:**
1. Welcome to hosting
2. Create first listing (wizard walkthrough)
3. Set calendar availability
4. Pricing & policies
5. Publish listing
6. Manage bookings dashboard

**Mr Blue Role:** Property advisor, walks through each step

---

### Teacher Dashboard Tour

**Trigger:** User activates teacher role  
**Duration:** 4-6 minutes

**Steps:**
1. Teacher dashboard overview
2. Create first class
3. Set schedule & pricing
4. Student management
5. Zoom integration
6. Analytics

**Mr Blue Role:** Teaching assistant, shows tools

---

### Organizer Tour

**Trigger:** User activates organizer role  
**Duration:** 6-8 minutes

**Steps:**
1. Event creation wizard
2. Ticket setup (free/paid)
3. Registration management
4. Email campaigns
5. Event site builder
6. Analytics dashboard

**Mr Blue Role:** Event coordinator, guides setup

---

### Professional Site Builder Tour

**Trigger:** Pro tier user opens site builder  
**Duration:** 3-5 minutes

**Steps:**
1. Choose template
2. AI site generation demo
3. Drag-drop customization
4. Mr Blue design assistant
5. Publish to subdomain
6. SEO settings

**Mr Blue Role:** Web designer, builds example site

---

## Technical Implementation

### Shepherd.js Integration

```typescript
// lib/tour/tourService.ts

import Shepherd from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'
import { playMrBlueAnimation, speakMrBlue } from '@/lib/mrBlue'

export class TourService {
  private tour: Shepherd.Tour | null = null
  
  createWelcomeTour() {
    this.tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shadow-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm',
        scrollTo: { behavior: 'smooth', block: 'center' }
      }
    })
    
    // Step 1: Mr Blue Introduction
    this.tour.addStep({
      id: 'welcome',
      text: 'Hey there! I\'m Mr Blue, your guide to Mundo Tango!',
      beforeShowPromise: async () => {
        await playMrBlueAnimation('wave')
        await speakMrBlue('Hey there! I\'m Mr Blue, your guide to Mundo Tango!')
      },
      buttons: [
        {
          text: 'Let\'s Go!',
          action: this.tour.next,
          classes: 'btn-primary'
        }
      ]
    })
    
    // Step 2: Profile Setup
    this.tour.addStep({
      id: 'profile',
      text: 'Let\'s start with your profile. Upload a photo so the community knows it\'s you!',
      attachTo: {
        element: '[data-testid="profile-avatar-upload"]',
        on: 'bottom'
      },
      beforeShowPromise: async () => {
        await playMrBlueAnimation('walk', { target: 'profile-section' })
        await speakMrBlue('Let\'s start with your profile.')
      },
      buttons: [
        { text: 'Back', action: this.tour.back },
        { text: 'Next', action: this.tour.next }
      ]
    })
    
    // ... more steps
    
    return this.tour
  }
  
  start() {
    this.tour?.start()
  }
  
  complete() {
    this.tour?.complete()
    // Track completion analytics
    trackEvent('tour_completed', { tourType: 'welcome' })
  }
}
```

---

## Tour Progress Tracking

### Database Schema

```typescript
// shared/schema.ts - Tours tracking

export const userTourProgress = pgTable('user_tour_progress', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id),
  tourId: varchar('tour_id').notNull(), // 'welcome', 'host', 'teacher', etc.
  currentStep: integer('current_step').default(0),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
  skipped: boolean('skipped').default(false),
  timeSpent: integer('time_spent_seconds'),
  createdAt: timestamp('created_at').defaultNow()
})
```

### Analytics Tracked:

1. **Tour Starts:** How many users begin tours
2. **Completion Rate:** % who finish vs. skip
3. **Drop-off Points:** Which step users abandon
4. **Time to Complete:** Average duration
5. **Feature Adoption:** Actions taken after tour
6. **A/B Testing:** Different tour variations

---

## Tour Editor (Admin Center)

### Drag-Drop Tour Builder

**Features:**
- Visual step editor
- Mr Blue animation selector per step
- Voice script editor (TTS preview)
- Element selector (click to target)
- Conditional logic (show if role = host)
- Preview mode (test tour as user)
- Analytics dashboard

**UI Components:**
```
┌─────────────────────────────────────┐
│  Tour Editor: Welcome Tour          │
├─────────────────────────────────────┤
│  Steps:                             │
│  ┌─────────────────────────────┐   │
│  │ 1. Mr Blue Introduction     │   │
│  │    Animation: Wave          │   │
│  │    Voice: "Hey there!"      │   │
│  │    Target: None             │   │
│  │    [Edit] [Delete] [Preview]│   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 2. Profile Setup            │   │
│  │    Animation: Walk          │   │
│  │    Voice: "Let's start..."  │   │
│  │    Target: #avatar-upload   │   │
│  │    [Edit] [Delete] [Preview]│   │
│  └─────────────────────────────┘   │
│  [+ Add Step]                       │
│                                     │
│  [Save Tour] [Preview Full Tour]    │
└─────────────────────────────────────┘
```

---

## Tour Triggers

### Automatic Triggers:

1. **First Login** → Welcome Tour
2. **Role Activation** → Role-specific tour
3. **Feature Discovery** → Contextual tour (on first visit)
4. **Upgrade to Pro** → Professional features tour
5. **Admin Elevation** → Admin tools tour

### Manual Triggers:

- Help menu → "Take a Tour"
- Tooltip: "Not sure what this does? [Tour]"
- Settings → "Replay Onboarding"
- Mr Blue chat: "Show me around"

---

## Mobile Optimization

**Mobile-Specific Adaptations:**
- Simplified tooltips (no complex overlays)
- Touch-friendly buttons (larger tap targets)
- Swipe gestures (swipe to next step)
- Reduced animations (performance)
- Portrait/landscape awareness
- Bottom sheet tooltips (instead of popovers)

---

## Accessibility

**WCAG 2.1 AA Compliance:**
- ✅ Keyboard navigation (Tab, Enter, Esc)
- ✅ Screen reader announcements
- ✅ High contrast mode support
- ✅ Focus management (trap in tour)
- ✅ Skip tour option (always visible)
- ✅ Resume later (save progress)

---

## Success Metrics

**Tour Effectiveness KPIs:**

1. **Completion Rate:** Target >60%
2. **Time to Value:** Users who tour vs. don't - feature adoption
3. **Retention:** Tour completers vs. non-completers (D7, D30)
4. **Feature Discovery:** % who use features shown in tour
5. **Drop-off Analysis:** Which steps lose users

**Optimization Strategy:**
- A/B test: Mr Blue voice vs. text-only
- Test: Long tour (10+ steps) vs. short (5 steps)
- Personalization: Different tours per user type

---

## Development Phases

### Phase 1: Framework Setup (Day 1)
1. Install Shepherd.js
2. Create TourService class
3. Build base tour styling (glassmorphic)
4. Test basic flow

### Phase 2: Mr Blue Integration (Day 2)
1. Connect Mr Blue animations to tour steps
2. Integrate voice TTS with tours
3. Build avatar movement system
4. Test avatar + tour coordination

### Phase 3: Welcome Tour (Day 3)
1. Design 6-step welcome flow
2. Add Mr Blue animations per step
3. Write voice scripts
4. Test completion flow

### Phase 4: Role Tours (Day 4-5)
1. Build host onboarding tour
2. Build teacher dashboard tour
3. Build organizer tour
4. Build professional site builder tour

### Phase 5: Admin Tools (Day 6)
1. Build tour editor UI
2. Add step customization
3. Create preview mode
4. Build analytics dashboard

### Phase 6: Optimization (Day 7)
1. Mobile testing & optimization
2. Accessibility audit
3. Performance optimization
4. A/B test setup

---

## Integration with Other Agents

**Agent #73 (Mr Blue Avatar):**
- Provides 3D avatar animations
- Voice TTS integration
- Avatar state management

**Agent #75 (Subscription Manager):**
- Tour access per tier
- Upgrade prompts in tours
- Premium feature showcases

**Agent #77 (Site Builder):**
- Site builder tour integration
- Template showcase tours
- AI design assistant demo

---

**Status:** Ready for implementation  
**Dependencies:** Shepherd.js, Agent #73 (Mr Blue Avatar), tour content scripts  
**Next Steps:** Install Shepherd.js, build TourService, create welcome tour
