# Mr Blue Complete File Structure

**Last Updated:** October 12, 2025  
**Status:** Production-Ready Organization  
**Agents:** #73, #74, #78

---

## 📁 Complete Directory Structure

```
client/src/
├── lib/
│   ├── mrBlue/                          # 🤖 Mr Blue Core System
│   │   ├── avatar/
│   │   │   ├── MrBlueAvatar.tsx        # 3D Avatar component (Ready Player Me)
│   │   │   ├── AnimationController.ts   # Mixamo animations (wave, walk, idle, etc)
│   │   │   ├── VoiceController.ts       # ElevenLabs/PlayHT voice
│   │   │   └── AvatarProvider.tsx       # Context provider
│   │   │
│   │   ├── visualEditor/                # 🎨 Agent #78: Visual Page Editor
│   │   │   ├── SelectionLayer.tsx       # Overlay for element selection
│   │   │   ├── ChangeTracker.ts         # Track all edits
│   │   │   ├── EditModeProvider.tsx     # Edit mode state
│   │   │   ├── ElementInspector.tsx     # Style/property editor
│   │   │   ├── ChangeLogSidebar.tsx     # Shows all changes
│   │   │   └── CodePreview.tsx          # Show generated code diff
│   │   │
│   │   ├── tours/                       # 🧭 Agent #74: Interactive Tours
│   │   │   ├── TourService.ts           # Shepherd.js wrapper
│   │   │   ├── tourDefinitions.ts       # All tour configs
│   │   │   ├── WelcomeTour.tsx          # 6-step welcome tour
│   │   │   ├── RoleTours.tsx            # Host, Teacher, Organizer, Pro
│   │   │   └── TourProgress.ts          # Track completion
│   │   │
│   │   ├── chat/                        # 💬 Mr Blue Chat Interface
│   │   │   ├── ChatWidget.tsx           # Floating chat UI
│   │   │   ├── MessageList.tsx          # Conversation history
│   │   │   ├── VoiceInput.tsx           # Speech-to-text
│   │   │   └── SemanticSearch.ts        # LanceDB integration
│   │   │
│   │   └── admin/                       # 👑 Admin Powers
│   │       ├── AdminCommandParser.ts    # "Change this color" → code
│   │       ├── SafePreview.ts           # Sandbox preview
│   │       └── DeploymentPipeline.ts    # Git + deploy flow
│   │
│   ├── subscriptions/                   # 💳 Agent #75: Subscription Manager
│   │   ├── TierManager.ts               # Tier logic
│   │   ├── FeatureFlagService.ts        # Feature access control
│   │   ├── PromoCodeService.ts          # Discount codes
│   │   └── SubscriptionHooks.ts         # React hooks
│   │
│   └── siteBuilder/                     # 🏗️ Agent #77: AI Site Builder
│       ├── SiteBuilderService.ts        # GrapesJS wrapper
│       ├── AIGenerator.ts               # GPT-4 site generation
│       ├── templates/                   # 5 templates
│       │   ├── EventTemplate.ts
│       │   ├── SchoolTemplate.ts
│       │   ├── TeacherTemplate.ts
│       │   ├── HostTemplate.ts
│       │   └── GenericTemplate.ts
│       └── SubdomainService.ts          # .mundotango.life deployment
│
├── components/
│   ├── mrBlue/
│   │   ├── MrBlueFloatingButton.tsx     # Global floating avatar
│   │   ├── MrBlueMenu.tsx               # Action menu (Edit Mode, Chat, Tours)
│   │   ├── EditModeIndicator.tsx        # "EDIT MODE ACTIVE" banner
│   │   ├── VoiceAnimation.tsx           # Voice waveform animation
│   │   └── TourTooltip.tsx              # Custom tour tooltip
│   │
│   ├── visualEditor/
│   │   ├── ElementHighlight.tsx         # Purple outline on hover
│   │   ├── DragHandle.tsx               # Drag-and-drop handle
│   │   ├── InlineTextEditor.tsx         # WYSIWYG text editor
│   │   ├── ColorPicker.tsx              # Color selection
│   │   └── SpacingControls.tsx          # Margin/padding adjuster
│   │
│   ├── tours/
│   │   ├── TourStep.tsx                 # Custom step component
│   │   ├── TourProgress.tsx             # Progress indicator
│   │   └── SkipTourButton.tsx           # Skip functionality
│   │
│   └── subscription/
│       ├── PricingCard.tsx              # Tier pricing display
│       ├── UpgradeModal.tsx             # Upgrade prompt
│       ├── FeatureLockedBanner.tsx      # "Upgrade to unlock"
│       └── TrialCountdown.tsx           # 7-day trial timer
│
├── pages/
│   ├── mrBlue/
│   │   ├── Dashboard.tsx                # Mr Blue AI dashboard
│   │   ├── Settings.tsx                 # Mr Blue configuration
│   │   └── History.tsx                  # Conversation history
│   │
│   ├── pricing.tsx                      # Pricing page (Agent #72)
│   ├── notifications.tsx                # Notifications center
│   │
│   ├── admin/
│   │   ├── VisualEditor.tsx             # Visual editor admin page
│   │   ├── TierBuilder.tsx              # Drag-drop tier builder
│   │   ├── PromoCodesAdmin.tsx          # Promo management
│   │   ├── SubscriptionAnalytics.tsx    # Metrics dashboard
│   │   └── TourEditor.tsx               # Edit tour steps
│   │
│   └── professional/
│       ├── MySites.tsx                  # Professional sites list
│       ├── SiteBuilder.tsx              # AI site builder UI
│       └── SiteAnalytics.tsx            # Site performance metrics
│
└── hooks/
    ├── useMrBlue.ts                     # Mr Blue state & actions
    ├── useEditMode.ts                   # Edit mode toggle
    ├── useTour.ts                       # Tour control
    ├── useSubscription.ts               # Subscription data
    └── useFeatureFlag.ts                # Feature access check

server/
├── services/
│   ├── mrBlue/
│   │   ├── aiService.ts                 # OpenAI GPT-4 integration
│   │   ├── codeGenerator.ts             # AI code generation
│   │   ├── visualEditorService.ts       # Process visual edits
│   │   ├── voiceService.ts              # Voice cloning API
│   │   └── tourService.ts               # Tour progress tracking
│   │
│   ├── subscription/
│   │   ├── stripeService.ts             # Stripe integration
│   │   ├── tierService.ts               # Tier management
│   │   ├── featureFlagService.ts        # Feature flags
│   │   └── promoCodeService.ts          # Promo validation
│   │
│   └── siteBuilder/
│       ├── aiSiteGenerator.ts           # AI site generation
│       ├── deploymentService.ts         # Subdomain deployment
│       └── analyticsService.ts          # Site analytics
│
├── routes/
│   ├── mrBlue.ts                        # /api/mr-blue/*
│   ├── visualEditor.ts                  # /api/visual-editor/*
│   ├── tours.ts                         # /api/tours/*
│   ├── subscriptions.ts                 # /api/subscriptions/*
│   └── professionalSites.ts             # /api/sites/*
│
└── middleware/
    ├── featureFlagMiddleware.ts         # Check tier access
    └── adminOnlyMiddleware.ts           # Super admin check

database/
└── migrations/
    ├── add-visual-edits-table.sql       # Visual editor changes
    ├── add-tour-progress-table.sql      # Tour tracking
    └── add-professional-sites-table.sql # Site builder

docs/
└── platform-handoff/
    ├── ESA_AGENT_72_PRICING_STRATEGY.md
    ├── ESA_AGENT_73_MR_BLUE_AVATAR.md
    ├── ESA_AGENT_74_INTERACTIVE_TOUR.md
    ├── ESA_AGENT_75_SUBSCRIPTION_MANAGER.md
    ├── ESA_AGENT_76_REPLIT_ARCHITECTURE.md
    ├── ESA_AGENT_77_AI_SITE_BUILDER.md
    ├── ESA_AGENT_78_VISUAL_PAGE_EDITOR.md
    └── MR_BLUE_FILE_STRUCTURE.md (this file)
```

