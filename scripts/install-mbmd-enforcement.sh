#!/bin/bash
# Install MB.MD Enforcement Mechanisms
# Phase 1A: ENFORCEMENT - Makes quality mandatory, not optional

echo "🔧 Installing MB.MD QA Protocol Enforcement..."
echo ""

# Install pre-commit hook
echo "1. Installing pre-commit hook..."
cp scripts/mb-md-pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
echo "   ✅ Pre-commit hook installed"

# Create screenshot directories
echo "2. Creating screenshot directories..."
mkdir -p docs/screenshots/$(date +%Y-%m-%d)
mkdir -p docs/architect_reviews
echo "   ✅ Screenshot directories created"

# Create enforcement checklist
echo "3. Creating MB.MD enforcement checklist..."
cat > docs/MB_MD_ENFORCEMENT_CHECKLIST.md << 'EOF'
# MB.MD Enforcement Checklist

## Before Starting Any Task

- [ ] Read AGENT_SESSION_LOG.md for latest learnings
- [ ] Read MB_MD_QA_PROTOCOL.md for quality rules
- [ ] Understand the 5 Non-Negotiable Rules
- [ ] Know which Agent # you are working as

## During Development

### Rule 1: VERIFY BEFORE BUILD
- [ ] Read existing files first
- [ ] Search for similar implementations
- [ ] Check documentation for existing solutions
- [ ] Verify routes/imports/integrations

### Rule 2: INTEGRATE IMMEDIATELY
- [ ] Import component in parent file
- [ ] Add to JSX render tree
- [ ] Wire up props/state
- [ ] Test import resolves

### Rule 3: SCREENSHOT EVERYTHING
- [ ] Take screenshot after UI changes
- [ ] Capture light mode
- [ ] Capture dark mode
- [ ] Test mobile (375px)
- [ ] Save to docs/screenshots/YYYY-MM-DD/

### Rule 4: TEST USER JOURNEY
- [ ] Navigate via actual UI (not URL bar)
- [ ] Test all interactions
- [ ] Verify different user roles
- [ ] Check error handling

### Rule 5: ARCHITECT VALIDATES
- [ ] Call architect tool with full git diff
- [ ] Include all modified files
- [ ] Fix issues before proceeding
- [ ] Get approval before marking "done"

## Before Marking Task Complete

- [ ] All 5 rules completed
- [ ] Screenshots captured and saved
- [ ] Architect review completed
- [ ] User journey validated
- [ ] Learning captured in AGENT_SESSION_LOG.md

## Pre-Commit Verification

- [ ] Run: git add .
- [ ] Pre-commit hook runs automatically
- [ ] All checks pass (no ❌ blockers)
- [ ] Commit proceeds
EOF

echo "   ✅ Enforcement checklist created"

echo ""
echo "✅ MB.MD Enforcement Installation Complete!"
echo ""
echo "Installed:"
echo "  - Pre-commit hook (.git/hooks/pre-commit)"
echo "  - Screenshot directories (docs/screenshots/)"
echo "  - Architect review directory (docs/architect_reviews/)"
echo "  - Enforcement checklist (docs/MB_MD_ENFORCEMENT_CHECKLIST.md)"
echo ""
echo "Next: All agents must follow MB_MD_ENFORCEMENT_CHECKLIST.md"
