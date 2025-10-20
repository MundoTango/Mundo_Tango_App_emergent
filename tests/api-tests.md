# API Test Suite - Mundo Tango
## Manual Testing Checklist for 21 Endpoints

**Last Updated:** October 20, 2025  
**Testing Tool:** Thunder Client / Postman / curl  
**Base URL:** `http://localhost:5000/api`

---

## 🎯 Testing Strategy

### Phase 1: Event API (7 endpoints)
### Phase 2: Profile API (6 endpoints)  
### Phase 3: Groups API (8 endpoints)

For each endpoint:
1. ✅ Test success case
2. ✅ Test validation errors
3. ✅ Test authentication
4. ✅ Test authorization
5. ✅ Document request/response

---

## 🎫 Event API Tests

### Test 1.1: Create Event - Success Case
**Endpoint:** `POST /api/events`  
**Auth:** Required  
**Status:** ⏸️ Pending

**Request:**
```json
POST /api/events
Content-Type: application/json
Cookie: connect.sid=<session>

{
  "title": "Test Milonga Night",
  "description": "Test event for API validation",
  "eventType": "milonga",
  "startDate": "2025-12-01T20:00:00Z",
  "endDate": "2025-12-02T02:00:00Z",
  "city": "Buenos Aires",
  "country": "Argentina",
  "venue": "Test Venue",
  "price": 500,
  "currency": "ARS",
  "maxAttendees": 100
}
```

