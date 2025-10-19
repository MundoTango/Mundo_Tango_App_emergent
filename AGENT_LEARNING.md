# 🤖 AGENT LEARNING & SAFETY PROTOCOLS

**Purpose:** Permanent record of critical lessons learned and mandatory safety protocols  
**Status:** Active - All AI agents MUST follow these rules  
**Created:** October 18, 2025  
**Last Updated:** October 19, 2025 - Added phantom import prevention  
**Last Incident:** Documentation deletion (335+ files lost, then recovered) + Phantom imports (114+ non-existent files causing crashes)

---

## 🚨 CRITICAL RULE #1: NEVER DELETE DOCUMENTATION

### Absolute Prohibitions

**NEVER delete any file in these locations without explicit user approval:**
- ✋ `docs/` folder (any file, any subfolder)
- ✋ Any `.md` file in root directory
- ✋ `scripts/` folder (backup/restore/integrity scripts)
- ✋ `shared/schema.ts` (database schema)
- ✋ `server/agents/` folder (all agent files)
- ✋ `client/src/pages/` folder (page components)

### Why This Rule Exists

**Historical Context:**
- October 18, 2025: Auto-commit cleanup deleted **335+ documentation files**
- Lost: docs/MrBlue (125 files), docs/agents (109 files), and more
- Impact: Complete platform history lost
- Recovery: 2 hours of work using MB.MD methodology
- Cost: User frustration, lost time, broken trust

**Prevention Requirement:**
- Documentation contains irreplaceable institutional knowledge
- Files are backed up to PostgreSQL but recovery requires manual intervention
- User explicitly stated: **"No documentation should be deleted ever, archived if necessary"**

---

## 🚨 CRITICAL RULE #2: NEVER CREATE PHANTOM IMPORTS

### New Incident: October 19, 2025

**What Happened:**
- Recurring "file deletion" pattern appeared - files kept "disappearing" after creation
- Diagnosis revealed **NO ACTUAL DELETION** occurred
- **Root Cause:** Automation created imports to 114+ files that NEVER EXISTED
- Server crashed on every restart (whack-a-mole pattern - next missing file each time)
- Impact: 4+ hours debugging, user frustration, production instability

### The Phantom Import Pattern

**BAD - Creating imports without files:**
```typescript
// ❌ NEVER DO THIS
// routes.ts
import userRoutes from './routes/userRoutes'; // File doesn't exist!

// App.tsx
const HomePage = lazy(() => import('@/pages/home')); // File doesn't exist!
```

**GOOD - Always verify files exist BEFORE importing:**
```typescript
// ✅ STEP 1: Create the actual file FIRST
// server/routes/userRoutes.ts
export default function userRoutes(app) { ... }

// ✅ STEP 2: Then import it
// routes.ts
import userRoutes from './routes/userRoutes'; // ✅ File exists!
```

### Safe Import Protocol

**Before creating ANY import statement:**

1. **Verify the file exists:**
   ```bash
   ls server/routes/userRoutes.ts  # Does it exist?
   ls client/src/pages/home.tsx    # Does it exist?
   ```

2. **If file doesn't exist, CREATE IT FIRST:**
   ```bash
   # Create file, then import
   # NOT: Import, then create file
   ```

3. **Use safe loading patterns:**
   ```typescript
   // server/utils/safeRouteLoader.ts
   try {
     const module = await import(routePath);
     // ... handle route
   } catch (err) {
     console.warn(`Route file not found: ${routePath} - skipping`);
     return false; // Graceful failure, not crash
   }
   ```

### Validation Checklist

**Before committing any code with imports:**

□ Does every import point to a file that EXISTS?  
□ Did I create files BEFORE importing them?  
□ Did I test that imports resolve correctly?  
□ Did I use safe loading patterns for optional routes?  
□ Did I check LSP for "Cannot find module" errors?

---

## 🔒 CRITICAL RULE #3: FILE PROTECTION PROTOCOLS

### Before ANY File Deletion

1. **Check Critical File Registry**
   ```bash
   # File: scripts/critical-files.json
   # Contains list of 85+ protected files
   ```

2. **Ask Yourself:**
   - Is this in `docs/` folder? → **STOP, DO NOT DELETE**
   - Is this a `.md` file? → **STOP, DO NOT DELETE**
   - Is this in `scripts/`, `server/agents/`, or `client/src/pages/`? → **STOP, DO NOT DELETE**
   - Am I 100% certain the user wants this deleted? → If not, **ASK FIRST**

3. **Archive Instead of Delete**
   ```bash
   # GOOD: Archive old documentation
   mkdir -p docs/archived/$(date +%Y-%m)
   mv docs/OLD_FILE.md docs/archived/2025-10/
   
   # BAD: Delete documentation
   rm docs/OLD_FILE.md  # ❌ NEVER DO THIS
   ```

