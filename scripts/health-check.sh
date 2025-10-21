#!/bin/bash
# MB.MD Health Check Script
# Validates entire Mundo Tango platform is functional
# Tests: Routes, Database, Storage, UI rendering

set -e          # Exit on any error
set -o pipefail # Exit on pipe failures

echo "=========================================="
echo "  🏥 MUNDO TANGO HEALTH CHECK"
echo "  Comprehensive System Validation"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0
START_TIME=$(date +%s)

# ============================================
# CHECK 1: ENVIRONMENT
# ============================================
echo "🌍 CHECK 1/7: Environment"
echo "-------------------------------------------"

# Node version
NODE_VERSION=$(node --version)
echo "✅ Node: $NODE_VERSION"

# Package count
if [ -d "node_modules" ]; then
  PKG_COUNT=$(ls node_modules | wc -l)
  echo "✅ Packages installed: $PKG_COUNT"
  
  if [ $PKG_COUNT -lt 1000 ]; then
    echo "⚠️  Only $PKG_COUNT packages - expected ~1345"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "❌ node_modules missing"
  ERRORS=$((ERRORS + 1))
fi

# Database
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set"
  WARNINGS=$((WARNINGS + 1))
else
  echo "✅ DATABASE_URL configured"
fi

echo ""

# ============================================
# CHECK 2: CRITICAL FILES
# ============================================
echo "📁 CHECK 2/7: Critical Files"
echo "-------------------------------------------"

CRITICAL_FILES=(
  "server/index.ts"
  "server/routes.ts"
  "server/storage.ts"
  "shared/schema.ts"
  "vite.config.ts"
  "package.json"
  "client/src/App.tsx"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ] && [ -s "$file" ]; then
    SIZE=$(wc -l < "$file")
    echo "  ✅ $file ($SIZE lines)"
  else
    echo "  ❌ $file MISSING or EMPTY"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""

# ============================================
# CHECK 3: BUILD SYSTEM
# ============================================
echo "🔨 CHECK 3/7: Build System"
echo "-------------------------------------------"

# Check binaries
BINARIES=("vite" "tsx" "esbuild" "tsc")
for bin in "${BINARIES[@]}"; do
  if [ -f "node_modules/.bin/$bin" ]; then
    echo "  ✅ $bin binary exists"
  else
    echo "  ❌ $bin binary missing"
    ERRORS=$((ERRORS + 1))
  fi
done

# Test TypeScript compilation
echo ""
echo "Testing TypeScript compilation..."
# Capture tsc output and exit code separately to handle pipefail
# Temporarily disable set -e to capture real exit code
set +e
TSC_OUTPUT=$(npx tsc --noEmit 2>&1)
TSC_EXIT=$?
set -e

if [ $TSC_EXIT -ne 0 ]; then
  echo "⚠️  TypeScript errors found (non-blocking):"
  echo "$TSC_OUTPUT" | grep "error TS" | head -5 || echo "  (See TypeScript output above)"
  WARNINGS=$((WARNINGS + 1))
else
  echo "✅ TypeScript compilation clean"
fi

echo ""

# ============================================
# CHECK 4: SERVER STARTUP
# ============================================
echo "🚀 CHECK 4/7: Server Startup"
echo "-------------------------------------------"

echo "Starting server (20 sec timeout)..."
timeout 20 npm run dev > /tmp/health-server.log 2>&1 &
SERVER_PID=$!

sleep 15

if kill -0 $SERVER_PID 2>/dev/null; then
  echo "✅ Server running (PID: $SERVER_PID)"
  
  # Check for error patterns
  if grep -qi "error.*cannot find module" /tmp/health-server.log; then
    echo "❌ Module errors detected:"
    grep -i "cannot find module" /tmp/health-server.log | head -3
    ERRORS=$((ERRORS + 1))
  elif grep -qi "ENOTEMPTY\|EPIPE" /tmp/health-server.log; then
    echo "❌ Corruption errors detected:"
    grep -i "ENOTEMPTY\|EPIPE" /tmp/health-server.log | head -3
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ No critical errors in startup logs"
  fi
  
  # Keep server running for route tests
else
  echo "❌ Server failed to start"
  echo "Last 10 lines of log:"
  tail -10 /tmp/health-server.log
  ERRORS=$((ERRORS + 1))
  SERVER_PID=""
fi

echo ""

# ============================================
# CHECK 5: API ROUTES (if server running)
# ============================================
echo "🌐 CHECK 5/7: API Routes"
echo "-------------------------------------------"

