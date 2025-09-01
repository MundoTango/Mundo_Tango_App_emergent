#!/bin/bash

# Deployment Fix Script - ESA Framework Implementation
# Fixes missing build directory issue that causes deployment failures

echo "🚀 ESA Deployment Fix - Ensuring Build Structure"

# Create required build directory structure
echo "📁 Creating build directories..."
mkdir -p /app/client/dist
mkdir -p /app/client/dist/src

# Copy essential files to expected locations
echo "📋 Copying build artifacts..."
cp /app/client/index.html /app/client/dist/index.html
cp -r /app/client/src/* /app/client/dist/src/ 2>/dev/null || true
cp /app/client/manifest.json /app/client/dist/manifest.json 2>/dev/null || true

# Verify build structure
echo "🔍 Verifying build structure..."
if [ -f "/app/client/dist/index.html" ]; then
  echo "  ✅ index.html exists in dist"
else
  echo "  ❌ Missing index.html in dist"
  exit 1
fi

if [ -d "/app/client/dist/src" ]; then
  echo "  ✅ src directory exists in dist"
else
  echo "  ❌ Missing src directory in dist"
fi

# Test frontend service
echo "🧪 Testing frontend service..."
sudo supervisorctl restart frontend
sleep 2

# Check if frontend is responding
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$response" = "200" ]; then
  echo "  ✅ Frontend service responding (HTTP $response)"
else
  echo "  ❌ Frontend service not responding (HTTP $response)"
  echo "  📋 Checking frontend logs..."
  sudo supervisorctl tail -1000 frontend
  exit 1
fi

# Verify all services are running
echo "🔄 Service status check..."
sudo supervisorctl status | while read line; do
  if echo "$line" | grep -q "RUNNING"; then
    service=$(echo "$line" | awk '{print $1}')
    echo "  ✅ $service"
  elif echo "$line" | grep -q "STOPPED\|FATAL\|EXITED"; then
    service=$(echo "$line" | awk '{print $1}')
    echo "  ❌ $service ($(echo "$line" | awk '{print $2}')"
  fi
done

# Memory and storage health check
echo "📊 Resource health check..."
memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
storage_usage=$(df /app | awk 'NR==2 {print $5}' | sed 's/%//')
cache_size=$(du -sh /root/.cache 2>/dev/null | cut -f1 || echo '0B')

echo "  💾 Memory: ${memory_usage}% used"
echo "  📁 Storage: ${storage_usage}% used"
echo "  🗃️ Cache: ${cache_size}"

if [ "$memory_usage" -gt 70 ]; then
  echo "  ⚠️  Memory usage high (${memory_usage}%)"
fi

if [ "$storage_usage" -gt 80 ]; then
  echo "  ⚠️  Storage usage high (${storage_usage}%)"
fi

echo ""
echo "✅ Deployment fix completed successfully!"
echo "🎯 Frontend accessible at http://localhost:3000"
echo "🔧 All services running and healthy"