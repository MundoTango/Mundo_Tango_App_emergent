# Mundo Tango - Complete Restoration Guide
## From Export Package to Fully Functional Platform

**Version:** 1.0  
**Created:** October 23, 2025  
**Purpose:** Restore Mundo Tango in any environment with original design preserved

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Restoration (30 minutes)](#quick-restoration-30-minutes)
4. [Detailed Step-by-Step Guide](#detailed-step-by-step-guide)
5. [Original Design Restoration](#original-design-restoration)
6. [Database Setup](#database-setup)
7. [Environment Configuration](#environment-configuration)
8. [Verification & Testing](#verification--testing)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This guide will help you restore Mundo Tango to **100% functionality** in a new environment, preserving the **original pre-fresh-mundo-tango design** with the MT Ocean theme.

### What You'll Get

✅ **Full Platform Functionality**
- All social features (Memories, Events, Groups, Profiles)
- Mr Blue AI assistant with voice + chat modes
- Visual Editor for design customization
- Complete admin dashboard
- Real-time updates via WebSockets

✅ **Original MT Ocean Design**
- Dark blue sidebar navigation
- Teal/cyan accent colors (#14B8A6)
- Glassmorphic cards with backdrop blur
- Clean, modern UI with rounded corners
- Global statistics dashboard
- Event cards with proper styling

✅ **Complete Data Architecture**
- PostgreSQL database with 50+ tables
- 3,055 lines of Drizzle ORM schema
- Full authentication & authorization
- Object storage integration

---

## Prerequisites

### Required Software

```bash
# 1. Node.js 20.x or higher
node --version  # Should show v20.x.x

# 2. PostgreSQL 16.x
psql --version  # Should show 16.x

# 3. npm 10.x or higher
npm --version   # Should show 10.x.x

# 4. Git
git --version
```

### Required Services

You'll need accounts and API keys for:

| Service | Purpose | Required? | Cost |
|---------|---------|-----------|------|
| **PostgreSQL Database** | Data storage | ✅ Yes | Free tier available (Neon, Supabase) |
| **Anthropic** | Mr Blue AI (Claude 3.5 Sonnet) | ✅ Yes | Pay-as-you-go (~$15/month) |
| **Stripe** | Payments | ⚠️ Optional | Free + transaction fees |
| **Object Storage** | Media files | ⚠️ Optional | Free tier (AWS S3, Cloudflare R2) |
| **SendGrid/Resend** | Email notifications | ⚠️ Optional | Free tier available |
| **PostHog** | Analytics | ⚠️ Optional | Free tier generous |
| **Sentry** | Error tracking | ⚠️ Optional | Free tier available |

### System Requirements

- **RAM:** 4 GB minimum, 8 GB recommended
- **Disk Space:** 2 GB for project + dependencies
- **OS:** macOS, Linux, or Windows (with WSL2)

---

## Quick Restoration (30 minutes)

### Fast Track Setup

```bash
# 1. Extract or clone the export package
git clone <your-new-repo-url> mundo-tango
cd mundo-tango

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API keys (see below)

# 4. Set up database
createdb mundo_tango
export DATABASE_URL="postgresql://localhost/mundo_tango"
npm run db:push

# 5. Start development server
npm run dev

# 6. Open browser
# Navigate to http://localhost:5000
```

### Minimum .env Configuration

```bash
# Required for basic functionality
DATABASE_URL=postgresql://localhost/mundo_tango
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Required for authentication (use Clerk or Auth0)
# See Environment Configuration section for details
```

**Result:** Mundo Tango should be running locally with core features working!

---

## Detailed Step-by-Step Guide

### Step 1: Obtain the Export Package

**Option A: Git Clone (Recommended)**
```bash
git clone https://github.com/MundoTango/Mundo_Tango_App_emergent.git mundo-tango
cd mundo-tango

# Checkout the recommended branch
git checkout 10-21-2025  # Latest development
# OR
git checkout main         # Stable production
```

**Option B: Download ZIP**
```bash
# Download from GitHub or Replit export
unzip mundo-tango-export.zip
cd mundo-tango-export
```

**Option C: Use Export Package**
```bash
# If using the structured export package
cd mundo-tango-export-package/SOURCE
```

### Step 2: Verify Package Contents

```bash
# Check critical files are present
ls -la package.json          # ✅ Dependencies
ls -la shared/schema.ts      # ✅ Database schema
ls -la client/src/App.tsx    # ✅ Frontend
ls -la server/routes.ts      # ✅ Backend
ls -la vite.config.ts        # ✅ Build config
ls -la .env.example          # ✅ Environment template

# Count files
find client -name "*.tsx" | wc -l    # Should be ~400+
find server -name "*.ts" | wc -l     # Should be ~335
find docs -name "*.md" | wc -l       # Should be ~635
```

**Expected Output:**
```
✅ 900+ TypeScript source files
✅ 635 documentation files
✅ All configuration files present
✅ Test suite included
```

### Step 3: Install Dependencies

```bash
# Install all npm packages (200+ packages)
npm install

# This will install:
# - React, TypeScript, Vite (frontend)
# - Express, Socket.io (backend)
# - Drizzle ORM, PostgreSQL driver (database)
# - Anthropic SDK, OpenAI SDK (AI)
# - Stripe SDK (payments)
# - And 190+ more packages

# Expected time: 3-5 minutes
# Expected size: ~500 MB in node_modules
```

**Troubleshooting:**
```bash
# If npm install fails:
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Step 4: Database Setup

**4.1: Install PostgreSQL**

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql-16 postgresql-contrib
sudo systemctl start postgresql
```

**Windows (WSL2):**
```bash
sudo apt update
sudo apt install postgresql-16
sudo service postgresql start
```

**4.2: Create Database**

```bash
# Create database
createdb mundo_tango

# Verify it exists
psql -l | grep mundo_tango

# Expected output:
# mundo_tango | your_user | UTF8 | ...
```

**4.3: Apply Schema**

```bash
# Set database URL
export DATABASE_URL="postgresql://localhost/mundo_tango"

# Or for custom connection:
export DATABASE_URL="postgresql://username:password@localhost:5432/mundo_tango"

# Push schema to database
npm run db:push

# Expected output:
# ✅ Applying database changes...
# ✅ Success! Database schema synchronized
```

**4.4: Verify Tables Created**

```bash
# Connect to database
psql mundo_tango

# List all tables
\dt

# You should see 50+ tables:
# - users
# - profiles
# - memories
# - events
# - groups
# - conversations
# - messages
# - etc.

# Exit
\q
```

**4.5: Optional - Load Sample Data**

```bash
# If you want test data for development
npm run db:seed

# This creates:
# - Test users (admin, regular users)
# - Sample events
# - Example memories
# - Test groups
```

### Step 5: Environment Configuration

**5.1: Copy Template**

```bash
cp .env.example .env
```

**5.2: Configure Required Variables**

Edit `.env` file:

```bash
# ============================================
# DATABASE (Required)
# ============================================
DATABASE_URL=postgresql://localhost/mundo_tango

# ============================================
# AI - MR BLUE (Required)
# ============================================
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-api03-your-anthropic-key-here

# ============================================
# AUTHENTICATION (Choose One)
# ============================================

# Option A: Clerk (Recommended - easiest)
# Get from: https://clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key
CLERK_SECRET_KEY=sk_test_your-key

# Option B: Auth0
# Get from: https://auth0.com/
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# ============================================
# OPTIONAL SERVICES
# ============================================

# Stripe (for payments/subscriptions)
STRIPE_SECRET_KEY=sk_test_your-stripe-key
VITE_STRIPE_PUBLIC_KEY=pk_test_your-stripe-public-key

# OpenAI (for additional AI features)
OPENAI_API_KEY=sk-your-openai-key

# Object Storage (for media uploads)
# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=mundo-tango-uploads

# OR Cloudflare R2
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret
R2_BUCKET_NAME=mundo-tango

# Analytics (PostHog)
POSTHOG_API_KEY=phc_your-posthog-key
VITE_POSTHOG_API_KEY=phc_your-posthog-key

# Error Tracking (Sentry)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# Maps & Location (LocationIQ)
LOCATIONIQ_API_KEY=your-locationiq-key
```

**5.3: Get API Keys**

**Anthropic (Required):**
1. Go to https://console.anthropic.com/
2. Sign up / Log in
3. Create an API key
4. Copy to `ANTHROPIC_API_KEY`
5. Cost: ~$15/month for typical usage

**Clerk (Recommended for Auth):**
1. Go to https://clerk.com/
2. Create application
3. Copy publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Copy secret key → `CLERK_SECRET_KEY`
5. Configure: Applications → Your App → Configure → Domains
6. Add: `http://localhost:5000` for development
7. Cost: Free up to 10,000 monthly active users

**PostgreSQL Database (Production):**

For production, use managed PostgreSQL:

**Neon (Recommended - same as Replit uses):**
1. Go to https://neon.tech/
2. Create project
3. Copy connection string → `DATABASE_URL`
4. Cost: Free tier includes 0.5 GB storage

**Supabase:**
1. Go to https://supabase.com/
2. Create project
3. Get connection string from Settings → Database
4. Cost: Free tier includes 500 MB database

### Step 6: Start Application

**Development Mode:**

```bash
# Start frontend + backend together
npm run dev

# Expected output:
# 🚀 Server running on http://localhost:5000
# ⚡ Vite dev server ready
# 🔌 WebSocket server listening
# ✅ Database connected

# Open browser:
# http://localhost:5000
```

**Production Build:**

```bash
# Build for production
npm run build

# Start production server
npm start

# Or use Docker:
docker-compose up -d
```

### Step 7: Create Admin Account

**Method 1: Database Direct**

```bash
# Connect to database
psql $DATABASE_URL

# Create admin user
INSERT INTO users (email, username, role, auth_provider, auth_provider_id)
VALUES (
  'admin@mundotango.com',
  'admin',
  'super_admin',
  'clerk',  -- or your auth provider
  'user_unique_id_from_clerk'
);

# Get the user ID
SELECT id FROM users WHERE email = 'admin@mundotango.com';
# Note this ID: e.g., 1

# Create profile
INSERT INTO profiles (user_id, display_name, bio)
VALUES (
  1,  -- Use the ID from above
  'Mundo Tango Admin',
  'Platform Administrator'
);

# Exit
\q
```

**Method 2: Seed Script**

```bash
# Edit scripts/create-admin.ts with your admin email
# Then run:
npm run create-admin
```

**Method 3: Sign Up First User**

```bash
# First user to sign up is automatically admin
# Go to http://localhost:5000
# Click "Sign Up"
# Complete registration
# User will have super_admin role
```

---

## Original Design Restoration

### Understanding the MT Ocean Theme

The original Mundo Tango design (pre-fresh-mundo-tango branch) features:

**Color Palette:**
```css
/* Primary Brand Colors */
--mt-teal: #14B8A6;           /* Teal-500 - Main accent */
--mt-cyan: #06B6D4;            /* Cyan-500 - Secondary accent */
--mt-ocean-dark: #0F172A;      /* Slate-900 - Dark backgrounds */
--mt-ocean-medium: #1E293B;    /* Slate-800 - Medium backgrounds */
--mt-ocean-light: #334155;     /* Slate-700 - Light backgrounds */

/* Gradients */
--mt-gradient: linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%);
--mt-gradient-dark: linear-gradient(135deg, #0D9488 0%, #0891B2 100%);
```

**Key Design Elements:**

1. **Left Sidebar Navigation**
   - Dark blue background (#0F172A)
   - Width: 280px on desktop
   - Collapsible on mobile
   - Menu items with icons (Lucide React)
   - Active state: Teal highlight (#14B8A6)

2. **Top Header**
   - MT logo (teal circle with "MT" text)
   - "Mundo Tango" branding
   - Search bar (center)
   - User menu (right)
   - Height: 64px

3. **Main Content Area**
   - Light background (#F8FAFC for light mode, #1E293B for dark mode)
   - White/dark cards with subtle shadows
   - Rounded corners: 12px
   - Padding: 24px

4. **Right Sidebar (Events/Stats)**
   - Width: 320px
   - Upcoming events cards
   - Global statistics
   - Glassmorphic effect: backdrop-blur-lg

5. **Typography**
   - Headings: Inter font family
   - Body: System fonts
   - Sizes: Tailwind scale (text-sm, text-base, text-lg, etc.)

### Verifying Design is Correct

After restoration, check these visual elements:

**✅ Sidebar Menu Items (in order):**
1. Memories (with flower/sparkle icon)
2. Tango Community
3. Friends
4. Messages
5. Groups
6. Events
7. Recommendations
8. Role Invitations

**✅ Global Statistics Panel:**
- Shows 4 metrics in 2x2 grid:
  - Global Members (e.g., 3.2K)
  - Active Events (e.g., 945)
  - Communities (e.g., 6.8K)
  - Active City (e.g., 18.4)

**✅ Color Verification:**
```bash
# Check colors in CSS file
grep -r "#14B8A6" client/src/  # Should find teal usage
grep -r "#0F172A" client/src/  # Should find dark blue
grep -r "backdrop-blur" client/src/  # Should find glassmorphic effects
```

### Design Files Locations

**CSS/Styling:**
```
client/src/index.css           # Global styles, CSS variables
tailwind.config.ts             # Tailwind configuration with MT colors
client/src/components/ui/      # shadcn components (styled)
```

**Layout Components:**
```
client/src/components/layout/Sidebar.tsx      # Left navigation
client/src/components/layout/Header.tsx       # Top header
client/src/components/layout/Layout.tsx       # Main layout wrapper
```

**Theme Components:**
```
client/src/components/ThemeProvider.tsx       # Dark mode toggle
client/src/lib/utils.ts                       # cn() utility for classes
```

### Applying the Original Design

If the design doesn't match the reference image, restore it:

**Step 1: Verify Branch**

```bash
# The original design should be in these branches:
git checkout main              # Production design
# OR
git checkout 10-21-2025        # Latest development with original design

# NOT this branch:
git checkout fresh-mundo-tango  # This has a different design
```

**Step 2: Check Tailwind Config**

Open `tailwind.config.ts` and verify:

```typescript
export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // MT Ocean Theme
        'mt-teal': {
          DEFAULT: '#14B8A6',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',  // Main brand color
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        'mt-ocean': {
          DEFAULT: '#0F172A',
          dark: '#0F172A',
          medium: '#1E293B',
          light: '#334155',
        }
      },
      // ... rest of config
    }
  }
}
```

**Step 3: Verify Global CSS**

Open `client/src/index.css` and check:

```css
@layer base {
  :root {
    /* Light mode colors */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    --primary: 174 72% 56%;        /* MT Teal */
    --primary-foreground: 0 0% 100%;
    
    /* ... */
  }
  
  .dark {
    /* Dark mode colors */
    --background: 222.2 84% 4.9%;   /* MT Ocean Dark */
    --foreground: 210 40% 98%;
    
    --primary: 174 72% 56%;         /* MT Teal */
    --primary-foreground: 0 0% 100%;
    
    /* ... */
  }
}

/* MT Ocean Glassmorphic Effects */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .glass-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Step 4: Check Sidebar Component**

Open `client/src/components/layout/Sidebar.tsx`:

```tsx
// Verify menu items are in correct order
const menuItems = [
  { icon: Sparkles, label: "Memories", path: "/memories" },
  { icon: Users, label: "Tango Community", path: "/community" },
  { icon: UserPlus, label: "Friends", path: "/friends" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: Users2, label: "Groups", path: "/groups" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: Star, label: "Recommendations", path: "/recommendations" },
  { icon: Mail, label: "Role Invitations", path: "/invitations" },
];

// Verify styling
<aside className="w-72 bg-mt-ocean-dark border-r border-mt-ocean-medium">
  {/* Sidebar content */}
</aside>
```

**Step 5: Force Theme Rebuild**

```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
rm -rf dist
npm run dev

# Hard refresh in browser
# Chrome/Firefox: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Design Reference Checklist

Compare your restored app to the reference image:

- [ ] Left sidebar is dark blue (#0F172A)
- [ ] MT logo is teal circle in top left
- [ ] "Memories" page header uses teal accent
- [ ] Main content has light background
- [ ] Event cards on right sidebar have proper rounded corners
- [ ] Global statistics show 4 metrics (3.2K, 945, 6.8K, 18.4)
- [ ] Post cards have avatar on left
- [ ] Action buttons (location, hashtag, photo, etc.) use icon buttons
- [ ] Upcoming events show date, location, attending count
- [ ] Overall feel is clean, modern, ocean-themed

---

## Verification & Testing

### Step 1: Visual Verification

**Homepage Check:**
```
✅ Sidebar navigation visible with 8 menu items
✅ MT logo in teal color
✅ Content area shows Memories feed
✅ Right sidebar shows Upcoming Events
✅ Global statistics panel displays
✅ Design matches reference image
```

**Responsive Check:**
```bash
# Test different screen sizes
# Desktop (1920x1080): Full layout with sidebars
# Tablet (768px): Collapsible sidebar
# Mobile (375px): Mobile menu, stacked content
```

### Step 2: Functional Testing

**Authentication:**
```
1. Click "Sign Up"
2. Create account with email
3. Verify email (if configured)
4. Log in successfully
5. Profile created automatically
```

**Core Features:**
```
✅ Memories:
   - Create new memory post
   - Add photo
   - Add hashtags
   - Add location
   - Post publishes successfully
   
✅ Events:
   - View events list
   - Create new event
   - RSVP to event
   - View event details
   
✅ Groups:
   - Browse groups
   - Join a group
   - View group members
   
✅ Messages:
   - Send message to user
   - Real-time delivery (WebSocket)
   - Message notifications
```

**Mr Blue AI:**
```
✅ Chat Mode:
   - Open Mr Blue modal
   - Send text message
   - Receive AI response
   - Use "Use mb.md:" prefix
   
✅ Voice Mode:
   - Click headphone icon
   - Grant mic permission
   - Speak to AI
   - Receive voice response
   - View transcript
   
✅ Omniscient Mode (Super Admin):
   - Database tools available
   - Codebase tools available
   - Documentation tools available
```

### Step 3: Performance Testing

```bash
# Run Lighthouse audit
npm run lighthouse

# Check metrics:
# - Performance: 90+
# - Accessibility: 95+
# - Best Practices: 95+
# - SEO: 90+
```

### Step 4: E2E Testing

```bash
# Run Playwright tests
npm run test:e2e

# All tests should pass:
# ✅ Authentication flows
# ✅ Memory creation
# ✅ Event RSVP
# ✅ Group joining
# ✅ Message sending
# ✅ Profile editing
```

---

## Troubleshooting

### Issue: Database Connection Failed

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# 1. Check PostgreSQL is running
sudo service postgresql status

# 2. Start if not running
sudo service postgresql start

# 3. Verify connection string
echo $DATABASE_URL

# 4. Test connection
psql $DATABASE_URL
```

### Issue: npm install Fails

**Error:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Or force
npm install --force

# Or use exact versions
rm package-lock.json
npm install
```

### Issue: Build Fails - TypeScript Errors

**Error:**
```
error TS2307: Cannot find module '@/components/ui/button'
```

**Solution:**
```bash
# Check tsconfig.json has correct paths
cat tsconfig.json | grep paths

# Should show:
# "@/*": ["./client/src/*"]

# Clear TypeScript cache
rm -rf node_modules/.cache
rm tsconfig.tsbuildinfo
npm run check
```

### Issue: Design Doesn't Match Reference

**Problem:** Colors, layout, or components look different

**Solution:**
```bash
# 1. Verify you're on the correct branch
git branch  # Should show * 10-21-2025 or * main

# 2. NOT on fresh-mundo-tango
git checkout 10-21-2025  # Switch if needed

# 3. Clear build cache
rm -rf node_modules/.vite dist

# 4. Reinstall tailwind
npm install -D tailwindcss postcss autoprefixer
npm run dev

# 5. Hard refresh browser
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Issue: Mr Blue Not Responding

**Problem:** AI chat doesn't respond

**Solution:**
```bash
# 1. Check API key is set
echo $ANTHROPIC_API_KEY

# 2. Verify in .env file
grep ANTHROPIC .env

# 3. Check API key is valid
# Go to https://console.anthropic.com/
# Verify key is active and has credits

# 4. Check browser console (F12)
# Look for network errors

# 5. Try different model
# Open Mr Blue → Settings → Change model to GPT-4
```

### Issue: WebSocket Connection Failed

**Problem:** Real-time features not working

**Solution:**
```bash
# 1. Check server logs
npm run dev
# Look for: "WebSocket server listening"

# 2. Verify firewall allows WebSocket
# Port 5000 must be open

# 3. Check browser console
# Should see: "WebSocket connected"
# NOT: "WebSocket connection failed"

# 4. Test WebSocket endpoint
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  http://localhost:5000/socket.io/
```

### Issue: Images Not Loading

**Problem:** Uploaded images return 404

**Solution:**
```bash
# 1. Check object storage is configured
grep -E "AWS_|R2_" .env

# 2. Create uploads directory
mkdir -p uploads
chmod 755 uploads

# 3. For local development (no S3)
# Edit server/storage.ts
# Enable local file storage fallback

# 4. Restart server
npm run dev
```

---

## Production Deployment

### Option 1: Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init

# 4. Add PostgreSQL
railway add -d postgres

# 5. Deploy
railway up

# 6. Set environment variables
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set CLERK_SECRET_KEY=sk_test_...
# (Set all required variables)

# 7. Open app
railway open
```

### Option 2: Vercel (Frontend) + Railway (Backend)

```bash
# Frontend on Vercel
vercel deploy

# Backend on Railway
railway init
railway up
```

### Option 3: Docker + Any Host

```bash
# Build images
docker-compose build

# Run locally
docker-compose up -d

# Deploy to any Docker host
# (DigitalOcean, AWS, GCP, Azure, etc.)
```

---

## Success Checklist

### ✅ Installation Complete

- [ ] All dependencies installed (node_modules exists)
- [ ] Database created and schema applied (50+ tables)
- [ ] Environment variables configured (.env file)
- [ ] Development server starts without errors
- [ ] Can access http://localhost:5000

### ✅ Design Verified

- [ ] Sidebar navigation matches reference image
- [ ] MT Ocean colors applied (teal #14B8A6, dark blue #0F172A)
- [ ] Global statistics panel displays correctly
- [ ] Event cards styled properly on right sidebar
- [ ] Responsive design works on mobile/tablet
- [ ] Dark mode toggle works

### ✅ Features Working

- [ ] Can create account and log in
- [ ] Can create memory posts with photos
- [ ] Can create and RSVP to events
- [ ] Can join groups
- [ ] Can send messages (real-time)
- [ ] Mr Blue AI responds in chat mode
- [ ] Mr Blue AI responds in voice mode
- [ ] Visual Editor loads (super admin)
- [ ] Admin dashboard accessible (super admin)

### ✅ Performance Acceptable

- [ ] Page load under 3 seconds
- [ ] Database queries under 100ms
- [ ] WebSocket latency under 50ms
- [ ] Lighthouse score 90+ (performance)
- [ ] No console errors in browser

### ✅ Production Ready

- [ ] All tests passing (npm run test)
- [ ] Build completes successfully (npm run build)
- [ ] Environment variables secured
- [ ] Database backed up
- [ ] Error tracking enabled (Sentry)
- [ ] Analytics enabled (PostHog)
- [ ] SSL certificate configured
- [ ] Domain name configured

---

## Support & Resources

### Documentation

**In Repository:**
- `/docs/` - 635 documentation files
- `/docs/MR_BLUE_MBMD_USER_GUIDE.md` - How to use Mr Blue
- `/docs/MB_MD_QA_PROTOCOL.md` - MB.MD methodology
- `/docs/AGENT_LEARNINGS.md` - Best practices

**External:**
- Mundo Tango GitHub: https://github.com/MundoTango/Mundo_Tango_App_emergent
- Community Forum: (link to your community)

### Getting Help

**For Technical Issues:**
1. Check this troubleshooting guide first
2. Search existing GitHub issues
3. Open new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

**For Design Questions:**
- Reference the original design image (attached)
- Check `tailwind.config.ts` for color values
- Review component files in `client/src/components/`

**For Feature Questions:**
- Use Mr Blue AI: "Use mb.md: How do I [task]?"
- Read feature guides in `/docs/`
- Ask in community forum

---

## Appendix: Complete Environment Variable Reference

```bash
# ============================================
# DATABASE (Required)
# ============================================
DATABASE_URL=postgresql://user:pass@host:port/db

# ============================================
# AI - MR BLUE (Required for AI features)
# ============================================
ANTHROPIC_API_KEY=sk-ant-your-key
OPENAI_API_KEY=sk-your-key                    # Optional, for additional AI

# ============================================
# AUTHENTICATION (Choose one)
# ============================================
# Clerk (Recommended)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-secret

# Firebase
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com

# ============================================
# PAYMENTS (Optional)
# ============================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# ============================================
# OBJECT STORAGE (Optional)
# ============================================
# AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=mundo-tango
AWS_REGION=us-east-1

# Cloudflare R2
R2_ACCESS_KEY_ID=your-key
R2_SECRET_ACCESS_KEY=your-secret
R2_BUCKET_NAME=mundo-tango
R2_ACCOUNT_ID=your-account-id

# Google Cloud Storage
GCS_PROJECT_ID=your-project
GCS_BUCKET_NAME=mundo-tango
GCS_KEYFILE_PATH=./gcs-keyfile.json

# ============================================
# ANALYTICS (Optional)
# ============================================
POSTHOG_API_KEY=phc_...
VITE_POSTHOG_API_KEY=phc_...
POSTHOG_HOST=https://us.i.posthog.com

# ============================================
# ERROR TRACKING (Optional)
# ============================================
SENTRY_DSN=https://...@sentry.io/...
VITE_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=your-auth-token

# ============================================
# SESSION REPLAY (Optional)
# ============================================
VITE_OPENREPLAY_PROJECT_KEY=your-key
VITE_ENABLE_OPENREPLAY=true

# ============================================
# MAPS & LOCATION (Optional)
# ============================================
LOCATIONIQ_API_KEY=your-key
GOOGLE_MAPS_API_KEY=your-key               # Alternative

# ============================================
# EMAIL (Optional)
# ============================================
# SendGrid
SENDGRID_API_KEY=SG....

# Resend
RESEND_API_KEY=re_...

# ============================================
# OTHER INTEGRATIONS (Optional)
# ============================================
JIRA_API_TOKEN=your-token
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com

GEMINI_API_KEY=your-gemini-key
HF_TOKEN=your-huggingface-token
MESHY_API_KEY=your-meshy-key
LUMA_API_KEY=your-luma-key
TOGETHER_API_KEY=your-together-key

# ============================================
# APPLICATION SETTINGS
# ============================================
NODE_ENV=development                        # or production
PORT=5000
APP_VERSION=1.0.0
LOG_LEVEL=info
```

---

## Summary

**This guide provides:**

✅ Complete step-by-step restoration instructions  
✅ Original MT Ocean design specifications  
✅ Database setup with 50+ tables  
✅ Environment configuration for 14+ services  
✅ Comprehensive testing checklist  
✅ Production deployment options  
✅ Troubleshooting for common issues  

**Estimated Restoration Time:**
- Quick setup: 30 minutes
- Complete setup with all integrations: 2-3 hours
- Production deployment: Additional 1-2 hours

**The restored platform will have:**
- 100% feature parity with original
- Original pre-fresh-mundo-tango design
- All 900+ source files functional
- Complete documentation (635 files)
- Production-ready infrastructure

**Start restoring Mundo Tango today!** 🚀

---

**Version History:**
- v1.0 (Oct 23, 2025) - Initial complete restoration guide
