#!/bin/bash
# MB.MD QA Protocol v1.0 - Pre-Commit Hook
# Enforces quality gates before commits
# Install: cp scripts/mb-md-pre-commit-hook.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit

CRITICAL_FILES=(
  "server/middleware/errorHandler.ts"
  "server/utils/apiResponse.ts"
  "vite.config.ts"
  "shared/schema.ts"
  "server/storage.ts"
  "server/routes.ts"
  "replit.md"
  "docs/DOCUMENTATION_MAP.md"
  "docs/PREVENTION_GUIDE.md"
  "docs/MrBlue/COMPREHENSIVE_AGENT_ONBOARDING_PROTOCOL.md"
  "scripts/agent-verification.sh"
  "scripts/verify-completion.sh"
  "scripts/install-git-hooks.sh"
  "docs/AGENT_SESSION_LOG.md"
  "docs/MB_MD_QA_PROTOCOL.md"
)

BLOCKED=0
WARNINGS=0

echo "🔍 MB.MD QA Protocol - Pre-Commit Checks"
echo "========================================"

# Check 1: Critical File Deletion
for file in "${CRITICAL_FILES[@]}"; do
  if git diff --cached --name-status | grep -q "^D.*$file"; then
    echo "❌ BLOCKED: Cannot delete critical file: $file"
    echo "   This file is required for system stability"
    echo "   If you must delete, document reason in docs/AGENT_SESSION_LOG.md"
    BLOCKED=1
  fi
done

# Check 2: Empty Files
for file in $(git diff --cached --name-only); do
  if [ -f "$file" ] && [ ! -s "$file" ]; then
    echo "❌ BLOCKED: Cannot commit empty file: $file"
    echo "   File has 0 bytes - add content or remove from commit"
    BLOCKED=1
  fi
done

# Check 3: UI Changes Require Screenshots (MB.MD Rule #3)
UI_CHANGED=0
for file in $(git diff --cached --name-only); do
  if [[ $file == *"client/src/components"* ]] || [[ $file == *"client/src/pages"* ]] || [[ $file == *".tsx" ]] || [[ $file == *".jsx" ]]; then
    UI_CHANGED=1
    break
  fi
done

if [ $UI_CHANGED -eq 1 ]; then
  SCREENSHOT_DATE=$(date +%Y-%m-%d)
  SCREENSHOT_DIR="docs/screenshots/$SCREENSHOT_DATE"
  
  if [ ! -d "$SCREENSHOT_DIR" ] || [ -z "$(ls -A $SCREENSHOT_DIR 2>/dev/null)" ]; then
    echo "⚠️  WARNING: UI changes detected but no screenshots found"
    echo "   MB.MD Rule #3: Screenshot verification is MANDATORY"
    echo "   Expected: $SCREENSHOT_DIR/*.png"
    echo "   Run: screenshot tool before committing UI changes"
    WARNINGS=1
  else
    echo "✅ Screenshots found: $SCREENSHOT_DIR"
  fi
fi

# Check 4: Task Completion Requires Architect Review (MB.MD Rule #5)
COMMIT_MSG_FILE=".git/COMMIT_EDITMSG"
if [ -f "$COMMIT_MSG_FILE" ]; then
  if grep -iq "complete\|finished\|done" "$COMMIT_MSG_FILE" 2>/dev/null; then
    ARCHITECT_LOG="docs/architect_reviews/$(date +%Y-%m-%d)_review.md"
    if [ ! -f "$ARCHITECT_LOG" ]; then
      echo "⚠️  WARNING: Commit claims completion but no architect review found"
      echo "   MB.MD Rule #5: Architect validation required before marking 'done'"
      echo "   Expected: $ARCHITECT_LOG"
      echo "   Run: architect tool with include_git_diff: true"
      WARNINGS=1
    fi
  fi
fi

# Check 5: Learning Capture (Agent #80)
if git diff --cached --name-only | grep -q "docs/AGENT_SESSION_LOG.md"; then
  echo "✅ Agent learning captured in AGENT_SESSION_LOG.md"
fi

echo ""
if [ $BLOCKED -eq 1 ]; then
  echo "❌ Pre-commit checks FAILED"
  echo "Fix critical issues above before committing"
  exit 1
fi

if [ $WARNINGS -eq 1 ]; then
  echo "⚠️  Pre-commit checks PASSED with warnings"
  echo "Consider addressing warnings above for full MB.MD compliance"
fi

if [ $BLOCKED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ All MB.MD QA checks passed"
fi

exit 0
