#!/bin/bash
# Mundo Tango - Install pre-commit hook
# Run this to install the pre-commit hook that prevents empty documentation files

HOOK_DIR=".git/hooks"
HOOK_FILE="$HOOK_DIR/pre-commit"

if [ ! -d "$HOOK_DIR" ]; then
  echo "❌ Error: .git/hooks directory not found"
  echo "   Make sure you're in the project root directory"
  exit 1
fi

cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash
# Mundo Tango - Pre-commit hook to prevent empty documentation files
# Installed: Oct 19, 2025

set -e

echo "🔍 Checking for empty markdown files..."

# Find all staged .md files
STAGED_MD_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.md$' || true)

if [ -z "$STAGED_MD_FILES" ]; then
  exit 0
fi

EMPTY_FILES_FOUND=0

for file in $STAGED_MD_FILES; do
  if [ -f "$file" ] && [ ! -s "$file" ]; then
    echo "❌ ERROR: Empty markdown file detected: $file"
    echo "   Please add content before committing."
    EMPTY_FILES_FOUND=1
  fi
done

if [ $EMPTY_FILES_FOUND -eq 1 ]; then
  echo ""
  echo "🚫 Commit blocked: Empty documentation files are not allowed."
  echo "   Add content to the files above and try again."
  exit 1
fi

echo "✅ No empty markdown files found"
exit 0
EOF

chmod +x "$HOOK_FILE"

echo "✅ Pre-commit hook installed successfully"
echo "   Location: $HOOK_FILE"
echo ""
echo "The hook will prevent committing empty .md files"