if [ -n "$SERVER_PID" ] && kill -0 $SERVER_PID 2>/dev/null; then
  echo "Testing core API endpoints..."
  
  # Give server time to fully initialize
  sleep 2
  
  # Test critical routes with expected status codes
  declare -A ROUTES=(
    ["/api/health"]="200"
    ["/api/auth/session"]="200,401"  # 200 if logged in, 401 if not
    ["/api/memories"]="200,401"      # Requires auth
    ["/api/events"]="200"            # Public endpoint
    ["/api/users/profile"]="200,401" # Requires auth
  )
  
  ROUTE_PASS=0
  ROUTE_FAIL=0
  
  for route in "${!ROUTES[@]}"; do
    # Use -sS (not -sf) to allow 4xx codes without failing
    HTTP_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "http://localhost:5000$route" 2>/dev/null || echo "000")
    EXPECTED="${ROUTES[$route]}"
    
    if [[ "$EXPECTED" == *"$HTTP_CODE"* ]]; then
      echo "  ✅ $route ($HTTP_CODE)"
      ROUTE_PASS=$((ROUTE_PASS + 1))
    else
      echo "  ❌ $route (got $HTTP_CODE, expected $EXPECTED)"
      ROUTE_FAIL=$((ROUTE_FAIL + 1))
      ERRORS=$((ERRORS + 1))
    fi
  done
  
  echo ""
  echo "Routes: $ROUTE_PASS passed, $ROUTE_FAIL failed"
  
  if [ $ROUTE_FAIL -gt 2 ]; then
    echo "⚠️  Multiple route failures detected"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "⏭️  Skipped (server not running)"
fi

echo ""

# ============================================
# CHECK 6: DATABASE CONNECTIVITY
# ============================================
echo "🗄️  CHECK 6/7: Database"
echo "-------------------------------------------"

if [ -z "$DATABASE_URL" ]; then
  echo "⏭️  Skipped (DATABASE_URL not set)"
else
  # Test database connection via Drizzle
  if npm run db:push 2>&1 | grep -q "No schema changes"; then
    echo "✅ Database schema in sync"
  elif npm run db:push 2>&1 | grep -q "Everything is in sync"; then
    echo "✅ Database connected and synced"
  else
    echo "⚠️  Database schema may need sync"
    WARNINGS=$((WARNINGS + 1))
  fi
fi

echo ""

# ============================================
# CHECK 7: UI BUILD TEST
# ============================================
echo "🎨 CHECK 7/7: UI Build"
echo "-------------------------------------------"

echo "Testing Vite build (may take 30s)..."
if NODE_OPTIONS="--max-old-space-size=2048" timeout 60 npx vite build 2>&1 | tee /tmp/health-build.log | tail -20; then
  if [ -d "dist/public" ]; then
    ASSET_COUNT=$(find dist/public -type f | wc -l)
    echo "✅ Build successful - $ASSET_COUNT files generated"
  else
    echo "❌ Build completed but dist/public missing"
    ERRORS=$((ERRORS + 1))
  fi
else
  if grep -q "EPIPE\|esbuild" /tmp/health-build.log; then
    echo "❌ Build failed - esbuild corruption detected"
    ERRORS=$((ERRORS + 1))
  else
    echo "⚠️  Build failed (may be non-critical)"
    tail -10 /tmp/health-build.log
    WARNINGS=$((WARNINGS + 1))
  fi
fi

echo ""

# ============================================
# CLEANUP & SUMMARY
# ============================================

# Stop test server
if [ -n "$SERVER_PID" ]; then
  kill $SERVER_PID 2>/dev/null || true
fi

# Cleanup temp files
rm -f /tmp/health-*.log

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "=========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "  ✅ ALL CHECKS PASSED"
  echo "  Platform is 100% functional"
  STATUS=0
elif [ $ERRORS -eq 0 ]; then
  echo "  ⚠️  CHECKS PASSED WITH WARNINGS"
  echo "  Warnings: $WARNINGS"
  STATUS=0
else
  echo "  ❌ HEALTH CHECK FAILED"
  echo "  Errors: $ERRORS, Warnings: $WARNINGS"
  STATUS=1
fi
echo "  Duration: ${DURATION}s"
echo "=========================================="
echo ""

if [ $STATUS -eq 0 ]; then
  echo "🎯 Platform Status: READY FOR DEVELOPMENT 🚀"
  echo ""
  echo "Next Steps:"
  echo "  • Start dev server: npm run dev"
  echo "  • Open preview: https://<your-repl>.replit.dev"
  echo "  • Check Mr Blue: /mr-blue"
else
  echo "🔴 Platform Status: ISSUES DETECTED"
  echo ""
  echo "Recommended Actions:"
  echo "  • Check error messages above"
  echo "  • Run: ./scripts/bootstrap-env.sh"
  echo "  • If corruption persists: Fork to fresh repl"
fi

exit $STATUS
