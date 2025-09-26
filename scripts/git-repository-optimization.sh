
#!/bin/bash

# ESA LIFE CEO 61×21 - Layer 48: Repository Performance Optimization

echo "⚡ ESA Layer 48: Repository Optimization..."
echo "========================================="

# Step 1: Git garbage collection
echo "🗑️  Running Git garbage collection..."
git gc --aggressive --prune=now
echo "✅ Garbage collection complete"

# Step 2: Repack repository
echo "📦 Repacking repository..."
git repack -Ad
echo "✅ Repository repacked"

# Step 3: Clean up loose objects
echo "🧹 Cleaning loose objects..."
git prune
echo "✅ Loose objects cleaned"

# Step 4: Optimize Git configuration for performance
echo "⚙️  Optimizing Git configuration..."
git config core.preloadindex true
git config core.fscache true
git config gc.auto 256
echo "✅ Git configuration optimized"

# Step 5: Add performance monitoring
echo "📊 Setting up performance monitoring..."
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# ESA Layer 48: Performance monitoring hook
start_time=$(date +%s)
echo "🔍 ESA Layer 48: Pre-commit performance check..."

# Check commit size
files=$(git diff --cached --name-only | wc -l)
if [ $files -gt 100 ]; then
    echo "⚠️  Large commit detected: $files files"
    echo "Consider splitting into smaller commits"
fi

end_time=$(date +%s)
duration=$((end_time - start_time))
echo "✅ Pre-commit check completed in ${duration}s"
EOF

chmod +x .git/hooks/pre-commit
echo "✅ Performance monitoring hooks installed"

echo "========================================="
echo "🏁 ESA Layer 48: Optimization Complete"
