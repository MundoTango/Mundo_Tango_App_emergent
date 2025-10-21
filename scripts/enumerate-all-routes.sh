#!/bin/bash
# MB.MD Comprehensive Route Inventory
# Enumerates ALL 72+ routes from server/routes.ts and client/src/App.tsx

echo "📋 MB.MD Comprehensive Route Inventory"
echo "======================================"
echo ""

echo "🔧 BACKEND API ROUTES (from server/routes.ts)"
echo "----------------------------------------------"

# Extract all app.use('/api/...) patterns
grep -n "app.use('/api/" server/routes.ts | while read line; do
  route=$(echo "$line" | sed -E "s/.*app\.use\('([^']+)'.*/\1/")
  comment=$(echo "$line" | sed -E "s/.*\/\/ (.+)/\1/")
  echo "  $route - $comment"
done

echo ""
echo "🌐 FRONTEND PAGE ROUTES (from client/src/App.tsx)"
echo "------------------------------------------------"

# Extract all <Route path="..." patterns
grep -n '<Route path=' client/src/App.tsx | while read line; do
  route=$(echo "$line" | sed -E 's/.*path="([^"]+)".*/\1/')
  echo "  $route"
done

echo ""
echo "📊 ROUTE COUNT SUMMARY"
echo "======================"

backend_count=$(grep -c "app.use('/api/" server/routes.ts)
frontend_count=$(grep -c '<Route path=' client/src/App.tsx)
total=$((backend_count + frontend_count))

echo "Backend API Routes: $backend_count"
echo "Frontend Page Routes: $frontend_count"
echo "Total Routes: $total"

echo ""
echo "💾 Saving comprehensive route list to docs/ROUTE_INVENTORY.md..."

cat > docs/ROUTE_INVENTORY.md << 'EOF'
# Mundo Tango Route Inventory
**Generated**: October 21, 2025  
**Purpose**: Complete mapping of all backend API and frontend page routes

---

## Backend API Routes

EOF

grep "app.use('/api/" server/routes.ts | while read line; do
  route=$(echo "$line" | sed -E "s/.*app\.use\('([^']+)'.*/\1/")
  comment=$(echo "$line" | sed -E "s/.*\/\/ (.+)/\1/" | sed "s/.*'\);$/No description/")
  echo "- \`$route\` - $comment" >> docs/ROUTE_INVENTORY.md
done

cat >> docs/ROUTE_INVENTORY.md << 'EOF'

---

## Frontend Page Routes

EOF

grep '<Route path=' client/src/App.tsx | while read line; do
  route=$(echo "$line" | sed -E 's/.*path="([^"]+)".*/\1/')
  echo "- \`$route\`" >> docs/ROUTE_INVENTORY.md
done

cat >> docs/ROUTE_INVENTORY.md << EOF

---

## Statistics

- **Backend API Routes**: $backend_count
- **Frontend Page Routes**: $frontend_count
- **Total Routes**: $total

---

## Testing Coverage

Currently tested: 18 routes (via scripts/test-routes.sh)
Coverage: $(awk "BEGIN {printf \"%.1f%%\", (18/$total)*100}")

---

*Generated automatically by scripts/enumerate-all-routes.sh*
EOF

echo "✅ Route inventory saved to docs/ROUTE_INVENTORY.md"
echo ""
echo "Next: Update scripts/test-routes.sh to cover all $total routes"
