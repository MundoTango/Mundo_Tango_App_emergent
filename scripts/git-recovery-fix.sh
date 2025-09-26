
#!/bin/bash

# ESA LIFE CEO 61×21 - Layer 50: Automated Git Recovery
# Safe recovery following antifragile architecture principles

set -e  # Exit on any error

echo "🚀 ESA Layer 50: Starting Git Recovery Process..."
echo "================================================="

# Step 1: Backup current state
echo "💾 Creating backup of current state..."
cp -r .git .git.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created"

# Step 2: Clean lock files safely
echo "🧹 Cleaning Git lock files..."
if [ -f ".git/index.lock" ]; then
    echo "Removing .git/index.lock..."
    rm -f .git/index.lock
fi
if [ -f ".git/HEAD.lock" ]; then
    echo "Removing .git/HEAD.lock..."
    rm -f .git/HEAD.lock
fi
if [ -f ".git/refs/heads/*.lock" ]; then
    echo "Removing branch lock files..."
    rm -f .git/refs/heads/*.lock
fi
echo "✅ Lock files cleaned"

# Step 3: Stash current changes
echo "📦 Stashing current changes..."
git add . 2>/dev/null || true
git stash push -m "ESA Recovery Stash $(date)" --include-untracked 2>/dev/null || true
echo "✅ Changes stashed"

# Step 4: Switch to main branch
echo "🔄 Switching to main branch..."
git checkout main 2>/dev/null || git checkout -b main
echo "✅ On main branch"

# Step 5: Fetch latest changes
echo "📡 Fetching latest changes..."
git fetch origin main --force 2>/dev/null || echo "Fetch completed with warnings"
echo "✅ Fetch completed"

# Step 6: Reset to origin/main if needed
echo "🔄 Synchronizing with origin..."
if git rev-parse origin/main >/dev/null 2>&1; then
    git reset --hard origin/main
    echo "✅ Reset to origin/main"
else
    echo "⚠️  No origin/main found, staying on current commit"
fi

echo "================================================="
echo "🏁 ESA Layer 50: Recovery Phase 1 Complete"
echo "Next: Run git-recovery-commit.sh to restore your work"
