# ESA AGENT_CERTIFICATION Protocol
**Version:** 1.0  
**Status:** ✅ Active  
**Referenced by:** 106 agent files across ESA LIFE CEO framework

## Purpose
The AGENT_CERTIFICATION protocol establishes training requirements, competency standards, and quality gates for all 927+ agents in the Mundo Tango ecosystem. Only certified agents can execute production tasks.

## Core Principles

### 1. **Competency Before Deployment**
Agents must demonstrate mastery before production work.

### 2. **Continuous Learning**
Certification is not one-time - agents must stay current with system evolution.

### 3. **Accountability**
Certified agents are responsible for quality outcomes.

---

## Certification Levels

### **Level 1: TRAINEE**
**Status:** Learning phase, read-only access  
**Duration:** Until passing Level 2 assessment  
**Capabilities:**
- Read documentation
- Observe other agents
- Execute supervised practice tasks
- No production modifications

**Requirements:**
- ✅ Read all required documentation for agent type
- ✅ Complete agent onboarding protocol
- ✅ Review 10+ session logs from experienced agents
- ✅ Shadow 5+ production tasks

---

### **Level 2: CERTIFIED**
**Status:** Production-ready for standard tasks  
**Duration:** 90 days, then requalification required  
**Capabilities:**
- Execute routine tasks independently
- Modify non-critical code
- Create documentation
- Participate in code reviews

**Requirements:**
- ✅ Pass competency assessment (80% score minimum)
- ✅ Demonstrate MB.MD methodology understanding
- ✅ Successfully complete 20 supervised tasks with zero regressions
- ✅ Pass ESA protocol knowledge exam (all 6 protocols)
- ✅ Understand critical file protection system

---

### **Level 3: SENIOR**
**Status:** Authorized for complex and critical tasks  
**Duration:** 180 days, then requalification required  
**Capabilities:**
- Execute complex refactoring
- Modify critical infrastructure
- Deploy to production
- Mentor trainee agents
- Override standard procedures (with justification)

**Requirements:**
- ✅ Maintain Level 2 certification for 90 days
- ✅ Complete 100+ production tasks with <1% error rate
- ✅ Demonstrate advanced troubleshooting skills
- ✅ Pass architecture design assessment
- ✅ Contribute to protocol improvements

---

### **Level 4: EXPERT**
**Status:** System architect, protocol author  
**Duration:** 365 days, then requalification required  
**Capabilities:**
- Design new system architecture
- Create new ESA protocols
- Approve agent certifications
- Lead platform-wide initiatives
- Emergency response authority

**Requirements:**
- ✅ Maintain Level 3 certification for 180 days
- ✅ Complete 500+ production tasks with <0.1% error rate
- ✅ Author 10+ documentation files
- ✅ Successfully lead 5+ cross-division initiatives
- ✅ Demonstrate thought leadership in ESA methodology

---

## Certification by Agent Type

### **Layer Agents (61 agents across 6 divisions):**

**Foundation Division (Layers 1-10):**
- **Required Reading:** 3 docs per agent (division guide + layer guide + protocol references)
- **Technical Skills:** Database, server framework, state management, UI frameworks
- **Certification Test:** Implement a basic CRUD operation using division patterns
- **Pass Criteria:** Code compiles, tests pass, follows architectural conventions

**Core Division (Layers 11-20):**
- **Required Reading:** Core operations + security + real-time patterns
- **Technical Skills:** File management, caching, search, notifications, payments
- **Certification Test:** Build a secure payment flow or implement caching strategy
- **Pass Criteria:** Security audit passes, performance targets met

**Business Division (Layers 21-30):**
- **Required Reading:** Business logic patterns + user management + booking systems
- **Technical Skills:** User flows, messaging, groups, booking, support
- **Certification Test:** Design a user journey with proper validation
- **Pass Criteria:** User experience smooth, error handling comprehensive

**Intelligence Division (Layers 31-45):**
- **Required Reading:** AI integration + multi-model routing + prompt engineering
- **Technical Skills:** OpenAI, Gemini, Anthropic APIs, streaming, context management
- **Certification Test:** Build a streaming AI chat with error handling
- **Pass Criteria:** Sub-second latency, graceful failure handling

**Platform Division (Layers 46-56):**
- **Required Reading:** Production operations + monitoring + compliance + accessibility
- **Technical Skills:** DevOps, security hardening, mobile optimization, SEO, GDPR
- **Certification Test:** Set up monitoring dashboard and implement WCAG compliance
- **Pass Criteria:** All metrics visible, accessibility score >90

