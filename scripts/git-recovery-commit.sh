
#!/bin/bash

# ESA LIFE CEO 61×21 - Layer 50: Safe Commit Recovery
# Handles large file sets with chunked commits

echo "📝 ESA Layer 50: Starting Commit Recovery..."
echo "============================================"

# Step 1: Restore stashed changes
echo "📦 Restoring stashed changes..."
if git stash list | grep -q "ESA Recovery Stash"; then
    git stash pop || git stash apply
    echo "✅ Stash restored"
else
    echo "⚠️  No ESA recovery stash found"
fi

# Step 2: Handle attached_assets separately (large files)
echo "📁 Managing large assets..."
if [ -d "attached_assets" ]; then
    echo "Moving attached_assets to separate location..."
    mv attached_assets attached_assets_temp
    
    # Add to .gitignore if not already there
    if ! grep -q "attached_assets/" .gitignore 2>/dev/null; then
        echo "attached_assets/" >> .gitignore
        echo "✅ Added attached_assets to .gitignore"
    fi
fi

# Step 3: Commit in chunks to avoid large commit issues
echo "🔄 Committing changes in chunks..."

# Chunk 1: Core application files
echo "Committing core application files..."
git add client/src server shared *.md *.json *.js *.ts 2>/dev/null || true
git commit -m "ESA Recovery: Core application files

- Updated client-side components
- Server-side improvements
- Configuration updates
- Documentation updates

Ticket: WDKP7J-PWNER" 2>/dev/null || echo "Core files already committed"

# Chunk 2: Configuration and build files
echo "Committing configuration files..."
git add .github scripts docs tests 2>/dev/null || true
git commit -m "ESA Recovery: Configuration and tooling

- GitHub workflows
- Build scripts
- Documentation
- Test configurations

Ticket: WDKP7J-PWNER" 2>/dev/null || echo "Config files already committed"

# Chunk 3: Remaining files (smaller batch)
echo "Committing remaining files..."
git add . 2>/dev/null || true
git commit -m "ESA Recovery: Final updates

- Remaining project files
- ESA Layer 50 recovery complete

Ticket: WDKP7J-PWNER" 2>/dev/null || echo "Remaining files already committed"

echo "============================================"
echo "🏁 ESA Layer 50: Commit Recovery Complete"
