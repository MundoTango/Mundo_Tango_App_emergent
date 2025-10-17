#!/bin/bash
# Storage monitoring for ephemeral environment

THRESHOLD=80  # Alert when storage exceeds 80%

usage=$(df /app | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "$usage" -gt "$THRESHOLD" ]; then
  echo "⚠️  WARNING: Storage usage is ${usage}% (threshold: ${THRESHOLD}%)"
  echo "🔍 Top 10 largest directories:"
  du -sh /app/* 2>/dev/null | sort -hr | head -10
  echo ""
  echo "📁 Large files (>5MB):"
  find /app -type f -size +5M -not -path "*/node_modules/*" -exec ls -lh {} \;
else
  echo "✅ Storage usage: ${usage}% (healthy)"
fi
