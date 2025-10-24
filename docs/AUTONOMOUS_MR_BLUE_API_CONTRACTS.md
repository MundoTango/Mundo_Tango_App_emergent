# Autonomous Mr Blue - API Contracts

Complete API documentation for all 12 autonomous endpoints across 5 phases.

## Security Model

All autonomous endpoints are protected by:
- **Authentication**: `isAuthenticated` middleware (JWT required)
- **Rate Limiting**: 10 requests/minute per user
- **Path Traversal Prevention**: `sanitizeFilePath()` validates all file operations stay within repository root
- **Command Injection Prevention**: Allowlist + metacharacter detection + `shell:false` mode
- **Timeout Enforcement**: Max 2 minutes for terminal commands, max 20 iterations for autonomous loops

---

## Phase 2: Code Reading APIs

### 1. Read File
**Endpoint**: `POST /api/mrblue/autonomous/read-file`

**Request Body**:
```json
{
  "filePath": "client/src/App.tsx"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "path": "client/src/App.tsx",
    "content": "...",
    "language": "typescript",
    "lineCount": 142,
    "syntax": {
      "isValid": true,
      "errors": []
    }
  }
}
```

---

### 2. Search Codebase
**Endpoint**: `POST /api/mrblue/autonomous/search-codebase`

**Request Body**:
```json
{
  "query": "function createUser",
  "filePattern": "**/*.ts"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "query": "function createUser",
    "totalMatches": 3,
    "files": [
      {
        "path": "server/routes/users.ts",
        "matches": [
          {
            "line": 42,
            "content": "export async function createUser(data: UserData) {",
            "context": "..."
          }
        ]
      }
    ]
  }
}
```

---

### 3. Analyze Component
**Endpoint**: `POST /api/mrblue/autonomous/analyze-component`

**Request Body**:
```json
{
  "filePath": "client/src/components/UserCard.tsx",
  "componentName": "UserCard"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "component": {
      "name": "UserCard",
      "type": "function",
      "props": ["user", "onEdit", "onDelete"],
      "state": [],
      "hooks": ["useState", "useEffect"],
      "dependencies": ["react", "@/components/ui/card"]
    }
  }
}
```

---

## Phase 3: Code Writing APIs

### 4. Write File
**Endpoint**: `POST /api/mrblue/autonomous/write-file`

**Request Body**:
```json
{
  "filePath": "client/src/utils/helper.ts",
  "content": "export function formatDate(date: Date) { return date.toISOString(); }"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "path": "client/src/utils/helper.ts",
    "bytesWritten": 68,
    "backup": "/path/to/backup-1234567890.ts",
    "validation": {
      "typescript": { "valid": true, "errors": [] },
      "eslint": { "valid": true, "warnings": [] }
    }
  }
}
```

---

### 5. Preview Diff
**Endpoint**: `POST /api/mrblue/autonomous/preview-diff`

**Request Body**:
```json
{
  "filePath": "client/src/App.tsx",
  "newContent": "..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "path": "client/src/App.tsx",
    "isNewFile": false,
    "diff": "--- a/client/src/App.tsx\n+++ b/client/src/App.tsx\n@@ -1,5 +1,5 @@\n-  const [count, setCount] = useState(0);\n+  const [count, setCount] = useState(10);",
    "stats": {
      "addedLines": 1,
      "removedLines": 1,
      "totalChanges": 2
    }
  }
}
```

---

### 6. Batch Write
**Endpoint**: `POST /api/mrblue/autonomous/batch-write`

**Request Body**:
```json
{
  "changes": [
    {
      "filePath": "client/src/components/UserCard.tsx",
      "content": "..."
    },
    {
      "filePath": "client/src/components/UserList.tsx",
      "content": "..."
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "filesWritten": 2,
    "totalFiles": 2,
    "results": [
      { "path": "client/src/components/UserCard.tsx", "success": true },
      { "path": "client/src/components/UserList.tsx", "success": true }
    ]
  }
}
```

