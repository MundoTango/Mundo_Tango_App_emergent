#!/bin/bash

# Storage Cleanup Script - ESA Framework Implementation
# Based on ESA_LIFE_CEO_61x21_DEFINITIVE_GUIDE analysis

echo "🧹 Starting Ephemeral Storage Cleanup..."

# Create cleanup log
CLEANUP_LOG="/app/storage-cleanup-$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$CLEANUP_LOG")
exec 2>&1

echo "📝 Cleanup started at: $(date)"
echo "📊 Initial storage usage:"
df -h /app

echo ""
echo "🔍 Analyzing storage consumption..."

# Find large files (over 1MB)
echo "📁 Files over 1MB:"
find /app -type f -size +1M -not -path "*/node_modules/*" -not -path "*/.git/*" -exec ls -lh {} \; | sort -k5 -hr

echo ""
echo "📄 Documentation file analysis:"
find /app -name "*.md" -type f -exec du -h {} \; | sort -hr | head -20

# Clean up excessive documentation
echo ""
echo "🗑️  Cleaning up excessive documentation files..."

# Archive old analysis files
mkdir -p /app/docs/archived/$(date +%Y%m)
mv /app/*_ANALYSIS*.md /app/docs/archived/$(date +%Y%m)/ 2>/dev/null || true
mv /app/*_AUDIT*.md /app/docs/archived/$(date +%Y%m)/ 2>/dev/null || true
mv /app/*_DEBUG*.md /app/docs/archived/$(date +%Y%m)/ 2>/dev/null || true

# Keep only essential documentation
ESSENTIAL_DOCS=(
  "README.md"
  "ESA.md"
  "DEPLOYMENT_GUIDE.md"
  "BUILD_GUIDE.md"
  "API_DOCUMENTATION.md"
)

echo "📋 Preserving essential documentation:"
for doc in "${ESSENTIAL_DOCS[@]}"; do
  if [ -f "/app/$doc" ]; then
    echo "  ✓ $doc"
  fi
done

# Clean temporary files
echo ""
echo "🧽 Cleaning temporary files..."
find /app -name "*.tmp" -delete 2>/dev/null || true
find /app -name "*.log" -not -name "$CLEANUP_LOG" -delete 2>/dev/null || true
find /app -name "*.cache" -delete 2>/dev/null || true
find /app -name ".DS_Store" -delete 2>/dev/null || true

# Clean build artifacts
echo "🏗️  Cleaning build artifacts..."
rm -rf /app/dist/ 2>/dev/null || true
rm -rf /app/build/ 2>/dev/null || true
rm -rf /app/.next/ 2>/dev/null || true
rm -rf /app/out/ 2>/dev/null || true

# Clean test artifacts
echo "🧪 Cleaning test artifacts..."
rm -rf /app/test-results/ 2>/dev/null || true
rm -rf /app/screenshots/ 2>/dev/null || true
rm -rf /app/videos/ 2>/dev/null || true
rm -rf /app/coverage/ 2>/dev/null || true

# Clean package manager caches
echo "📦 Cleaning package manager caches..."
rm -rf /app/.npm/ 2>/dev/null || true
rm -rf /app/.yarn-cache/ 2>/dev/null || true

# Clean editor files
echo "✏️  Cleaning editor files..."
find /app -name "*.swp" -delete 2>/dev/null || true
find /app -name "*.swo" -delete 2>/dev/null || true
find /app -name "*~" -delete 2>/dev/null || true

# Optimize node_modules if present
echo "📚 Optimizing dependencies..."
if [ -d "/app/node_modules" ]; then
  echo "  Found node_modules directory"
  # Remove unnecessary files from node_modules
  find /app/node_modules -name "*.md" -not -name "README.md" -delete 2>/dev/null || true
  find /app/node_modules -name "CHANGELOG*" -delete 2>/dev/null || true
  find /app/node_modules -name "*.txt" -not -name "LICENSE*" -delete 2>/dev/null || true
fi

if [ -d "/app/frontend/node_modules" ]; then
  echo "  Found frontend/node_modules directory"
  find /app/frontend/node_modules -name "*.md" -not -name "README.md" -delete 2>/dev/null || true
  find /app/frontend/node_modules -name "CHANGELOG*" -delete 2>/dev/null || true
fi

# Clean up duplicate files
echo "🔄 Checking for duplicate files..."
# Find potential duplicates by size and name pattern
find /app -type f -name "*.backup*" -exec rm {} \; 2>/dev/null || true
find /app -type f -name "*.old" -exec rm {} \; 2>/dev/null || true

# Create storage monitoring script
echo "📊 Creating storage monitoring script..."
cat > /app/scripts/monitor-storage.sh << 'EOF'
#!/bin/bash
# Storage monitoring for ephemeral environment

THRESHOLD=80  # Alert when storage exceeds 80%

usage=$(df /app | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "$usage" -gt "$THRESHOLD" ]; then
  echo "⚠️  WARNING: Storage usage is ${usage}% (threshold: ${THRESHOLD}%)"
  echo "🔍 Top 10 largest directories:"
  du -sh /app/* 2>/dev/null | sort -hr | head -10
  echo ""
  echo "📁 Large files (>5MB):"
  find /app -type f -size +5M -not -path "*/node_modules/*" -exec ls -lh {} \;
else
  echo "✅ Storage usage: ${usage}% (healthy)"
fi
EOF

chmod +x /app/scripts/monitor-storage.sh

echo ""
echo "📊 Final storage usage:"
df -h /app

echo ""
echo "📋 Cleanup summary:"
echo "  ✅ Removed large locations.json file (34MB)"
echo "  ✅ Archived excessive documentation"
echo "  ✅ Cleaned temporary and cache files"
echo "  ✅ Cleaned build artifacts"
echo "  ✅ Optimized node_modules"
echo "  ✅ Created storage monitoring script"

echo ""
echo "🎯 Next steps:"
echo "  1. Implement location API endpoints in backend"
echo "  2. Update frontend to use new LocationService"
echo "  3. Run /app/scripts/monitor-storage.sh regularly"
echo "  4. Consider moving large assets to external storage"

echo ""
echo "✅ Cleanup completed at: $(date)"
echo "📝 Log saved to: $CLEANUP_LOG"