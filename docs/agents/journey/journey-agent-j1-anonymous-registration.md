# Journey Agent J1: Anonymous Visitor → Registration
## MB.MD Journey Agent Specification

**Agent ID:** J1  
**Journey Name:** Anonymous Visitor → Registration  
**User Role:** Anonymous (unauthenticated)  
**Pages:** 7  
**Estimated Completion Time:** 5-10 minutes  
**Success Metric:** >80% registration conversion  
**Created:** October 19, 2025

---

## 🎯 Journey Overview

**Purpose:** Guide anonymous visitors through the registration process with minimal friction, clear value proposition, and progressive trust-building.

**User Flow:**
```
Landing Page (/) 
  ↓
Login Page (/login) 
  ↓
Register Page (/register) 
  ↓
Email Verification (/verify-email) 
  ↓
Welcome Setup (/welcome-setup) 
  ↓
Profile Setup (/profile-setup) 
  ↓
Preferences (/preferences) 
  ↓
→ Redirect to Journey J2 (/memories)
```

---

## 📋 Page-by-Page Breakdown

### Step 1: Landing Page `/`
**Goal:** Communicate value proposition, encourage sign-up

**Onboarding Elements:**
- Hero section with "Join the Global Tango Community"
- 3 key benefits (Connect, Learn, Dance)
- Social proof (user count, testimonials)
- CTA: "Get Started Free" → `/register`

**Tooltips:**
- None (anonymous user, no interactive elements yet)

**Analytics:**
- Track: Time on page, scroll depth, CTA click rate

---

### Step 2: Login Page `/login`
**Goal:** Offer login option, encourage registration if new user

**Onboarding Elements:**
- "New here? Create your account" prompt
- Social login options (Replit OAuth)
- "Forgot password?" recovery flow

**Tooltips:**
- Hover on "Why create an account?" → Shows benefits popup

**Journey Logic:**
```typescript
// If user has no account
onLoginAttempt() {
  if (!userExists) {
    showTooltip("Looks like you're new! Let's create your account →");
    redirect('/register');
  }
}
```

**Analytics:**
- Track: Login attempts, registration redirects

---

### Step 3: Register Page `/register`
**Goal:** Capture essential info with minimal friction

**Onboarding Elements:**
- **Wizard Step 1/7** indicator at top
- Form fields: Email, Password, Display Name
- "By signing up, you agree to..." (clear, concise)
- CTA: "Create Account" → triggers email verification

**Tooltips:**
- Email field: "We'll send you a verification link"
- Password field: "Min 8 characters, secure your account"
- Display Name: "How other dancers will see you"

**Validation:**
```typescript
const registerSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Min 8 characters"),
  displayName: z.string().min(2, "Min 2 characters")
});
```

**Journey Logic:**
```typescript
onRegisterSuccess() {
  createJourneyProgress({
    userId: newUser.id,
    journeyId: 'J1',
    currentStep: 3,
    completedSteps: [1, 2, 3]
  });
  redirect('/verify-email');
}
```

**Analytics:**
- Track: Registration attempts, validation errors, success rate

---

### Step 4: Email Verification `/verify-email`
**Goal:** Verify email ownership, build trust

**Onboarding Elements:**
- **Wizard Step 4/7** indicator
- "Check your email!" message with inbox icon
- Email address display (editable if wrong)
- "Didn't receive? Resend verification email" button
- Auto-check for verification every 5 seconds

**Tooltips:**
- "Why verify?" → Security popup
- "Check spam folder" reminder after 2 minutes

**Journey Logic:**
```typescript
onEmailVerified() {
  updateJourneyProgress({
    userId: user.id,
    journeyId: 'J1',
    currentStep: 4,
    completedSteps: [1, 2, 3, 4]
  });
  redirect('/welcome-setup');
}
```

**Analytics:**
- Track: Verification time, resend requests, drop-off rate

---

### Step 5: Welcome Setup `/welcome-setup`
**Goal:** Personalize experience, set expectations

**Onboarding Elements:**
- **Wizard Step 5/7** indicator
- "Welcome to Mundo Tango, {displayName}!" greeting
- "Let's personalize your experience" subtitle
- Quick survey:
  - Dance experience level (Beginner, Intermediate, Advanced, Professional)
  - Primary interests (Social dancing, Events, Learning, Teaching)
  - Location (city auto-detection with confirmation)
- Progress bar: 5/7 steps complete

**Tooltips:**
- "Why we ask this" → Personalization explanation
- "You can change this later" reassurance

**Journey Logic:**
```typescript
onWelcomeComplete() {
  updateJourneyProgress({
    userId: user.id,
    journeyId: 'J1',
    currentStep: 5,
    completedSteps: [1, 2, 3, 4, 5]
  });
  
  // Auto-assign to city group
  assignToCityGroup(user.location);
  
  redirect('/profile-setup');
}
```

