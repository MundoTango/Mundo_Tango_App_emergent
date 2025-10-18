# AI Clarifier Logic - Resume Interview System
**Component**: Talent Match - Agent #C1 (Resume Interview Agent)  
**Purpose**: AI-powered volunteer skill detection and task matching  
**Technology**: GPT-4o (or multi-model routing via Mr Blue #73)  
**Date**: October 17, 2025

---

## 🎯 **WHAT IS THE AI CLARIFIER?**

The **AI Clarifier** is an intelligent interview system that:
1. Reads volunteer's resume or LinkedIn profile
2. Detects skill signals (backend, frontend, design, etc.)
3. Asks adaptive follow-up questions
4. Maps skills to specific platform tasks
5. Generates task recommendations with hours estimates

**Goal**: Connect human volunteers to agent work they're best suited for

---

## 🔄 **THE CLARIFIER FLOW**

### **Step 1: Resume Upload**
```
User visits: /volunteer/apply
    ↓
Uploads resume (PDF, DOCX, TXT)
  OR
Pastes LinkedIn profile URL
    ↓
Server extracts text
    ↓
Stores in: resumes table
```

**Extraction methods**:
- PDF: Parse with pdf-parse library
- DOCX: Parse with mammoth
- LinkedIn: Scrape profile (or use API if available)
- Plain text: Direct storage

---

### **Step 2: Initial Skill Signal Detection**

**AI analyzes resume for signals**:

```typescript
// Skill signal patterns
const SKILL_SIGNALS = {
  backend: ['node', 'express', 'api', 'backend', 'server', 'postgres', 'sql'],
  frontend: ['react', 'vue', 'angular', 'ui', 'frontend', 'html', 'css'],
  database: ['sql', 'postgres', 'mysql', 'mongodb', 'database', 'schema'],
  security: ['security', 'auth', 'jwt', 'encryption', 'rls', 'compliance'],
  design: ['figma', 'ui', 'ux', 'design', 'wireframe', 'prototype'],
  testing: ['jest', 'playwright', 'cypress', 'testing', 'qa', 'e2e'],
  devops: ['docker', 'ci/cd', 'github actions', 'deployment', 'aws'],
  docs: ['documentation', 'technical writing', 'readme', 'markdown'],
  governance: ['compliance', 'gdpr', 'privacy', 'governance', 'audit']
};

function detectSkillSignals(resumeText: string): SkillSignal[] {
  const signals = [];
  const lowerText = resumeText.toLowerCase();
  
  for (const [domain, keywords] of Object.entries(SKILL_SIGNALS)) {
    const matches = keywords.filter(kw => lowerText.includes(kw));
    if (matches.length > 0) {
      signals.push({
        domain,
        confidence: matches.length / keywords.length,
        keywords: matches
      });
    }
  }
  
  return signals.sort((a, b) => b.confidence - a.confidence);
}
```

**Example output**:
```json
{
  "signals": [
    {
      "domain": "backend",
      "confidence": 0.85,
      "keywords": ["node", "express", "api", "postgres", "sql"]
    },
    {
      "domain": "security",
      "confidence": 0.6,
      "keywords": ["auth", "jwt", "encryption"]
    }
  ]
}
```

---

### **Step 3: AI-Powered Adaptive Interview**

**System prompt for AI Clarifier**:

```
You are a friendly volunteer coordinator for Mundo Tango, a tango social platform.

A volunteer has submitted their resume. Your job:
1. Understand their skills and interests
2. Ask 3-5 adaptive follow-up questions
3. Be conversational and encouraging
4. Detect which platform tasks they're best suited for

Resume analysis detected these skill signals:
{signals}

Ask questions about:
- Scope preferences (small tasks vs large projects)
- Time availability (hours/week, duration)
- Recent tools/languages they've used
- 1-2 concrete project examples
- What excites them about contributing

Keep questions natural and conversational. Don't interrogate!
```

**Example conversation**:

```
AI: "Hi! Thanks for offering to help build Mundo Tango! 🎉

I see you have experience with Node.js and backend development. 
That's perfect - we have several backend tasks available!

To match you with the right work, I have a few quick questions:

1. Are you interested in smaller tasks (2-4 hours) or larger 
   projects (10+ hours)?"

User: "I prefer smaller tasks to start, maybe 2-3 hours each"

AI: "Great! Starting small makes sense. 

2. How many hours per week can you typically contribute?"

User: "Maybe 5-10 hours per week"

AI: "Perfect, that's really helpful!

3. I noticed Express and PostgreSQL in your resume. Have you 
   worked with authentication systems (JWT, OAuth) before?"

User: "Yes, I built a JWT auth system for my last project"

AI: "Excellent! That experience will be very valuable.

4. Can you tell me about one recent project you're proud of?
   Just a quick summary!"

User: "I built a REST API for a food delivery app with Express, 
Postgres, and JWT auth. Handled about 10k users."

AI: "That sounds like a solid project! Based on our conversation, 
I think you'd be a great fit for some of our backend security 
tasks.

Let me show you some recommendations..."
```

---

### **Step 4: Task Mapping Logic**

**Map skill signals → specific tasks**:

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  domain: string;
  hours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requiredSkills: string[];
  agentMapping: string; // Which agent needs this work
}

