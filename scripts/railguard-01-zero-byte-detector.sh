#!/bin/bash
# MB.MD Railguard #1: Zero-Byte File Detector (Optimized)
# Created: October 19, 2025

echo "🔍 MB.MD Railguard #1: Zero-Byte File Detection"
echo ""

# Only check critical directories (faster)
critical_dirs=("server" "client" "shared" "scripts")
critical_count=0
total_found=0

for dir in "${critical_dirs[@]}"; do
  if [ -d "$dir" ]; then
    while IFS= read -r file; do
      if [ -n "$file" ]; then
        ((total_found++))
        if [[ "$file" == *.ts || "$file" == *.tsx || "$file" == *.js || "$file" == *.jsx || "$file" == *.json ]]; then
          echo "❌ CRITICAL: $file"
          ((critical_count++))
        else
          echo "⚠️  FOUND: $file"
        fi
      fi
    done < <(find "$dir" -type f -size 0 2>/dev/null)
  fi
done

echo ""
if [ $total_found -eq 0 ]; then
  echo "✅ No zero-byte files in critical directories!"
  exit 0
fi

echo "📊 Found $total_found zero-byte files ($critical_count critical)"
echo ""

if [ $critical_count -gt 0 ]; then
  echo "❌ DEPLOYMENT BLOCKED: Critical zero-byte files detected!"
  echo "   Use bash commands to recreate these files."
  exit 1
fi

echo "⚠️  Non-critical zero-byte files found but not blocking deployment."
exit 0
