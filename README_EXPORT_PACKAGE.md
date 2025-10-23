# Mundo Tango - Complete Export Package
## Everything You Need to Restore the Platform Anywhere

**Export Date:** October 23, 2025  
**Version:** 1.0  
**Branch:** 10-21-2025 (Latest Development)

---

## 📦 What's Inside This Package

This export package contains the **complete Mundo Tango platform** - every file, configuration, and piece of documentation needed to restore and run the application in any environment.

### Package Contents

```
mundo-tango-export-package/
├── 📁 SOURCE/                   # All application code
│   ├── client/                  # React/TypeScript frontend (900+ files)
│   ├── server/                  # Node.js/Express backend (335 files)
│   ├── shared/                  # Shared types & database schema
│   ├── tests/                   # Playwright E2E tests
│   └── scripts/                 # Build & deployment scripts
│
├── 📁 DOCS/                     # Complete documentation
│   ├── docs/                    # 635+ technical documentation files
│   ├── README.md                # Platform overview
│   ├── MR_BLUE_MBMD_USER_GUIDE.md        # ⭐ How to use Mr Blue AI
│   └── MUNDO_TANGO_COMPLETE_RESTORATION_GUIDE.md  # ⭐ Restore instructions
│
├── 📁 CONFIG/                   # All configuration files
│   ├── package.json             # 200+ npm dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   ├── vite.config.ts           # Build tool configuration
│   ├── drizzle.config.ts        # Database ORM config
│   ├── tailwind.config.ts       # Styling configuration
│   ├── playwright.config.ts     # E2E testing config
│   └── .env.example             # Environment variables template
│
├── 📁 DATABASE/                 # Database assets
│   ├── schema.ts                # Complete database schema (3,055 lines)
│   └── README.md                # Database setup instructions
│
├── 📁 INFRASTRUCTURE/           # Deployment configurations
│   ├── docker-compose.yml       # Docker orchestration
│   ├── Dockerfile.frontend      # Frontend container
│   ├── Dockerfile.backend       # Backend container
│   └── nginx.conf               # Web server configuration
│
└── 📄 EXPORT_MANIFEST.md        # Complete file inventory
```

---

## 🚀 Quick Start (5 Steps - 30 Minutes)

### Prerequisites
- **Node.js 20+** - `node --version`
- **PostgreSQL 16+** - `psql --version`
- **npm 10+** - `npm --version`

### Step 1: Extract Package
```bash
# If from Git
git clone <your-repo-url> mundo-tango
cd mundo-tango

# If from ZIP
unzip mundo-tango-export.zip
cd mundo-tango
```

### Step 2: Install Dependencies
```bash
npm install
# Installs 200+ packages (~3-5 minutes)
```

### Step 3: Set Up Database
```bash
createdb mundo_tango
export DATABASE_URL="postgresql://localhost/mundo_tango"
npm run db:push
# Creates 50+ tables from schema
```

### Step 4: Configure Environment
```bash
cp .env.example .env
# Edit .env and add your API keys:
# - ANTHROPIC_API_KEY (required for Mr Blue AI)
# - DATABASE_URL (from step 3)
# - Auth provider keys (Clerk recommended)
```

### Step 5: Launch Application
```bash
npm run dev
# Opens at http://localhost:5000
```

**🎉 Done!** Your Mundo Tango instance is running!

---

## 📚 Essential Documentation

### 🆕 Start Here First

**1. Mr Blue AI Assistant Guide**
📄 `DOCS/MR_BLUE_MBMD_USER_GUIDE.md`

Learn how to use Mr Blue - Mundo Tango's AI assistant - with the MB.MD methodology:
- What is Mr Blue? (Chat, Voice, Omniscient modes)
- What is MB.MD? (Mapping → Breakdown → Mitigation → Deployment)
- Quick start guide with example conversations
- Complete feature guide (search, export, analytics, templates)
- Voice mode tutorial
- Visual Editor integration
- Best practices and troubleshooting

**Perfect for:** Everyone using the platform, especially developers and admins

---

**2. Complete Restoration Guide**
📄 `DOCS/MUNDO_TANGO_COMPLETE_RESTORATION_GUIDE.md`

Step-by-step instructions to restore Mundo Tango with 100% functionality:
- Detailed installation guide
- **Original MT Ocean design restoration** (pre-fresh-mundo-tango)
- Database setup with 50+ tables
- Environment configuration (14+ services)
- Design verification checklist
- Production deployment options
- Complete troubleshooting section

**Perfect for:** DevOps, new installations, migrating environments

---

**3. Export Package Plan**
📄 `docs/MUNDO_TANGO_EXPORT_PACKAGE_PLAN.md`

Comprehensive strategy for exporting and migrating the platform:
- Multi-branch export strategy
- File inventory and exclusions
- Replit → Standard environment migration
- Service replacement guides
- Risk mitigation strategies

**Perfect for:** Understanding what's in this package and why

---

### 📖 Additional Documentation

