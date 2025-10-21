#!/bin/bash
# MB.MD Bootstrap Environment Script
# Rebuilds entire Mundo Tango environment from scratch in <5 minutes
# Use after: fresh repl fork, storage corruption, catastrophic failure

set -e          # Exit on any error
set -o pipefail # Exit on pipe failures (critical for tee usage)

echo "=========================================="
echo "  🚀 MUNDO TANGO BOOTSTRAP"
echo "  5-Minute Environment Rebuild"
echo "=========================================="
echo ""

START_TIME=$(date +%s)
ERRORS=0

# ============================================
# PHASE 1: PRE-FLIGHT CHECKS
# ============================================
echo "📋 PHASE 1/5: Pre-flight Checks"
echo "-------------------------------------------"

# Check we're in correct directory
if [ ! -f "package.json" ]; then
  echo "❌ ERROR: Must run from project root (package.json not found)"
  exit 1
fi

# Check git status
if [ ! -d ".git" ]; then
  echo "❌ ERROR: Not a git repository - clone your branch first!"
  exit 1
fi

BRANCH=$(git branch --show-current)
echo "✅ Git branch: $BRANCH"

# Check Node version
NODE_VERSION=$(node --version)
echo "✅ Node version: $NODE_VERSION"

# Check for corruption indicators
shopt -s nullglob
NPM_LOGS=($HOME/.npm/_logs/*-debug-*.log)
if [ ${#NPM_LOGS[@]} -gt 0 ]; then
  if grep -q "ENOTEMPTY" "${NPM_LOGS[@]}" 2>/dev/null; then
    echo "⚠️  Previous corruption detected - will clean thoroughly"
  fi
fi

echo "✅ Phase 1 complete"
echo ""

# ============================================
# PHASE 2: CLEAN SLATE
# ============================================
echo "🧹 PHASE 2/5: Deep Clean"
echo "-------------------------------------------"

# Remove corrupted artifacts
echo "Removing node_modules..."
rm -rf node_modules || true

echo "Removing package-lock.json..."
rm -f package-lock.json || true

echo "Removing build artifacts..."
rm -rf dist || true
rm -rf .vite || true
rm -rf client/dist || true

echo "Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Kill any zombie processes
pkill -f "node.*tsx" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo "✅ Phase 2 complete - clean slate achieved"
echo ""

# ============================================
# PHASE 3: DEPENDENCY INSTALLATION
# ============================================
echo "📦 PHASE 3/5: Installing Dependencies"
echo "-------------------------------------------"

echo "Running npm install (this may take 2-3 minutes)..."
echo ""

# Fresh install with progress
if npm install 2>&1 | tee /tmp/bootstrap-npm-install.log; then
  PACKAGE_COUNT=$(ls node_modules | wc -l)
  echo ""
  echo "✅ Installed $PACKAGE_COUNT packages successfully"
else
  echo ""
  echo "❌ npm install failed - checking for ENOTEMPTY..."
  if grep -q "ENOTEMPTY" /tmp/bootstrap-npm-install.log; then
    echo ""
    echo "🔴 CRITICAL: Storage corruption persists!"
    echo "This means the Replit storage layer is corrupted."
    echo ""
    echo "SOLUTION: Fork to a fresh repl:"
    echo "  1. Click the 3 dots on this repl"
    echo "  2. Select 'Fork Repl'"
    echo "  3. In the new repl, run this script again"
    echo ""
    echo "Your code is safe in git - you just need fresh storage."
  fi
  exit 1
fi

# Verify critical packages
echo ""
echo "Verifying critical packages..."
CRITICAL_PACKAGES=(
  "express"
  "vite"
  "tsx"
  "esbuild"
  "typescript"
  "drizzle-orm"
  "react"
)

for pkg in "${CRITICAL_PACKAGES[@]}"; do
  if [ -d "node_modules/$pkg" ]; then
    echo "  ✅ $pkg"
  else
    echo "  ❌ $pkg MISSING"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo "❌ $ERRORS critical packages missing - install incomplete"
  exit 1
fi

echo "✅ Phase 3 complete"
echo ""

# ============================================
# PHASE 4: DATABASE SETUP
# ============================================
echo "🗄️  PHASE 4/5: Database Setup"
echo "-------------------------------------------"

# Check if DATABASE_URL exists
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set - skipping database setup"
  echo "   Set DATABASE_URL environment variable to enable database"
else
  echo "✅ DATABASE_URL found"
  
  # Push schema to database
  echo "Pushing schema to database..."
  if npm run db:push --force 2>&1 | tee /tmp/bootstrap-db-push.log; then
    echo "✅ Database schema synced"
  else
    if grep -q "data loss" /tmp/bootstrap-db-push.log; then
      echo "⚠️  Schema changes may cause data loss - using --force"
      npm run db:push -- --force || {
        echo "❌ Database push failed - check logs above"
        ERRORS=$((ERRORS + 1))
      }
    else
      echo "❌ Database push failed"
      ERRORS=$((ERRORS + 1))
    fi
  fi
fi

echo "✅ Phase 4 complete"
echo ""

# ============================================
# PHASE 5: HEALTH CHECK
# ============================================
echo "🏥 PHASE 5/5: Health Check"
echo "-------------------------------------------"

# Test server startup
echo "Testing server startup (15 sec timeout)..."
timeout 15 npm run dev > /tmp/bootstrap-server-test.log 2>&1 &
SERVER_PID=$!

sleep 10

if kill -0 $SERVER_PID 2>/dev/null; then
  echo "✅ Server starts successfully"
  kill $SERVER_PID 2>/dev/null || true
  
  # Check for common errors in logs
  if grep -q "Error\|error\|ERROR" /tmp/bootstrap-server-test.log 2>/dev/null; then
    echo "⚠️  Errors found in server logs (may be non-critical):"
    grep -i "error" /tmp/bootstrap-server-test.log | head -5
  fi
else
  echo "❌ Server failed to start - check logs:"
  tail -20 /tmp/bootstrap-server-test.log
  ERRORS=$((ERRORS + 1))
fi

# Cleanup test files
rm -f /tmp/bootstrap-*.log

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
  echo "  ✅ BOOTSTRAP COMPLETE"
  echo "  Time: ${DURATION}s"
  echo "=========================================="
  echo ""
  echo "🎯 Next Steps:"
  echo "  1. Start dev server: npm run dev"
  echo "  2. Run health check: ./scripts/health-check.sh"
  echo "  3. Check app at: https://<your-repl>.replit.dev"
  echo ""
  echo "Environment ready for development! 🚀"
  exit 0
else
  echo "  ❌ BOOTSTRAP FAILED"
  echo "  Time: ${DURATION}s"
  echo "  Errors: $ERRORS"
  echo "=========================================="
  echo ""
  echo "🔴 Critical failures detected:"
  echo "  • Review error messages above"
  echo "  • If ENOTEMPTY errors persist → Fork repl (storage corruption)"
  echo "  • If database errors → Check DATABASE_URL is set"
  echo "  • If server errors → Check logs for missing dependencies"
  echo ""
  echo "See: docs/RECOVERY_PLAYBOOK.md for troubleshooting"
  exit 1  # Exit with error code to stop MB.MD workflow
fi
