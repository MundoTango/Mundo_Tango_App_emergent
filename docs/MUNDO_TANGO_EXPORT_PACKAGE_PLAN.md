# Mundo Tango - Complete Export Package Plan
## MB.MD Methodology: Comprehensive Repository Migration Strategy

**Created:** October 23, 2025  
**Status:** Phase 2 - Breakdown Complete  
**Purpose:** Export entire Mundo Tango platform for migration to new repository

---

## EXECUTIVE SUMMARY

This plan provides a complete strategy for packaging and exporting the Mundo Tango platform, including all files from multiple branches and forks, for migration to another repository. The package will preserve all functionality, documentation, and configuration while removing Replit-specific dependencies.

### Research Findings Summary

| Category | Findings |
|----------|----------|
| **Repository** | GitHub: `MundoTango/Mundo_Tango_App_emergent.git` |
| **Current Branch** | `10-21-2025` |
| **Total Branches** | 10+ (including conflict branches, fresh-mundo-tango, main, production-restore) |
| **Source Files** | 900+ TypeScript/TSX files (client + server) |
| **Documentation** | 635 Markdown files in `docs/` |
| **Key Files** | `schema.ts` (3055 lines), `routes.ts` (1483 lines), `App.tsx` (815 lines) |
| **Dependencies** | 200+ npm packages in package.json |
| **Environment Vars** | 14 required secrets + API keys |
| **Database** | PostgreSQL with Drizzle ORM |
| **Integrations** | Replit Object Storage, Replit Auth, Stripe |

---

## MB.MD PHASE 1: MAPPING - Research Complete ✅

### 1.1 Repository Structure

```
mundo-tango/
├── client/               # React/TypeScript frontend (900+ TS/TSX files)
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # UI components (shadcn, custom)
│       ├── pages/       # Route pages
│       ├── hooks/       # Custom React hooks
│       ├── lib/         # Utilities
│       └── App.tsx      # Main app (815 lines)
├── server/              # Node.js/Express backend (335 TS files)
│   ├── routes.ts        # API routes (1483 lines)
│   ├── storage.ts       # Database interface
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic
│   └── index.ts         # Server entry
├── shared/              # Shared types/schemas
│   └── schema.ts        # Drizzle schema (3055 lines)
├── docs/                # Documentation (635 MD files)
│   ├── agents/          # Agent specifications
│   ├── MrBlue/          # Mr Blue AI documentation
│   ├── The Pages/       # User guides
│   └── *.md             # Various documentation
├── tests/               # Playwright E2E tests
├── scripts/             # Build & deployment scripts
├── backups/             # Code backups
└── data/                # Reference data
```

### 1.2 Git Branch Analysis

**Active Branches:**
```
* 10-21-2025                    (current)
  conflict_100925_1852
  fresh-mundo-tango
  main
  production-restore-oct14
  replit-agent
```

**Remote Branches:**
```
remotes/origin/10-21-2025
remotes/origin/HEAD -> origin/main
remotes/origin/conflict_* (multiple conflict resolution branches)
remotes/origin/fresh-mundo-tango
remotes/origin/main
```

**Branch Purpose:**
- `main` - Production-ready stable code
- `10-21-2025` - Active development (current)
- `fresh-mundo-tango` - Clean slate rebuild
- `conflict_*` - Merge conflict resolution branches
- `production-restore-oct14` - Production rollback point

### 1.3 Critical Configuration Files

| File | Lines | Purpose | Export Priority |
|------|-------|---------|-----------------|
| `.replit` | 50 | Replit environment config | ⚠️ Needs adaptation |
| `replit.nix` | - | Nix package manager | ⚠️ Needs removal |
| `package.json` | 340 | npm dependencies | ✅ Critical |
| `drizzle.config.ts` | 10 | Database ORM config | ✅ Critical |
| `vite.config.ts` | 30 | Frontend build config | ✅ Critical |
| `tsconfig.json` | 30 | TypeScript config | ✅ Critical |
| `tailwind.config.ts` | 150 | Styling config | ✅ Critical |
| `.env.example` | 80 | Environment template | ✅ Critical |
| `playwright.config.ts` | 40 | E2E testing config | ✅ Critical |
| `.gitignore` | 277 | Git exclusions | ✅ Critical |

