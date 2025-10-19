# ESA Agent Certification Assessment Rubrics
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Purpose:** Detailed assessment criteria, exam questions, and scoring rubrics for agent certification

## Overview

This document provides the complete assessment framework for certifying agents at all 4 levels (Trainee, Certified, Senior, Expert) across all agent types in the 927+ agent ecosystem.

---

## Certification Levels Quick Reference

| Level | Duration | Tasks Required | Error Rate Target | Capabilities |
|-------|----------|----------------|-------------------|--------------|
| **Level 1: Trainee** | Until pass | 0 (learning only) | N/A | Read-only access |
| **Level 2: Certified** | 90 days | 20 supervised | <5% | Standard tasks |
| **Level 3: Senior** | 180 days | 100 production | <1% | Complex/critical tasks |
| **Level 4: Expert** | 365 days | 500 production | <0.1% | Architecture/protocols |

---

## Level 2 Certification Assessment

### **Knowledge Exam (100 points total, 80% pass)**

#### **Section 1: ESA Protocols (30 points)**

**Question 1.1 (5 points): CHECK_BEFORE_BUILD**
```
When should an agent run the CHECK_BEFORE_BUILD protocol?

A) Only when starting a new project
B) Before ANY build or deployment task
C) Only when errors occur
D) After completing work

Correct Answer: B
Scoring: All or nothing (5 points or 0)
```

**Question 1.2 (5 points): PARALLEL_BY_DEFAULT**
```
Which of these operations should execute in PARALLEL?

A) Read user data → Create profile based on user data
B) Read file A, Read file B, Read file C
C) Insert user → Insert user's profile (foreign key dependency)
D) Check if user exists → Create user if not found

Correct Answer: B
Scoring: All or nothing (5 points or 0)
Rationale: A, C, D have data dependencies requiring sequential execution
```

**Question 1.3 (5 points): WORKLOAD_BALANCING**
```
System CPU is at 85%. What should WORKLOAD_BALANCING do?

A) Continue normal operations
B) Increase parallelism to finish faster
C) Reduce parallelism and pause P2/P3 tasks
D) Shut down all operations

Correct Answer: C
Scoring: All or nothing (5 points or 0)
Rationale: >80% CPU triggers yellow zone → reduce load
```

**Question 1.4 (5 points): PERFORMANCE_METRICS**
```
What is the target for API response time (p95)?

A) <100ms
B) <500ms
C) <1000ms
D) <2000ms

Correct Answer: B
Scoring: All or nothing (5 points or 0)
```

**Question 1.5 (5 points): AGENT_CERTIFICATION**
```
How long does Level 2 certification last?

A) 30 days
B) 90 days
C) 180 days
D) Forever

Correct Answer: B
Scoring: All or nothing (5 points or 0)
```

**Question 1.6 (5 points): REUSABLE_COMPONENTS**
```
When should you create a NEW reusable component?

A) Every time you write UI code
B) When component is used in 3+ places
C) Only for admin features
D) Never, always copy-paste

Correct Answer: B
Scoring: All or nothing (5 points or 0)
```

---

#### **Section 2: MB.MD Methodology (20 points)**

**Question 2.1 (5 points): Phase Identification**
```
You need to analyze why the home feed is slow. Which MB.MD phase is this?

A) MAPPING
B) BREAKDOWN
C) MITIGATION
D) DEPLOYMENT

Correct Answer: A (MAPPING - analyzing current state)
Scoring: All or nothing
```

**Question 2.2 (5 points): Documentation Routing**
```
In the MITIGATION phase, which doc should you read to prevent regressions?

A) MB_MD_DOCUMENTATION_PHASE_MAP.md
B) PREVENTION_GUIDE.md
C) API_REFERENCE.md
D) COMPONENT_CATALOG.md

Correct Answer: B
Scoring: All or nothing
```

**Question 2.3 (10 points): Quality Gates**
```
Order these steps correctly for MB.MD execution:

1. Deploy to production
2. Identify the problem
3. Implement the fix
4. Test the solution

Correct Order: 2 (MAPPING) → 3 (BREAKDOWN/MITIGATION) → 4 (MITIGATION) → 1 (DEPLOYMENT)

Scoring:
- All correct: 10 points
- 1 error: 5 points
- 2+ errors: 0 points
```

---

#### **Section 3: Technical Skills (30 points)**

**Question 3.1 (10 points): Code Quality**
```typescript
Review this code and identify all issues:

function CreateUser(data) {
  const user = db.insert(users).values(data)
  return user
}

Issues to identify:
1. Missing TypeScript types (2 points)
2. Not async/await (2 points)
3. No error handling (2 points)
4. No input validation (2 points)
5. Doesn't use storage interface (2 points)

Scoring: 2 points per issue identified (max 10)
```