// Task database (examples)
const AVAILABLE_TASKS: Task[] = [
  {
    id: "t-rls-checklist",
    title: "Draft Row Level Security (RLS) checklist",
    description: "Create a comprehensive checklist for implementing RLS on all volunteer tables",
    domain: "security",
    hours: 4,
    difficulty: "intermediate",
    requiredSkills: ["security", "postgres", "rls"],
    agentMapping: "Layer 49 (Security Hardening Agent)"
  },
  {
    id: "t-express-hardening",
    title: "Harden Express endpoints",
    description: "Review and improve security of all Express API endpoints",
    domain: "backend",
    hours: 3,
    difficulty: "intermediate",
    requiredSkills: ["node", "express", "security"],
    agentMapping: "Layer 3 (Server Configuration Agent)"
  },
  {
    id: "t-sql-indexing",
    title: "Add database indexes and review schema",
    description: "Optimize PostgreSQL performance with proper indexes",
    domain: "database",
    hours: 2,
    difficulty: "intermediate",
    requiredSkills: ["postgres", "sql", "performance"],
    agentMapping: "Layer 5 (Database Management Agent)"
  },
  {
    id: "t-readme-onboarding",
    title: "Improve README onboarding section",
    description: "Make it easier for new contributors to get started",
    domain: "docs",
    hours: 2,
    difficulty: "beginner",
    requiredSkills: ["documentation", "markdown"],
    agentMapping: "Layer 52 (Documentation Agent)"
  }
];

