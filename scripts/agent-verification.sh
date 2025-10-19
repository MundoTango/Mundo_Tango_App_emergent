#!/bin/bash
# MB.MD Agent Pre-Work Verification Script
# Run this BEFORE starting ANY development work
# Implements PREVENTION_GUIDE.md lines 14-47

set -e  # Exit on any error

echo "=========================================="
echo "  MB.MD PRE-WORK VERIFICATION"
echo "  Implementing PREVENTION_GUIDE.md"
echo "=========================================="
echo ""

ERRORS=0

# 1. Critical Files Check
echo "📁 1/5 Checking critical files..."
CRITICAL_FILES=(
  "server/middleware/errorHandler.ts"
  "server/utils/apiResponse.ts"
  "vite.config.ts"
  "shared/schema.ts"
  "server/storage.ts"
  "server/routes.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "   ❌ CRITICAL: $file is MISSING!"
    echo "      Restore from git: git show a22010c:$file > $file"
    ERRORS=$((ERRORS + 1))
  elif [ ! -s "$file" ]; then
    echo "   ❌ CRITICAL: $file is EMPTY (0 bytes)!"
    echo "      Restore from git: git show a22010c:$file > $file"
    ERRORS=$((ERRORS + 1))
  else
    SIZE=$(wc -l < "$file")
    echo "   ✅ $file ($SIZE lines)"
  fi
done

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo "❌ STOP: $ERRORS critical file(s) missing or empty"
  echo "   Fix files before proceeding"
  exit 1
fi

# 1.5. Vite Port Configuration Check (CRITICAL FOR UI WORK)
echo ""
echo "⚙️  1.5/5 Checking vite.config.ts port configuration..."

if ! grep -q "port: 5000" vite.config.ts; then
  echo "   ❌ CRITICAL: vite.config.ts port is NOT set to 5000!"
  echo "      Current setting:"
  grep -n "port:" vite.config.ts || echo "      (port not found in config)"
  echo ""
  echo "   ⚠️  Port mismatch prevents UI from loading in iframe preview"
  echo "   Fix: Edit vite.config.ts line ~7 to: server: { port: 5000, host: '0.0.0.0' }"
  echo ""
  echo "   📚 See: docs/MB_MD_DOCUMENTATION_PHASE_MAP.md (Frontend Build Configuration)"
  ERRORS=$((ERRORS + 1))
else
  echo "   ✅ Vite port correctly set to 5000"
fi

if [ $ERRORS -gt 0 ]; then
  echo ""
  echo "❌ STOP: Vite configuration error - fix before proceeding"
  exit 1
fi

# 2. Build System Health
echo ""
echo "🔨 2/5 Checking build system..."

# Check node_modules exists
if [ ! -d "node_modules" ]; then
  echo "   ❌ node_modules missing - run npm install first"
  exit 1
fi

# Check critical build tools
if [ ! -f "node_modules/.bin/vite" ]; then
  echo "   ❌ Vite not installed"
  ERRORS=$((ERRORS + 1))
fi

if [ ! -f "node_modules/.bin/tsx" ]; then
  echo "   ❌ tsx not installed"
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -gt 0 ]; then
  echo "   ❌ Build tools missing - run: npm install"
  exit 1
fi

echo "   ✅ Build system OK"

# 3. Package Verification
echo ""
echo "📦 3/5 Verifying critical packages..."
PACKAGES="vite tsx esbuild typescript drizzle-orm"

npm list $PACKAGES --depth=0 2>&1 | grep -q "UNMET" && {
  echo "   ❌ Missing dependencies detected"
  echo "   Run: npm install"
  exit 1
}

echo "   ✅ Packages OK"

# 4. Server Test
echo ""
echo "🚀 4/5 Testing server startup..."

# Start server in background and capture output
timeout 15 npm run dev > /tmp/server-test.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 8

# Check if process still running
if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "   ❌ Server exited early - check logs:"
  tail -20 /tmp/server-test.log
  exit 1
fi

# Check for successful startup message
if grep -q "running on port 5000\|Server running" /tmp/server-test.log; then
  echo "   ✅ Server starts successfully"
  kill $SERVER_PID 2>/dev/null || true
else
  echo "   ❌ Server started but no success message found"
  echo "   Last 10 lines of log:"
  tail -10 /tmp/server-test.log
  kill $SERVER_PID 2>/dev/null || true
  exit 1
fi

# Cleanup
rm -f /tmp/server-test.log

echo ""
echo "=========================================="
echo "  ✅ ALL PRE-WORK CHECKS PASSED"
echo "  Safe to proceed with development"
echo "=========================================="
echo ""