### 1.4 Environment Variables Required

**Auto-Provided by Replit (need migration):**
```bash
DATABASE_URL=postgresql://...  # Needs new PostgreSQL instance
```

**API Keys Required (14 total):**
```bash
# Analytics & Monitoring
POSTHOG_API_KEY
VITE_POSTHOG_API_KEY
SENTRY_DSN
VITE_SENTRY_DSN
VITE_OPENREPLAY_PROJECT_KEY

# Payments
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
VITE_STRIPE_PUBLIC_KEY

# AI & Content
ANTHROPIC_API_KEY
OPENAI_API_KEY

# Maps & Location
LOCATIONIQ_API_KEY

# Additional
JIRA_API_TOKEN
MESHY_API_KEY
GEMINI_API_KEY
```

### 1.5 Replit-Specific Dependencies

**Integration Analysis:**
```javascript
// .replit integrations that need replacement
integrations = [
  "javascript_object_storage:1.0.0",      // ❌ Replace with S3/R2/Cloud Storage
  "javascript_log_in_with_replit:1.0.0",  // ❌ Replace with Auth0/Clerk/Firebase
  "javascript_stripe:1.0.0"                // ✅ Can use standard Stripe
]
```

**Modules to replace:**
```nix
modules = [
  "nodejs-20",        # ✅ Standard Node.js install
  "postgresql-16"     # ✅ Standard PostgreSQL install
]
```

### 1.6 Exclusions from Export

**Auto-Generated/Build Artifacts:**
```
node_modules/           # 500MB+ - reinstall with npm install
dist/                   # Build output
build/
.next/
.cache/                 # Cypress/browser cache
test-results/           # Playwright results
playwright-report/
logs/                   # Runtime logs
tmp/
temp/
```

**Large Media Files:**
```
attached_assets/        # User uploads
uploads/                # User content
*.mp4, *.mov, *.avi    # Video files
*.png, *.jpg (except icons/fixtures)
```

**Environment-Specific:**
```
.env                    # Contains secrets
.env.local
.git/                   # Version control (exported separately)
```

---

## MB.MD PHASE 2: BREAKDOWN - Export Strategy

### 2.1 Multi-Branch Export Strategy

**Option A: Single Branch Export (Recommended)**
- Export current branch `10-21-2025` (most recent development)
- Advantages: Clean, no conflicts, ready to deploy
- Use case: Fresh start in new environment

**Option B: Main Branch Export**
- Export stable `main` branch
- Advantages: Production-tested, fewer bugs
- Use case: Conservative migration

**Option C: Multi-Branch Bundle**
- Export all branches as separate folders
- Advantages: Complete history, all code versions
- Use case: Need to compare/merge different approaches

**Recommended Approach: Option A + Git History**
```bash
# Export current branch with full git history
git clone https://github.com/MundoTango/Mundo_Tango_App_emergent.git mundo-tango-export
cd mundo-tango-export
git checkout 10-21-2025
# Create clean export package
```

### 2.2 Export Package Structure

```
mundo-tango-export-package/
├── SOURCE/                          # All source code
│   ├── client/
│   ├── server/
│   ├── shared/
│   ├── tests/
│   └── scripts/
├── DOCS/                            # All documentation
│   ├── docs/                        # 635 MD files
│   ├── README.md                    # Main README
│   ├── SETUP.md                     # Setup instructions
│   └── MIGRATION_GUIDE.md           # Replit → Standard migration
├── CONFIG/                          # Configuration files
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── drizzle.config.ts
│   ├── tailwind.config.ts
│   ├── playwright.config.ts
│   └── .env.example
├── DATABASE/                        # Database exports
│   ├── schema.sql                   # Database schema
│   ├── migrations/                  # Migration history
│   └── seed-data/                   # Sample data
├── INFRASTRUCTURE/                  # Deployment configs
│   ├── docker-compose.yml
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   ├── nginx.conf
│   └── deploy-scripts/
├── BRANCHES/                        # Other important branches (optional)
│   ├── main/
│   ├── fresh-mundo-tango/
│   └── production-restore-oct14/
└── EXPORT_MANIFEST.md               # Complete inventory
```