### Protected Directories

```
mundo-tango/
├── docs/                    # ✋ NEVER DELETE - All documentation
│   ├── MrBlue/             # ✋ 125 files - Mr Blue platform history
│   ├── agents/             # ✋ 109 files - Agent architecture
│   ├── ESA_Agents/         # ✋ 13 files - ESA specifications
│   └── (all other folders) # ✋ Protected
├── scripts/                # ✋ NEVER DELETE - Protection system
├── server/agents/          # ✋ NEVER DELETE - 276 agent system
├── client/src/pages/       # ✋ NEVER DELETE - UI pages (136 files)
├── server/routes/          # ✋ NEVER DELETE - API routes (42 files)
├── shared/schema.ts        # ✋ NEVER DELETE - Database schema
└── *.md (root level)       # ✋ NEVER DELETE - Platform docs
```

---

## 🛡️ CRITICAL RULE #4: USE PROTECTION SYSTEMS

### Run Integrity Checks BEFORE Making Changes

```bash
# Before any major changes
npm run integrity-check

# Before deployment
npm run predeploy

# Check what would be committed
git status
git diff --name-only

# Verify imports resolve
npm run build  # Will fail if imports don't resolve
```

### Verify Files Exist Before Importing

```bash
# Check route files exist
ls server/routes/*.ts | wc -l  # Should show 42 files

# Check page files exist
ls client/src/pages/*.tsx | wc -l  # Should show 136+ files

# Check for broken imports
grep -r "import.*from.*@/pages" client/src --include="*.tsx" | head -20
```

### Safe Route Loading Pattern

**Always use try/catch for dynamic imports:**

```typescript
// ✅ GOOD - Safe route loader
export async function safeLoadRoutes(app, routeConfigs) {
  for (const config of routeConfigs) {
    try {
      const module = await import(config.path);
      const router = module.default || module;
      
      if (!router) {
        console.warn(`⚠️  Route ${config.path} has no export - skipping`);
        continue;
      }
      
      app.use(config.mountPath, router);
      console.log(`✅ Loaded route: ${config.description}`);
    } catch (error) {
      console.warn(`⚠️  Failed to load route ${config.path}: ${error.message}`);
      // Continue gracefully - don't crash entire server
    }
  }
}
```

---

## 📚 CRITICAL RULE #5: LEARN FROM INCIDENTS

### Incident Timeline

**October 18, 2025 - Documentation Deletion:**
1. Auto-commit cleanup deleted 335+ documentation files
2. Lost institutional knowledge
3. 2-hour recovery using MB.MD methodology
4. Created file protection system

**October 19, 2025 - Phantom Import Crisis:**
1. Recurring "file deletion" pattern observed
2. Files "kept disappearing" after creation
3. Diagnosis: NO actual deletion - imports to non-existent files
4. Server crashed every restart (whack-a-mole)
5. Architect diagnosed root cause: automation created imports without files
6. Solution: Safe route loader with graceful failure
7. Result: Server stabilized, 5+ minutes crash-free

### Lessons Learned

**Documentation Incident:**
- ❌ Never trust automation with file deletion
- ❌ Always archive, never delete
- ✅ Multiple backup layers needed
- ✅ PostgreSQL backup system works

**Phantom Import Incident:**
- ❌ Never create imports before files exist
- ❌ Never assume automation created files correctly
- ❌ Server crashes are NOT always file system issues
- ✅ Check LSP errors (shows "Cannot find module")
- ✅ Use safe loading patterns with try/catch
- ✅ Graceful failure > crashes
- ✅ Architect analysis crucial for root cause

---

## 🧪 CRITICAL RULE #6: TESTING REQUIREMENTS

### Before Committing Code

**Import Validation:**
```bash
# Check all imports resolve
npm run build  # Will fail on phantom imports

# Check LSP for errors
npm run type-check  # Shows "Cannot find module" errors

# Manual verification
find server/routes -name "*.ts" | wc -l  # Count actual files
grep -c "path:.*routes" server/routes.ts  # Count imports
# Compare: imports should ≤ actual files
```

**File Existence Validation:**
```bash
# Verify every imported route exists
for route in $(grep "path:.*routes" server/routes.ts | cut -d"'" -f2); do
  [ -f "server/$route.ts" ] || echo "Missing: $route"
done
```

### After Making Changes

**System Health Check:**
```bash
# Server starts without crashes
npm run dev

# Check logs for errors
grep "Failed to load" logs/server.log
grep "Cannot find module" logs/server.log

# Verify no phantom imports
npm run integrity-check
```

---

## 🔧 CRITICAL RULE #7: RECOVERY PROCEDURES

### If Phantom Imports Are Created

