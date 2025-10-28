#!/bin/bash

###############################################################################
# E2E Test Runner with Evidence Collection
# 
# Runs all E2E tests and generates comprehensive evidence bundle:
# - HTML test report
# - Screenshots for all visual tests
# - Console logs for each test
# - Network traces (HAR files)
# - Coverage report
# 
# Usage:
#   ./scripts/run-e2e-tests.sh              # Run all tests
#   ./scripts/run-e2e-tests.sh --headed     # Run with browser visible
#   ./scripts/run-e2e-tests.sh --debug      # Run in debug mode
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║    E2E TEST RUNNER - MR BLUE PLAN/BUILD MODES             ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create evidence directories
echo -e "${YELLOW}📁 Creating evidence directories...${NC}"
mkdir -p evidence/screenshots
mkdir -p evidence/console-logs
mkdir -p evidence/network-traces
mkdir -p evidence/test-report
mkdir -p evidence/coverage

# Clean old evidence
echo -e "${YELLOW}🧹 Cleaning old evidence...${NC}"
rm -f evidence/screenshots/*.png
rm -f evidence/console-logs/*.log
rm -f evidence/network-traces/*.json
rm -f evidence/network-traces/*.har

# Check if server is running
echo -e "${YELLOW}🔍 Checking if development server is running...${NC}"
if ! curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
  echo -e "${RED}❌ Development server is not running!${NC}"
  echo -e "${YELLOW}Please start it with: npm run dev${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"

# Run tests
echo ""
echo -e "${YELLOW}🧪 Running E2E tests...${NC}"
echo ""

# Parse arguments
ARGS="$@"
if [[ "$ARGS" == *"--headed"* ]]; then
  echo -e "${YELLOW}Running with browser visible...${NC}"
  npx playwright test -c playwright.config.e2e.ts --headed
elif [[ "$ARGS" == *"--debug"* ]]; then
  echo -e "${YELLOW}Running in debug mode...${NC}"
  npx playwright test -c playwright.config.e2e.ts --debug
else
  npx playwright test -c playwright.config.e2e.ts
fi

TEST_EXIT_CODE=$?

# Generate summary
echo ""
echo -e "${YELLOW}📊 Generating test summary...${NC}"

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
fi

# Count evidence files
SCREENSHOT_COUNT=$(ls -1 evidence/screenshots/*.png 2>/dev/null | wc -l || echo "0")
LOG_COUNT=$(ls -1 evidence/console-logs/*.log 2>/dev/null | wc -l || echo "0")
TRACE_COUNT=$(ls -1 evidence/network-traces/*.json 2>/dev/null | wc -l || echo "0")

echo ""
echo -e "${YELLOW}📦 Evidence Bundle Generated:${NC}"
echo -e "   Screenshots:   ${SCREENSHOT_COUNT} files"
echo -e "   Console Logs:  ${LOG_COUNT} files"
echo -e "   Network Traces: ${TRACE_COUNT} files"
echo -e "   Test Report:   evidence/test-report/index.html"

# Open report if tests passed
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo ""
  echo -e "${GREEN}🎉 Test suite completed successfully!${NC}"
  echo -e "${YELLOW}📖 Opening test report...${NC}"
  
  # Try to open report (works on macOS, Linux with xdg-open)
  if command -v open > /dev/null; then
    open evidence/test-report/index.html
  elif command -v xdg-open > /dev/null; then
    xdg-open evidence/test-report/index.html
  else
    echo -e "${YELLOW}Report available at: evidence/test-report/index.html${NC}"
  fi
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

exit $TEST_EXIT_CODE