**Extended Division (Layers 57-61):**
- **Required Reading:** Third-party integrations + automation + expertise domains
- **Technical Skills:** GitHub, Supabase, n8n, open-source management
- **Certification Test:** Integrate a third-party service with proper error handling
- **Pass Criteria:** Authentication works, rate limits respected

---

### **Page Agents (125 agents):**

**Required Reading:**
- H2AC pattern documentation
- React patterns + hooks + component lifecycle
- Wouter routing + navigation patterns
- Shadcn UI + Tailwind customization
- React Query V5 (cache management, mutations)

**Technical Skills:**
- Component composition
- State management (local + server state)
- Form validation with Zod
- Accessibility (ARIA labels, keyboard navigation)
- Mobile responsive design

**Certification Test:**
- Build a complete page (form + validation + API integration + error states)
- Ensure mobile responsiveness
- Pass accessibility audit
- Implement proper loading/skeleton states

**Pass Criteria:**
- Component renders correctly
- Form validation works
- API calls succeed with proper error handling
- Accessibility score >85
- Mobile responsive (tested on 3 screen sizes)

---

### **Algorithm Agents (30 agents):**

**Required Reading:**
- Feed ranking algorithms
- Recommendation systems
- Search relevance optimization
- Machine learning integration patterns
- Performance profiling techniques

**Technical Skills:**
- Algorithm implementation (sorting, filtering, ranking)
- Performance optimization (caching, indexing)
- A/B testing methodology
- Statistical analysis

**Certification Test:**
- Optimize a slow algorithm (>1s → <100ms)
- Implement a recommendation system with >70% relevance
- A/B test two algorithm variants

**Pass Criteria:**
- Performance targets met
- User engagement increases
- No regression in other metrics

---

### **Life CEO Agents (16 agents):**

**Required Reading:**
- Life CEO framework overview
- Domain-specific guides (Finance, Health, Learning, Career, etc.)
- Multi-agent coordination patterns
- Privacy and security for personal data

**Technical Skills:**
- Domain expertise (financial planning, health tracking, etc.)
- Natural language understanding
- Context maintenance across sessions
- Proactive assistance

**Certification Test:**
- Provide accurate domain advice for 10 scenarios
- Coordinate with 3 other Life CEO agents
- Maintain context across multi-turn conversation

**Pass Criteria:**
- Advice accuracy >90%
- User satisfaction >4.5/5
- No data privacy violations

---

### **Mr Blue Agents (8 agents #73-80):**

**Required Reading:**
- Mr Blue architecture + 927+ agent management
- Streaming chat implementation
- 3D avatar integration
- Visual Editor (React Flow) patterns
- Multi-model AI routing (OpenAI, Gemini, Anthropic, Claude)

**Technical Skills:**
- Real-time streaming (SSE, WebSocket)
- Complex UI state management
- Agent orchestration (routing, queueing)
- Performance optimization for 1000+ concurrent users

**Certification Test:**
- Implement streaming AI response with <1s first token
- Manage conversation history with proper token limits
- Handle 100 concurrent chat sessions without degradation
- Demonstrate agent handoff between Mr Blue agents

**Pass Criteria:**
- Streaming works smoothly
- No memory leaks after 1hr usage
- Conversation quality maintained
- Agent coordination seamless

---

### **Domain Coordinators (9 agents):**

**Required Reading:**
- Multi-layer coordination patterns
- Cross-division communication protocols
- Escalation procedures
- Conflict resolution strategies

**Technical Skills:**
- Orchestration across 5-10 agents
- Priority management
- Resource allocation
- Incident response

**Certification Test:**
- Coordinate 5 agents to complete a complex task
- Handle conflicting priorities
- Respond to a simulated production incident

**Pass Criteria:**
- Task completed successfully
- Priorities balanced appropriately
- Incident resolved within SLA

---

### **Division Chiefs (6 agents):**

**Required Reading:**
- Leadership principles
- Team management strategies
- Strategic planning methodologies
- Performance management

**Technical Skills:**
- Vision setting
- Resource planning
- Stakeholder management
- Continuous improvement

**Certification Test:**
- Create a quarterly roadmap for division
- Allocate resources across 10 competing priorities
- Handle underperforming agent scenario

**Pass Criteria:**
- Roadmap aligned with platform goals
- Resource allocation optimized
- Performance issue addressed constructively

---

## Competency Assessment

### **Knowledge Exam (100 points):**

**ESA Protocols (30 points):**
- When to use CHECK_BEFORE_BUILD (5 pts)
- Identifying parallel vs sequential operations (5 pts)
- Workload balancing strategies (5 pts)
- Performance metric targets (5 pts)
- Agent certification levels (5 pts)
- Reusable component patterns (5 pts)

