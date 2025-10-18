# 🤖 AGENT LEARNING & SAFETY PROTOCOLS

**Purpose:** Permanent record of critical lessons learned and mandatory safety protocols  
**Status:** Active - All AI agents MUST follow these rules  
**Created:** October 18, 2025  
**Last Incident:** Documentation deletion (335+ files lost, then recovered)

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

## 🔒 CRITICAL RULE #2: FILE PROTECTION PROTOCOLS

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
├── client/src/pages/       # ✋ NEVER DELETE - UI pages
├── shared/schema.ts        # ✋ NEVER DELETE - Database schema
└── *.md (root level)       # ✋ NEVER DELETE - Platform docs
```

---

## 🛡️ CRITICAL RULE #3: USE PROTECTION SYSTEMS

### Run Integrity Checks BEFORE Making Changes

```bash
# Before any major changes
npm run integrity-check

# Before deployment
npm run predeploy

# Check what would be committed
git status
git diff --name-only
```

### Backup Documentation Regularly

```bash
# After creating new documentation
npm run backup-docs

# After updating important files
npm run backup-docs
```

### Verify Files Exist

```bash
# Check critical directories
ls docs/MrBlue/        # Should show 118+ files
ls docs/agents/        # Should show 109+ files
ls server/agents/      # Should show agent categories

# Verify protection scripts exist
ls scripts/backup-docs-to-db.ts
ls scripts/restore-docs-from-db.ts
ls scripts/pre-deploy-check.ts
```

---

## 📚 CRITICAL RULE #4: LEARN FROM INCIDENTS

### October 18, 2025 Documentation Deletion Incident

**What Happened:**
1. Auto-commit cleanup process ran
2. Deleted 335+ documentation files across multiple sessions
3. Lost docs/MrBlue folder (125 files)
4. Lost docs/agents folder (109 files)
5. Lost 8 other documentation folders

**Root Cause:**
- No pre-deletion checks in agent workflow
- No awareness of protected directories
- Git operations treated all files equally
- Missing guardrails in agent decision-making

**What We Learned:**
1. ✅ **NEVER delete docs/ folder contents**
2. ✅ **Always check critical file registry first**
3. ✅ **Archive instead of delete**
4. ✅ **Use PostgreSQL backup for protection**
5. ✅ **Run integrity checks before deployment**

**Prevention Measures Implemented:**
- ✅ Created AGENT_LEARNING.md (this file)
- ✅ PostgreSQL backup system (394 files backed up)
- ✅ File integrity monitoring (Layer 52 agent)
- ✅ Critical file registry (85 files protected)
- ✅ Pre-deployment validation scripts
- ⏳ Pre-commit hooks (pending)
- ⏳ Automated tests (pending)

---

## 🎯 CRITICAL RULE #5: AGENT BEHAVIOR STANDARDS

### When in Doubt, DON'T Delete

**Decision Tree:**
```
Need to clean up files?
├─ Is it in docs/? → Archive it, DON'T delete
├─ Is it a .md file? → Archive it, DON'T delete
├─ Is it in scripts/? → DON'T delete
├─ Is it in server/agents/? → DON'T delete
├─ Is user explicitly asking to delete? → Ask for confirmation
└─ Still uncertain? → Ask user for guidance
```

### Safe Cleanup Practices

**GOOD:**
```bash
# Archive old files
mkdir -p docs/archived/2025-10
mv docs/OLD_DOC.md docs/archived/2025-10/

# Clean node_modules (safe to regenerate)
rm -rf node_modules/
npm install

# Clean build artifacts (safe to regenerate)
rm -rf dist/
npm run build

# Clean cache files
rm -rf .cache/
```

**BAD:**
```bash
# ❌ NEVER do this
rm -rf docs/
rm *.md
rm -rf scripts/
rm -rf server/agents/
```

### Communication Protocol

**ALWAYS tell the user when:**
- You're about to delete ANY file (get approval first)
- You encounter protected directories (explain why they're protected)
- You need to modify critical systems (ask for permission)
- You're uncertain about an action (request guidance)

---

## 🔧 CRITICAL RULE #6: RECOVERY PROCEDURES

### If Files Are Accidentally Deleted

1. **STOP immediately** - Don't make more changes
2. **Check PostgreSQL backup:**
   ```bash
   npm run restore-docs
   ```
3. **Check git history:**
   ```bash
   git log --all --diff-filter=D -- "FILE_PATH"
   git show COMMIT:FILE_PATH > FILE_PATH
   ```
4. **Verify restoration:**
   ```bash
   ls docs/MrBlue/  # Should show 118+ files
   npm run integrity-check
   ```
5. **Report to user** - Explain what happened and what was recovered

### Documentation Backup Status

```bash
# Check when docs were last backed up
psql $DATABASE_URL -c "SELECT filename, version, backup_date FROM documentation_archive ORDER BY backup_date DESC LIMIT 10;"

