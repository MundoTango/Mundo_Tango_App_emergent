# Jira → Self-Hosted Project Tracker Field Mapping

**Created:** Phase 2 - Field Analysis  
**Agent #65:** Project Tracker Manager  
**Agent #2:** API Structure Specialist

---

## Field Mapping Matrix

### Epic Fields

| Jira Field | Our Database Field | Transformation |
|------------|-------------------|----------------|
| `key` | `key` | Direct copy (e.g., "MUN-5") |
| `fields.summary` | `summary` | Direct copy |
| `fields.description` | `description` | Convert ADF JSON → Plain text/Markdown |
| `fields.status.name` | `status` | Normalize: "To Do" → "to_do", "In Progress" → "in_progress", "Done" → "done" |
| `fields.priority.name` | `priority` | Lowercase: "Medium" → "medium", "High" → "high", etc. |
| `fields.labels` | `labels` | Direct copy (array) |
| `fields.created` | `createdAt` | Parse ISO timestamp |
| `fields.updated` | `updatedAt` | Parse ISO timestamp |
| `fields.reporter` | `createdById` | Map to system user (ID 1) - Jira users don't exist in our system |
| `fields.assignee` | `assignedToId` | NULL (no user mapping yet) |
| N/A | `startDate` | NULL (not in Jira export) |
| N/A | `dueDate` | NULL (not in Jira export) |
| N/A | `completedDate` | Set if status = "done" |

### Story Fields

| Jira Field | Our Database Field | Transformation |
|------------|-------------------|----------------|
| `key` | `key` | Direct copy (e.g., "MUN-6") |
| `fields.parent.key` OR `customfield_10014` | `epicId` | **Lookup epic ID by key** (e.g., "MUN-5" → find epic ID) |
| `fields.summary` | `summary` | Direct copy |
| `fields.description` | `description` | Convert ADF JSON → Plain text/Markdown |
| `fields.status.name` | `status` | Normalize: "To Do" → "to_do", etc. |
| `fields.priority.name` | `priority` | Lowercase |
| `fields.labels` | `labels` | Direct copy (array) |
| `fields.created` | `createdAt` | Parse ISO timestamp |
| `fields.updated` | `updatedAt` | Parse ISO timestamp |
| `fields.reporter` | `createdById` | Map to system user (ID 1) |
| `fields.assignee` | `assignedToId` | NULL |
| N/A | `storyPoints` | NULL (extract from summary if pattern exists) |
| N/A | `assignedAgentId` | NULL (to be assigned later) |
| N/A | `teamAgentIds` | [] (to be assigned later) |
| N/A | `codeFiles` | [] (to be added later) |

---

## Status Normalization Rules

```typescript
const statusMap: Record<string, string> = {
  'To Do': 'to_do',
  'In Progress': 'in_progress',
  'Done': 'done',
  'Cancelled': 'cancelled',
  'Blocked': 'blocked'
};
```

## Priority Normalization Rules

```typescript
const priorityMap: Record<string, string> = {
  'Lowest': 'low',
  'Low': 'low',
  'Medium': 'medium',
  'High': 'high',
  'Highest': 'critical',
  'Critical': 'critical'
};
```

## ADF to Text Conversion

Atlassian Document Format (ADF) is a JSON structure. We'll convert it to plain text:

1. Extract all text nodes recursively
2. Join with newlines for paragraphs
3. Preserve basic structure (headings, lists)
4. Strip complex formatting

Example:
```json
{
  "type": "doc",
  "content": [
    { "type": "paragraph", "content": [{ "type": "text", "text": "Deploy 7 squads..." }] }
  ]
}
```
→ `"Deploy 7 squads..."`

---

## Epic Lookup Logic

Stories reference their epic via `parent.key` (e.g., "MUN-5"). 

**Migration Order:**
1. Import all epics first (get their database IDs)
2. Create key → ID mapping: `{ "MUN-5": 1, "MUN-4": 2, ... }`
3. Import stories, looking up epicId from mapping

---

## User Mapping Strategy

Jira users (reporter, assignee) don't exist in our system yet.

**Approach:**
- Map all Jira reporters to system user (ID 1) - the admin
- Set `assignedToId = NULL` (to be assigned later)
- Store original Jira user data in story description or comments

---

## Next Steps

1. Build migration service with these transformations
2. Import epics → get ID mappings
3. Import stories with epic lookups
4. Validate data integrity
