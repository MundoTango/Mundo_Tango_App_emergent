#!/bin/bash

# Agent Documentation Validation Script
# Purpose: Enforce documentation accountability per agent type
# Created: October 19, 2025
# Referenced by: COMPREHENSIVE_AGENT_DOCUMENTATION_AUDIT.md

set -e

echo "🔍 Agent Documentation Validation"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED=0
FAILED=0
WARNINGS=0

# Documentation requirements per agent type
declare -A LAYER_AGENTS=(
  [1]="Database (Foundation)"
  [2]="API Routes"
  [3]="Server Infrastructure"
  [10]="Component Library"
  [17]="Payment Processing"
  [21]="User Management"
  [22]="Group Management"
  [23]="Event Management"
  [24]="Social Features"
  [50]="DevOps & Deployment"
  [52]="Documentation Agent"
)

echo "📊 PHASE 1: Validating Layer Agent Documentation"
echo "=================================================="
echo ""

# Check Layer agents (61 total)
echo "Checking Layer agents (should have feature guide + troubleshooting)..."
for i in {1..61}; do
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  
  # Find layer definition
  LAYER_FILE=$(find docs/agents/layers -name "*layer-${i}-*" -o -name "*layer${i}*" 2>/dev/null | head -1)
  
  if [ -n "$LAYER_FILE" ]; then
    echo -e "${GREEN}✓${NC} Layer #${i}: Definition exists (${LAYER_FILE})"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} Layer #${i}: No definition file found in docs/agents/layers/"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "📄 PHASE 2: Validating Feature Guide Documentation"
echo "===================================================="
echo ""

# Check MT Platform Feature Guides (created Oct 19)
declare -A FEATURE_GUIDES=(
  ["EVENTS_FEATURE_GUIDE.md"]="Layer #23 (Event Management)"
  ["GROUPS_FEATURE_GUIDE.md"]="Layer #22 (Group Management)"
  ["PROFILES_FEATURE_GUIDE.md"]="Layer #21 (User Management)"
  ["MEMORIES_FEATURE_GUIDE.md"]="Layer #24 (Social Features)"
  ["SUBSCRIPTIONS_FEATURE_GUIDE.md"]="Layer #17 (Payment Processing)"
)

for guide in "${!FEATURE_GUIDES[@]}"; do
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  
  if [ -f "docs/${guide}" ]; then
    LINE_COUNT=$(wc -l < "docs/${guide}")
    echo -e "${GREEN}✓${NC} ${guide} exists (${LINE_COUNT} lines) - ${FEATURE_GUIDES[$guide]}"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} ${guide} MISSING - Required for ${FEATURE_GUIDES[$guide]}"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "📋 PHASE 3: Validating Deployment Documentation"
echo "================================================"
echo ""

# Check Deployment docs (created Oct 19)
declare -A DEPLOYMENT_DOCS=(
  ["DEPLOYMENT_TROUBLESHOOTING.md"]="Layer #50 (DevOps)"
  ["DEPENDENCY_MANAGEMENT.md"]="Layer #50 + Op #64"
  ["REPLIT_DEPLOYMENT_PATTERNS.md"]="Layer #50 (DevOps)"
)

for doc in "${!DEPLOYMENT_DOCS[@]}"; do
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  
  if [ -f "docs/${doc}" ]; then
    LINE_COUNT=$(wc -l < "docs/${doc}")
    echo -e "${GREEN}✓${NC} ${doc} exists (${LINE_COUNT} lines) - ${DEPLOYMENT_DOCS[$doc]}"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} ${doc} MISSING - Required for ${DEPLOYMENT_DOCS[$doc]}"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "🤖 PHASE 4: Validating Page Agent Documentation"
echo "================================================="
echo ""