**Behavior**: Atomic operation with automatic rollback on any failure.

---

## Phase 4: Testing APIs

### 7. Execute Command
**Endpoint**: `POST /api/mrblue/autonomous/execute-command`

**Request Body**:
```json
{
  "command": "npm run test",
  "timeout": 30000,
  "cwd": "/path/to/project"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "command": "npm run test",
    "stdout": "All tests passed!",
    "stderr": "",
    "exitCode": 0,
    "duration": 2341
  }
}
```

**Allowed Commands**: `ls`, `cat`, `grep`, `find`, `echo`, `npm`, `node`, `git`, `python`, `npx`, `pnpm`, `yarn`, `tsx`, `tsc`

**Safety**: 
- Commands validated against allowlist
- Shell metacharacters blocked (`;&|`$()<>`)
- `shell:false` mode prevents injection
- Max timeout: 120 seconds

---

### 8. Test Change
**Endpoint**: `POST /api/mrblue/autonomous/test-change`

**Request Body**:
```json
{
  "url": "http://localhost:5000",
  "actionScript": "await page.click('[data-testid=\"button-submit\"]');"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "screenshot": "data:image/png;base64,...",
    "passed": true,
    "errors": [],
    "consoleErrors": []
  }
}
```

---

### 9. Analyze Error
**Endpoint**: `POST /api/mrblue/autonomous/analyze-error`

**Request Body**:
```json
{
  "errorMessage": "TypeError: Cannot read property 'name' of undefined",
  "context": "file: UserCard.tsx, line: 42"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "errorType": "TypeError",
    "severity": "high",
    "suggestedFixes": [
      "Add optional chaining: user?.name",
      "Add null check: if (user) { ... }",
      "Provide default value: user?.name || 'Unknown'"
    ],
    "affectedFiles": ["client/src/components/UserCard.tsx"]
  }
}
```

---

## Phase 5: Safety & Checkpoint APIs

### 10. Create Checkpoint
**Endpoint**: `POST /api/mrblue/autonomous/create-checkpoint`

**Request Body**:
```json
{
  "description": "Before refactoring UserCard component",
  "includeDatabase": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "mrblue-1698765432000",
    "description": "Before refactoring UserCard component",
    "timestamp": "2024-10-24T01:37:12.000Z",
    "gitCommit": "a1b2c3d",
    "files": ["client/src/components/UserCard.tsx"],
    "dbSnapshot": null
  }
}
```

**Behavior**: Creates Git commit with checkpoint ID, optionally backs up database.

---

### 11. Rollback
**Endpoint**: `POST /api/mrblue/autonomous/rollback`

**Request Body**:
```json
{
  "checkpointId": "mrblue-1698765432000",
  "includeDatabase": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "checkpointId": "mrblue-1698765432000",
    "filesRestored": 1,
    "databaseRestored": false
  }
}
```

---

### 12. Request Approval
**Endpoint**: `POST /api/mrblue/autonomous/request-approval`

**Request Body**:
```json
{
  "action": "Delete authentication system",
  "description": "Remove all auth-related files and database tables",
  "risk": "high",
  "affectedFiles": ["server/auth.ts", "server/middleware/auth.ts"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "requestId": "approval-1698765432000",
    "status": "pending",
    "expiresAt": "2024-10-24T01:42:12.000Z"
  }
}
```

**Risk Levels**: `low`, `medium`, `high`

---

## Phase 6: Orchestration Engine

### 13. Autonomous Execute
**Endpoint**: `POST /api/mrblue/autonomous/execute`

**Request Body**:
```json
{
  "task": "Refactor UserCard component to use Tailwind instead of inline styles",
  "maxIterations": 5,
  "requireApproval": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "taskId": "auto-1698765432000",
    "status": "running",
    "message": "Autonomous execution started. Monitor progress via WebSocket."
  }
}
```

**Safety**:
- Max iterations capped at 20 (prevents infinite loops)
- Creates checkpoint before each major change
- Requires approval for high-risk operations
- Automatic retry on transient errors

---

### 14. Get Status
**Endpoint**: `GET /api/mrblue/autonomous/status/:taskId`

**Response**:
```json
{
  "success": true,
  "data": {
    "taskId": "auto-1698765432000",
    "status": "reading",
    "iterations": 2,
    "maxIterations": 5,
    "startTime": "2024-10-24T01:37:12.000Z",
    "steps": [
      {
        "id": "step-1",
        "action": "Read UserCard.tsx",
        "status": "completed",
        "startTime": "2024-10-24T01:37:12.000Z",
        "endTime": "2024-10-24T01:37:13.000Z"
      },
      {
        "id": "step-2",
        "action": "Analyze inline styles",
        "status": "running",
        "startTime": "2024-10-24T01:37:14.000Z"
      }
    ]
  }
}
```

---

## Rate Limiting

All endpoints share a single rate limit pool:
- **Limit**: 10 requests per minute per user
- **Headers**: 
  - `X-RateLimit-Limit`: Total allowed requests
  - `X-RateLimit-Remaining`: Remaining requests in window
  - `X-RateLimit-Reset`: Timestamp when limit resets
- **429 Response**: `{ "success": false, "error": "Too many autonomous requests", "retryAfter": 45 }`

---

## Error Handling

All endpoints follow consistent error format:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

**Common Status Codes**:
- `200`: Success
- `400`: Invalid request body
- `401`: Unauthorized (no JWT)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `429`: Rate limit exceeded
- `500`: Internal server error

---

## Usage Example: Complete Autonomous Workflow

```typescript
// 1. Enable autonomous mode
const { taskId } = await fetch('/api/mrblue/autonomous/execute', {
  method: 'POST',
  body: JSON.stringify({
    task: 'Add dark mode support to UserCard component',
    maxIterations: 10,
    requireApproval: true
  })
});

