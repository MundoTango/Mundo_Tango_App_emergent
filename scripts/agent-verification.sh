#!/bin/bash
# Agent Verification Script - MB.MD Methodology
# Verifies file integrity, build health, and deployment readiness
# Created: Oct 19, 2025

set -e

echo "🔍 MB.MD Agent Verification Script"
echo "===================================="
echo ""

ERRORS=0

# Function to report errors
report_error() {
    echo "❌ FAIL: $1"
    ERRORS=$((ERRORS + 1))
}

report_success() {
    echo "✅ PASS: $1"
}

# 1. Check critical files exist
echo "📁 Phase 1: File Existence Check"
echo "--------------------------------"

CRITICAL_FILES=(
    "vite.config.ts"
    "SECURITY_FIX_OCT19_2025.md"
    "server/middleware/errorHandler.ts"
    "server/utils/apiResponse.ts"
    "package.json"
    "shared/schema.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        report_success "File exists: $file"
    else
        report_error "File missing: $file"
    fi
done

echo ""

# 2. Check files have content (not empty)
echo "📝 Phase 2: File Content Verification"
echo "-------------------------------------"

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file" 2>/dev/null || echo "0")
        if [ "$lines" -gt 5 ]; then
            report_success "$file has $lines lines"
        else
            report_error "$file has only $lines lines (possibly empty)"
        fi
    fi
done

echo ""

# 3. Check for empty documentation files recursively
echo "📚 Phase 3: Documentation Integrity Check"
echo "-----------------------------------------"

if [ -d "docs" ]; then
    EMPTY_DOCS=$(find docs -type f -name "*.md" -size -100c 2>/dev/null || echo "")
    if [ -z "$EMPTY_DOCS" ]; then
        report_success "No suspiciously small documentation files"
    else
        report_error "Found small/empty documentation files:"
        echo "$EMPTY_DOCS"
    fi
else
    report_error "docs/ directory missing"
fi

echo ""

# 4. Check build artifacts
echo "🏗️  Phase 4: Build Artifact Check"
echo "---------------------------------"

if [ -f "dist/index.js" ]; then
    size=$(stat -c%s "dist/index.js" 2>/dev/null || stat -f%z "dist/index.js" 2>/dev/null || echo "0")
    if [ "$size" -gt 10000 ]; then
        report_success "dist/index.js exists ($size bytes)"
    else
        report_error "dist/index.js too small ($size bytes)"
    fi
else
    echo "⚠️  WARN: dist/index.js not found (run npm run build)"
fi

echo ""

# 5. Check for node_modules
echo "📦 Phase 5: Dependencies Check"
echo "------------------------------"

if [ -d "node_modules" ]; then
    report_success "node_modules exists"
else
    report_error "node_modules missing (run npm install)"
fi

echo ""

# 6. Check for orphan processes on port 5000
echo "🔌 Phase 6: Port Availability Check"
echo "-----------------------------------"

PORT_USED=$(lsof -ti:5000 2>/dev/null || echo "")
if [ -z "$PORT_USED" ]; then
    report_success "Port 5000 is free"
else
    report_error "Port 5000 occupied by PID: $PORT_USED"
    echo "   Run: kill -9 $PORT_USED"
fi

echo ""

# 7. Summary
echo "📊 Verification Summary"
echo "======================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ All checks passed! System is deployment-ready."
    exit 0
else
    echo "❌ $ERRORS check(s) failed. Fix issues before deploying."
    exit 1
fi
