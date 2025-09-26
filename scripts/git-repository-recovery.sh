
#!/bin/bash

# ESA LIFE CEO 61×21 - Layer 48/50: Git Repository Recovery Script
# Ticket: WDKP7J-PWNER

echo "🔧 ESA Layer 48: Git Repository Diagnostic Starting..."
echo "=================================================="

# Step 1: Check for zombie Git processes
echo "📊 Checking for zombie Git processes..."
ps aux | grep git | grep -v grep
if [ $? -eq 0 ]; then
    echo "⚠️  Found Git processes. Checking if any are stuck..."
fi

# Step 2: Check lock files
echo "🔒 Checking for Git lock files..."
find .git -name "*.lock" -type f
if [ -f ".git/index.lock" ]; then
    echo "❌ Found .git/index.lock"
fi
if [ -f ".git/HEAD.lock" ]; then
    echo "❌ Found .git/HEAD.lock"
fi

# Step 3: Repository status analysis
echo "📈 Repository Status Analysis..."
echo "Current branch: $(git branch --show-current)"
echo "Staged files: $(git diff --cached --name-only | wc -l)"
echo "Modified files: $(git diff --name-only | wc -l)"
echo "Untracked files: $(git ls-files --others --exclude-standard | wc -l)"

# Step 4: Check repository size and large files
echo "💾 Repository Size Analysis..."
du -sh .git
echo "Largest files in repository:"
find . -type f -size +10M | head -10

# Step 5: Check remote synchronization
echo "🌐 Remote Synchronization Check..."
git remote -v
git fetch --dry-run 2>&1 || echo "Fetch failed"
git status --porcelain | wc -l

echo "=================================================="
echo "🏁 ESA Layer 48: Diagnostic Complete"