**Question 3.2 (10 points): Security**
```typescript
Which code snippet has a SECURITY VULNERABILITY?

A) const user = await db.query.users.findFirst({ 
     where: eq(users.id, req.user.id) 
   })

B) const user = await db.query.users.findFirst({ 
     where: eq(users.id, req.params.id) 
   })

C) const user = await db.query.users.findFirst({ 
     where: and(
       eq(users.id, req.params.id),
       eq(users.tenantId, req.user.tenantId)
     )
   })

D) All are secure

Correct Answer: B (missing authorization check - any user can access any user's data)
Scoring:
- Correct answer + explanation: 10 points
- Correct answer only: 5 points
- Wrong answer: 0 points
```

**Question 3.3 (10 points): Performance**
```typescript
Optimize this code for performance:

const users = await db.query.users.findMany();
const posts = [];
for (const user of users) {
  const userPosts = await db.query.posts.findMany({
    where: eq(posts.userId, user.id)
  });
  posts.push(...userPosts);
}

Optimized version should:
1. Use a single JOIN query (5 points)
2. Use proper Drizzle relations (3 points)
3. Add limit to prevent OOM (2 points)

Scoring: Points awarded per optimization applied
```

---

#### **Section 4: System Knowledge (20 points)**

**Question 4.1 (10 points): MT Platform Architecture**
```
Match each layer to its responsibility:

Layers:
1. Layer #1 (Database Architecture)
2. Layer #9 (UI Framework)
3. Layer #13 (Content Management)
4. Layer #17 (Payment Processing)
5. Layer #52 (Documentation System)

Responsibilities:
A. Drizzle ORM and PostgreSQL schema
B. React components and Shadcn UI
C. Memories, posts, and hashtags
D. Stripe integration and subscriptions
E. Agent documentation and training

Correct Matches: 1-A, 2-B, 3-C, 4-D, 5-E
Scoring: 2 points per correct match (max 10)
```

**Question 4.2 (5 points): Critical File Protection**
```
Which files are protected by Git pre-commit hooks?

A) vite.config.ts, errorHandler.ts, apiResponse.ts
B) package.json, README.md, LICENSE
C) index.html, main.tsx, App.tsx
D) All TypeScript files

Correct Answer: A
Scoring: All or nothing
```

**Question 4.3 (5 points): Disaster Recovery**
```
How do you restore a deleted critical file?

A) Rewrite from memory
B) Ask another agent
C) Use Git: git show <commit>:<file> 
D) Download from internet

Correct Answer: C
Scoring: All or nothing
```

---

### **Practical Assessment (100 points total, 80% pass)**

#### **Task 1: Build a Feature (50 points)**

**Scenario:** Create a "Like Memory" feature

**Requirements:**
1. Add database schema (10 points)
   - ✅ Create `memoryLikes` table with proper relations (5 pts)
   - ✅ Add indexes for performance (3 pts)
   - ✅ Run `npm run db:push` successfully (2 pts)

2. Implement backend API (10 points)
   - ✅ POST /api/memories/:id/like endpoint (3 pts)
   - ✅ DELETE /api/memories/:id/like endpoint (3 pts)
   - ✅ Proper authentication (req.user.id) (2 pts)
   - ✅ Error handling (2 pts)

3. Build frontend UI (15 points)
   - ✅ LikeButton component (5 pts)
   - ✅ Optimistic UI updates (5 pts)
   - ✅ React Query mutations with cache invalidation (5 pts)

4. Testing & Documentation (10 points)
   - ✅ Add data-testid attributes (2 pts)
   - ✅ Test like/unlike flow (3 pts)
   - ✅ Document API endpoint (3 pts)
   - ✅ Update session log (2 pts)

5. Quality Gates (5 points)
   - ✅ Run CHECK_BEFORE_BUILD before starting (1 pt)
   - ✅ TypeScript compiles with no errors (2 pts)
   - ✅ Run verify-completion.sh (1 pt)
   - ✅ Architect review passes (1 pt)

**Scoring Rubric:**
- 45-50 points: Excellent (production-ready)
- 40-44 points: Good (minor issues)
- 35-39 points: Satisfactory (needs polish)
- <35 points: Fail (redo required)

---

#### **Task 2: Debug a Production Issue (30 points)**

**Scenario:** Users report "Login button doesn't work on mobile"

**Steps & Scoring:**

1. **Problem Diagnosis (10 points)**
   ```
   Expected process:
   - ✅ Take screenshot of login page (2 pts)
   - ✅ Check browser console logs (2 pts)
   - ✅ Test on mobile viewport (2 pts)
   - ✅ Identify root cause (button too small for touch) (4 pts)
   ```