**Platform Architecture:**
- `docs/MASTER_DOCUMENTATION_INDEX.md` - Complete doc index (635+ files)
- `docs/MB_MD_QA_PROTOCOL.md` - Development methodology
- `docs/AGENT_LEARNINGS.md` - Best practices (19 learnings)
- `replit.md` - Platform overview and architecture

**Feature Guides:**
- `docs/MEMORIES_FEATURE_GUIDE.md` - Social posts system
- `docs/EVENTS_FEATURE_GUIDE.md` - Event management
- `docs/GROUPS_FEATURE_GUIDE.md` - Community groups
- `docs/PROFILES_FEATURE_GUIDE.md` - User profiles

**Technical Guides:**
- `docs/MT_DRIZZLE_ORM_GUIDE.md` - Database patterns
- `docs/MT_REACT_QUERY_V5_GUIDE.md` - Data fetching
- `docs/MT_WEBSOCKET_REALTIME_ARCHITECTURE.md` - Real-time features
- `docs/MT_MULTI_AI_PROVIDER_GUIDE.md` - AI integrations

---

## 🎨 Original Design Specifications

This package preserves the **original MT Ocean theme** (pre-fresh-mundo-tango branch):

### Color Palette
```css
Primary Brand: #14B8A6 (Teal-500)
Secondary: #06B6D4 (Cyan-500)
Dark Background: #0F172A (Slate-900)
Medium Background: #1E293B (Slate-800)
Light Background: #334155 (Slate-700)
```

