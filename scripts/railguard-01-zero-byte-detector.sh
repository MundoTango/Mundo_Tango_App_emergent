#!/bin/bash
# MB.MD Railguard #1: Zero-Byte File Detector (FIXED)
# Created: October 19, 2025
# Fixed: Subshell issue that prevented exit code from working

echo "🔍 MB.MD Railguard #1: Zero-Byte File Detection"
echo ""

# Find all zero-byte files (excluding certain directories)
zero_files=$(find . -type f -size 0 \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./dist/*" \
  -not -path "./.cache/*" \
  -not -path "./.pythonlibs/*" 2>/dev/null)

if [ -z "$zero_files" ]; then
  echo "✅ No zero-byte files detected!"
  echo ""
  exit 0
fi

# Count and categorize (FIXED: avoid subshell)
critical_count=0
docs_count=0
code_count=0
other_count=0
total_count=0

while IFS= read -r file; do
  ((total_count++))
  if [[ "$file" == *.md ]]; then
    echo "⚠️  DOC: $file"
    ((docs_count++))
  elif [[ "$file" == *.ts || "$file" == *.tsx || "$file" == *.js || "$file" == *.jsx ]]; then
    echo "❌ CODE: $file"
    ((code_count++))
  elif [[ "$file" == server/* || "$file" == client/* || "$file" == shared/* ]]; then
    echo "🚨 CRITICAL: $file"
    ((critical_count++))
  else
    echo "ℹ️  OTHER: $file"
    ((other_count++))
  fi
done <<< "$zero_files"

echo ""
echo "📊 Found $total_count zero-byte files"
echo "   Critical: $critical_count"
echo "   Documentation: $docs_count"
echo "   Code: $code_count"
echo "   Other: $other_count"
echo ""

# Block deployment if critical files are zero-byte
if [ $critical_count -gt 0 ] || [ $code_count -gt 0 ]; then
  echo "❌ DEPLOYMENT BLOCKED: Critical zero-byte files detected!"
  echo "   This usually means the write tool failed."
  echo "   Use bash commands to recreate these files."
  echo ""
  exit 1
fi

if [ $docs_count -gt 0 ]; then
  echo "⚠️  Zero-byte documentation files detected but not blocking deployment."
fi

exit 0