function mapSignalsToTasks(
  signals: SkillSignal[],
  preferences: {
    hoursPerWeek: number;
    preferredTaskSize: 'small' | 'medium' | 'large';
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  }
): Task[] {
  // Filter tasks by skill match
  const matchedTasks = AVAILABLE_TASKS.filter(task => {
    return signals.some(signal => 
      task.domain === signal.domain && 
      signal.confidence > 0.5
    );
  });
  
  // Filter by preferences
  const filteredTasks = matchedTasks.filter(task => {
    // Hours check
    if (preferences.preferredTaskSize === 'small' && task.hours > 4) return false;
    if (preferences.preferredTaskSize === 'large' && task.hours < 8) return false;
    
    // Experience level check
    if (preferences.experienceLevel === 'beginner' && task.difficulty === 'advanced') return false;
    
    return true;
  });
  
  // Score and sort
  return filteredTasks
    .map(task => ({
      ...task,
      score: calculateMatchScore(task, signals, preferences)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5 recommendations
}
```

---

### **Step 5: Generate Recommendations**

**AI generates explanation for each recommendation**:

```
System prompt:
"Based on the volunteer's skills and preferences, generate a 
personalized explanation for why each task is a good match.

Volunteer profile:
- Skills: {detectedSkills}
- Preferences: {preferences}
- Interview highlights: {conversationSummary}

For task "{taskTitle}":
Explain in 2-3 sentences why this is a good match. Be specific 
about which skills apply. Be encouraging!"
```

**Example output**:

```json
{
  "recommendations": [
    {
      "taskId": "t-express-hardening",
      "title": "Harden Express endpoints",
      "hours": 3,
      "matchScore": 0.92,
      "reason": "Perfect match! You have strong Express and backend security experience from your food delivery API project. This task involves reviewing authentication middleware and implementing security best practices - exactly what you did with JWT. Your 10k user experience means you understand production security needs.",
      "agentMapping": "Layer 3 (Server Configuration Agent)",
      "urgency": "high",
      "impact": "Directly improves platform security for all users"
    },
    {
      "taskId": "t-sql-indexing",
      "title": "Add database indexes",
      "hours": 2,
      "matchScore": 0.88,
      "reason": "Great fit for your PostgreSQL skills! Since you've worked with Postgres at scale (10k users), you know how critical indexing is. This is a quick 2-hour task that will have immediate performance impact.",
      "agentMapping": "Layer 5 (Database Management Agent)",
      "urgency": "medium",
      "impact": "Improves query performance across platform"
    }
  ]
}
```

---

### **Step 6: Volunteer Review & Apply**

**UI shows recommendations**:

```tsx
<TaskRecommendations>
  {recommendations.map(task => (
    <TaskCard key={task.taskId}>
      <TaskTitle>{task.title}</TaskTitle>
      <Hours>{task.hours} hours</Hours>
      <MatchScore>
        {task.matchScore * 100}% match 
        <Badge>{task.urgency}</Badge>
      </MatchScore>
      <Reason>{task.reason}</Reason>
      <Impact>{task.impact}</Impact>
      <AgentMapping>
        Works with: {task.agentMapping}
      </AgentMapping>
      <ApplyButton onClick={() => applyForTask(task.taskId)}>
        Apply for this task
      </ApplyButton>
    </TaskCard>
  ))}
</TaskRecommendations>
```

**User clicks "Apply"**:
```
POST /volunteers/match/apply
{
  "volunteerId": "uuid",
  "taskId": "t-express-hardening",
  "motivation": "I have experience securing Express APIs and would love to help!"
}

    ↓
Creates assignment record:
{
  "id": "uuid",
  "volunteerId": "uuid",
  "taskId": "t-express-hardening",
  "status": "pending_approval",
  "appliedAt": "2025-10-17T23:55:00Z"
}

    ↓
Notification to admin dashboard
```

---

### **Step 7: Admin Review & Approval**

**Admin sees in dashboard**:

```
Pending Volunteer Applications
─────────────────────────────────
John Doe applied for: "Harden Express endpoints"

Resume highlights:
- 5 years backend experience
- Built JWT auth for 10k users
- Express, Node, PostgreSQL

AI Clarifier match: 92%

AI reasoning: "Strong backend security experience. 
Built production auth systems. Understands Express 
middleware patterns."

Interview summary: Available 5-10 hrs/week, prefers 
small tasks, excited about security work.

[Approve] [Request more info] [Decline]
```

**Admin clicks "Approve"**:
```
POST /admin/assignments/:id/status
{
  "status": "approved",
  "assignedAgent": "Layer 3 (Server Configuration)",
  "dueDate": "2025-10-24",
  "onboardingNotes": "Check docs/CONTRIBUTING.md for setup"
}

    ↓
Volunteer receives notification
    ↓
Task appears in volunteer dashboard
    ↓
Volunteer can start work!
```

---

## 🧠 **AI CLARIFIER PROMPTS**

### **Initial Analysis Prompt**:
```
Analyze this resume and identify skill domains:

{resumeText}

For each skill domain detected, provide:
1. Confidence score (0-1)
2. Keywords that indicate this skill
3. Experience level (beginner, intermediate, advanced)

Available domains: backend, frontend, database, security, 
design, testing, devops, docs, governance

Return JSON:
{
  "signals": [
    {
      "domain": "backend",
      "confidence": 0.85,
      "keywords": ["node", "express"],
      "experienceLevel": "intermediate"
    }
  ]
}
```

### **Interview Question Generation**:
```
Generate a natural, friendly follow-up question for a volunteer.

Context:
- Resume signals: {signals}
- Previous answers: {conversationHistory}
- Questions asked: {questionsCount}/5

Generate ONE question that:
- Feels conversational (not interrogative)
- Helps clarify skill level or preferences
- Is specific but not too technical
- Shows enthusiasm for their contribution

Return:
{
  "question": "...",
  "purpose": "..." // What we're trying to learn
}
```

### **Task Recommendation Explanation**:
```
Explain why this task is a good match for this volunteer.

Volunteer:
- Skills: {skills}
- Preferences: {preferences}
- Interview highlights: {highlights}

Task:
- Title: {taskTitle}
- Domain: {taskDomain}
- Hours: {taskHours}

Write 2-3 sentences explaining the match. Be specific about 
which skills apply. Be encouraging! Mention the impact.
```

---

## 📊 **GUARDRAILS & QUALITY CONTROLS**

### **1. Resume Privacy**
```typescript
// Never expose full resume to logs
function sanitizeResumeForLogs(resume: Resume): LogSafeResume {
  return {
    id: resume.id,
    skillSignals: resume.parsed.signals,
    // PII redacted
    textLength: resume.parsedText.length,
    uploadedAt: resume.createdAt
  };
}
```

### **2. Question Limits**
```typescript
const MAX_CLARIFIER_QUESTIONS = 5;

// Prevent endless interviewing
if (session.questionsAsked >= MAX_CLARIFIER_QUESTIONS) {
  return generateRecommendations(session);
}
```

### **3. Match Confidence Thresholds**
```typescript
// Only recommend high-confidence matches
const MINIMUM_MATCH_SCORE = 0.6;

const recommendations = allMatches.filter(
  match => match.score >= MINIMUM_MATCH_SCORE
);

if (recommendations.length === 0) {
  // Offer general starter tasks
  return getStarterTasks();
}
```

### **4. Human-in-the-Loop**
```typescript
// Admin must approve all task assignments
const assignment = {
  status: "pending_approval", // Not "approved"
  aiConfidence: matchScore,
  aiReasoning: explanation,
  requiresHumanReview: true
};
```

---

## 🎯 **SUCCESS METRICS**

### **Clarifier Performance**:
```
Engagement:
├─ Resume upload completion: >70%
├─ Interview completion: >60%
├─ Task application rate: >40%
└─ Admin approval rate: >70%

Accuracy:
├─ Skill detection accuracy: >85%
├─ Task match quality (admin rating): >4.0/5.0
├─ Volunteer satisfaction: >4.5/5.0
└─ Task completion rate: >75%
```

---

## 🔮 **FUTURE ENHANCEMENTS**

### **Phase 1** (Current):
- ✅ Basic skill signal detection
- ✅ Manual task database
- ✅ GPT-4o interview
- ✅ Admin approval workflow

### **Phase 2** (AI Upgrade):
- NotebookLM integration for deeper resume analysis
- Automatic skill assessment tests
- Portfolio project analysis (GitHub repos)
- Video interview option

### **Phase 3** (Advanced Matching):
- ML-based match scoring
- Volunteer performance tracking
- Adaptive difficulty progression
- Team formation (match volunteers who complement each other)

### **Phase 4** (Automation):
- Auto-approval for high-confidence matches
- Task generation from GitHub issues
- Skill-based badging system
- Career development pathways

---

## 📚 **INTEGRATION POINTS**

### **With Main Platform**:
```typescript
// Server loads this logic at boot
const clarifierLogic = await loadClarifierLogic();

app.post('/volunteers/clarifier/session', async (req, res) => {
  const { volunteerId, resumeText } = req.body;
  
  // Detect signals
  const signals = await detectSkillSignals(resumeText);
  
  // Create session
  const session = await createClarifierSession({
    volunteerId,
    signals,
    status: 'interviewing'
  });
  
  // Generate first question
  const firstQuestion = await generateQuestion(signals, []);
  
  res.json({ sessionId: session.id, question: firstQuestion });
});
```

### **With ESA.json**:
```typescript
// Load agent registry to map tasks
const esaRegistry = JSON.parse(
  fs.readFileSync('docs/ESA.json', 'utf-8')
);

// When matching tasks
task.agentMapping = esaRegistry.agents
  .find(a => a.domain === task.domain)
  ?.name || "Unknown Agent";
```

---

## ✅ **CLARIFIER CHECKLIST**

### **Implementation Complete When**:
- [ ] Resume upload & parsing works
- [ ] Skill signal detection >85% accurate
- [ ] AI interview feels natural (not robotic)
- [ ] Task recommendations >70% match quality
- [ ] Admin approval workflow functional
- [ ] Volunteer onboarding smooth
- [ ] PII properly protected
- [ ] All guardrails in place
- [ ] Metrics tracking active

### **Current Status** (October 17, 2025):
```
🟡 SCAFFOLDING EXISTS (Talent Match app on port 5174)
⚠️ IMPLEMENTATION PENDING (Phase 6-7)

Next steps:
1. Complete Talent Match UI
2. Implement resume parsing
3. Build AI Clarifier chat
4. Create task database
5. Build admin approval dashboard
```

---

**AI Clarifier: Connecting human talent to agent work**

*For questions, consult Agent #C1 (Resume Interview Agent) or Agent #T1 (Talent Match Director)*