### Layout Structure
- **Left Sidebar:** Dark blue (#0F172A), 280px wide
  - 8 menu items: Memories, Community, Friends, Messages, Groups, Events, Recommendations, Invitations
- **Top Header:** MT logo (teal), search bar, user menu
- **Main Content:** Light background, white cards, rounded corners (12px)
- **Right Sidebar:** Upcoming events, global statistics (glassmorphic effect)

### Visual Elements
- Glassmorphic cards with backdrop-blur
- Rounded corners (12px)
- Teal accent highlights on active states
- Clean typography (Inter font family)
- Mobile-responsive with collapsible sidebar

**Design Reference:** See attached image in restoration guide

---

## 🔧 Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3 + shadcn/ui components
- **State Management:** TanStack Query v5
- **Routing:** Wouter
- **Real-time:** Socket.io client
- **Testing:** Playwright E2E

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express
- **Language:** TypeScript (ESM)
- **Database ORM:** Drizzle
- **Real-time:** Socket.io server
- **File Upload:** Multer
- **Authentication:** JWT (Clerk/Auth0 integration)

### Database
- **Primary:** PostgreSQL 16
- **ORM:** Drizzle with type-safe queries
- **Schema:** 50+ tables, 3,055 lines
- **Migrations:** `npm run db:push`

### AI & Services
- **Mr Blue AI:** Anthropic Claude 3.5 Sonnet
- **Voice AI:** OpenAI GPT-4o Realtime API
- **Payments:** Stripe
- **Object Storage:** AWS S3 / Cloudflare R2
- **Analytics:** PostHog
- **Error Tracking:** Sentry
- **Maps:** LocationIQ + Leaflet

---

## 📊 Package Statistics

| Metric | Count |
|--------|-------|
| **Source Files** | 900+ TypeScript/TSX |
| **Documentation** | 635+ Markdown files |
| **Database Tables** | 50+ tables |
| **Database Schema** | 3,055 lines |
| **API Routes** | 1,483 lines |
| **npm Packages** | 200+ dependencies |
| **Total Files** | ~2,000+ (excluding node_modules) |
| **Package Size** | ~70 MB (without node_modules) |
| **node_modules** | ~500 MB (reinstall with npm) |

---

## 🌐 Deployment Options

### Development
```bash
npm run dev           # Local development server
```

### Production

**Option 1: Railway** (Recommended - Easiest)
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

**Option 2: Docker** (Any Host)
```bash
docker-compose up -d
```

**Option 3: Vercel + Neon**
```bash
vercel deploy        # Frontend
# Neon.tech for PostgreSQL
```

**Option 4: Custom Server**
```bash
npm run build        # Build production assets
npm start            # Start production server
```

---

## 🔐 Required API Keys

### Essential (Required for Core Features)
1. **PostgreSQL Database**
   - Free: Neon.tech, Supabase
   - Paid: AWS RDS, Railway

2. **Anthropic API** (Mr Blue AI)
   - Get from: https://console.anthropic.com/
   - Cost: ~$15/month typical usage

3. **Authentication** (Choose one)
   - Clerk (recommended) - https://clerk.com/
   - Auth0 - https://auth0.com/
   - Firebase Auth

### Optional (Enhanced Features)
4. **OpenAI API** (Voice AI, enhanced features)
5. **Stripe** (Payments/subscriptions)
6. **Object Storage** (S3/R2 for media uploads)
7. **PostHog** (Analytics)
8. **Sentry** (Error tracking)
9. **LocationIQ** (Maps/geocoding)

**See `.env.example` for complete list**

---

## ✅ Success Checklist

After restoration, verify:

### Installation
- [ ] Dependencies installed (`node_modules/` exists)
- [ ] Database created (50+ tables)
- [ ] Environment configured (`.env` file)
- [ ] Server starts (`npm run dev`)
- [ ] Accessible at http://localhost:5000

### Design
- [ ] Left sidebar is dark blue with 8 menu items
- [ ] MT logo appears in teal color
- [ ] Right sidebar shows upcoming events
- [ ] Global statistics display (4 metrics)
- [ ] Design matches reference image

### Features
- [ ] Can create account and log in
- [ ] Can create memory posts
- [ ] Can create/RSVP to events
- [ ] Can join groups
- [ ] Can send messages (real-time)
- [ ] Mr Blue AI responds in chat mode
- [ ] Mr Blue AI responds in voice mode
- [ ] Admin dashboard accessible (super admin)

### Performance
- [ ] Page load under 3 seconds
- [ ] Database queries under 100ms
- [ ] No console errors
- [ ] All E2E tests pass (`npm run test:e2e`)

---

## 🆘 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Design Doesn't Match Reference
```bash
# Ensure correct branch
git checkout 10-21-2025  # NOT fresh-mundo-tango

# Clear build cache
rm -rf node_modules/.vite dist
npm run dev

# Hard refresh browser (Cmd+Shift+R)
```

### Mr Blue Not Responding
```bash
# Check API key is set
grep ANTHROPIC .env

# Verify key is valid at console.anthropic.com
# Check browser console (F12) for errors
```

**For detailed troubleshooting:** See `DOCS/MUNDO_TANGO_COMPLETE_RESTORATION_GUIDE.md`

---

## 📞 Support

### Documentation
- **User Guide:** `DOCS/MR_BLUE_MBMD_USER_GUIDE.md`
- **Restoration Guide:** `DOCS/MUNDO_TANGO_COMPLETE_RESTORATION_GUIDE.md`
- **Full Docs:** `docs/` folder (635+ files)

### Community
- GitHub Issues: Report bugs and request features
- Community Forum: Ask questions and share tips
- Documentation: Search 635+ docs for specific topics

### Using Mr Blue for Help
```
Open Mr Blue → Type:
"Use mb.md: I'm having trouble with [specific issue]"

Mr Blue will systematically research and solve your problem!
```

---

## 📝 Version Information

**Export Details:**
- **Date:** October 23, 2025
- **Branch:** 10-21-2025 (Latest development)
- **Commit:** [Git commit hash]
- **Platform Version:** 1.0
- **Node Version:** 20.x
- **PostgreSQL:** 16.x

**Included Features:**
✅ Complete social platform (Memories, Events, Groups, Profiles)  
✅ Mr Blue AI assistant (Chat, Voice, Omniscient modes)  
✅ Visual Editor for design customization  
✅ Real-time messaging & notifications  
✅ Admin dashboard & analytics  
✅ Payment processing (Stripe)  
✅ Mobile responsive design  
✅ Dark mode support  
✅ E2E test suite  
✅ Complete documentation (635+ files)  

**Excluded (Reinstall or Reconfigure):**
- `node_modules/` - Run `npm install`
- `.env` secrets - Copy from `.env.example` and configure
- User uploads - Will be empty (set up object storage)
- Build artifacts - Generated by `npm run build`

---

## 🎯 Next Steps

**1. Read the Guides**
- Start with `DOCS/MUNDO_TANGO_COMPLETE_RESTORATION_GUIDE.md`
- Learn Mr Blue: `DOCS/MR_BLUE_MBMD_USER_GUIDE.md`

**2. Set Up Environment**
- Follow Quick Start above
- Get required API keys
- Configure `.env` file

**3. Verify Restoration**
- Check design matches reference
- Test all core features
- Run E2E tests

**4. Deploy to Production**
- Choose deployment platform (Railway/Vercel/Docker)
- Configure production environment
- Set up monitoring and backups

**5. Customize & Extend**
- Use Mr Blue AI to add features
- Follow MB.MD methodology
- Contribute improvements back

---

## 🚀 Welcome to Mundo Tango!

This package contains everything you need to restore and run the complete Mundo Tango platform. With the original MT Ocean design, comprehensive documentation, and powerful Mr Blue AI assistant, you're ready to deploy a world-class tango community platform.

**The restoration process typically takes:**
- Quick setup: 30 minutes
- Full setup with integrations: 2-3 hours
- Production deployment: +1-2 hours

**Questions?** Use Mr Blue AI with "Use mb.md:" prefix for systematic help!

---

**Package Integrity:**
```
Total Files: ~2,000
Total Lines: ~150,000+
Documentation: 635 MD files
Tests: 100+ E2E scenarios
Platform: 100% functional
Design: Original MT Ocean preserved
```

**Ready to restore? Start with:** `DOCS/MUNDO_TANGO_COMPLETE_RESTORATION_GUIDE.md`

🌊 **Happy Dancing!** 💃🕺