**Expected Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": <number>,
    "title": "Test Milonga Night",
    "eventType": "milonga",
    "attendeeCount": 0
  }
}
```

**Verification:**
- [ ] Status code is 201
- [ ] Response includes event ID
- [ ] Response includes all required fields
- [ ] Event appears in GET /api/events

---

### Test 1.2: Create Event - Validation Errors
**Endpoint:** `POST /api/events`  
**Status:** ⏸️ Pending

**Test Cases:**
1. Missing title → 400 Bad Request
2. Invalid eventType → 400 Bad Request
3. Past startDate → 400 Bad Request
4. endDate before startDate → 400 Bad Request
5. Negative price → 400 Bad Request

**Example Request:**
```json
POST /api/events
{
  "title": "A",
  "eventType": "invalid",
  "startDate": "2020-01-01T00:00:00Z"
}
```

**Expected:** `400 Bad Request` with validation details

---

### Test 1.3: Get All Events - Success
**Endpoint:** `GET /api/events`  
**Auth:** Optional  
**Status:** ⏸️ Pending

**Request:**
```
GET /api/events
```

**Expected Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Event 1",
      "eventType": "milonga",
      "city": "Buenos Aires"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

**Verification:**
- [ ] Returns array of events
- [ ] Includes pagination info
- [ ] Events sorted by date (newest first)

---

### Test 1.4: Get Event by ID - Success
**Endpoint:** `GET /api/events/:id`  
**Status:** ⏸️ Pending

**Request:**
```
GET /api/events/1
```

**Expected:** `200 OK` with full event details

---

### Test 1.5: Get Event by ID - Not Found
**Endpoint:** `GET /api/events/:id`  
**Status:** ⏸️ Pending

**Request:**
```
GET /api/events/99999
```

**Expected:** `404 Not Found`
```json
{
  "error": "Event not found"
}
```

---

### Test 1.6: Update Event - Success
**Endpoint:** `PATCH /api/events/:id`  
**Auth:** Required (owner/admin)  
**Status:** ⏸️ Pending

**Request:**
```json
PATCH /api/events/1
{
  "title": "Updated Title",
  "price": 600
}
```

**Expected:** `200 OK` with updated event

**Verification:**
- [ ] Only provided fields updated
- [ ] Other fields unchanged
- [ ] updatedAt timestamp changed

---

### Test 1.7: Update Event - Unauthorized
**Endpoint:** `PATCH /api/events/:id`  
**Status:** ⏸️ Pending

**Request:** Attempt to update another user's event

**Expected:** `403 Forbidden`

---

### Test 1.8: Delete Event - Success
**Endpoint:** `DELETE /api/events/:id`  
**Auth:** Required (owner/admin)  
**Status:** ⏸️ Pending

**Request:**
```
DELETE /api/events/1
```

**Expected:** `200 OK`
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Verification:**
- [ ] Event no longer appears in GET /api/events
- [ ] GET /api/events/1 returns 404

---

### Test 1.9: RSVP to Event - Going
**Endpoint:** `POST /api/events/:id/rsvp`  
**Auth:** Required  
**Status:** ⏸️ Pending

**Request:**
```json
POST /api/events/1/rsvp
{
  "status": "going"
}
```

**Expected:** `200 OK`
```json
{
  "success": true,
  "data": {
    "eventId": 1,
    "userId": 45,
    "status": "going",
    "attendeeCount": 46
  }
}
```

**Verification:**
- [ ] attendeeCount increased
- [ ] RSVP appears in user's events

---

### Test 1.10: RSVP to Event - Event Full
**Endpoint:** `POST /api/events/:id/rsvp`  
**Status:** ⏸️ Pending

**Scenario:** Event at maxAttendees capacity

**Expected:** `409 Conflict`
```json
{
  "error": "Event is at maximum capacity"
}
```

---

### Test 1.11: Search Events - Success
**Endpoint:** `GET /api/events/search`  
**Status:** ⏸️ Pending

**Request:**
```
GET /api/events/search?q=tango&city=Buenos Aires&maxPrice=1000
```

**Expected:** `200 OK` with filtered results

**Verification:**
- [ ] Results match search query
- [ ] Results filtered by city
- [ ] Results filtered by price
- [ ] Results sorted by relevance

---

## 📊 Event API Test Summary

**Total Tests:** 11  
**Passed:** 0  
**Failed:** 0  
**Pending:** 11

---

## 👤 Profile API Tests

### Test 2.1: Get User Profile - Success
**Endpoint:** `GET /api/profiles/:id`  
**Status:** ⏸️ Pending

**Request:**
```
GET /api/profiles/1
```

**Expected:** `200 OK` with user profile

---

### Test 2.2: Get User Profile - Not Found
**Endpoint:** `GET /api/profiles/:id`  
**Status:** ⏸️ Pending

**Request:**
```
GET /api/profiles/99999
```

**Expected:** `404 Not Found`

---

### Test 2.3: Update Profile - Success
**Endpoint:** `PATCH /api/profiles/:id`  
**Auth:** Required (own profile)  
**Status:** ⏸️ Pending

**Request:**
```json
PATCH /api/profiles/1
{
  "bio": "Updated bio text",
  "city": "New York",
  "leaderLevel": 10
}
```

**Expected:** `200 OK` with updated profile

---

### Test 2.4: Update Profile - Unauthorized
**Endpoint:** `PATCH /api/profiles/:id`  
**Status:** ⏸️ Pending

**Scenario:** Attempt to update another user's profile

**Expected:** `403 Forbidden`

---

### Test 2.5: Follow User - Success
**Endpoint:** `POST /api/profiles/:id/follow`  
**Auth:** Required  
**Status:** ⏸️ Pending

**Request:**
```
POST /api/profiles/2/follow
```

**Expected:** `200 OK`
```json
{
  "success": true,
  "data": {
    "followerId": 1,
    "followingId": 2,
    "isFollowing": true
  }
}
```

---

### Test 2.6: Unfollow User - Success
**Endpoint:** `DELETE /api/profiles/:id/follow`  
**Auth:** Required  
**Status:** ⏸️ Pending

**Request:**
```
DELETE /api/profiles/2/follow
```

**Expected:** `200 OK` with isFollowing: false

---

### Test 2.7: Get Profile Stats - Success
**Endpoint:** `GET /api/profiles/:id/stats`  
**Status:** ⏸️ Pending

**Request:**
```
GET /api/profiles/1/stats
```

**Expected:** `200 OK` with detailed stats

---

### Test 2.8: Search Profiles - Success
**Endpoint:** `GET /api/profiles/search`  
**Status:** ⏸️ Pending

**Request:**
```
GET /api/profiles/search?q=elena&city=Buenos Aires
```

**Expected:** `200 OK` with matching profiles

---

## 📊 Profile API Test Summary

**Total Tests:** 8  
**Passed:** 0  
**Failed:** 0  
**Pending:** 8

---

## 👥 Groups API Tests

### Test 3.1: Create Group - Success
**Endpoint:** `POST /api/groups`  
**Auth:** Required  
**Status:** ⏸️ Pending

**Request:**
```json
POST /api/groups
{
  "name": "Test Tango Group",
  "description": "Test group for API validation",
  "city": "New York",
  "country": "USA",
  "isPublic": true
}
```

**Expected:** `201 Created`

---

### Test 3.2: Get All Groups - Success
**Endpoint:** `GET /api/groups`  
**Status:** ⏸️ Pending

**Request:**
```
GET /api/groups
```

**Expected:** `200 OK` with array of groups

---

### Test 3.3: Get Group by ID - Success
**Endpoint:** `GET /api/groups/:id`  
**Status:** ⏸️ Pending

**Request:**
```
GET /api/groups/1
```

**Expected:** `200 OK` with group details

---

### Test 3.4: Join Group - Success
**Endpoint:** `POST /api/groups/:id/join`  
**Auth:** Required  
**Status:** ⏸️ Pending

**Request:**
```
POST /api/groups/1/join
```

**Expected:** `200 OK` with memberCount increased

---

### Test 3.5: Leave Group - Success
**Endpoint:** `POST /api/groups/:id/leave`  
**Auth:** Required  
**Status:** ⏸️ Pending

**Request:**
```
POST /api/groups/1/leave
```

**Expected:** `200 OK` with memberCount decreased

---

### Test 3.6: Get Group Members
**Endpoint:** `GET /api/groups/:id/members`  
**Status:** ⏸️ Pending

**Request:**
```
GET /api/groups/1/members
```

**Expected:** `200 OK` with array of members

---

### Test 3.7: Get Group Posts
**Endpoint:** `GET /api/groups/:id/posts`  
**Status:** ⏸️ Pending

**Request:**
```
GET /api/groups/1/posts
```

**Expected:** `200 OK` with array of posts

---

### Test 3.8: Get Group Events
**Endpoint:** `GET /api/groups/:id/events`  
**Status:** ⏸️ Pending

**Request:**
```
GET /api/groups/1/events
```

**Expected:** `200 OK` with array of events

---

## 📊 Groups API Test Summary

**Total Tests:** 8  
**Passed:** 0  
**Failed:** 0  
**Pending:** 8

---

## 🎯 OVERALL TEST SUMMARY

**Total API Endpoints:** 21  
**Total Test Cases:** 27  
**Tests Passed:** 0  
**Tests Failed:** 0  
**Tests Pending:** 27

**Progress:** 0% (Ready to start!)

---

## 🔧 Testing Tools

### Thunder Client (VS Code Extension)
1. Install Thunder Client extension
2. Import collection from this file
3. Run tests sequentially
4. Document results

### Postman
1. Create new collection "Mundo Tango APIs"
2. Add 21 endpoints with test cases
3. Use environment variables for base URL
4. Export collection when complete

### curl Commands
```bash
# Test Event API
curl -X GET http://localhost:5000/api/events

# Test with auth (replace with actual session)
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=<session>" \
  -d '{"title":"Test Event","eventType":"milonga",...}'
```

---

## 📝 Test Execution Log

### Session 1 - [Date]
- [ ] Event API (7 endpoints)
- [ ] Profile API (6 endpoints)
- [ ] Groups API (8 endpoints)

**Notes:**
- _Add observations, bugs found, edge cases discovered_

---

**Test Suite Created:** October 20, 2025  
**Next Steps:** Execute tests, document results, file bugs
