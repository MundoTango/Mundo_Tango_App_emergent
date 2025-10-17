# 🚀 MUNDO TANGO MIGRATION GUIDE

**Complete step-by-step guide to migrate from corrupted Replit to fresh environment**

---

## 📋 WHAT I'VE PREPARED FOR YOU

### ✅ Files Created:
1. **`git-cleanup-and-merge.sh`** - Automated Git cleanup script
2. **`RESTORATION_PROMPT.md`** - Complete prompt for new Replit
3. **`MIGRATION_GUIDE.md`** - This guide

### ✅ Pre-Flight Checks Completed:
- Git is working (locks removed)
- Working tree is clean (no uncommitted changes)
- Both branches exist (main, conflict_100925_1852)
- .gitignore already configured

---

## 🎯 STEP-BY-STEP MIGRATION

### **STEP 1: Run Git Cleanup (In This Replit)**

Open the Shell tab and run:

```bash
./git-cleanup-and-merge.sh
```

**This script will:**
1. ✅ Remove Git locks
2. ✅ Update .gitignore
3. ✅ Remove `node_modules.backup` from entire Git history
4. ✅ Run garbage collection
5. ✅ Merge your work to main branch
6. ✅ Force push cleaned branches
7. ✅ Push cleaned main branch

**Expected output:**
```
🚀 Starting Git cleanup and merge process...
Step 1: Cleaning up Git processes...
✅ Git processes cleaned

Step 2: Removing Git locks...
✅ Git locks removed

[... more steps ...]

🎉 SUCCESS! Git cleanup and merge complete!
```

**Time estimate:** 2-5 minutes

---

### **STEP 2: Create New Replit**

1. Go to https://replit.com
2. Click "Create Replit"
3. Choose "Import from GitHub"
4. Enter: `https://github.com/MundoTango/Mundo_Tango_App_emergent.git`
5. Select **main** branch (it's cleaned now!)
6. Click "Import from GitHub"

---

### **STEP 3: Use Restoration Prompt**

In your new Replit, open the chat and paste the contents of **`RESTORATION_PROMPT.md`**

**Or use this shortened version:**

```
I need to restore my complete Mundo Tango platform from GitHub (already cloned). This is a production-grade Multi-AI orchestration platform with 476 dependencies.

CRITICAL: Previous Replit had npm corruption. Emergency CDN fallback was deployed but it's NOT the real app. Need full React/TypeScript/Vite restoration.

STEPS NEEDED:

1. INSTALL: npm install (all 476 packages must succeed)
   - Key: vite, tsx, esbuild, react, @tanstack/react-query
   - If ANY fail, STOP and report

2. DATABASE: Create PostgreSQL, run: npm run db:push --force

3. SECRETS (I'll provide):
   - ANTHROPIC_API_KEY, GEMINI_API_KEY
   - JIRA_API_TOKEN, JIRA_DOMAIN, JIRA_EMAIL
   - LOCATIONIQ_API_KEY, MESHY_API_KEY

4. WORKFLOW:
   - Name: "Start application"
   - Command: npm run dev
   - Port: 5000
   - Output: webview

5. VERIFY (CRITICAL):
   Screenshot of / MUST show:
   ✅ Full sidebar (not just header)
   ✅ Story viewer at top
   ✅ Rich post feed with glassmorphic cards
   ✅ Create post with media upload
   ✅ MT Ocean Theme (turquoise-blue gradient)
   ✅ shadcn/ui components

   Test /memories route has FULL feed

DO NOT ACCEPT:
❌ CDN React fallback (client/dist/index.html)
❌ Simplified version with just header buttons
❌ Missing sidebar or story viewer

See docs/PREVENTION_GUIDE.md and replit.md for full context.

GOAL: Full Mundo Tango platform with all features working!
```

---

## ⚠️ TROUBLESHOOTING

### If Git Cleanup Script Fails:

**"Permission denied" or "Cannot remove lock":**
```bash
# Run manually:
rm -f .git/index.lock
pkill -9 git
./git-cleanup-and-merge.sh
```

**"Working tree not clean":**
```bash
git status
git add -A
git commit -m "Pre-cleanup commit"
./git-cleanup-and-merge.sh
```

**"Cannot merge":**
```bash
# Check if already merged:
git log --oneline | head -20
# If you see your commits, skip to push:
git push origin main --force
```

---

### If New Replit Shows Wrong App:

**Signs of CDN fallback (wrong):**
- Console: "🌎 Mundo Tango loaded successfully with CDN React!"
- No sidebar, just header buttons
- Simple welcome card only

**Solution:**
1. Check workflow command is `npm run dev` (NOT node server/minimal-mt-server.js)
2. Verify all packages installed: `ls node_modules | wc -l` (should be ~400+)
3. Restart workflow
4. Take screenshot and verify

---

## 📊 SUCCESS CHECKLIST

### Before Migration:
- [ ] Git cleanup script runs successfully
- [ ] All branches pushed to GitHub
- [ ] Main branch is clean (no large files)

### After Migration:
- [ ] npm install completes (476 packages)
- [ ] Database connected
- [ ] Server runs on port 5000
- [ ] Screenshot shows FULL app (sidebar, stories, rich feed)
- [ ] /memories route works
- [ ] MT Ocean Theme visible
- [ ] No CDN fallback messages

---

## 🎯 QUICK REFERENCE

### Current Replit (This One):
```bash
# Run cleanup
./git-cleanup-and-merge.sh
```

### New Replit:
```bash
# Already cloned, just need:
npm install
npm run db:push --force
npm run dev
```

### GitHub URL:
```
https://github.com/MundoTango/Mundo_Tango_App_emergent.git
Branch: main (cleaned)
```

---

## 📚 DOCUMENTATION REFERENCE

**In this Replit:**
- `/docs/NPM_CORRUPTION_INCIDENT_REPORT.md` - What happened
- `/docs/CRITICAL_FAILURE_ANALYSIS.md` - Root cause analysis
- `/docs/PREVENTION_GUIDE.md` - How to prevent this
- `/replit.md` - Full platform documentation

**These will be in your new Replit too!**

---

## 🚀 READY TO GO!

**You're all set! Here's the order:**

1. **Now:** Run `./git-cleanup-and-merge.sh` in Shell
2. **Wait:** 2-5 minutes for cleanup to complete
3. **Verify:** Check success message
4. **Create:** New Replit from GitHub
5. **Paste:** Restoration prompt
6. **Verify:** Screenshot shows FULL app

**Good luck! You'll have the full Mundo Tango platform running in your new Replit soon!** 🎉
