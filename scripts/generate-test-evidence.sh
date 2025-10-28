#!/bin/bash

###############################################################################
# Test Evidence Bundle Generator
# 
# Generates a comprehensive evidence bundle for deployment approval:
# - Aggregates all test results
# - Collects screenshots
# - Bundles console logs
# - Includes network traces
# - Generates summary report
# 
# Output: evidence/EVIDENCE_BUNDLE_[timestamp].md
###############################################################################

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="evidence/EVIDENCE_BUNDLE_${TIMESTAMP}.md"

echo "📦 Generating Test Evidence Bundle..."

cat > "$REPORT_FILE" << EOF
# Test Evidence Bundle
**Generated**: $(date)
**Test Suite**: Mr Blue Plan/Build Modes E2E Tests

---

## Executive Summary

EOF

# Count test results
if [ -f "evidence/test-results.json" ]; then
  TOTAL_TESTS=$(jq '.suites | map(.specs | length) | add' evidence/test-results.json || echo "N/A")
  PASSED_TESTS=$(jq '[.suites[].specs[].tests[] | select(.status == "passed")] | length' evidence/test-results.json || echo "N/A")
  FAILED_TESTS=$(jq '[.suites[].specs[].tests[] | select(.status == "failed")] | length' evidence/test-results.json || echo "N/A")
  
  cat >> "$REPORT_FILE" << EOF
**Total Tests**: ${TOTAL_TESTS}
**Passed**: ✅ ${PASSED_TESTS}
**Failed**: ❌ ${FAILED_TESTS}
**Pass Rate**: $(echo "scale=2; ${PASSED_TESTS} * 100 / ${TOTAL_TESTS}" | bc || echo "N/A")%

EOF
fi

cat >> "$REPORT_FILE" << EOF
---

## Test Projects

EOF

# List test projects and their results
for project in plan-mode build-mode visual-editor auto-queue universal-save network-monitoring console-validation visual-regression error-handling mode-persistence; do
  cat >> "$REPORT_FILE" << EOF
### ${project}

EOF
done

cat >> "$REPORT_FILE" << EOF

---

## Evidence Files

### Screenshots ($(ls -1 evidence/screenshots/*.png 2>/dev/null | wc -l || echo "0") files)

\`\`\`
$(ls -lh evidence/screenshots/*.png 2>/dev/null | awk '{print $9, $5}' || echo "No screenshots")
\`\`\`

### Console Logs ($(ls -1 evidence/console-logs/*.log 2>/dev/null | wc -l || echo "0") files)

\`\`\`
$(ls -lh evidence/console-logs/*.log 2>/dev/null | awk '{print $9, $5}' || echo "No logs")
\`\`\`

### Network Traces ($(ls -1 evidence/network-traces/*.json 2>/dev/null | wc -l || echo "0") files)

\`\`\`
$(ls -lh evidence/network-traces/*.json 2>/dev/null | awk '{print $9, $5}' || echo "No traces")
\`\`\`

---

## Test Execution Details

### Environment
- Node Version: $(node --version)
- npm Version: $(npm --version)
- Playwright Version: $(npx playwright --version)
- OS: $(uname -s)
- Architecture: $(uname -m)

### Server Health
\`\`\`json
$(curl -s http://localhost:5000/api/health || echo "Server not responding")
\`\`\`

---

## Deployment Checklist

- [ ] All tests passed (100%)
- [ ] Network monitoring confirms API calls
- [ ] Console logs show expected execution flow
- [ ] Screenshots validate visual changes
- [ ] No errors in browser console
- [ ] No 400/500 HTTP errors
- [ ] Test coverage ≥ 90%
- [ ] Visual regression tests passed
- [ ] Error handling tests passed
- [ ] Architect reviewed changes

---

## Next Steps

1. Review evidence bundle
2. Fix any failing tests
3. Re-run test suite
4. Get architect approval
5. Mark tasks as complete
6. Deploy to production

---

**Report Location**: \`${REPORT_FILE}\`
**Test Report**: \`evidence/test-report/index.html\`
EOF

echo "✅ Evidence bundle generated: ${REPORT_FILE}"
echo "📖 View report: cat ${REPORT_FILE}"
