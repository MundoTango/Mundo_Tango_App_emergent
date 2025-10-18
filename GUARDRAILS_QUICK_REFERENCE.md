# 🛡️ Agent Guardrails - Quick Reference

**Purpose:** Quick guide for running protection systems and understanding safety protocols  
**Status:** Active - Updated Oct 18, 2025  
**Full Documentation:** See `AGENT_LEARNING.md` for complete details

---

## ⚡ Quick Commands

### Test File Integrity
```bash
# Run all protection tests (26 checks)
tsx scripts/test-file-protection.ts
```

**Expected Output:**
```
✅ ALL PROTECTION TESTS PASSED
🚀 System integrity verified - safe to deploy
```

**If Tests Fail:**
```bash
# Restore missing documentation
npm run restore-docs

# Backup current documentation
npm run backup-docs

# Check git for deleted files
git status
git log --diff-filter=D --summary
```

---

## 🚨 Protected Resources

**NEVER DELETE without user approval:**

| Resource | Files | Why Protected |
|----------|-------|---------------|
| `docs/` folder | 350 files | Platform documentation history |
| Root `.md` files | 15+ files | System documentation |
| `scripts/` | 3+ files | Protection system itself |
| `server/agents/` | 82+ files | 276-agent system |
| `shared/schema.ts` | 1 file | Database schema |
| `client/src/pages/` | 137+ files | UI pages |

---

## 🔍 Protection Layers

1. **AGENT_LEARNING.md** - 8 critical rules (mandatory reading)
2. **Pre-commit hooks** - Blocks git commits that delete protected files
3. **Automated tests** - Validates 26 critical files/folders exist
4. **PostgreSQL backup** - 394 markdown files recoverable
5. **File monitoring** - Layer 52 agent watches continuously

---

## 📋 Before Deployment Checklist

```bash
# 1. Run integrity check
tsx scripts/test-file-protection.ts

# 2. Check TypeScript
npx tsc --noEmit

# 3. Verify server starts
npm run dev

# 4. Check for uncommitted changes
git status
```

---

## ❌ What Triggers Protection

### Pre-Commit Hook Blocks:

```bash
# ❌ BLOCKED: Deleting docs folder
rm docs/file.md
git commit -m "cleanup"
# Result: "ERROR: Attempting to delete files from docs/ folder"

# ❌ BLOCKED: Deleting root .md files
rm README.md
git commit -m "update"
# Result: "ERROR: Attempting to delete root-level .md files"

# ❌ BLOCKED: Deleting protection scripts
rm scripts/backup-docs-to-db.ts
git commit -m "cleanup"
# Result: "ERROR: Attempting to delete protection system scripts"

# ❌ BLOCKED: Deleting agent files
rm -rf server/agents/
git commit -m "refactor"
# Result: "ERROR: Attempting to delete agent system files"

# ❌ BLOCKED: Deleting schema
rm shared/schema.ts
git commit -m "rebuild"
# Result: "ERROR: Attempting to delete database schema"
```

### Instead, Do This:

```bash
# ✅ ALLOWED: Archive old documentation
mkdir -p docs/archived/$(date +%Y-%m)
git mv docs/OLD_FILE.md docs/archived/$(date +%Y-%m)/
git commit -m "archive old documentation"

# ✅ ALLOWED: Update files (not delete)
echo "new content" > docs/file.md
git commit -m "update documentation"

# ✅ ALLOWED: Add new files
touch docs/NEW_FILE.md
git commit -m "add new documentation"
```

---

## 🧪 Testing the Protection System

### Test Pre-Commit Hook

```bash
# Create a test file
echo "test" > docs/test-delete-me.md
git add docs/test-delete-me.md
git commit -m "add test file"

# Try to delete it (should be blocked)
rm docs/test-delete-me.md
git add docs/test-delete-me.md
git commit -m "delete test"
# Expected: ❌ ERROR: Attempting to delete files from docs/ folder

# Clean up (move to archived instead)
mkdir -p docs/archived
git mv docs/test-delete-me.md docs/archived/
git commit -m "archive test file"
```

### Test File Protection Tests

```bash
# Run the test suite
tsx scripts/test-file-protection.ts

# Should check:
# - 6 documentation folders (docs/MrBlue, docs/agents, etc.)
# - 5 root .md files
# - 3 protection scripts
# - 4 agent system files
# - 3 database files
# - 2 page component files
# - 3 middleware files
# Total: 26 tests
```

---

## 🔧 Recovery Procedures

### If Documentation Is Missing

```bash
# Step 1: Run integrity check to identify missing files
tsx scripts/test-file-protection.ts

# Step 2: Restore from PostgreSQL backup
npm run restore-docs

# Step 3: Verify restoration
tsx scripts/test-file-protection.ts
# Expected: ✅ ALL PROTECTION TESTS PASSED

# Step 4: Check what was restored
git status
git diff --stat
```

### If Git Deletion Detected

```bash
# Check what was deleted
git log --diff-filter=D --summary

# Restore specific file from git history
git log --all --full-history -- path/to/file.md
git show COMMIT_HASH:path/to/file.md > path/to/file.md

# Or restore from last commit
git checkout HEAD -- path/to/file.md
```

---

## 📚 Key Rules Summary

1. **Archive, never delete** - Move to `docs/archived/` folder
2. **Ask first** - Get user approval before ANY file deletion
3. **Run tests** - Check integrity before every deployment
4. **Backup often** - Run `npm run backup-docs` after changes
5. **Follow guidelines** - Read `AGENT_LEARNING.md` before making changes
6. **Use protection system** - Don't bypass or disable guardrails
7. **Test changes** - Verify nothing broke with `tsx scripts/test-file-protection.ts`
8. **Commit safely** - Pre-commit hooks protect you

---

## 🆘 Emergency Contacts

**If all else fails:**

1. **User directive:** "No documentation should be deleted ever, archived if necessary"
2. **Full documentation:** See `AGENT_LEARNING.md`
3. **Incident history:** See `ALL_DOCUMENTATION_RESTORED.md`
4. **Protection details:** See `DEPLOYMENT_STABILITY_PLAN.md`

---

## 📊 System Status

**Protection System Status:**
- ✅ AGENT_LEARNING.md created (400+ lines, 8 rules)
- ✅ Pre-commit hooks active (blocks 5 deletion types)
- ✅ Automated tests working (26 checks, all passing)
- ✅ PostgreSQL backup active (394 files protected)
- ✅ File monitoring active (Layer 52 agent)

**Documentation Status:**
- ✅ 350 files in docs/ folder
- ✅ 125 files in docs/MrBlue
- ✅ 109 files in docs/agents
- ✅ 13 files in docs/ESA_Agents
- ✅ All other folders intact

**Last Incident:** Oct 18, 2025 - 350 files deleted, 100% recovered  
**Protection Active Since:** Oct 18, 2025  
**Incidents Since Protection:** 0 ✅

---

**Version:** 1.0  
**Last Updated:** October 18, 2025  
**Status:** ✅ **ACTIVE - ALL PROTECTION SYSTEMS OPERATIONAL**
