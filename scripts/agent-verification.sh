#!/bin/bash
# Mundo Tango - Agent Verification Script
# Referenced by COMMON_FAILURES_DATABASE.md
# Use by Agent #50 (DevOps) and Agent #52 (Documentation)

set -e  # Exit on any error

echo "🔍 Mundo Tango Agent Verification Script"
echo "========================================="
echo ""

FAILED=0

# Function to check result
check_result() {
  if [ $? -eq 0 ]; then
    echo "✅ $1"
  else
    echo "❌ $1"
    FAILED=$((FAILED + 1))
  fi
}

# 1. Build System Health Check
echo "1️⃣  Build System Health Check"
echo "----------------------------"

if command -v npm &> /dev/null; then
  check_result "npm command available"
else
  echo "❌ npm command not found"
  FAILED=$((FAILED + 1))
fi

if command -v node &> /dev/null; then
  check_result "node command available"
else
  echo "❌ node command not found"
  FAILED=$((FAILED + 1))
fi

if [ -f "node_modules/.bin/vite" ]; then
  check_result "Vite installed"
else
  echo "❌ Vite not installed"
  FAILED=$((FAILED + 1))
fi

if [ -f "node_modules/.bin/tsx" ]; then
  check_result "tsx installed"
else
  echo "❌ tsx not installed"
  FAILED=$((FAILED + 1))
fi

echo ""

# 2. Critical Files Check
echo "2️⃣  Critical Files Check"
echo "------------------------"

CRITICAL_FILES=(
  "vite.config.ts"
  "package.json"
  "server/index.ts"
  "client/src/main.tsx"
  "shared/schema.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    LINES=$(wc -l < "$file" 2>/dev/null || echo "0")
    if [ "$LINES" -gt 5 ]; then
      check_result "$file exists with content ($LINES lines)"
    else
      echo "❌ $file has too few lines ($LINES)"
      FAILED=$((FAILED + 1))
    fi
  else
    echo "❌ $file missing"
    FAILED=$((FAILED + 1))
  fi
done

echo ""

# 3. Documentation Integrity
echo "3️⃣  Documentation Integrity"
echo "---------------------------"

if [ -f "docs/PREVENTION_GUIDE.md" ]; then
  LINES=$(wc -l < "docs/PREVENTION_GUIDE.md")
  check_result "PREVENTION_GUIDE.md exists ($LINES lines)"
else
  echo "❌ PREVENTION_GUIDE.md missing"
  FAILED=$((FAILED + 1))
fi

if [ -f "docs/COMMON_FAILURES_DATABASE.md" ]; then
  LINES=$(wc -l < "docs/COMMON_FAILURES_DATABASE.md")
  check_result "COMMON_FAILURES_DATABASE.md exists ($LINES lines)"
else
  echo "❌ COMMON_FAILURES_DATABASE.md missing"
  FAILED=$((FAILED + 1))
fi

echo ""

# 4. Empty File Detection (UPDATED - Oct 19, 2025 - Recursive scan)
echo "4️⃣  Empty File Detection (Recursive)"
echo "-------------------------------------"

# Check for empty markdown files recursively in docs/, agents/, and root
EMPTY_FILES=$(find docs agents . -maxdepth 1 -name "*.md" -size 0 -type f 2>/dev/null; find docs -type f -name "*.md" -size 0 2>/dev/null)

if [ -z "$EMPTY_FILES" ]; then
  check_result "No empty documentation files found (recursive scan)"
else
  echo "❌ Empty documentation files detected:"
  echo "$EMPTY_FILES" | while read -r file; do
    echo "   - $file"
  done
  FAILED=$((FAILED + 1))
fi

echo ""

# 5. Build Test (if requested)
if [ "$1" == "--build-test" ]; then
  echo "5️⃣  Build Test"
  echo "--------------"
  
  if npm run build > /tmp/build-test.log 2>&1; then
    check_result "npm run build succeeds"
  else
    echo "❌ npm run build failed"
    echo "See /tmp/build-test.log for details"
    FAILED=$((FAILED + 1))
  fi
  echo ""
fi

# Summary
echo "========================================="
if [ $FAILED -eq 0 ]; then
  echo "✅ All verification checks passed!"
  exit 0
else
  echo "❌ $FAILED checks failed"
  echo ""
  echo "📚 Review docs/PREVENTION_GUIDE.md for remediation"
  exit 1
fi
