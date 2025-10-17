# 🚀 MUNDO TANGO RESTORATION PROMPT

**Use this exact prompt in your new Replit after running the Git cleanup script.**

---

# RESTORE MUNDO TANGO - FULL PRODUCTION PLATFORM

I need to restore my complete Mundo Tango platform from GitHub. This is a production-grade, enterprise-level Multi-AI orchestration platform with Life CEO AI assistant, Memories Feed, Events system, and ESA Framework (105 agents, 61 layers).

## 🚨 CRITICAL CONTEXT

**Previous Environment Issue:**
- Catastrophic npm corruption in previous Replit (see docs/NPM_CORRUPTION_INCIDENT_REPORT.md)
- Emergency CDN React fallback was deployed - THIS IS NOT THE REAL APP
- Full React/TypeScript/Vite application needs to be restored
- Latest code is on **main** branch (cleaned and merged)

**What Went Wrong:**
- npm package manager completely corrupted (ENOTEMPTY errors)
- Missing dependencies (tsx/cjs, tinyglobby, esbuild)
- User saw simplified CDN version instead of full platform
- All build tools failed

**Prevention:**
- Pre-flight health checks documented in docs/PREVENTION_GUIDE.md
- Health check script available: server/health-check.sh
- Full incident analysis in docs/CRITICAL_FAILURE_ANALYSIS.md

---

## 📦 STEP 1: CLONE REPOSITORY

```bash
git clone https://github.com/MundoTango/Mundo_Tango_App_emergent.git
cd Mundo_Tango_App_emergent
# Already on main branch - cleaned and ready!
```

**Verify you have these key files:**
- ✅ replit.md (project documentation)
- ✅ package.json (476 dependencies)
- ✅ client/src/App.tsx (main React app)
- ✅ client/src/pages/ESAMemoryFeed.tsx (Memories feed)
- ✅ server/index.ts (Express server)

---

## 🏗️ STEP 2: INSTALL DEPENDENCIES

**CRITICAL: Verify EVERY package installs correctly**

```bash
npm install
```

**Key packages that MUST install (476 total):**

### Core Build Tools:
- vite (^7.0.6)
- tsx (^4.20.5)
- esbuild (^0.25.0)
- typescript (^5.6.3)

### Frontend:
- react (^18.3.1)
- react-dom (^18.3.1)
- @tanstack/react-query (^5.60.5)
- wouter (^3.3.5)
- framer-motion (^11.13.1)
- @radix-ui/* (30+ components)
- shadcn/ui components
- tailwindcss (^3.4.17)

### Backend:
- express (^4.21.2)
- socket.io (^4.8.1)
- drizzle-orm (^0.39.1)

### AI/ML:
- openai (^5.23.2)
- @anthropic-ai/sdk (^0.37.0)
- @lancedb/lancedb (^0.22.1)

**If ANY package fails to install:**
1. STOP immediately
2. Document which package failed
3. Check npm logs
4. Do NOT proceed until all packages install

---

## 🗄️ STEP 3: DATABASE SETUP

**Create PostgreSQL Database:**
- Replit will provide DATABASE_URL automatically
- Or create using Replit's database panel

**Run Migrations:**

```bash
npm run db:push --force
```

---

## ⚙️ STEP 4: ENVIRONMENT SECRETS

**I will provide these secrets when asked:**

### AI Services:
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`

### Project Management:
- `JIRA_API_TOKEN`
- `JIRA_DOMAIN`
- `JIRA_EMAIL`

### Other:
- `LOCATIONIQ_API_KEY`
- `MESHY_API_KEY`

---

## 🚀 STEP 5: WORKFLOW CONFIGURATION

**Create workflow:**

```yaml
Name: Start application
Command: npm run dev
Port: 5000
Output Type: webview
```

---

## ✅ STEP 6: VERIFY FULL APPLICATION

### Take Screenshot of Home Page (/)

**You MUST see ALL of these:**

✅ **UnifiedTopBar** - Full navigation bar at top  
✅ **Sidebar** - Collapsible left sidebar (not just header buttons)  
✅ **Story Viewer** - Horizontal story carousel  
✅ **Rich PostFeed** - Glassmorphic cards with avatars, media, interactions  
✅ **Create Post Button** - With media upload  
✅ **MT Ocean Theme** - Turquoise-to-blue gradient  
✅ **shadcn/ui Components** - Modern UI visible

### Test /memories Route

✅ **ESAMemoryFeed Component** loads  
✅ **Full feed functionality**  
✅ **NOT the CDN fallback**

---

## 🚫 WARNING SIGNS

**If you see:**
- "🌎 Mundo Tango loaded successfully with CDN React!" in console
- Simple welcome card only
- No sidebar navigation
- Missing story viewer

**THEN STOP - This is the CDN fallback, not the real app!**

---

## 🎯 SUCCESS CRITERIA

✅ npm install completes (476 packages)  
✅ Database connected  
✅ Server running on port 5000  
✅ Screenshot shows FULL app with sidebar, stories, rich feed  
✅ /memories route works  
✅ MT Ocean Theme visible

---

**Let's restore the FULL Mundo Tango platform!** 🚀