# 5. MB.MD Phase Detection and Documentation Routing
echo "📘 5/5 MB.MD Documentation Routing..."
echo ""
echo "Which MB.MD phase are you starting?"
echo "  1) MAPPING - Understanding system/dependencies"
echo "  2) BREAKDOWN - Decomposing work into tasks"
echo "  3) MITIGATION - Implementing with error prevention"
echo "  4) DEPLOYMENT - Validating production readiness"
echo ""
echo "Enter phase number (1-4) or press Enter to skip:"
read -t 10 PHASE_CHOICE || PHASE_CHOICE=""

case "$PHASE_CHOICE" in
  1)
    echo ""
    echo "📖 MAPPING PHASE - Required Reading:"
    echo "   ✅ docs/MB_MD_DOCUMENTATION_PHASE_MAP.md (MAPPING section)"
    echo "   ✅ docs/ESA_QUALITY_GATES.md (Gates 1-2)"
    echo "   ✅ docs/DOCUMENTATION_MAP.md (find your component docs)"
    echo "   ✅ replit.md (current system state)"
    echo ""
    echo "Task-Specific Docs (choose based on your work):"
    echo "   • Building UI page? Read H2AC pattern + page agent docs"
    echo "   • Building API? Read layer-2 + API contracts"
    echo "   • Building payment? Read layer-17 + payment-endpoints.yaml"
    echo "   • Modifying agents? Read agent layer docs + hierarchy"
    ;;
  2)
    echo ""
    echo "🔨 BREAKDOWN PHASE - Required Reading:"
    echo "   ✅ docs/MB_MD_DOCUMENTATION_PHASE_MAP.md (BREAKDOWN section)"
    echo ""
    echo "Choose decomposition methodology:"
    echo "   • UI work? docs/The Pages/H2AC_EXECUTIVE_SUMMARY.md"
    echo "   • Backend work? docs/40x20s-framework.md"
    echo "   • Algorithm work? docs/MrBlue/ALGORITHM_AGENTS_MBMD_PLAN.md"
    echo "   • Parallel execution? docs/MrBlue/mb-master-plan-v4.md"
    ;;
  3)
    echo ""
    echo "🛡️ MITIGATION PHASE - Required Reading:"
    echo "   ✅ docs/PREVENTION_GUIDE.md (Pre-work checklist - MANDATORY)"
    echo "   ✅ docs/AGENT_SESSION_LOG.md (What previous agents learned)"
    echo "   ✅ docs/CRITICAL_FAILURE_ANALYSIS.md (If you see errors)"
    echo "   ✅ docs/MB_MD_DOCUMENTATION_PHASE_MAP.md (MITIGATION section)"
    echo ""
    echo "Component-Specific Prevention:"
    echo "   • UI work? Check dark-mode-fixes.md, translation-fixes.md"
    echo "   • Routing? Check mb-routing-fix-summary.md"
    echo "   • Database? Check DB_FIX_COMPLETE.md, DB_PERFORMANCE_FIX.md"
    ;;
  4)
    echo ""
    echo "✅ DEPLOYMENT PHASE - Required Reading:"
    echo "   ✅ docs/ESA_QUALITY_GATES.md (Gates 3-4)"
    echo "   ✅ docs/LAUNCH_CHECKLIST.md"
    echo "   ✅ docs/MB_MD_DOCUMENTATION_PHASE_MAP.md (DEPLOYMENT section)"
    echo ""
    echo "Quality Validation:"
    echo "   • UI work? Read VISUAL_QUALITY_SCORECARD + visual testing"
    echo "   • API work? Read API audit reports + integration tests"
    echo "   • Full feature? Read component audit reports"
    echo ""
    echo "Before claiming 'DONE':"
    echo "   1. Run scripts/verify-completion.sh"
    echo "   2. Check relevant audit reports for quality standards"
    echo "   3. Update docs/AGENT_SESSION_LOG.md with learnings"
    ;;
  *)
    echo ""
    echo "⏭️  Phase selection skipped"
    echo ""
    echo "📚 Default Required Reading:"
    echo "   1. docs/PREVENTION_GUIDE.md (lines 14-47) - MANDATORY"
    echo "   2. replit.md (current project state)"
    echo "   3. docs/MB_MD_DOCUMENTATION_PHASE_MAP.md (task-based routing)"
    ;;
esac

echo ""
echo "🔗 Full Documentation Reference:"
echo "   docs/MB_MD_DOCUMENTATION_PHASE_MAP.md - Phase-based routing"
echo "   docs/DOCUMENTATION_MAP.md - Component-based routing"
echo ""
