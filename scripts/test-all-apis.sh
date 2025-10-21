#!/bin/bash
# MB.MD Week 1 - Complete API Test Suite
# Tests all 19 endpoints with HTTP code verification

echo "================================"
echo "Mundo Tango API Health Check"
echo "Testing 19 Endpoints"
echo "================================"
echo ""

BASE="http://localhost:5000/api"
PASSED=0
FAILED=0

test_endpoint() {
  local method=$1
  local endpoint=$2
  local expected=$3
  local name=$4
  
  echo -n "Testing $name... "
  
  if [ "$method" = "GET" ]; then
    CODE=$(curl -s -w "%{http_code}" -o /dev/null "$BASE$endpoint")
  elif [ "$method" = "POST" ]; then
    CODE=$(curl -s -X POST -w "%{http_code}" -o /dev/null "$BASE$endpoint")
  fi
  
  if [ "$CODE" = "$expected" ]; then
    echo "✅ PASS ($CODE)"
    ((PASSED++))
  else
    echo "❌ FAIL (expected $expected, got $CODE)"
    ((FAILED++))
  fi
}

echo "=== EVENTS API (12 endpoints) ==="
test_endpoint "GET" "/events/upcoming" "200" "GET /events/upcoming"
test_endpoint "GET" "/events/past" "200" "GET /events/past"
test_endpoint "GET" "/events/my-events" "401" "GET /events/my-events (requires auth)"
test_endpoint "GET" "/events/attending" "401" "GET /events/attending (requires auth)"
test_endpoint "GET" "/events/hosting" "401" "GET /events/hosting (requires auth)"
test_endpoint "GET" "/events/search?q=tango" "200" "GET /events/search"
test_endpoint "GET" "/events/nearby?lat=40.7&lon=-74" "200" "GET /events/nearby"
test_endpoint "GET" "/events/by-city?city=BuenosAires" "200" "GET /events/by-city"
test_endpoint "GET" "/events/by-country?country=Argentina" "200" "GET /events/by-country"
test_endpoint "GET" "/events/calendar?month=10&year=2025" "200" "GET /events/calendar"
test_endpoint "GET" "/events/export" "200" "GET /events/export"
test_endpoint "GET" "/events" "200" "GET /events (base list)"

echo ""
echo "=== GROUPS API (3 endpoints) ==="
test_endpoint "GET" "/groups/discover" "200" "GET /groups/discover"
test_endpoint "GET" "/groups/recommendations" "200" "GET /groups/recommendations"
test_endpoint "GET" "/groups/my" "401" "GET /groups/my (requires auth)"

echo ""
echo "=== MR BLUE API (1 endpoint) ==="
test_endpoint "POST" "/mrblue/conversations" "401" "POST /mrblue/conversations (requires auth)"

echo ""
echo "=== OTHER APIS (3 endpoints) ==="
test_endpoint "GET" "/profile/elena_tango" "200" "GET /profile/:username"
test_endpoint "GET" "/notifications/unread" "401" "GET /notifications/unread (requires auth)"
test_endpoint "GET" "/auth/session" "200" "GET /auth/session"

echo ""
echo "================================"
echo "RESULTS"
echo "================================"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
TOTAL=$((PASSED + FAILED))
SCORE=$((PASSED * 100 / TOTAL))
echo "📊 Health Score: $SCORE%"
echo "================================"
