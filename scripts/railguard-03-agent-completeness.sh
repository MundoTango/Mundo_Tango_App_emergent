#!/bin/bash
# MB.MD Railguard #3: Agent Category Completeness Audit  
# Created: October 19, 2025

echo "🔍 MB.MD Railguard #3: Agent Category Completeness Audit"
echo ""

# Expected 13 agent categories
categories=(
  "esa-infrastructure"
  "leadership"
  "operational"
  "life-ceo"
  "mr-blue"
  "journey-agents"
  "page-agents"
  "ui-sub-agents"
  "algorithms"
  "services"
  "app-leads"
  "marketing"
  "hire-volunteer"
)

missing_count=0

for category in "${categories[@]}"; do
  index_file="server/agents/$category/index.ts"
  if [ ! -f "$index_file" ]; then
    echo "❌ Missing: $index_file"
    ((missing_count++))
  else
    echo "✅ Found: $category/index.ts"
  fi
done

echo ""
if [ $missing_count -eq 0 ]; then
  echo "✅ All 13 agent categories have index files!"
  echo ""
  exit 0
else
  echo "⚠️  WARNING: $missing_count/${#categories[@]} agent categories missing index files"
  echo "   Agent system will only partially load."
  echo "   Not blocking deployment, but should be fixed."
  echo ""
  exit 0
fi