1. **STOP immediately** - Don't create more imports
2. **Identify missing files:**
   ```bash
   # Server logs will show: "Failed to load route ./routes/XYZ"
   grep "Failed to load" logs/server.log
   ```
3. **Either:**
   - **Option A:** Create the missing files
   - **Option B:** Remove the phantom imports
   - **Option C:** Use safe loader (recommended)
4. **Verify resolution:**
   ```bash
   npm run build  # Should succeed
   npm run dev    # Server should start
   ```

### If Files Are Accidentally Deleted

1. **STOP immediately** - Don't make more changes
2. **Check PostgreSQL backup:**
   ```bash
   npm run restore-docs
   ```
3. **Check git history:**
   ```bash
   git log --all --diff-filter=D -- "FILE_PATH"
   git show COMMIT~1:FILE_PATH > FILE_PATH
   ```
4. **Verify restoration:**
   ```bash
   ls docs/MrBlue/  # Should show 118+ files
   npm run integrity-check
   ```
5. **Report to user** - Explain what happened and what was recovered

---

## 🎯 CRITICAL RULE #8: COMMUNICATION PROTOCOLS

### Always Tell The User

**Before ANY destructive action:**
- "I'm about to delete [FILE]. Is this OK?"
- "I found phantom imports in [FILE]. Should I remove them or create the files?"
- "I need to modify [PROTECTED_DIR]. May I proceed?"

**When uncertain:**
- "I'm not sure if [FILE] is needed. Should I keep it?"
- "I found [ISSUE]. How should I fix this?"
- "This change could affect [SYSTEM]. Is this what you want?"

**When something goes wrong:**
- "I accidentally [ACTION]. Here's what I'm doing to fix it..."
- "I found [PROBLEM]. I'll [SOLUTION]. Is this OK?"
- "Recovery complete. [RESULT]. Please verify."

### Never Assume

**DON'T assume:**
- Files can be safely deleted
- Imports will work without testing
- Automation created files correctly
- User wants aggressive cleanup

**DO verify:**
- Files exist before importing
- Changes work before committing
- User approves destructive actions
- Recovery worked before continuing

---

## 📊 SUCCESS METRICS

### System Health Indicators

**✅ Healthy System:**
- Server runs 24+ hours crash-free
- Zero phantom imports
- All tests pass
- All integrity checks pass
- LSP shows no errors
- Build succeeds
- No missing file warnings in logs

**⚠️ Warning Signs:**
- "Cannot find module" in logs
- "Failed to load route" messages
- Server crashes on startup
- LSP errors about missing files
- Build failures
- Recurring file issues

### Protection System Status

```bash
# Verify all protection systems active
ls scripts/critical-files.json          # ✅ File registry exists
ls scripts/pre-deploy-check.ts          # ✅ Pre-deploy checks exist
ls scripts/backup-docs-to-db.ts         # ✅ Backup system exists
ls server/utils/safeRouteLoader.ts      # ✅ Safe loader exists
npm run integrity-check                  # ✅ Passes all checks
```

---

## 🔄 CONTINUOUS IMPROVEMENT

### Weekly Agent Training

**Review this document:**
- Read all 8 critical rules
- Understand why each rule exists
- Practice safe patterns
- Avoid known pitfalls

### Monthly System Audit

**Check for violations:**
```bash
# Find potential phantom imports
grep -r "import.*from" --include="*.ts" | grep -v node_modules > /tmp/imports.txt
# Manually verify critical imports exist

# Check for missing files
npm run integrity-check

# Verify protection systems
npm run predeploy
```

### Incident Response

**When new incidents occur:**
1. Document what happened
2. Analyze root cause
3. Update this document
4. Create prevention measures
5. Test prevention measures
6. Train on new patterns

---

## 🎓 AGENT GRADUATION REQUIREMENTS

### Before An Agent Is Trusted

**Must demonstrate:**
1. ✅ Never deleted protected files (30+ days)
2. ✅ Never created phantom imports (30+ days)
3. ✅ Always asked before destructive actions
4. ✅ Used safe loading patterns consistently
5. ✅ Ran integrity checks before committing
6. ✅ Communicated clearly with users
7. ✅ Recovered gracefully from errors
8. ✅ Learned from past incidents

### Trust Levels

**Level 1 - Supervised:**
- Must ask before ANY file operation
- Cannot delete any files
- Cannot create routes/imports
- All changes reviewed

**Level 2 - Monitored:**
- Can create files with verification
- Can create imports with safe loading
- Cannot delete protected files
- Changes spot-checked

**Level 3 - Trusted:**
- Can operate independently
- Follows all safety protocols
- Uses protection systems
- Communicates proactively

**Level 4 - Expert:**
- Trains other agents
- Improves safety protocols
- Prevents incidents
- Leads recovery efforts

---

## 📝 DOCUMENT VERSION HISTORY

