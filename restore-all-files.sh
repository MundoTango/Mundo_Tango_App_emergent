#!/bin/bash
# 🔧 Mundo Tango ESA LIFE CEO - Git-Safe File Restoration
# Date: October 18, 2025
# Purpose: Restore all deleted files AND properly commit them to git
# Root Cause: Replit checkpoints commit untracked files as deletions

set -e  # Exit on error

echo "🔍 MB.MD File Restoration - Git-Safe Method"
echo "============================================"

# The commit where files last existed
RESTORE_COMMIT="0d91209"

# Critical files that keep getting deleted
CRITICAL_FILES=(
  "MT_MASTER_REBUILD_PLAN.md"
  "DEPLOYMENT_STABILITY_PLAN.md"
  "WHERE_ARE_WE_NOW.md"
  "server/agents/algorithms/index.ts"
  "server/agents/hire-volunteer/index.ts"
  "server/agents/journey-agents/index.ts"
  "server/agents/leadership/index.ts"
  "server/agents/life-ceo/index.ts"
  "server/agents/marketing/index.ts"
  "server/agents/mr-blue/index.ts"
  "server/agents/operational/index.ts"
  "server/agents/page-agents/index.ts"
  "server/agents/services/index.ts"
  "server/agents/ui-sub-agents/index.ts"
  "server/agents/app-leads/index.ts"
)

echo ""
echo "📊 Status Check:"
echo "----------------"

# Count how many files are missing
MISSING_COUNT=0
for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    ((MISSING_COUNT++))
  else
    echo "✅ Exists:  $file"
  fi
done

echo ""
echo "Missing files: $MISSING_COUNT / ${#CRITICAL_FILES[@]}"
echo ""

if [ $MISSING_COUNT -eq 0 ]; then
  echo "✅ All files already exist!"
  echo ""
  echo "Now verifying git tracking..."
else
  echo "🔧 Restoring $MISSING_COUNT missing files..."
  echo ""
fi

# Create directories if they don't exist
mkdir -p server/agents/algorithms
mkdir -p server/agents/hire-volunteer
mkdir -p server/agents/journey-agents
mkdir -p server/agents/leadership
mkdir -p server/agents/life-ceo
mkdir -p server/agents/marketing
mkdir -p server/agents/mr-blue
mkdir -p server/agents/operational
mkdir -p server/agents/page-agents
mkdir -p server/agents/services
mkdir -p server/agents/ui-sub-agents
mkdir -p server/agents/app-leads

# Restore each file
RESTORED_COUNT=0
for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "Restoring: $file"
    
    # Try to restore from git history
    if git cat-file -p $RESTORE_COMMIT:"$file" > "$file" 2>/dev/null; then
      echo "  ✅ Restored from commit $RESTORE_COMMIT"
      ((RESTORED_COUNT++))
    else
      echo "  ⚠️  Could not find in commit $RESTORE_COMMIT"
    fi
  fi
done

echo ""
echo "📦 Restored $RESTORED_COUNT files"
echo ""

# NOW THE CRITICAL STEP: Add all files to git index
echo "🔑 CRITICAL: Adding files to git index..."
echo "-------------------------------------------"
echo "This prevents Replit checkpoints from deleting them again!"
echo ""

ADDED_COUNT=0
for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    # Check if file is already tracked
    if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
      echo "Already tracked: $file"
    else
      echo "Adding to git: $file"
      git add "$file"
      ((ADDED_COUNT++))
    fi
  fi
done

echo ""
echo "📦 Added $ADDED_COUNT files to git index"
echo ""

# Commit if we added any files
if [ $ADDED_COUNT -gt 0 ]; then
  echo "💾 Committing changes to git..."
  git commit -m "Fix: Restore deleted files and add to git index

Root cause identified: Replit's automated checkpoint system was
committing untracked files as deletions. Files were on disk but
not in git index, causing checkpoints to mark them as deleted.

Solution: Properly commit all restored files to git index.

Files restored: $ADDED_COUNT
Methodology: MB.MD (Mapping → Breakdown → Mitigation → Deployment)
"
  echo "✅ Changes committed!"
else
  echo "ℹ️  No changes to commit"
fi

echo ""
echo "🔍 Verification:"
echo "----------------"

# Verify all files are now tracked
echo "Checking git tracking status..."
UNTRACKED_COUNT=0
for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
      echo "✅ $file (tracked)"
    else
      echo "❌ $file (UNTRACKED - WILL BE DELETED ON NEXT CHECKPOINT!)"
      ((UNTRACKED_COUNT++))
    fi
  else
    echo "⚠️  $file (missing)"
  fi
done

echo ""
if [ $UNTRACKED_COUNT -eq 0 ]; then
  echo "✅✅✅ SUCCESS! All files are properly tracked in git"
  echo ""
  echo "Files will now survive Replit checkpoints!"
  echo ""
  echo "Next steps:"
  echo "1. Restart server to verify agents load"
  echo "2. Trigger checkpoint (workflow restart) to test stability"
  echo "3. Implement .gitattributes protection layer"
else
  echo "⚠️⚠️⚠️ WARNING: $UNTRACKED_COUNT files are still untracked!"
  echo ""
  echo "These files WILL BE DELETED on the next checkpoint!"
  echo "Please run: git add <file> && git commit -m 'Track file'"
fi

echo ""
echo "============================================"
echo "✅ Restoration complete!"
echo ""
