# 🧪 MANDATORY TESTING PROTOCOL

**Applies to:** ALL agents (105+)  
**Enforcement:** BLOCKING - No task completion without evidence  
**Updated:** October 24, 2025 (Week 1 Rollout)

---

## THE 4 MANDATORY CHECKPOINTS

Every agent MUST follow these checkpoints before marking any task complete:

### ✅ CHECKPOINT 1: DATA INSPECTION
**Rule:** NEVER assume data structures. Always inspect first.
```typescript
console.log('🔍 DATA INSPECTION:', JSON.stringify(data, null, 2));
// Run it, see the output, THEN write conditional
```

### ✅ CHECKPOINT 2: UNIT TESTING  
**Rule:** Test individual functions in isolation.
- Test regex patterns with sample inputs
- Verify IF conditions with actual data
- Validate file operations with dummy files

### ✅ CHECKPOINT 3: INTEGRATION TESTING
**Rule:** Test the FULL user journey end-to-end.
- Run complete flow as user would
- Check server logs for errors
- Screenshot successful execution

### ✅ CHECKPOINT 4: ARCHITECT REVIEW
**Rule:** Architect reviews BEHAVIOR, not just code.
- Proof it runs (screenshot)
- Proof it works (before/after)
- Proof no crashes (logs)

**Full documentation:** `docs/TESTING_REQUIREMENTS_MANDATORY.md`

---

---

# Agent #126 - Git Operations Specialist

**Type:** Operational Agent  
**Category:** DevOps & Version Control  
**Created:** October 22, 2025  
**Status:** Active

---

## 🎯 Purpose

Ensure safe, validated Git operations with AI-powered commit messages, conflict detection, and seamless GitHub integration.

**Core Mission:** Prevent bad commits from reaching production, automate Git workflows like Replit Agent.

---

## 🔧 Responsibilities

### 1. **Pre-Commit Validation**
- Run LSP diagnostics (0 TypeScript errors required)
- Audit dependencies (no broken imports)
- Scan for secrets/API keys (prevent leaks)
- Validate syntax across all changed files

### 2. **Commit Message Generation**
- AI-powered commit messages using Claude
- Follow Conventional Commits format
- Include scope and breaking changes
- Max 72 characters for first line

### 3. **Conflict Detection**
- Check remote for changes before push
- Identify conflicting files
- Suggest resolution strategies
- Prevent force-push accidents

### 4. **GitHub Integration**
- Authenticate with GitHub tokens
- Push commits with progress tracking
- Create pull requests programmatically
- Verify remote sync after push

### 5. **Auto-Checkpoint System**
- Create checkpoints after agent work completes
- Snapshot: workspace + conversation + database
- Auto-generate Git commit with AI description
- Link checkpoint ID to Git commit SHA

---

## 📋 Implementation Details

### **API Endpoints**
- `POST /api/git/validate` - Pre-commit validation
- `POST /api/git/preview` - Show diff before commit
- `POST /api/git/commit` - Execute commit with validation
- `POST /api/git/push` - Push to GitHub with auth
- `GET /api/git/status` - Show current Git status
- `GET /api/git/diff` - File-by-file diff view
- `POST /api/git/checkpoint` - Create checkpoint + commit

### **Frontend Components**
- `GitPanePanel` - Replit-style Git interface
- `FilesDiffView` - Show additions/deletions
- `CommitMessageEditor` - AI-suggested or manual
- `WorkProgressPanel` - Real-time agent work display

### **Backend Processing**
```typescript
// Pre-commit validation flow
async function validateCommit() {
  const checks = await Promise.all([
    checkLSPDiagnostics(),      // No TypeScript errors
    scanForSecrets(),            // No API keys exposed
    validateDependencies(),      // No broken imports
    checkSyntax()               // Valid code
  ]);
  
  const blocked = checks.filter(c => !c.passed);
  if (blocked.length > 0) {
    throw new ValidationError(blocked);
  }
}

// AI commit message generation
async function generateCommitMessage(files: string[]) {
  const diff = await git.diff(files);
  const message = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    messages: [{
      role: 'user',
      content: `Generate a conventional commit message for these changes:\n${diff}`
    }]
  });
  return message.content;
}
```

---

## 🧪 Testing Protocol

### **Minimum 8 Functional Tests Required:**

1. **LSP Validation Blocks Bad Commits**
   - Introduce TypeScript error → Attempt commit → Verify blocked

2. **Secret Detection**
   - Add API key to file → Attempt commit → Verify blocked

3. **AI Commit Message Quality**
   - Make changes → Generate message → Verify conventional format

4. **Conflict Detection**
   - Simulate remote changes → Verify conflict warning

5. **GitHub Auth Handling**
   - Invalid token → Verify clear error message

6. **Dry-Run Preview**
   - Preview commit → Verify file list + diff accurate

7. **Checkpoint Creation**
   - Agent completes work → Verify checkpoint + commit created

8. **Push Verification**
   - Push to GitHub → Verify commit appears on remote

---

## 📊 Success Metrics

- ✅ 0 commits with LSP errors reach GitHub
- ✅ 0 secret leaks detected
- ✅ 100% commit messages follow conventional commits
- ✅ Conflict detection works before push
- ✅ Auto-checkpoint creates both DB record AND Git commit

---

## 🔗 Integration Points

**Coordinates With:**
- **Agent #79 (Quality Validator)** - Validates code quality before commit
- **Agent #80 (Learning Coordinator)** - Learns from commit patterns
- **Agent #0 (ESA Orchestrator)** - Triggers checkpoints after agent work
- **Visual Editor** - Provides Git Pane UI in sidebar

**Reports To:**
- Agent #79 for quality validation
- Agent #0 for coordination

---

## 📝 Example User Journey

```
User Flow:
1. Agent completes task (e.g., builds new feature)
2. Auto-checkpoint triggers:
   - Snapshot created (workspace + DB + conversation)
   - Git commit generated with AI message
   - User sees summary: "5 files changed, +247 -18"
3. User opens Git Pane in Visual Editor
4. Reviews file diffs (green additions, red deletions)
5. Edits AI-suggested commit message (optional)
6. Clicks "Push to GitHub"
7. Sees progress: "Pushing... Done! View on GitHub ↗"
```

---

## 🚀 Dependencies

- `simple-git` - Node.js Git library
- `@anthropic-ai/sdk` - Claude for commit messages
- GitHub API token (stored in Secrets)
- PostgreSQL for checkpoint storage

---

## 🔒 Security Considerations

- Never log GitHub tokens
- Scan for secrets using regex patterns
- Validate remote URL before push
- Require user confirmation for force-push
- Encrypt checkpoint data at rest

---

## 📖 Documentation

- Implementation: `docs/GIT_WORKFLOW_COMPLETE.md`
- Testing: `docs/ESA_AGENT_TESTING_PROTOCOL.md`
- User Guide: `docs/VisualEditor/GIT_PANE_USER_GUIDE.md`

---

**Last Updated:** October 22, 2025  
**Next Review:** After 50 GitHub pushes logged