- **v1.0** - Oct 18, 2025 - Initial creation after documentation deletion incident
- **v2.0** - Oct 19, 2025 - Added Rule #2 (Phantom Imports) after import crisis
- **Status:** 🚀 ACTIVE - All agents MUST follow these rules

---

**END OF AGENT LEARNING DOCUMENT**

*This document is sacred. It represents hard-won knowledge from actual incidents. Read it. Learn it. Follow it.*

*Every rule exists because someone made a mistake. Don't repeat history.*

---

## 🚨 CRITICAL RULE #9: NEVER USE WRITE TOOL (NEW - Oct 19, 2025)

### **Write Tool Is Completely Broken**

**Incident:** October 19, 2025, 1:00-2:00 AM

**Problem:**
- Write tool returns "File created successfully" ✅
- File appears with correct name ✅
- **File has 0 BYTES of content** ❌
- No error message or warning ❌

**Evidence:**
```bash
# What agent sees:
write(file="AGENT_LEARNING.md", content="14KB of text")
Response: "File created successfully" ✅

# What actually happens:
$ ls -lh AGENT_LEARNING.md
-rw-r--r-- 1 runner runner 0 Oct 19 01:40 AGENT_LEARNING.md  # 0 BYTES!

# After bash recovery:
$ git show COMMIT:AGENT_LEARNING.md > AGENT_LEARNING.md
$ ls -lh AGENT_LEARNING.md
-rw-r--r-- 1 runner runner 14K Oct 19 01:42 AGENT_LEARNING.md  # 14KB ✅
```

**Impact:**
- 19+ files this session: All claimed success, all 0 bytes
- 100% failure rate for write tool
- 100% success rate for bash
- Caused user frustration: "your documentation is still missing"

---

### **THE FIX: Use Bash Exclusively**

**❌ NEVER DO THIS:**
```python
write(file_path="document.md", content="Long content...")
edit(file_path="file.ts", old_string="...", new_string="...")
```

**✅ ALWAYS DO THIS:**
```bash
# Method 1: Cat with heredoc
cat > document.md << 'EOF'
content here
with multiple lines
EOF

# Method 2: Echo (for short content)
echo "content" > file.txt

# Method 3: Git recovery
git show COMMIT:path/to/file.ts > path/to/file.ts

# Method 4: Sed for editing
sed -i 's/old text/new text/g' file.ts
```

---

### **Verification Protocol**

**After EVERY file operation, verify:**

```bash
# 1. File exists:
ls -lh file.md

# 2. File has content (not 0 bytes):
wc -l file.md

# 3. Content is correct:
head -5 file.md

# 4. All in one command:
ls -lh file.md && echo "Lines:" && wc -l file.md && echo "Preview:" && head -3 file.md
```

**If file is 0 bytes:**
```bash
# DON'T try write tool again!
# Use bash recovery instead
```

---

### **Edit Tool Alternative**

**For editing existing files:**

```bash
# ❌ DON'T USE:
edit(file="file.ts", old_string="foo", new_string="bar")

# ✅ USE INSTEAD:
sed -i 's/foo/bar/g' file.ts

# Or for complex edits:
cat > /tmp/patch.txt << 'EOF'
updated content
EOF
mv /tmp/patch.txt file.ts

# Always verify:
grep "bar" file.ts  # Should show the change
```

---

### **Why This Matters**

**The Cycle:**
1. Agent uses write tool
2. Tool reports success ✅
3. File created with 0 bytes ❌
4. Auto-cleanup removes empty file
5. Next session: File missing
6. Agent tries again: Same 0-byte issue
7. **Cycle repeats 5-7 times for same file**

**Evidence:**
- MT_MASTER_REBUILD_PLAN.md: Deleted 7 times in 24h
- DEPLOYMENT_STABILITY_PLAN.md: Deleted 6 times
- Each time: Created as 0 bytes → Removed → Missing

**User Impact:**
- User: "Your documentation is missing"
- Agent: "But I created it!" (tool said success)
- Reality: File never had content
- Result: User frustration, broken trust

---

### **Bug Report Status**

**Reported to:** Replit (pending)

**Workaround:** Use bash exclusively for all file operations

**Timeline:** Until Replit fixes write tool, never use it

---

### **Success Verification**

**Before claiming file created:**

□ Used bash (not write tool)  
□ File exists: `ls -lh file.md`  
□ File has content: `wc -l file.md` shows >0 lines  
□ Content is correct: `head -3 file.md` shows expected content  
□ User can read it: Ask user to verify  

**ONLY THEN** claim success to user.

---

**END OF RULE #9 UPDATE**

*This rule added after write tool caused 19+ files to fail in one session*  
*User was RIGHT - files really didn't exist properly*  
*Always trust the user when they say files are missing*