**Analytics:**
- Track: Survey completion, dance level distribution, location data

---

### Step 6: Profile Setup `/profile-setup`
**Goal:** Complete basic profile, prepare for social features

**Onboarding Elements:**
- **Wizard Step 6/7** indicator
- Profile photo upload (optional, with default avatar option)
- Bio textarea (140 char limit, Twitter-style)
- "Your profile helps others find and connect with you"
- Preview: Live profile card preview

**Tooltips:**
- Photo upload: "Add a photo to increase connections by 80%"
- Bio: "Share what makes your tango journey unique"
- "Skip for now" option visible

**Journey Logic:**
```typescript
onProfileComplete() {
  updateJourneyProgress({
    userId: user.id,
    journeyId: 'J1',
    currentStep: 6,
    completedSteps: [1, 2, 3, 4, 5, 6]
  });
  redirect('/preferences');
}

onSkip() {
  // Allow skip, but mark for later reminder
  markIncomplete('profile_photo');
  redirect('/preferences');
}
```

**Analytics:**
- Track: Photo upload rate, bio completion, skip rate

---

### Step 7: Preferences `/preferences`
**Goal:** Configure essential settings, complete onboarding

**Onboarding Elements:**
- **Wizard Step 7/7** indicator - "Almost done!"
- Theme selection (Light, Dark, Auto)
- Language selection (6 languages available)
- Notification preferences (Email, Push, SMS toggles)
- Privacy: "Who can see your profile?" (Everyone, Friends, Private)
- "Finish Setup" CTA with confetti animation

**Tooltips:**
- Theme: Live preview on hover
- Privacy: "You can always change this in Settings"

**Journey Logic:**
```typescript
onPreferencesComplete() {
  updateJourneyProgress({
    userId: user.id,
    journeyId: 'J1',
    currentStep: 7,
    completedSteps: [1, 2, 3, 4, 5, 6, 7],
    completedAt: new Date()
  });
  
  // Trigger confetti celebration
  showConfetti();
  
  // Show success modal
  showModal({
    title: "Welcome to Mundo Tango! 🎉",
    message: "Your profile is ready. Let's explore the community!",
    cta: "Start Exploring",
    action: () => {
      // Start Journey J2
      createJourneyProgress({
        userId: user.id,
        journeyId: 'J2',
        currentStep: 1
      });
      redirect('/memories');
    }
  });
}
```

**Analytics:**
- Track: Preferences completion, theme selection, privacy settings, journey completion time

---

## 🎨 UI Components Required

### 1. Journey Progress Ring
**Location:** Top-right corner of all pages

```typescript
<JourneyProgressRing
  currentStep={5}
  totalSteps={7}
  journeyName="Getting Started"
  percentage={71}
/>
```

**Features:**
- Animated circular progress (0-100%)
- Step counter (5/7)
- Smooth transitions
- Click to see full journey map

---

### 2. Onboarding Wizard Modal
**Location:** Center screen, overlay

```typescript
<OnboardingWizard
  journeyId="J1"
  currentStep={3}
  totalSteps={7}
  canSkip={true}
  onComplete={() => handleStepComplete()}
  onSkip={() => handleSkip()}
>
  <WizardStep title="Register" subtitle="Create your account">
    {/* Form content */}
  </WizardStep>
</OnboardingWizard>
```

**Features:**
- Multi-step form with validation
- Previous/Next navigation
- Progress indicator
- Skip option (configurable per step)
- Auto-save draft state

---

### 3. Contextual Tooltips
**Location:** Near interactive elements

```typescript
<Tooltip
  trigger="hover"
  content="We'll send you a verification link"
  position="top"
  theme="ocean"
>
  <Input type="email" placeholder="your@email.com" />
</Tooltip>
```

**Features:**
- Auto-dismiss after 5 seconds
- "Don't show again" option
- Accessibility (keyboard navigation)
- Mobile-friendly (tap to show)

---

### 4. Success Celebration
**Location:** Full-screen overlay

```typescript
<SuccessCelebration
  confetti={true}
  message="Welcome to Mundo Tango! 🎉"
  cta="Start Exploring"
  onContinue={() => redirect('/memories')}
/>
```

**Features:**
- Confetti animation (react-confetti)
- Fade-in entrance
- Auto-dismiss after 3 seconds (or user click)
- Smooth transition to next journey

---

## 🔧 API Endpoints

### Start Journey
```typescript
POST /api/journeys/start
Body: { userId: number, journeyId: string }
Response: { id: number, currentStep: 1, startedAt: Date }
```