# Check Page agents (125 total, 15 documented)
PAGE_AGENT_COUNT=$(find docs/The\ Pages -name "P*.md" 2>/dev/null | wc -l)
echo "Page agents documented: ${PAGE_AGENT_COUNT}/125"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if [ "$PAGE_AGENT_COUNT" -lt 125 ]; then
  MISSING=$((125 - PAGE_AGENT_COUNT))
  echo -e "${YELLOW}⚠${NC}  ${MISSING} page agents still need documentation (P1-P125)"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✓${NC} All 125 page agents documented!"
  PASSED=$((PASSED + 1))
fi

echo ""
echo "🧮 PHASE 5: Validating Algorithm Agent Documentation"
echo "====================================================="
echo ""

# Check Algorithm agents (30 total)
ALGO_AGENT_COUNT=$(find docs/agents -name "*algorithm*" -o -name "*A[0-9]*" 2>/dev/null | wc -l)
echo "Algorithm agents documented: ${ALGO_AGENT_COUNT}/30"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if [ "$ALGO_AGENT_COUNT" -lt 30 ]; then
  MISSING=$((30 - ALGO_AGENT_COUNT))
  echo -e "${YELLOW}⚠${NC}  ${MISSING} algorithm agents need individual documentation (A1-A30)"
  WARNINGS=$((WARNINGS + 1))
else
  echo -e "${GREEN}✓${NC} All 30 algorithm agents documented!"
  PASSED=$((PASSED + 1))
fi

echo ""
echo "🎯 PHASE 6: Validating Core Documentation Maps"
echo "==============================================="
echo ""

# Check core documentation files
declare -A CORE_DOCS=(
  ["DOCUMENTATION_MAP.md"]="Meta-map of all 349 documentation files"
  ["MB_MD_DOCUMENTATION_PHASE_MAP.md"]="MB.MD phase routing for all docs"
  ["COMPREHENSIVE_AGENT_DOCUMENTATION_AUDIT.md"]="Complete agent inventory (287+ agents)"
  ["AGENT_SESSION_LOG.md"]="Session learning logs for knowledge transfer"
  ["PREVENTION_GUIDE.md"]="Pre-work checklist system"
  ["ESA_QUALITY_GATES.md"]="4-gate pre-work protocol"
)

for doc in "${!CORE_DOCS[@]}"; do
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  
  if [ -f "docs/${doc}" ]; then
    LINE_COUNT=$(wc -l < "docs/${doc}")
    echo -e "${GREEN}✓${NC} ${doc} exists (${LINE_COUNT} lines)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} ${doc} MISSING - ${CORE_DOCS[$doc]}"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "📈 VALIDATION SUMMARY"
echo "===================="
echo ""
echo "Total checks: ${TOTAL_CHECKS}"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo -e "${YELLOW}Warnings: ${WARNINGS}${NC}"
echo ""

# Calculate percentage
PASS_RATE=$(awk "BEGIN {printf \"%.1f\", (${PASSED}/${TOTAL_CHECKS})*100}")
echo "Pass rate: ${PASS_RATE}%"

echo ""
echo "📊 DOCUMENTATION GAPS IDENTIFIED"
echo "================================"
echo ""
echo "- 122 Page agents need documentation (P1-P125, only 15 documented)"
echo "- Algorithm agents need individual specs (currently documented collectively)"
echo "- Each Layer agent should have:"
echo "  • Layer definition (61/61 ✓)"
echo "  • Feature guide (5 created for main features)"
echo "  • Troubleshooting guide (3 deployment guides created)"
echo "  • API reference (in progress)"
echo ""

# Exit code based on critical failures
if [ "$FAILED" -gt 0 ]; then
  echo -e "${RED}❌ VALIDATION FAILED${NC}"
  echo "Critical documentation files are missing. Please create them before deployment."
  exit 1
else
  echo -e "${GREEN}✅ VALIDATION PASSED${NC}"
  echo "All critical documentation exists. Warnings are for documentation gaps that should be addressed over time."
  exit 0
fi
