# Autonomous Mr Blue - Usage Examples

Real-world code snippets showing common autonomous workflows.

## Example 1: Simple Text Change

**Goal**: Update button text autonomously

```typescript
// User enables autonomous mode
const { autonomousExecute } = useAutonomousMode();

// Send request
const result = await autonomousExecute.mutateAsync({
  task: 'Change the submit button text from "Submit" to "Send Now"',
  maxIterations: 5,
  requireApproval: false // Low risk
});

// Mr Blue autonomously:
// 1. Searches codebase for submit button
// 2. Reads component file
// 3. Creates checkpoint
// 4. Updates button text
// 5. Tests change (screenshot validation)
// 6. Commits change
```

---

## Example 2: Component Refactor

**Goal**: Extract reusable component from inline code

```typescript
const { autonomousExecute } = useAutonomousMode();

const result = await autonomousExecute.mutateAsync({
  task: 'Extract the user card UI into a reusable UserCard component',
  maxIterations: 10,
  requireApproval: true // Medium risk
});

// Mr Blue autonomously:
// 1. Analyzes current UserList.tsx file
// 2. Identifies repeated card UI pattern
// 3. Creates checkpoint  
// 4. Creates new UserCard.tsx component
// 5. Extracts props interface
// 6. Updates UserList.tsx to import UserCard
// 7. Runs TypeScript validation
// 8. Tests UI doesn't break (screenshot)
// 9. Requests approval (shows diff)
// 10. After approval, commits changes
```

---

## Example 3: Add Dark Mode

**Goal**: Autonomously add dark mode support

```typescript
const { autonomousExecute } = useAutonomousMode();

const result = await autonomousExecute.mutateAsync({
  task: 'Add dark mode support to all components using Tailwind dark: variants',
  maxIterations: 20,
  requireApproval: true
});

// Mr Blue autonomously:
// 1. Searches for all component files
// 2. Reads ThemeProvider to understand dark mode setup
// 3. Creates checkpoint
// 4. For each component:
//    a. Read component file
//    b. Add dark: variants to className strings
//    c. Write updated file
//    d. Test component renders correctly
// 5. Batch write all changes atomically
// 6. Run full test suite
// 7. Request approval with diff preview
// 8. After approval, commit
```

---

## Example 4: Fix TypeScript Errors

**Goal**: Autonomously fix all TypeScript errors

```typescript
const { autonomousExecute } = useAutonomousMode();

const result = await autonomousExecute.mutateAsync({
  task: 'Fix all TypeScript errors in the codebase',
  maxIterations: 15,
  requireApproval: true
});

// Mr Blue autonomously:
// 1. Executes: npx tsc --noEmit
// 2. Parses error output
// 3. For each error:
//    a. Read file with error
//    b. Analyze error (analyze-error API)
//    c. Apply suggested fix
//    d. Validate TypeScript still compiles
// 4. If errors remain, iterate (max 15 times)
// 5. Request approval if changes > 50 lines
// 6. Commit fixes
```

---

## Example 5: Error Recovery with Retry

**Goal**: Handle syntax errors and retry

```typescript
const { autonomousExecute } = useAutonomousMode();

const result = await autonomousExecute.mutateAsync({
  task: 'Add input validation to the signup form',
  maxIterations: 10,
  requireApproval: false
});

// Scenario: Mr Blue makes a syntax error
// 1. Writes new validation code
// 2. Runs npm run build
// 3. Build fails (syntax error detected)
// 4. Analyzes error: "Unexpected token )"
// 5. Reads file again
// 6. Identifies missing parenthesis
// 7. Fixes syntax
// 8. Re-runs build
// 9. Build succeeds ✅
// 10. Commits change
```

---

## Example 6: Rollback After Mistake

**Goal**: Rollback to checkpoint after autonomous change breaks app

```typescript
const { createCheckpoint, rollback } = useAutonomousMode();

// Before autonomous work
const checkpoint = await createCheckpoint.mutateAsync({
  description: 'Before adding authentication',
  includeDatabase: false
});

// Autonomous work happens...
// App breaks!

// Rollback
await rollback.mutateAsync({
  checkpointId: checkpoint.data.id,
  includeDatabase: false
});

// App restored to working state ✅
```

---

## Example 7: Approval Workflow

**Goal**: Require approval for destructive operation

```typescript
const { autonomousExecute } = useAutonomousMode();

// Start autonomous task
autonomousExecute.mutate({
  task: 'Delete all deprecated API endpoints',
  maxIterations: 5,
  requireApproval: true // MUST approve
});

// Listen for approval requests (via WebSocket or state)
socket.on('approval-required', (request) => {
  // Show modal with:
  // - Risk level: HIGH
  // - Files affected: 12
  // - Diff preview
  
  if (userClicksApprove()) {
    fetch('/api/mrblue/autonomous/approve/' + request.id, {
      method: 'POST'
    });
  } else {
    // Reject - task cancelled
    fetch('/api/mrblue/autonomous/reject/' + request.id, {
      method: 'POST'
    });
  }
});
```

---

## Example 8: Real-Time Progress Monitoring

**Goal**: Show live progress to user

