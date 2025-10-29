# Project Tracker API Documentation
**ESA Agent #64 - Auto-Generated Documentation**

## Overview
Self-hosted project tracking API for Epics, Stories, Tasks, and Sprints. Replaces Jira with internal admin center solution.

## Base URL
```
/api/tracker
```

## Authentication
All endpoints require authentication. Include session cookie or JWT token in requests.

---

## Epics

### GET /tracker/epics
Get all epics with story counts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "key": "MUN-1",
      "summary": "Build Self-Hosted Project Tracker",
      "description": "Replace Jira with internal solution",
      "status": "in_progress",
      "priority": "high",
      "labels": ["infrastructure", "self-hosted"],
      "startDate": "2025-10-01T00:00:00.000Z",
      "dueDate": "2025-10-31T00:00:00.000Z",
      "completedDate": null,
      "assignedToId": 7,
      "createdById": 1,
      "createdAt": "2025-10-10T00:00:00.000Z",
      "updatedAt": "2025-10-10T00:00:00.000Z",
      "storyCount": 5
    }
  ]
}
```

### GET /tracker/epics/:id
Get single epic with all stories.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "key": "MUN-1",
    "summary": "Build Self-Hosted Project Tracker",
    ...
    "stories": [
      {
        "id": 1,
        "key": "MUN-6",
        "summary": "Create database schema",
        ...
      }
    ]
  }
}
```

### POST /tracker/epics
Create new epic.

**Request Body:**
```json
{
  "key": "MUN-1",
  "summary": "Epic summary",
  "description": "Detailed description",
  "status": "to_do",
  "priority": "medium",
  "labels": ["tag1", "tag2"],
  "dueDate": "2025-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* epic object */ }
}
```

### PUT /tracker/epics/:id
Update epic.

**Request Body:** Partial epic object

---

## Stories

### GET /tracker/stories
Get all stories with optional filters.

**Query Parameters:**
- `epicId` (optional) - Filter by epic ID
- `sprintId` (optional) - Filter by sprint ID
- `status` (optional) - Filter by status (to_do, in_progress, done, cancelled)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "key": "MUN-6",
      "epicId": 1,
      "summary": "Create database schema",
      "description": "Design and implement tables",
      "status": "done",
      "priority": "high",
      "storyPoints": 5,
      "labels": ["database", "backend"],
      "sprintId": 1,
      "assignedToId": 7,
      "createdById": 1,
      "createdAt": "2025-10-10T00:00:00.000Z",
      "updatedAt": "2025-10-10T00:00:00.000Z"
    }
  ]
}
```

### GET /tracker/stories/:id
Get single story with tasks and comments.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "key": "MUN-6",
    ...
    "tasks": [
      {
        "id": 1,
        "storyId": 1,
        "title": "Design schema",
        "status": "done",
        ...
      }
    ],
    "comments": [
      {
        "id": 1,
        "storyId": 1,
        "userId": 7,
        "comment": "Schema looks good!",
        "userName": "Pierre Dubois",
        "createdAt": "2025-10-10T00:00:00.000Z"
      }
    ]
  }
}
```

### POST /tracker/stories
Create new story.

**Request Body:**
```json
{
  "key": "MUN-6",
  "epicId": 1,
  "summary": "Story summary",
  "description": "Detailed description",
  "status": "to_do",
  "priority": "medium",
  "storyPoints": 5,
  "sprintId": 1
}
```

### PUT /tracker/stories/:id
Update story.

### POST /tracker/stories/:id/comments
Add comment to story.

**Request Body:**
```json
{
  "comment": "Comment text here"
}
```

---

## Tasks

### POST /tracker/tasks
Create task within a story.

**Request Body:**
```json
{
  "storyId": 1,
  "title": "Task title",
  "description": "Task description",
  "status": "to_do",
  "estimatedHours": 4,
  "assignedToId": 7
}
```

### PUT /tracker/tasks/:id
Update task.

---

## Sprints

### GET /tracker/sprints
Get all sprints.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sprint 1",
      "goal": "Complete project tracker",
      "status": "active",
      "startDate": "2025-10-01T00:00:00.000Z",
      "endDate": "2025-10-14T00:00:00.000Z",
      "velocityTarget": 32,
      "actualVelocity": 28,
      "createdAt": "2025-10-01T00:00:00.000Z",
      "updatedAt": "2025-10-14T00:00:00.000Z"
    }
  ]
}
```

### POST /tracker/sprints
Create new sprint.

**Request Body:**
```json
{
  "name": "Sprint 2",
  "goal": "Sprint goal",
  "status": "planning",
  "startDate": "2025-10-15",
  "endDate": "2025-10-28",
  "velocityTarget": 30
}
```

---

## Dashboard

### GET /tracker/dashboard
Get project tracker overview metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "epics": [
      { "status": "to_do", "count": 2 },
      { "status": "in_progress", "count": 3 },
      { "status": "done", "count": 1 }
    ],
    "stories": [
      { "status": "to_do", "count": 5, "totalPoints": 25 },
      { "status": "in_progress", "count": 3, "totalPoints": 15 },
      { "status": "done", "count": 7, "totalPoints": 35 }
    ],
    "activeSprint": {
      "id": 1,
      "name": "Sprint 1",
      "status": "active",
      ...
    },
    "timestamp": "2025-10-10T12:00:00.000Z"
  }
}
```

---

## Status Enums

### Epic/Story/Task Status
- `to_do` - Not started
- `in_progress` - Currently being worked on
- `done` - Completed
- `cancelled` - Cancelled/abandoned

### Priority
- `low` - Low priority
- `medium` - Medium priority (default)
- `high` - High priority
- `critical` - Critical priority

### Sprint Status
- `planning` - Sprint being planned
- `active` - Sprint in progress
- `completed` - Sprint finished
- `cancelled` - Sprint cancelled

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## GitHub Integration

Stories can be automatically synced from GitHub issues using the prefix `GH-{issue_number}`.

**Example:** GitHub issue #123 becomes story `GH-123`

Configure GitHub sync via Agent #67 services.

---

*Generated by ESA Agent #64 - Documentation Architect*  
*Last Updated: October 10, 2025*
