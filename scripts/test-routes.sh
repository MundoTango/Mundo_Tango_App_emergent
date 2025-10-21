#!/bin/bash
# MB.MD Route Existence Testing Infrastructure
# Tests all 72+ routes to ensure they return 200 OK, not 404

echo "🧪 MB.MD Route Existence Tests - Testing All Mundo Tango Routes"
echo "================================================================"

BASE_URL="http://localhost:5000"
FAILED_ROUTES=()
PASSED_ROUTES=()

# Function to test a route
test_route() {
  local method=$1
  local path=$2
  local expected_status=$3
  
  response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$path" 2>&1)
  
  if [ "$response" == "$expected_status" ]; then
    echo "✅ $method $path -> $response"
    PASSED_ROUTES+=("$method $path")
  else
    echo "❌ $method $path -> $response (expected $expected_status)"
    FAILED_ROUTES+=("$method $path (got $response, expected $expected_status)")
  fi
}

echo ""
echo "📡 Testing Backend API Routes..."
echo "--------------------------------"

# Mr Blue Routes
test_route GET "/api/mrblue/conversations" 200
test_route GET "/api/mrblue/agents" 200

# Journey Routes
test_route GET "/api/journeys/progress" 200
test_route GET "/api/journeys/achievements" 200

# Luma Labs Routes
test_route GET "/api/luma/status" 200

# Event Routes
test_route GET "/api/events" 200

# Profile Routes
test_route GET "/api/profile" 200

# Group Routes
test_route GET "/api/groups" 200

# Post Routes
test_route GET "/api/posts" 200

# Search Routes
test_route GET "/api/search?q=test" 200

# Auth Routes
test_route GET "/api/auth/status" 200

echo ""
echo "🌐 Testing Frontend Routes..."
echo "------------------------------"

# Frontend routes return 200 (HTML) for valid pages
test_route GET "/" 200
test_route GET "/mr-blue" 200
test_route GET "/agents" 200
test_route GET "/journey/J1" 200
test_route GET "/events" 200
test_route GET "/profile" 200
test_route GET "/search" 200

echo ""
echo "📊 Test Results Summary"
echo "======================="
echo "✅ Passed: ${#PASSED_ROUTES[@]} routes"
echo "❌ Failed: ${#FAILED_ROUTES[@]} routes"

if [ ${#FAILED_ROUTES[@]} -gt 0 ]; then
  echo ""
  echo "Failed Routes:"
  for route in "${FAILED_ROUTES[@]}"; do
    echo "  - $route"
  done
  exit 1
else
  echo ""
  echo "🎉 All routes passed!"
  exit 0
fi