# Restore all docs from database
npm run restore-docs

# Restore specific file
npm run restore-docs -- --file=filename.md
```

---

## 🧪 CRITICAL RULE #7: TESTING REQUIREMENTS

### Before Completing Any Task

1. **Run integrity checks:**
   ```bash
   npm run integrity-check
   npm run predeploy
   ```

2. **Verify critical files exist:**
   ```bash
   # Test script will check these
   test -d docs/MrBlue && echo "✅ MrBlue exists"
   test -d docs/agents && echo "✅ Agents exists"
   test -f shared/schema.ts && echo "✅ Schema exists"
   ```

3. **Check for LSP errors:**
   ```bash
   npx tsc --noEmit
   ```

4. **Verify server runs:**
   ```bash
   npm run dev
   # Check for startup errors
   ```

### Automated Tests (Coming Soon)

```bash
# Run all protection tests
npm run test:protection

# Verify critical files exist
npm run test:files

# Check documentation integrity
npm run test:docs
```

---

## 📋 CRITICAL RULE #8: AGENT LEARNING UPDATES

### When to Update This File

**Required Updates:**
- ✅ After any file deletion incident
- ✅ When new critical directories are identified
- ✅ When protection measures are added
- ✅ When recovery procedures are updated
- ✅ When new lessons are learned

**Update Process:**
1. Add new rule or lesson to appropriate section
2. Update date and version
3. Back up to PostgreSQL: `npm run backup-docs`
4. Notify user of the update

### This File is Protected

- ✋ **Never delete** AGENT_LEARNING.md
- ✋ **Never move** to archived/
- ✅ **Always update** with new learnings
- ✅ **Always back up** after changes
- ✅ **Always reference** when uncertain

---

## 🎓 KEY LESSONS SUMMARY

1. **Documentation is irreplaceable** - Lost knowledge cannot be regenerated
2. **Archive, don't delete** - Storage is cheap, recovery is expensive
3. **Use protection systems** - They exist for a reason
4. **When uncertain, ask** - User guidance prevents mistakes
5. **Test before deploying** - Catch issues before they become incidents
6. **Learn from mistakes** - Document every incident for future prevention
7. **Follow MB.MD methodology** - Map, Breakdown, Mitigate, Deploy
8. **Respect user preferences** - "No documentation should be deleted ever"

---

## 🚀 Quick Reference

### Before ANY File Deletion
1. ❓ Is it in `docs/`? → **DON'T DELETE**
2. ❓ Is it a `.md` file? → **DON'T DELETE**
3. ❓ Is it in `scripts/`, `server/agents/`, `shared/schema.ts`? → **DON'T DELETE**
4. ❓ User explicitly requested deletion? → **ASK FOR CONFIRMATION**
5. ✅ If all checks pass → Proceed with caution

### Emergency Recovery
```bash
npm run restore-docs    # Restore from PostgreSQL
git log --all           # Check git history
npm run integrity-check # Verify system integrity
```

### Backup After Changes
```bash
npm run backup-docs     # Back up all documentation
git add . && git commit # Commit changes
```

---

## 📊 Protection System Status

✅ **PostgreSQL Backup:** 394 files backed up  
✅ **Critical File Registry:** 85 files tracked  
✅ **File Integrity Monitoring:** Active (Layer 52)  
✅ **Recovery Scripts:** Available and tested  
✅ **Agent Learning:** This document (active)  
⏳ **Pre-commit Hooks:** Pending implementation  
⏳ **Automated Tests:** Pending implementation  

---

## 🔗 Related Documentation

- `mb.md` - MB.MD methodology guide
- `replit.md` - Platform architecture and user preferences
- `FILE_DELETION_INCIDENT_REPORT.md` - October 18 incident details
- `DEPLOYMENT_STABILITY_PLAN.md` - File protection implementation
- `scripts/critical-files.json` - Protected file registry
- `docs/` - **ALL 350 files are protected**

---

**Version:** 1.0  
**Last Updated:** October 18, 2025  
**Last Incident:** Documentation deletion (recovered successfully)  
**Status:** ✅ **ACTIVE - ALL AGENTS MUST FOLLOW THESE RULES**  
**User Directive:** "No documentation should be deleted ever, archived if necessary"