// 2. Monitor progress
const interval = setInterval(async () => {
  const status = await fetch(`/api/mrblue/autonomous/status/${taskId}`);
  const { data } = await status.json();
  
  console.log(`Status: ${data.status}, Iteration: ${data.iterations}/${data.maxIterations}`);
  
  if (data.status === 'completed') {
    clearInterval(interval);
  }
}, 1000);

// 3. Handle approval requests (via WebSocket)
socket.on('approval-required', (request) => {
  // Show approval modal to user
  showApprovalModal(request);
});

// 4. If something goes wrong, rollback
await fetch('/api/mrblue/autonomous/rollback', {
  method: 'POST',
  body: JSON.stringify({
    checkpointId: 'mrblue-1698765432000',
    includeDatabase: false
  })
});
```

---

## Security Best Practices

1. **Never bypass path validation** - Always use `sanitizeFilePath()` for file operations
2. **Never trust user input** - Validate all request bodies with strong typing
3. **Command allowlist only** - Never add `rm`, `sudo`, or destructive commands to allowlist
4. **Rate limit all endpoints** - Prevent resource abuse and DOS attacks
5. **Create checkpoints frequently** - Enable safe rollback after any error
6. **Require approval for destructive actions** - Delete, drop, truncate operations must be approved
7. **Log all autonomous actions** - Maintain audit trail for debugging and accountability

---

## Future Enhancements

- [ ] **Persistent audit log** - Store all actions in PostgreSQL for long-term tracking
- [ ] **WebSocket progress updates** - Real-time status streaming instead of polling
- [ ] **Smart retry logic** - Exponential backoff for transient errors
- [ ] **Cost estimation** - Show token usage before executing expensive operations
- [ ] **Batch approval** - Approve multiple related changes at once
- [ ] **Undo/Redo stack** - Navigate through checkpoint history like Git
- [ ] **Diff-based learning** - AI learns from approved/rejected changes over time