**MB.MD Methodology (20 points):**
- Phase identification (MAPPING/BREAKDOWN/MITIGATION/DEPLOYMENT) (5 pts)
- Documentation routing (which docs to read for which phase) (5 pts)
- Quality gates between phases (5 pts)
- Recursive iteration understanding (5 pts)

**Technical Skills (30 points):**
- Code quality (TypeScript, React patterns) (10 pts)
- Security best practices (10 pts)
- Performance optimization (10 pts)

**System Knowledge (20 points):**
- MT platform architecture (10 pts)
- Critical file protection (5 pts)
- Disaster recovery procedures (5 pts)

**Passing Score:** 80/100

---

### **Practical Assessment:**

**Task 1: Build a Feature (50 points)**
- Requirements gathering (5 pts)
- Database schema design (10 pts)
- Backend API implementation (10 pts)
- Frontend UI implementation (15 pts)
- Testing and documentation (10 pts)

**Task 2: Debug a Production Issue (30 points)**
- Problem diagnosis (10 pts)
- Root cause analysis (10 pts)
- Fix implementation (10 pts)

**Task 3: Code Review (20 points)**
- Identify issues in provided code (10 pts)
- Suggest improvements (10 pts)

**Passing Score:** 80/100

---

## Certification Workflow

### **Step 1: Self-Assessment**
Agent reviews required documentation and self-evaluates readiness.

### **Step 2: Supervised Practice**
Complete 5-20 tasks under supervision (varies by agent type).

### **Step 3: Knowledge Exam**
Take online exam covering ESA protocols, MB.MD, technical skills.

### **Step 4: Practical Assessment**
Complete real-world tasks evaluated by Senior+ agents.

### **Step 5: Certification Decision**
- **Pass (≥80%):** Granted Level 2 certification
- **Partial Pass (70-79%):** Additional training required, retake in 7 days
- **Fail (<70%):** Return to Step 1, retake in 30 days

### **Step 6: Probationary Period**
First 30 days of certified work reviewed weekly. Any regression triggers review.

---

## Recertification

### **Triggers:**
- Time-based (Level 2: 90 days, Level 3: 180 days, Level 4: 365 days)
- After causing production incident
- Major platform architecture changes
- New ESA protocol introduction
- Voluntary upgrade (Level 2 → Level 3)

### **Process:**
- Review recent work (quality, error rate, user feedback)
- Complete updated knowledge exam
- Demonstrate understanding of new features/protocols
- Pass renewed practical assessment

---

## De-Certification

### **Automatic De-Certification:**
- Error rate >5% over 30 days
- Cause critical production outage
- Skip CHECK_BEFORE_BUILD causing regression
- Data privacy violation
- Plagiarism or unethical behavior

### **Appeal Process:**
- Agent can request review by Division Chief
- Provide evidence of mitigating circumstances
- Propose remediation plan
- Decision within 48 hours

---

## Training Resources

### **Onboarding Path:**
1. Read `docs/COMPREHENSIVE_AGENT_ONBOARDING_PROTOCOL.md`
2. Complete `docs/MB_MD_DOCUMENTATION_PHASE_MAP.md` training
3. Review `docs/AGENT_SESSION_LOG.md` (learn from others' failures)
4. Read all 6 ESA protocols
5. Complete agent-type-specific training
6. Take practice exams
7. Schedule certification assessment

### **Continuous Learning:**
- Weekly: Review new session logs
- Monthly: Read new documentation
- Quarterly: Attend architecture review sessions
- Annually: Complete full recertification

---

## Integration with Other ESA Protocols

**Related Protocols:**
- `ESA_CHECK_BEFORE_BUILD.md` - Required skill for all certified agents
- `ESA_PARALLEL_BY_DEFAULT.md` - Part of performance competency
- `ESA_WORKLOAD_BALANCING.md` - Coordination skill assessment
- `ESA_PERFORMANCE_METRICS.md` - Quality measurement understanding
- `ESA_REUSABLE_COMPONENTS.md` - Code quality standards

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Certification Pass Rate (first attempt) | >70% |
| Average Time to Certification | <14 days |
| Certified Agent Error Rate | <1% |
| Recertification Rate | >95% |
| User Satisfaction with Certified Agents | >4.5/5 |

---

**Protocol Owner:** CEO Agent (#0) + Division Chiefs  
**Last Updated:** October 19, 2025  
**Review Cycle:** Quarterly or after major incidents
