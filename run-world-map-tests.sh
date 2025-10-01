#!/bin/bash

# Tango World Map Test Runner
# Runs the comprehensive Playwright test suite for the community world map page

echo "======================================"
echo "Tango World Map E2E Test Suite"
echo "======================================"
echo ""
echo "Running Playwright tests for /community-world-map page..."
echo ""

# Run the tests with detailed output
npx playwright test tests/e2e/community-world-map.spec.ts \
  --reporter=list \
  --timeout=30000 \
  --retries=0

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo "======================================"
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✓ All tests passed!"
else
  echo "✗ Some tests failed. Check the output above."
fi
echo "======================================"

# Show test report location
if [ -d "tests/e2e/playwright-report" ]; then
  echo ""
  echo "HTML Report available at: tests/e2e/playwright-report/index.html"
  echo "Run 'npx playwright show-report tests/e2e/playwright-report' to view it"
fi

exit $TEST_EXIT_CODE