### 2.3 File Inventory Manifest

**Phase 2.3.1: Generate Complete File List**
```bash
# Count all files by type
find . -type f -name "*.ts" | wc -l      # TypeScript files
find . -type f -name "*.tsx" | wc -l     # React components
find . -type f -name "*.md" | wc -l      # Documentation
find . -type f -name "*.json" | wc -l    # Config files
find . -type f -name "*.css" | wc -l     # Stylesheets
```

**Expected Counts:**
- TypeScript files: ~900+
- React components: ~400+
- Documentation: 635
- Config files: ~50+
- Total files: ~2000+ (excluding node_modules)

**Phase 2.3.2: Create Inventory Categories**

| Category | File Pattern | Count | Export? |
|----------|-------------|-------|---------|
| Source Code | `*.ts`, `*.tsx` | 900+ | ✅ Yes |
| Documentation | `docs/**/*.md` | 635 | ✅ Yes |
| Configuration | `*.config.*`, `*.json` | 50+ | ✅ Yes |
| Tests | `tests/**/*.spec.ts` | ~100 | ✅ Yes |
| Scripts | `scripts/**/*.sh`, `*.mjs` | ~15 | ✅ Yes |
| Styles | `*.css` | ~20 | ✅ Yes |
| Assets (small) | Icons, fixtures | ~50 | ✅ Yes |
| Build artifacts | `dist/`, `build/` | N/A | ❌ No |
| Dependencies | `node_modules/` | N/A | ❌ No |
| Uploads | `uploads/`, `attached_assets/` | N/A | ❌ No |
| Logs | `logs/`, `*.log` | N/A | ❌ No |

### 2.4 Database Export Strategy

**Phase 2.4.1: Schema Export**
```bash
# Export Drizzle schema
cp shared/schema.ts DATABASE/schema.ts

# Generate SQL schema from Drizzle
npx drizzle-kit generate:pg
cp drizzle/*.sql DATABASE/migrations/
```

**Phase 2.4.2: Data Export Options**

**Option A: Schema Only (Recommended)**
- Export only `shared/schema.ts`
- New environment creates fresh database
- Advantages: Clean slate, no data migration issues
- Use case: Starting fresh in new repo

**Option B: Schema + Sample Data**
- Export schema + seed data scripts
- Provides example data for testing
- Advantages: Can test immediately
- Use case: Development/staging environment

**Option C: Full Data Export**
- Export schema + all production data
- Requires PostgreSQL dump
- Advantages: Complete migration
- Use case: Production migration

**Recommended: Option A**
```typescript
// DATABASE/schema-export-readme.md
# Database Setup Instructions

1. Install PostgreSQL 16
2. Create database: `createdb mundo_tango`
3. Copy shared/schema.ts to new repo
4. Run: `npm run db:push`
5. Database is ready!
```

### 2.5 Dependency Migration Plan

**Phase 2.5.1: npm Package Analysis**

**Production Dependencies (keep all):**
```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.67.0",     // AI integration
    "@stripe/stripe-js": "^7.7.0",       // Payments
    "@tanstack/react-query": "^5.60.5",  // Data fetching
    "drizzle-orm": "^*",                 // Database ORM
    "express": "^*",                     // Backend server
    "react": "^*",                       // Frontend framework
    "socket.io": "^*",                   // WebSockets
    // ... 200+ more packages
  }
}
```

**Replit-Specific Packages to Remove:**
```json
{
  "dependencies": {
    "@replit/object-storage": "^*",      // ❌ Remove - replace with S3
    "@replit/database": "^*"             // ❌ Remove - using PostgreSQL
  }
}
```

**Phase 2.5.2: Replacement Strategy**

| Replit Service | Replacement Options | Recommended |
|----------------|---------------------|-------------|
| Object Storage | S3, R2, Google Cloud Storage, Azure Blob | **AWS S3** or **Cloudflare R2** |
| Auth | Auth0, Clerk, Firebase Auth, Supabase Auth | **Clerk** (similar API) |
| Database | Supabase, Neon, Railway, Render Postgres | **Neon** (same as Replit uses) |
| Deployment | Vercel, Railway, Render, Fly.io | **Railway** (easiest) |

