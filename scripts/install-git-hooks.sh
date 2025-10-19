#!/bin/bash
# Install git pre-commit hook to prevent critical file deletions

echo "Installing MB.MD git hooks..."

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# MB.MD Pre-Commit Hook
# Prevents deletion of critical files

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
)

BLOCKED=0

# Check for deletions
for file in "${CRITICAL_FILES[@]}"; do
  if git diff --cached --name-status | grep -q "^D.*$file"; then
    echo "❌ BLOCKED: Cannot delete critical file: $file"
    echo "   This file is required for system stability"
    echo "   If you must delete, document reason in docs/AGENT_SESSION_LOG.md"
    BLOCKED=1
  fi
done

# Check for empty files being added
for file in $(git diff --cached --name-only); do
  if [ -f "$file" ] && [ ! -s "$file" ]; then
    echo "❌ BLOCKED: Cannot commit empty file: $file"
    echo "   File has 0 bytes - add content or remove from commit"
    BLOCKED=1
  fi
done

if [ $BLOCKED -eq 1 ]; then
  echo ""
  echo "Pre-commit checks FAILED"
  echo "Fix issues above before committing"
  exit 1
fi

echo "✅ Pre-commit checks passed"
exit 0
EOF

# Make hook executable
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks installed successfully"
echo ""
echo "The following files are now protected from deletion:"
echo "  - server/middleware/errorHandler.ts"
echo "  - server/utils/apiResponse.ts"
echo "  - vite.config.ts"
echo "  - shared/schema.ts"
echo "  - Other critical system files"
echo ""
echo "Empty files (0 bytes) are also blocked from commits"
