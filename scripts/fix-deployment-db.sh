#!/bin/bash
# ESA LIFE CEO 61x21 - Deployment Database Fix Script

echo "🚀 ESA LIFE CEO 61x21 - Fixing deployment database conflicts..."

# First, try to push the schema normally
echo "📊 Attempting normal schema push..."
npm run db:push

# If that fails, force the push
if [ $? -ne 0 ]; then
  echo "⚠️  Normal push failed. Using force option..."
  npm run db:push -- --force
  
  if [ $? -eq 0 ]; then
    echo "✅ Schema successfully synced with force option"
  else
    echo "❌ Force push also failed. Manual intervention required."
    echo "💡 Options:"
    echo "   1. Cancel deployment and copy development database"
    echo "   2. Manually fix the schema in production"
    exit 1
  fi
else
  echo "✅ Schema successfully synced"
fi

echo "🎉 Database ready for deployment!"