### Get Journey Progress
```typescript
GET /api/journeys/:userId/progress
Response: {
  journeyId: 'J1',
  currentStep: 5,
  totalSteps: 7,
  completedSteps: [1, 2, 3, 4, 5],
  startedAt: Date,
  completedAt: Date | null,
  percentage: 71
}
```

### Complete Step
```typescript
PUT /api/journeys/:userId/complete/:step
Body: { metadata: { surveyResults, profileData, etc } }
Response: { success: true, nextStep: 6 }
```

### Skip Step
```typescript
PUT /api/journeys/:userId/skip/:step
Response: { success: true, nextStep: 7 }
```

---

## 💾 Database Schema

```typescript
// shared/schema.ts
export const userJourneyProgress = pgTable('user_journey_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  journeyId: varchar('journey_id', { length: 10 }).notNull(), // 'J1' through 'J9'
  currentStep: integer('current_step').default(1),
  completedSteps: jsonb('completed_steps').$type<number[]>().default([]),
  skippedSteps: jsonb('skipped_steps').$type<number[]>().default([]),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

**Indexes:**
```sql
CREATE INDEX idx_user_journey ON user_journey_progress(user_id, journey_id);
CREATE INDEX idx_journey_incomplete ON user_journey_progress(journey_id, completed_at) WHERE completed_at IS NULL;
```

---

## 📊 Analytics & Metrics

### Key Performance Indicators (KPIs)

**Conversion Funnel:**
- Landing page visits → Register clicks: Target >40%
- Register attempts → Email verified: Target >90%
- Email verified → Profile complete: Target >75%
- Profile complete → Journey complete: Target >85%
- **Overall J1 completion rate: Target >80%**

**Engagement Metrics:**
- Average time to complete J1: Target <10 minutes
- Step drop-off rate: <15% per step
- Skip rate: <20% overall
- Return rate (users who start J2 within 24h): >70%

**Quality Metrics:**
- Profile photo upload rate: >60%
- Bio completion rate: >50%
- Survey response rate: >95%

---

## 🔗 Integration with Other Systems

### Journey ↔ Page Agent Coordination

**Page Agent detects user's journey:**
```typescript
// On page load
const journeyProgress = await fetch(`/api/journeys/${userId}/progress`);

if (journeyProgress.journeyId === 'J1' && journeyProgress.currentStep === 3) {
  // User is on registration step
  showOnboardingWizard('register');
  highlightNextAction('create_account_button');
}
```

### Journey ↔ Mr Blue Integration

**Mr Blue adapts to journey:**
```typescript
// In MrBlueComplete.tsx
const { data: journey } = useQuery({
  queryKey: ['/api/journeys', user.id, 'progress']
});

const greeting = journey.journeyId === 'J1' 
  ? `Welcome! I'm here to help you get started. Currently on step ${journey.currentStep}/7.`
  : `Hi ${user.displayName}! What can I help with today?`;
```

**START trigger (when Mr Blue chat opens):**
```typescript
onMrBlueOpen() {
  const journey = getJourneyProgress(userId);
  
  if (journey.journeyId === 'J1') {
    suggestNextStep(journey.currentStep);
    // "Ready to verify your email? Check your inbox!"
  }
}
```

**END trigger (when user completes action):**
```typescript
onActionComplete(action) {
  if (action === 'email_verified') {
    updateJourneyProgress(userId, 'J1', 4);
    celebrateSuccess("Email verified! 🎉");
    suggestNextStep(5); // Welcome setup
  }
}
```

---

## 🎯 Success Criteria

**Journey J1 is complete when:**
- [ ] All 7 pages have onboarding elements
- [ ] Journey progress tracked in database
- [ ] API endpoints functional
- [ ] UI components built and tested
- [ ] Analytics tracking implemented
- [ ] Mr Blue integration working
- [ ] >80% users complete registration
- [ ] Average completion time <10 minutes
- [ ] Drop-off rate <15% per step

---

## 📚 Files to Create

**Backend:**
- `server/agents/journey-agents/J1-anonymous-registration.ts` (agent logic)
- `server/routes/journeyRoutes.ts` (API endpoints)
- `server/services/journeyService.ts` (business logic)

**Frontend:**
- `client/src/components/journey/JourneyProgressRing.tsx`
- `client/src/components/journey/OnboardingWizard.tsx`
- `client/src/components/journey/SuccessCelebration.tsx`
- `client/src/lib/journey/useJourneyProgress.ts` (hook)

**Database:**
- Add `userJourneyProgress` table to `shared/schema.ts`
- Run `npm run db:push` to migrate

---

**Created by:** Agent #64 (Documentation Architect)  
**Status:** ✅ SPECIFICATION COMPLETE - Ready for implementation  
**Estimated Build Time:** 2 hours
