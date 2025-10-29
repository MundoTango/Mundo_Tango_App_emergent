# Export Manifest - Mundo Tango Platform
## Complete File List for Transfer

---

## 🎯 How to Export This Project

### Method 1: Git Clone (Recommended)
```bash
# If you have access to the repository
git clone <repository-url>
cd Mundo_Tango_App_emergent
git checkout 10-21-2025
```

### Method 2: Replit Download
1. Click "⋮" (three dots) in Replit sidebar
2. Select "Download as zip"
3. Extract on your target platform

### Method 3: Manual Git Bundle
```bash
# From Replit shell
git bundle create mundo-tango.bundle --all
# Download the .bundle file and clone it elsewhere:
# git clone mundo-tango.bundle
```

---

## 📦 Critical Files to Include

### ✅ Root Configuration Files
```
package.json              # Dependencies (CRITICAL)
package-lock.json         # Locked versions
tsconfig.json            # TypeScript config
vite.config.ts           # Vite build config
drizzle.config.ts        # Database config
.replit                  # Replit config (optional for other platforms)
replit.nix              # Nix config (optional)
replit.md               # Project documentation (IMPORTANT)
DEPLOYMENT_GUIDE.md     # This deployment guide
EXPORT_MANIFEST.md      # This file
```

### ✅ Frontend Code (`client/`)
```
client/
├── index.html                    # Entry HTML
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Main app component
│   ├── index.css                # Global styles
│   │
│   ├── components/              # ALL React components
│   │   ├── mrBlue/             # Mr Blue AI (100+ files)
│   │   ├── visual-editor/      # Visual Editor (50+ files)
│   │   ├── layout/
│   │   ├── navigation/
│   │   ├── ui/                 # shadcn components
│   │   └── ...
│   │
│   ├── pages/                   # All pages
│   │   ├── Dashboard.tsx
│   │   ├── Events.tsx
│   │   ├── Memories.tsx
│   │   └── ...
│   │
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities
│   ├── services/                # API clients
│   ├── utils/                   # Helper functions
│   └── i18n/                    # Internationalization
│
└── public/                      # Static assets (if any)
```

### ✅ Backend Code (`server/`)
```
server/
├── index-novite.ts              # Server entry point (CRITICAL)
├── vite.ts                      # Vite integration
│
├── routes/                      # ALL API routes
│   ├── mrBlueUnifiedRoutes.ts  # Mr Blue unified endpoint
│   ├── mrBlueAutonomous/       # Autonomous coding routes
│   ├── featureFlagsRoutes.ts
│   ├── conversationRoutes.ts
│   └── ... (30+ route files)
│
├── services/                    # Business logic
│   ├── gemini/                 # Gemini AI integration
│   │   ├── VibeCodeEngine.ts
│   │   └── ...
│   ├── aiService.ts
│   ├── selfAwarenessSystem.ts
│   └── ...
│
├── middleware/                  # Express middleware
│   ├── isAuthenticated.ts
│   └── ...
│
├── db/                          # Database setup
│   └── index.ts
│
├── utils/                       # Server utilities
│   ├── authHelper.ts
│   └── ...
│
└── replitAuth.ts               # Authentication (CRITICAL)
```

### ✅ Shared Code (`shared/`)
```
shared/
└── schema.ts                    # Database schema (CRITICAL)
```

### ✅ Documentation (`docs/`)
```
docs/
├── MB_MD_QA_PROTOCOL.md         # Development methodology
├── INTEGRATION_PROTOCOL.md      # Integration guide
├── AGENT_LEARNINGS.md           # AI agent training
├── DOCUMENTATION_VERIFICATION.md
├── UPGRADED_UI_TESTING_PROTOCOL.md
└── agents/                      # Agent documentation
```

### ✅ Database Migrations (if any)
```
drizzle/                         # Generated migrations (optional)
```

### ✅ Assets
```
attached_assets/                 # Static files (images, etc.)
```

---