---

## 🎯 Priority Build Order

### **Phase 1: Foundation** (Week 1)
1. ✅ Database schema (visual_edits, tour_progress, professional_sites)
2. 🔧 Install packages
3. 🔧 Create core hooks (useMrBlue, useEditMode, useTour)
4. 🔧 Setup service infrastructure

### **Phase 2: Visual Editor** (Week 2-3)
1. 🔧 Build SelectionLayer.tsx
2. 🔧 Create ChangeTracker.ts
3. 🔧 Build ChangeLogSidebar.tsx
4. 🔧 Implement AI code generation
5. 🔧 Create preview deployment

### **Phase 3: 3D Avatar** (Week 4-5)
1. 🔧 Integrate Ready Player Me
2. 🔧 Setup Mixamo animations
3. 🔧 Voice cloning integration
4. 🔧 Floating button UI
5. 🔧 Chat interface

### **Phase 4: Tours** (Week 6)
1. 🔧 Integrate Shepherd.js
2. 🔧 Create welcome tour
3. 🔧 Build role-specific tours
4. 🔧 Progress tracking

### **Phase 5: Subscription** (Week 7)
1. 🔧 Build tier builder UI
2. 🔧 Feature flag system
3. 🔧 Stripe integration
4. 🔧 Promo codes

### **Phase 6: Site Builder** (Week 8)
1. 🔧 GrapesJS integration
2. 🔧 AI generation
3. 🔧 Template library
4. 🔧 Subdomain deployment

---

## 📦 Package Dependencies

