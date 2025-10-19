#!/bin/bash
# MB.MD Post-Work Verification Script
# Run this AFTER completing any task
# Implements PREVENTION_GUIDE.md lines 119-138

set -e

echo "=========================================="
echo "  MB.MD POST-WORK VERIFICATION"
echo "  Implementing PREVENTION_GUIDE.md"
echo "=========================================="
echo ""

ERRORS=0

# 1. Check for empty files (0 bytes)
echo "📄 1/5 Checking for empty files..."
EMPTY_FILES=$(find . \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -print0 | xargs -0 ls -l | awk '$5 == 0 {print $9}')

if [ -n "$EMPTY_FILES" ]; then
  echo "   ❌ Empty files detected:"
  echo "$EMPTY_FILES"
  ERRORS=$((ERRORS + 1))
else
  echo "   ✅ No empty files"
fi

# 2. Critical files still exist
echo ""
echo "📁 2/5 Verifying critical files..."
CRITICAL_FILES=(
  "server/middleware/errorHandler.ts"
  "server/utils/apiResponse.ts"
  "vite.config.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ] || [ ! -s "$file" ]; then
    echo "   ❌ CRITICAL: $file missing or empty!"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ $ERRORS -eq 0 ]; then
  echo "   ✅ Critical files intact"
fi

# 3. File content verification
echo ""
echo "📝 3/5 Verifying file modifications..."

# Check if any files were actually modified
if git diff --quiet; then
  echo "   ⚠️  WARNING: No files modified - is task actually complete?"
else
  MODIFIED=$(git diff --name-status | wc -l)
  echo "   ✅ $MODIFIED files modified"
  
  # Show what was modified
  echo ""
  echo "   Modified files:"
  git diff --name-status | head -10 | sed 's/^/      /'
fi

# 4. TypeScript/Build Check
echo ""
echo "🔨 4/5 Checking TypeScript errors..."

# Quick TypeScript check (if tsc is available)
if command -v npx &> /dev/null; then
  if npx tsc --noEmit --skipLibCheck 2>&1 | grep -q "error TS"; then
    echo "   ⚠️  TypeScript errors detected - review before completing"
    ERRORS=$((ERRORS + 1))
  else
    echo "   ✅ No TypeScript errors"
  fi
else
  echo "   ⚠️  Skipping TypeScript check (tsc not available)"
fi

# 5. Server Status
echo ""
echo "🚀 5/5 Verifying server is running..."

# Check if server process exists
if pgrep -f "npm run dev\|node.*server" > /dev/null; then
  echo "   ✅ Server process running"
  
  # Test if port 5000 is accessible
  if timeout 5 bash -c 'cat < /dev/null > /dev/tcp/localhost/5000' 2>/dev/null; then
    echo "   ✅ Port 5000 accessible"
  else
    echo "   ⚠️  Port 5000 not accessible"
  fi
else
  echo "   ⚠️  Server not running - restart before testing"
fi

# Summary
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
  echo "  ✅ POST-WORK VERIFICATION PASSED"
  echo ""
  echo "  BEFORE marking task complete:"
  echo "  ☐ Take screenshot of UI"
  echo "  ☐ Test routes from user perspective"
  echo "  ☐ Update docs/AGENT_SESSION_LOG.md"
  echo "  ☐ Commit changes to git"
  echo "=========================================="
  exit 0
else
  echo "  ❌ VERIFICATION FAILED: $ERRORS issue(s)"
  echo ""
  echo "  Fix these issues before declaring complete"
  echo "=========================================="
  exit 1
fi
