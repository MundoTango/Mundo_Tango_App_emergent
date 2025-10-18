#!/bin/bash
# 🚀 QUICK FIX - Run these commands in Replit Shell
# Mundo Tango ESA LIFE CEO - Complete the file restoration

echo "🔧 Mundo Tango - Final Git Add (Manual Step)"
echo "============================================="
echo ""

# Step 1: Remove git lock
echo "Step 1: Removing git lock file..."
rm -f .git/index.lock
echo "✅ Lock file removed"
echo ""

# Step 2: Add all files to git
echo "Step 2: Adding restored files to git index..."
echo "(This is the CRITICAL step that prevents checkpoint deletions!)"
echo ""

git add server/agents/*/index.ts vite.config.ts .gitattributes

echo "✅ Files added to git index"
echo ""

# Step 3: Check status
echo "Step 3: Checking git status..."
echo ""
git status | head -30
echo ""

# Step 4: Commit
echo "Step 4: Committing changes..."
echo ""

git commit -m "Fix: Restore agent index files and vite.config to git

ROOT CAUSE IDENTIFIED: Replit's automated checkpoint system was committing
untracked files as deletions. Files were on disk but not in git index,
causing checkpoints to mark them as deleted.

SOLUTION: Properly commit all restored files to git index.

Files restored from commit 512d49c:
- server/agents/algorithms/index.ts
- server/agents/leadership/index.ts  
- server/agents/operational/index.ts
- server/agents/mr-blue/index.ts
- server/agents/journey-agents/index.ts
- server/agents/hire-volunteer/index.ts
- server/agents/services/index.ts
- server/agents/ui-sub-agents/index.ts
- vite.config.ts
- .gitattributes (protection layer)

Expected result: Files will now survive Replit checkpoints.

Investigation: MB_MD_FILE_DELETION_INVESTIGATION_COMPLETE.md
Methodology: MB.MD (Mapping → Breakdown → Mitigation → Deployment)"

echo ""
echo "✅ Changes committed!"
echo ""

# Step 5: Verify
echo "Step 5: Verifying files are in git..."
echo ""
echo "Agent index files tracked:"
git ls-files | grep "agents/.*index.ts"
echo ""

echo "vite.config tracked:"
git ls-files | grep "vite.config"
echo ""

# Step 6: Test server
echo "=========================================="
echo "✅ ALL DONE! Now test the server:"
echo ""
echo "Run: npm run dev"
echo ""
echo "Expected: Server starts successfully"
echo "Expected: ~119 agents operational (up from 60!)"
echo "Expected: No vite.config error"
echo ""
echo "Then test stability: Restart 10 times"
echo "=========================================="