### **Visual Editor & 3D Avatar**
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.92.0",
  "three": "^0.160.0",
  "react-contenteditable": "^3.3.7",
  "dom-to-image": "^2.6.0",
  "diff": "^5.1.0",
  "@codemirror/view": "^6.23.0"
}
```

### **Tours & AI**
```json
{
  "shepherd.js": "^11.2.0",
  "grapesjs": "^0.20.4",
  "@langchain/openai": "latest" // Already installed
}
```

### **Voice & Audio**
```json
{
  "elevenlabs": "^0.4.0", // Voice cloning
  "wavesurfer.js": "^7.0.0" // Voice visualization
}
```

---

## 🔑 Environment Variables

```bash
# Mr Blue AI
OPENAI_API_KEY=sk-...           # Already configured
ELEVENLABS_API_KEY=...          # For voice cloning

# Stripe (Already configured)
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...

# Deployment
PREVIEW_DOMAIN=preview.mundotango.life
PRODUCTION_DOMAIN=mundotango.life
```

---

## 🎨 Component Examples

### **Mr Blue Floating Button**
```tsx
// components/mrBlue/MrBlueFloatingButton.tsx
export function MrBlueFloatingButton() {
  const { isEditMode, toggleEditMode } = useEditMode();
  const { startTour } = useTour();
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 3D Avatar */}
      <MrBlueAvatar 
        animation={isEditMode ? "think" : "idle"}
        onClick={() => setMenuOpen(true)}
      />
      
      {/* Action Menu */}
      {menuOpen && (
        <MrBlueMenu
          onEditMode={toggleEditMode}
          onStartTour={() => startTour('welcome')}
          onOpenChat={() => setChatOpen(true)}
        />
      )}
    </div>
  );
}
```

### **Edit Mode Indicator**
```tsx
// components/mrBlue/EditModeIndicator.tsx
export function EditModeIndicator() {
  const { isEditMode, exitEditMode } = useEditMode();
  
  if (!isEditMode) return null;
  
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full">
        <Wand2 className="w-5 h-5 animate-pulse" />
        <span>EDIT MODE ACTIVE</span>
        <kbd onClick={exitEditMode}>ESC</kbd>
      </div>
    </div>
  );
}
```

---

## 🗄️ Database Tables

### **Visual Edits**
```sql
CREATE TABLE visual_edits (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id),
  session_id varchar,
  page varchar,
  changes jsonb,
  status varchar,
  branch_name varchar,
  preview_url varchar,
  deployed_at timestamp,
  notes text,
  created_at timestamp DEFAULT now()
);
```

### **Tour Progress**
```sql
CREATE TABLE user_tour_progress (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id),
  tour_id varchar,
  current_step integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamp,
  created_at timestamp DEFAULT now()
);
```

### **Professional Sites**
```sql
CREATE TABLE professional_sites (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id),
  name varchar,
  subdomain varchar UNIQUE,
  content jsonb,
  status varchar DEFAULT 'draft',
  deployed_at timestamp,
  created_at timestamp DEFAULT now()
);
```

---

## 🚀 API Routes

### **Mr Blue Routes**
```
POST   /api/mr-blue/chat              # Chat with Mr Blue
POST   /api/mr-blue/execute-command   # Execute admin command
GET    /api/mr-blue/conversation/:id  # Get conversation history
```

### **Visual Editor Routes**
```
POST   /api/visual-editor/start       # Start edit session
POST   /api/visual-editor/track       # Track change
POST   /api/visual-editor/generate    # Generate code
POST   /api/visual-editor/deploy      # Deploy to preview
POST   /api/visual-editor/approve     # Approve & go live
```

### **Tour Routes**
```
GET    /api/tours/:tourId             # Get tour config
POST   /api/tours/progress            # Update progress
GET    /api/tours/user/:userId        # Get user tours
```

### **Subscription Routes**
```
GET    /api/subscriptions/tiers       # Get all tiers
POST   /api/subscriptions/upgrade     # Upgrade tier
POST   /api/subscriptions/cancel      # Cancel subscription
GET    /api/subscriptions/features    # Check feature access
```

### **Site Builder Routes**
```
POST   /api/sites/generate            # AI generate site
POST   /api/sites/deploy              # Deploy to subdomain
GET    /api/sites/analytics/:siteId   # Get analytics
```

---

## ✅ Current Status

**Completed:**
- ✅ All 7 ESA agent documentation
- ✅ Database schema design
- ✅ File structure planning
- ✅ Security fixes ready
- ✅ Package list defined

**In Progress:**
- 🔧 Installing packages
- 🔧 Creating database tables
- 🔧 Building core components

**Next Up:**
- ⏳ 3D avatar integration
- ⏳ Visual editor UI
- ⏳ Tour system
- ⏳ Subscription flows

---

**This is the complete Mr Blue system - organized, documented, ready to build!** 🚀