```typescript
const [taskId, setTaskId] = useState<string>();
const [progress, setProgress] = useState(0);

// Start autonomous task
const { autonomousExecute } = useAutonomousMode();
const result = await autonomousExecute.mutateAsync({
  task: 'Refactor authentication to use JWT',
  maxIterations: 15,
  requireApproval: true
});

setTaskId(result.data.taskId);

// Poll for status updates
const interval = setInterval(async () => {
  const response = await fetch(`/api/mrblue/autonomous/status/${taskId}`);
  const { data } = await response.json();
  
  const completed = data.steps.filter(s => s.status === 'completed').length;
  const total = data.steps.length;
  setProgress((completed / total) * 100);
  
  // Update UI with current step
  console.log('Current step:', data.steps[data.steps.length - 1].action);
  
  if (data.status === 'completed') {
    clearInterval(interval);
  }
}, 1000);

// UI shows:
// Progress: 60% (6/10 steps)
// Current: "Writing updated auth middleware..."
```

---

## Example 9: Multi-File Batch Write

**Goal**: Autonomously update multiple related files

```typescript
const { batchWrite } = useAutonomousMode();

// Mr Blue analyzes task and prepares changes
const changes = [
  {
    filePath: 'client/src/components/UserCard.tsx',
    content: '...updated component...'
  },
  {
    filePath: 'client/src/components/UserList.tsx',
    content: '...updated import...'
  },
  {
    filePath: 'client/src/types/user.ts',
    content: '...updated types...'
  }
];

// Atomic batch write (all or nothing)
await batchWrite.mutateAsync({ changes });

// If ANY file fails:
// - All changes rolled back automatically
// - Backups restored
// - Error reported
```

---

## Example 10: Custom Commands

**Goal**: Run custom terminal commands

```typescript
const { executeCommand } = useAutonomousMode();

// Run tests
const testResult = await executeCommand.mutateAsync({
  command: 'npm run test',
  timeout: 60000
});

if (testResult.data.exitCode === 0) {
  console.log('✅ All tests passed');
} else {
  console.error('❌ Tests failed:', testResult.data.stderr);
}

// Lint code
const lintResult = await executeCommand.mutateAsync({
  command: 'npm run lint',
  timeout: 30000
});
```

---

## Example 11: Component Analysis

**Goal**: Analyze React component structure

```typescript
const { analyzeComponent } = useAutonomousMode();

const analysis = await analyzeComponent.mutateAsync({
  filePath: 'client/src/components/UserCard.tsx',
  componentName: 'UserCard'
});

console.log('Component:', analysis.data.component);
// {
//   name: 'UserCard',
//   type: 'function',
//   props: ['user', 'onEdit', 'onDelete'],
//   state: [],
//   hooks: ['useState', 'useEffect'],
//   dependencies: ['react', '@/components/ui/card']
// }
```

---

## Example 12: Search & Replace Pattern

**Goal**: Find all instances and update

```typescript
const { searchCodebase, batchWrite } = useAutonomousMode();

// 1. Search for pattern
const results = await searchCodebase.mutateAsync({
  query: 'console.log',
  filePattern: '**/*.ts'
});

console.log(`Found ${results.data.totalMatches} console.log statements`);

// 2. Mr Blue autonomously:
// - Reads each file with console.log
// - Replaces with proper logger
// - Batch writes all changes
// - Tests build still works
```

---

## Best Practices

### 1. Always Create Checkpoints for Large Changes
```typescript
// Before major refactoring
await createCheckpoint.mutateAsync({
  description: 'Before authentication refactor',
  includeDatabase: false
});
```

### 2. Use Appropriate Risk Levels
- **Low Risk** (no approval): Text changes, comments, README updates
- **Medium Risk** (approval): Component refactors, new features
- **High Risk** (approval): Database changes, delete operations, auth changes

### 3. Set Reasonable Iteration Limits
```typescript
// Simple task
maxIterations: 5

// Complex refactor
maxIterations: 15

// Full feature
maxIterations: 20 // (hard cap)
```

### 4. Monitor Progress in Real-Time
- Use polling or WebSocket for status updates
- Show progress bar to user
- Display current step being executed

### 5. Handle Rate Limiting
```typescript
try {
  await autonomousExecute.mutateAsync({ task: '...' });
} catch (error) {
  if (error.status === 429) {
    const retryAfter = error.retryAfter; // seconds
    console.log(`Rate limited. Retry after ${retryAfter}s`);
  }
}
```

---

## Troubleshooting

### Issue: Autonomous mode stuck in loop
**Solution**: Check iteration count, ensure task is achievable, add debugging

### Issue: Changes not persisting
**Solution**: Verify checkpoint created, check file permissions, review logs

### Issue: Approval modal not showing
**Solution**: Ensure `requireApproval: true`, check WebSocket connection

### Issue: Commands failing
**Solution**: Verify command in allowlist, check timeout limit, review error logs

---

## Security Reminders

1. ✅ **DO**: Use autonomous mode for repetitive, well-defined tasks
2. ✅ **DO**: Require approval for destructive operations
3. ✅ **DO**: Create checkpoints before major changes
4. ❌ **DON'T**: Run autonomous mode without rate limiting
5. ❌ **DON'T**: Bypass path validation
6. ❌ **DON'T**: Add dangerous commands to allowlist
