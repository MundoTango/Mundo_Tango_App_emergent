#!/bin/bash

# Memory Pressure Prevention Script
# Addresses the real cause: 8GB container memory limit + cache explosion

echo "🧠 Memory Pressure Prevention - ESA Framework Implementation"

# Check current memory status
echo "📊 Current memory status:"
free -h
echo "Container memory limit: 8GB"
echo ""

# Check cache sizes
echo "💾 Cache analysis:"
echo "UV Cache: $(du -sh /root/.cache/uv 2>/dev/null || echo '0B')"
echo "Code-server Cache: $(du -sh /root/.cache/code-server 2>/dev/null || echo '0B')"
echo "Total Cache: $(du -sh /root/.cache 2>/dev/null || echo '0B')"
echo ""

# Clean aggressive caches if they exceed thresholds
UV_CACHE_SIZE=$(du -sb /root/.cache/uv 2>/dev/null | cut -f1 || echo 0)
CODESERVER_CACHE_SIZE=$(du -sb /root/.cache/code-server 2>/dev/null | cut -f1 || echo 0)
THRESHOLD=104857600  # 100MB threshold for 8GB container

echo "🧹 Cache cleanup (threshold: 100MB):"

if [ "$UV_CACHE_SIZE" -gt "$THRESHOLD" ]; then
  echo "  🗑️  Cleaning UV cache ($(echo $UV_CACHE_SIZE | numfmt --to=iec-i)B)"
  rm -rf /root/.cache/uv/archive-v0/* 2>/dev/null || true
  rm -rf /root/.cache/uv/built-wheels-v0/* 2>/dev/null || true
  echo "  ✅ UV cache cleaned"
else
  echo "  ✅ UV cache OK ($(echo $UV_CACHE_SIZE | numfmt --to=iec-i)B)"
fi

if [ "$CODESERVER_CACHE_SIZE" -gt "$THRESHOLD" ]; then
  echo "  🗑️  Cleaning code-server cache ($(echo $CODESERVER_CACHE_SIZE | numfmt --to=iec-i)B)"
  rm -rf /root/.cache/code-server/logs/* 2>/dev/null || true
  rm -rf /root/.cache/code-server/coder-logs/* 2>/dev/null || true
  echo "  ✅ Code-server cache cleaned"
else
  echo "  ✅ Code-server cache OK ($(echo $CODESERVER_CACHE_SIZE | numfmt --to=iec-i)B)"
fi

# Clean other system caches
echo "  🧽 Cleaning system caches..."
# Clear package manager caches
apt-get clean 2>/dev/null || true
pip cache purge 2>/dev/null || true
yarn cache clean 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

# Clear temporary files that consume memory
find /tmp -type f -atime +1 -delete 2>/dev/null || true
find /var/tmp -type f -atime +1 -delete 2>/dev/null || true

echo ""
echo "📊 Post-cleanup memory status:"
free -h
echo "Total Cache: $(du -sh /root/.cache 2>/dev/null || echo '0B')"

# Check for memory pressure indicators
MEMORY_AVAILABLE=$(free | awk 'NR==2{printf "%.1f", $7/1024/1024}')
MEMORY_USED_PCT=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')

echo ""
echo "🎯 Memory analysis:"
echo "  Available: ${MEMORY_AVAILABLE}GB"
echo "  Used: ${MEMORY_USED_PCT}%"

if (( $(echo "$MEMORY_USED_PCT > 70" | bc -l) )); then
  echo "  ⚠️  High memory usage detected (${MEMORY_USED_PCT}%)"
  echo "  💡 Consider restarting services to free memory"
else
  echo "  ✅ Memory usage healthy (${MEMORY_USED_PCT}%)"
fi

echo ""
echo "✅ Memory pressure prevention completed"