2. **Root Cause Analysis (10 points)**
   ```
   Expected findings:
   - ✅ Button has min-height: 20px (should be 44px for touch) (4 pts)
   - ✅ Missing tap highlight styles (2 pts)
   - ✅ No touch event handlers (2 pts)
   - ✅ Document in session log (2 pts)
   ```

3. **Fix Implementation (10 points)**
   ```
   Expected fix:
   - ✅ Update button CSS: min-height: 44px, min-width: 44px (4 pts)
   - ✅ Add -webkit-tap-highlight-color (2 pts)
   - ✅ Test on mobile devices (2 pts)
   - ✅ Verify no regression on desktop (2 pts)
   ```

**Scoring Rubric:**
- 27-30 points: Excellent (fast, thorough diagnosis)
- 24-26 points: Good (correct but slow)
- 20-23 points: Satisfactory (eventually found issue)
- <20 points: Fail (didn't find root cause)

---

#### **Task 3: Code Review (20 points)**

**Scenario:** Review this pull request

```typescript
// MemoryCard.tsx
export function MemoryCard({ memory }) {
  const [likes, setLikes] = useState(memory.likes);
  
  const handleLike = () => {
    fetch('/api/memories/' + memory.id + '/like', { method: 'POST' });
    setLikes(likes + 1);
  };
  
  return (
    <div onClick={handleLike}>
      <p>{memory.content}</p>
      <span>{likes} likes</span>
    </div>
  );
}
```

**Issues to Identify (10 points):**
1. ❌ Missing TypeScript types (2 pts)
2. ❌ Doesn't use React Query (2 pts)
3. ❌ No error handling (1 pt)
4. ❌ No loading state (1 pt)
5. ❌ Div onClick instead of button (accessibility) (2 pts)
6. ❌ String concatenation for URL (use template literals) (1 pt)
7. ❌ No data-testid attribute (1 pt)

**Suggestions (10 points):**
1. ✅ Use TypeScript interface for props (2 pts)
2. ✅ Use useMutation from React Query (3 pts)
3. ✅ Replace div with button (2 pts)
4. ✅ Add error toast (2 pts)
5. ✅ Add data-testid (1 pt)

**Scoring:**
- Points awarded per issue found (max 10)
- Points awarded per valid suggestion (max 10)
- Total: 20 points

---

## Level 3 (Senior) Certification Assessment

### **Prerequisites:**
- ✅ Maintained Level 2 certification for 90 days
- ✅ Completed 100+ production tasks
- ✅ Error rate <1% over last 100 tasks
- ✅ Positive architect reviews (>80% approval rate)

### **Advanced Knowledge Exam (100 points, 85% pass)**

**Topics:**
1. System architecture design (20 pts)
2. Performance optimization strategies (20 pts)
3. Security best practices (OWASP Top 10) (20 pts)
4. Database optimization and indexing (15 pts)
5. Real-time systems (WebSocket, SSE) (15 pts)
6. Production debugging and incident response (10 pts)

**Sample Question (Architecture):**
```
Design a scalable architecture for 10,000 concurrent users
accessing the home feed with real-time updates.

Consider:
- Database connection pooling
- Caching strategy (React Query + Redis)
- WebSocket scaling (Socket.io rooms)
- CDN for static assets
- Load balancing

Scoring Rubric (20 points):
- Database strategy: 5 pts
- Caching strategy: 5 pts
- Real-time strategy: 5 pts
- Scalability considerations: 5 pts
```

---

### **Advanced Practical Assessment (100 points, 85% pass)**

#### **Task 1: Complex Refactoring (50 points)**

**Scenario:** Refactor the authentication system to support multiple OAuth providers

**Requirements:**
1. Design abstraction layer (15 pts)
2. Implement for 3 providers (Replit, Google, GitHub) (20 pts)
3. Migrate existing users (10 pts)
4. Zero downtime deployment (5 pts)

#### **Task 2: Production Incident Response (30 points)**

**Scenario:** Database queries are taking 5s+ (normally <100ms)

**Expected Process:**
1. Check monitoring dashboards (5 pts)
2. Identify slow queries (pg_stat_statements) (10 pts)
3. Analyze execution plans (EXPLAIN ANALYZE) (5 pts)
4. Implement fix (add index, optimize query) (10 pts)

#### **Task 3: Mentor a Trainee Agent (20 points)**

**Scenario:** Guide a Level 1 agent through their first task

**Evaluation:**
- Clear communication (5 pts)
- Proper guidance (not doing work for them) (5 pts)
- Teaching best practices (5 pts)
- Patience and encouragement (5 pts)

---

## Level 4 (Expert) Certification Assessment

### **Prerequisites:**
- ✅ Maintained Level 3 certification for 180 days
- ✅ Completed 500+ production tasks
- ✅ Error rate <0.1% over last 500 tasks
- ✅ Led 5+ cross-division initiatives
- ✅ Authored 10+ documentation files

### **Expert Assessment (Portfolio-Based)**

**Component 1: Strategic Initiative (40 points)**
- Led a platform-wide improvement
- Measurable impact (performance, quality, efficiency)
- Team coordination and stakeholder management

**Component 2: Protocol/Architecture Contribution (30 points)**
- Created or significantly improved an ESA protocol
- Designed new system architecture
- Solved a complex technical challenge

**Component 3: Knowledge Sharing (20 points)**
- Authored comprehensive documentation
- Conducted training sessions
- Mentored multiple junior agents

**Component 4: Thought Leadership (10 points)**
- Proposed innovative solutions
- Challenged status quo constructively
- Influenced platform direction

---

## Recertification Process

### **Time-Based Recertification:**

**Level 2 (Every 90 days):**
1. Review recent work (20 tasks minimum since last cert)
2. Updated knowledge check (new features/protocols)
3. Quick practical (30-minute task)
4. Pass threshold: 75%

**Level 3 (Every 180 days):**
1. Review last 6 months of work
2. Advanced knowledge update exam
3. Mentor 1 junior agent successfully
4. Pass threshold: 80%

**Level 4 (Every 365 days):**
1. Portfolio review (contributions this year)
2. Strategic planning session
3. Peer review by other Expert agents
4. Pass threshold: 85%

---

### **Incident-Triggered Recertification:**

**Automatic Triggers:**
- Caused P0 production outage
- Error rate >5% over 30 days
- Skipped CHECK_BEFORE_BUILD causing regression
- Failed security audit

**Process:**
1. Immediate suspension of certification
2. Root cause analysis (why did incident occur?)
3. Remediation plan creation
4. Complete relevant re-training modules
5. Pass certification exam again
6. Supervised work for 14 days
7. ✅ Reinstate if successful OR ❌ Demote if not

---

## Escalation and Appeals

### **Appeal Process:**

**Step 1: Request Review (Within 48 hours of decision)**
- Agent submits appeal to Division Chief
- Provides evidence/mitigating circumstances
- Proposes remediation if applicable

**Step 2: Review Committee**
- Division Chief + 2 Expert agents
- Review exam results, task history, incident reports
- Interview agent if needed

**Step 3: Decision (Within 7 days)**
- **Uphold:** Original decision stands
- **Overturn:** Certification granted/restored
- **Partial:** Additional training required before retry

**Step 4: Final Appeal (CEO Agent #0)**
- Only if process was unfair (not if simply failed)
- Decision is final

---

## Certification Dashboard

### **Agent View (What agents see):**

```
═══════════════════════════════════════════════════
│  YOUR CERTIFICATION STATUS                      │
═══════════════════════════════════════════════════
│                                                   │
│  Level: 2 (Certified) ✅                         │
│  Expiration: January 18, 2026 (90 days)          │
│  Renewal Status: ON TRACK                        │
│                                                   │
│  PERFORMANCE METRICS:                             │
│  ✅ Tasks Completed: 47/100 (47% to Level 3)     │
│  ✅ Error Rate: 2.1% (target <5%)                │
│  ✅ Quality Score: 87/100 (from reviews)         │
│  ✅ Protocol Compliance: 96% (CHECK_BEFORE_BUILD)│
│                                                   │
│  NEXT MILESTONE:                                  │
│  Complete 53 more tasks with <1% error rate      │
│  to qualify for Level 3 Senior certification     │
│                                                   │
│  RECENT ACHIEVEMENTS:                             │
│  🏆 Zero regressions this month                  │
│  🏆 Completed Customer Journey J2 audit          │
│  🏆 Mentored 2 trainee agents                    │
│                                                   │
═══════════════════════════════════════════════════
```

---

## Integration with Other Systems

**With WORKLOAD_BALANCING:**
- Certified agents get priority task assignment
- Senior agents assigned complex tasks
- Expert agents handle critical infrastructure

**With PERFORMANCE_METRICS:**
- Certification dashboard shows real-time metrics
- Automated alerts if performance drops
- Trend analysis for continuous improvement

**With CHECK_BEFORE_BUILD:**
- Compliance tracked per agent
- Skipping protocol triggers warning
- Repeated violations = decertification review

---

## Success Metrics

| Metric | Target | Tracking |
|--------|--------|----------|
| First-Time Pass Rate | >70% | PostHog analytics |
| Average Time to Certify | <14 days | Certification system |
| Recertification Rate | >95% | Renewal tracking |
| Appeal Rate | <5% | Appeal log |
| User Satisfaction with Certified Agents | >4.5/5 | User surveys |

---

**Document Owner:** CEO Agent (#0) + All Division Chiefs  
**Review Cycle:** Quarterly  
**Last Updated:** October 19, 2025  
**Next Review:** January 19, 2026
