#!/bin/bash

# ESA LIFE CEO 61x21 - Test Runner Script
# Comprehensive test execution with coverage reporting

set -e

echo "🧪 ESA LIFE CEO 61x21 - Running Complete Test Suite"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in CI environment
if [ "$CI" = "true" ]; then
    echo "Running in CI environment"
    export NODE_ENV=test
fi

# Function to run tests with timing
run_test_suite() {
    local suite_name=$1
    local command=$2
    
    echo -e "\n${YELLOW}Running $suite_name...${NC}"
    start_time=$(date +%s)
    
    if eval $command; then
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        echo -e "${GREEN}✅ $suite_name passed (${duration}s)${NC}"
        return 0
    else
        echo -e "${RED}❌ $suite_name failed${NC}"
        return 1
    fi
}

# Clean previous coverage reports
echo "Cleaning previous coverage reports..."
rm -rf coverage .nyc_output

# Run unit tests
echo -e "\n${YELLOW}=== Unit Tests ===${NC}"

# Frontend unit tests with Jest
run_test_suite "Frontend Unit Tests (Jest)" "npm run test:unit:frontend"

# Backend unit tests with Vitest
run_test_suite "Backend Unit Tests (Vitest)" "npm run test:unit:backend"

# Run integration tests
echo -e "\n${YELLOW}=== Integration Tests ===${NC}"
run_test_suite "API Integration Tests" "npm run test:integration"

# Run E2E tests
echo -e "\n${YELLOW}=== E2E Tests ===${NC}"
if [ "$SKIP_E2E" != "true" ]; then
    run_test_suite "E2E Tests (Playwright)" "npm run test:e2e"
else
    echo "Skipping E2E tests (SKIP_E2E=true)"
fi

# Generate coverage report
echo -e "\n${YELLOW}=== Coverage Report ===${NC}"
npm run test:coverage:report

# Check coverage thresholds
echo -e "\n${YELLOW}=== Coverage Check ===${NC}"
nyc check-coverage --lines 80 --functions 80 --branches 80

# Display summary
echo -e "\n${GREEN}=================================================="
echo "✅ ESA LIFE CEO 61x21 Test Suite Complete!"
echo "==================================================${NC}"

# Open coverage report in browser (if not in CI)
if [ "$CI" != "true" ] && [ "$OPEN_COVERAGE" = "true" ]; then
    echo "Opening coverage report in browser..."
    open coverage/index.html 2>/dev/null || xdg-open coverage/index.html 2>/dev/null || echo "Please open coverage/index.html manually"
fi

exit 0