### 2.6 Configuration Adaptation Plan

**Phase 2.6.1: Replace .replit Configuration**

**Current (.replit):**
```toml
modules = ["nodejs-20", "postgresql-16"]
[[ports]]
localPort = 5000
externalPort = 80
```

**New (docker-compose.yml):**
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
  
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
  
  database:
    image: postgres:16
    environment:
      - POSTGRES_DB=mundo_tango
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

**Phase 2.6.2: Update package.json Scripts**

**Remove Replit-specific:**
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",  // ✅ Keep
    "build": "vite build && esbuild ...",                // ✅ Keep
    "start": "node dist/index.js",                       // ✅ Keep
  }
}
```

**Add standard deployment:**
```json
{
  "scripts": {
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "deploy:railway": "railway up",
    "deploy:vercel": "vercel deploy --prod"
  }
}
```

---

## MB.MD PHASE 3: MITIGATION - Risk Management

### 3.1 Export Risks & Solutions

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| **Replit integration failures** | High | 100% | Replace with standard services before export |
| **Environment variable mismatch** | High | 80% | Create comprehensive .env.example |
| **Database migration errors** | Medium | 40% | Test schema export/import process |
| **Missing dependencies** | Medium | 30% | Verify package.json completeness |
| **Build script failures** | Low | 20% | Test build in clean environment |
| **Branch conflicts** | Low | 10% | Document branch merge strategy |

### 3.2 Pre-Export Validation Checklist

**Code Quality:**
- [ ] All TypeScript files compile without errors
- [ ] All tests pass (`npm run test`)
- [ ] No hard-coded Replit URLs or paths
- [ ] No `.env` files included (use .env.example)
- [ ] All import paths are relative or use configured aliases

**Configuration:**
- [ ] package.json has all dependencies
- [ ] vite.config.ts works without Replit
- [ ] drizzle.config.ts uses standard DATABASE_URL
- [ ] No Replit-specific integrations in code
- [ ] Docker configs build successfully

**Documentation:**
- [ ] README.md explains setup process
- [ ] SETUP.md has step-by-step instructions
- [ ] MIGRATION_GUIDE.md documents Replit replacements
- [ ] All 635 docs files are included
- [ ] API documentation is complete

**Database:**
- [ ] schema.ts is complete and up-to-date
- [ ] Migrations (if any) are included
- [ ] Database can be created from schema alone
- [ ] No Replit-specific database code

### 3.3 Testing Strategy

**Phase 3.3.1: Pre-Export Testing**
```bash
# Test 1: Clean build
rm -rf node_modules dist
npm install
npm run build
npm run start

# Test 2: Database creation
dropdb mundo_tango_test
createdb mundo_tango_test
DATABASE_URL=postgres://localhost/mundo_tango_test npm run db:push

# Test 3: E2E tests
npm run test:e2e
```

**Phase 3.3.2: Post-Export Testing**
```bash
# In new repository
git clone <new-repo-url>
cd mundo-tango
npm install
# Set up .env
npm run db:push
npm run dev
# Manual testing checklist...
```

### 3.4 Rollback Plan

**If Export Fails:**
1. Keep original Replit project untouched
2. Export is non-destructive operation
3. Can retry export at any time
4. Git history preserved

**If Migration Fails:**
1. Can return to Replit environment
2. Original repository remains on GitHub
3. All branches preserved
4. No data loss

---

## MB.MD PHASE 4: DEPLOYMENT - Export Execution Plan

### 4.1 Export Execution Steps

**Step 1: Prepare Repository**
```bash
# 1. Commit all changes
git add .
git commit -m "Pre-export checkpoint - all features complete"
git push origin 10-21-2025

# 2. Create export tag
git tag -a v1.0-export -m "Complete Mundo Tango export package"
git push origin v1.0-export

# 3. Create export branch
git checkout -b export-package
```

**Step 2: Clean Repository**
```bash
# Remove build artifacts
rm -rf node_modules dist build .next .cache
rm -rf test-results playwright-report logs tmp

# Remove large files
rm -rf attached_assets uploads backups

# Remove environment files
rm .env .env.local