## ❌ Files to EXCLUDE (DO NOT transfer)

```
node_modules/                    # Reinstall with npm install
.git/                           # Optional (use git clone instead)
.env                            # Create fresh on new platform
dist/                           # Build output (regenerate)
.replit.db/                     # Replit-specific
.cache/                         # Cache files
.vite/                          # Vite cache
*.log                           # Log files
.DS_Store                       # Mac files
```

---

## 🔑 Environment Variables Required

Create `.env` file on target platform with these variables:

```env
# === REQUIRED FOR BASIC OPERATION ===
DATABASE_URL=postgresql://...
JWT_SECRET=generate-random-string-here
NODE_ENV=development
PORT=5000

# === REQUIRED FOR REPLIT AUTH (optional on other platforms) ===
REPLIT_COOKIE_SECRET=generate-random-string
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-domain

# === OPTIONAL AI SERVICES ===
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_GENAI_API_KEY=...

# === OPTIONAL MONITORING ===
SENTRY_DSN=...
VITE_POSTHOG_API_KEY=...
```

---

## 📊 File Count Summary

**Estimated Total Files:** ~500-800 files

Breakdown:
- **Frontend Components:** ~200 files
- **Backend Routes/Services:** ~100 files
- **Node Modules:** ~20,000 files (DO NOT copy - reinstall)
- **Documentation:** ~30 files
- **Configuration:** ~15 files

---

## 🚚 Transfer Checklist

### Before Export:
- ✅ Commit all changes: `git add . && git commit -m "Final export"`
- ✅ Document current branch: `10-21-2025`
- ✅ List all environment variables needed
- ✅ Note database schema version
- ✅ Export database data (if needed)

### After Transfer to New Platform:
- ✅ Extract/clone repository
- ✅ Run `npm install`
- ✅ Create `.env` file with secrets
- ✅ Set up PostgreSQL database
- ✅ Run `npm run db:push` to create tables
- ✅ Run `npm run dev` to test
- ✅ Verify all features work
- ✅ Deploy to production

---

## 🎯 Platform-Specific Notes

### Deploying to Vercel/Netlify
- Frontend-only deployment won't work (this is full-stack)
- Consider splitting into frontend (Vercel) + backend (Railway/Render)
- Use serverless functions for API routes

### Deploying to Railway/Render
- Perfect for full-stack Node.js apps
- Configure `npm run dev` as start command
- Set all environment variables in dashboard
- Connect PostgreSQL database

### Deploying to AWS/GCP/Azure
- Use EC2/Compute Engine/App Service
- Install Node.js 18+
- Set up PostgreSQL (RDS/Cloud SQL/Azure Database)
- Configure reverse proxy (nginx)

### Deploying to Heroku
- Add `Procfile`: `web: npm start`
- Use Heroku Postgres add-on
- Set environment variables: `heroku config:set KEY=value`

---

## 💾 Database Export (Optional)

If you need to transfer existing data:

```bash
# Export schema + data
pg_dump $DATABASE_URL > mundo_tango_backup.sql

# On new platform, restore:
psql $NEW_DATABASE_URL < mundo_tango_backup.sql
```

---

## 🔗 Repository Information

**Branch:** 10-21-2025  
**Last Commit:** "Update documentation to include recent changes"  
**Platform:** Originally built on Replit  
**Tech Stack:** React + Express + PostgreSQL + TypeScript  

---

## 📞 Next Steps After Transfer

1. **Test locally first** - Make sure everything runs on your machine
2. **Set up staging environment** - Test deployment before production
3. **Configure monitoring** - Set up error tracking and logs
4. **Update authentication** - May need to replace Replit OAuth
5. **Test AI features** - Verify API keys work on new platform
6. **Performance testing** - Check database queries and API response times

---

**Important:** This manifest ensures you have everything needed to run Mundo Tango on any Node.js-compatible platform. Follow the DEPLOYMENT_GUIDE.md for detailed setup instructions.
