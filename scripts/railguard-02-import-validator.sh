#!/bin/bash
# MB.MD Railguard #2: Import/Route Validation
# Created: October 19, 2025

echo "🔍 MB.MD Railguard #2: Import/Route Validation"
echo ""

# Check all TypeScript imports resolve
broken_imports=0

echo "Checking route imports in server/routes.ts..."
if [ -f "server/routes.ts" ]; then
  grep -E "path: '\.\./routes/" server/routes.ts | while read line; do
    route_path=$(echo "$line" | sed "s/.*path: '\(\.\.\/routes\/[^']*\)'.*/\1/")
    full_path="server/${route_path#../}.ts"
    if [ ! -f "$full_path" ]; then
      echo "❌ Broken import: $full_path (referenced in server/routes.ts)"
      ((broken_imports++))
    fi
  done
fi

if [ $broken_imports -eq 0 ]; then
  echo "✅ All route imports validated!"
  echo ""
  exit 0
else
  echo ""
  echo "❌ DEPLOYMENT BLOCKED: $broken_imports broken imports detected!"
  echo "   Fix phantom imports before deploying."
  echo ""
  exit 1
fi