# Keep .env.example
```

**Step 3: Update Configuration Files**
```bash
# Update package.json (remove Replit packages)
# Update .replit → docker-compose.yml
# Update README.md with new setup instructions
# Create MIGRATION_GUIDE.md
```

**Step 4: Create Export Package**
```bash
# Option A: Git clone export
git clone https://github.com/MundoTango/Mundo_Tango_App_emergent.git mundo-tango-export
cd mundo-tango-export
git checkout export-package

# Option B: Zip export
zip -r mundo-tango-export.zip . \
  -x "node_modules/*" \
  -x "dist/*" \
  -x ".git/*" \
  -x "logs/*" \
  -x "attached_assets/*" \
  -x "uploads/*"

# Option C: Replit download
# Use Replit "Download as zip" feature
```

**Step 5: Generate Export Manifest**
```bash
# Create comprehensive file inventory
find . -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/.git/*" \
  > EXPORT_MANIFEST.txt

# Add metadata
echo "Export Date: $(date)" >> EXPORT_MANIFEST.txt
echo "Total Files: $(cat EXPORT_MANIFEST.txt | wc -l)" >> EXPORT_MANIFEST.txt
echo "Git Commit: $(git rev-parse HEAD)" >> EXPORT_MANIFEST.txt
```

**Step 6: Create Multi-Branch Export (Optional)**
```bash
# Export all important branches
mkdir -p BRANCHES
for branch in main fresh-mundo-tango production-restore-oct14; do
  git checkout $branch
  git archive --format=tar $branch | tar -x -C BRANCHES/$branch/
done
```

### 4.2 Post-Export Documentation

**Create SETUP.md:**
```markdown
# Mundo Tango - Setup Instructions

## Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm or yarn

## Quick Start
1. Clone repository
2. `npm install`
3. Copy `.env.example` to `.env`
4. Fill in environment variables
5. `npm run db:push`
6. `npm run dev`

## Detailed Setup
[See full instructions...]
```

**Create MIGRATION_GUIDE.md:**
```markdown
# Replit to Standard Environment Migration

## Service Replacements

### 1. Object Storage
**Replit:** @replit/object-storage
**Replace with:** AWS S3
**Changes needed:**
- Update server/storage.ts
- Install aws-sdk
- Configure S3 bucket
[See code examples...]

### 2. Authentication
**Replit:** Replit OAuth
**Replace with:** Clerk
**Changes needed:**
- Update client auth context
- Install @clerk/clerk-react
- Configure Clerk app
[See code examples...]

[...]
```

### 4.3 New Repository Setup Instructions

**For destination repository:**
```bash
# 1. Create new repository
gh repo create mundo-tango-new --private

# 2. Push exported code
cd mundo-tango-export
git remote add new https://github.com/yourorg/mundo-tango-new.git
git push new export-package:main

# 3. Set up environment
cp .env.example .env
# Edit .env with actual values

# 4. Install dependencies
npm install

# 5. Set up database
createdb mundo_tango
npm run db:push

# 6. Run migrations (if any)
npm run migrate

# 7. Start development server
npm run dev

# 8. Run tests
npm test
npm run test:e2e
```

### 4.4 Verification Checklist

**After Export:**
- [ ] All source files present (900+ files)
- [ ] All documentation present (635 MD files)
- [ ] All configuration files included
- [ ] package.json dependencies complete
- [ ] .env.example has all required variables
- [ ] Docker configs included
- [ ] Setup instructions are clear
- [ ] No sensitive data included
- [ ] Export manifest generated
- [ ] Git history preserved (if using git clone)

**In New Environment:**
- [ ] npm install succeeds
- [ ] TypeScript compiles without errors
- [ ] Database schema applies successfully
- [ ] Development server starts
- [ ] Frontend renders correctly
- [ ] API endpoints respond
- [ ] Tests pass
- [ ] Build process works
- [ ] Production deployment succeeds

---

## APPENDICES

### Appendix A: Complete File Exclusion List

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
.next/
out/
.nuxt/

# Caches
.cache/
.parcel-cache/
.eslintcache
.prettier-cache
*.tsbuildinfo

# Test outputs
test-results/
playwright-report/
coverage/
.nyc_output/

# Logs
logs/
*.log
npm-debug.log*

# Temporary
tmp/
temp/
.tmp/

# User uploads
attached_assets/
uploads/

# Media files
*.mp4
*.mov
*.avi
*.png (except icons)
*.jpg (except fixtures)

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Git
.git/

# Replit-specific
.replit
replit.nix
.config/
.upm/
```

### Appendix B: Branch Comparison Matrix

| Branch | Status | Features | Use Case | Export? |
|--------|--------|----------|----------|---------|
| 10-21-2025 | Current dev | Latest features, Mr Blue complete | Active development | ✅ Primary |
| main | Stable | Production-tested | Safe deployment | ✅ Backup |
| fresh-mundo-tango | Clean | Rebuilt from scratch | Clean slate | ⚠️ Optional |
| production-restore-oct14 | Rollback | Known good state | Emergency restore | ⚠️ Optional |
| conflict_* | Resolution | Merge attempts | Historical reference | ❌ Skip |

### Appendix C: Environment Variable Mapping

| Variable | Required | Source | Migration Notes |
|----------|----------|--------|-----------------|
| DATABASE_URL | ✅ Yes | PostgreSQL instance | Use Neon/Supabase/Railway |
| ANTHROPIC_API_KEY | ✅ Yes | Anthropic console | Direct copy |
| STRIPE_SECRET_KEY | ✅ Yes | Stripe dashboard | Direct copy |
| POSTHOG_API_KEY | ⚠️ Optional | PostHog project | For analytics |
| SENTRY_DSN | ⚠️ Optional | Sentry project | For error tracking |

### Appendix D: Integration Replacement Code Examples

**Object Storage Migration:**
```typescript
// OLD (Replit)
import { Client } from '@replit/object-storage';
const storage = new Client();

// NEW (AWS S3)
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
const storage = new S3Client({ region: 'us-east-1' });
```

**Auth Migration:**
```typescript
// OLD (Replit Auth)
import { getUserInfo } from '@replit/auth';
const user = getUserInfo(req);

// NEW (Clerk)
import { getAuth } from '@clerk/express';
const { userId } = getAuth(req);
```

### Appendix E: Estimated Export Package Size

| Component | Size | Notes |
|-----------|------|-------|
| Source Code | ~50 MB | All TS/TSX files |
| Documentation | ~10 MB | 635 MD files |
| Configuration | ~1 MB | Config files |
| Tests | ~5 MB | Playwright tests |
| **Total (without node_modules)** | **~70 MB** | Manageable size |
| node_modules (not included) | ~500 MB | Reinstall with npm |
| Git history (if included) | ~100 MB | Full repo history |

---

## SUMMARY & NEXT STEPS

### What This Plan Delivers

✅ **Complete Export Strategy** for all Mundo Tango files  
✅ **Multi-Branch Handling** for different code versions  
✅ **Replit → Standard Migration** guide  
✅ **Environment Configuration** documentation  
✅ **Database Export** strategy  
✅ **Dependency Management** plan  
✅ **Risk Mitigation** checklist  
✅ **Testing Strategy** for validation  

### Recommended Export Path

1. **Use Current Branch** (`10-21-2025`) as primary export
2. **Include Main Branch** as stable backup
3. **Document Replit Replacements** clearly
4. **Test in Clean Environment** before finalizing
5. **Create Comprehensive README** for new repo

### Timeline Estimate

| Phase | Duration | Description |
|-------|----------|-------------|
| Preparation | 2 hours | Commit, tag, create export branch |
| Configuration Updates | 3 hours | Update configs, create Docker files |
| Export Package Creation | 1 hour | Clone, zip, or download |
| Documentation | 4 hours | Write setup guides, migration docs |
| Testing | 6 hours | Test in new environment |
| **Total** | **~16 hours** | **2 work days** |

### Success Criteria

- [ ] All 900+ source files exported
- [ ] All 635 documentation files included
- [ ] New environment runs successfully
- [ ] All tests pass
- [ ] Production deployment works
- [ ] No Replit dependencies remain

---

**Status:** ✅ Plan Complete - Ready for User Approval  
**Next Action:** User review and approval to proceed with export execution
