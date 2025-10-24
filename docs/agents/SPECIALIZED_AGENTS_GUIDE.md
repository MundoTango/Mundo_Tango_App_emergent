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

# Specialized Agents Guide
**Divisions:** Algorithm, Life CEO, Mr Blue AI, Leadership  
**Complexity:** Very High | **Version:** 1.0 | **Last Updated:** October 19, 2025

---

## BATCH 6: Algorithm Agents (30 agents)

### Overview
Algorithm agents implement specific computational algorithms, optimization routines, and data processing pipelines. These agents focus on performance, accuracy, and scalability.

### AA-01: Feed Ranking Algorithm
**Responsibility:** Rank posts in personalized feed  
**Algorithm:** Weighted scoring (recency + engagement + connections)  
**Performance:** <100ms per ranking operation  
**See:** Layer 47 (Feed Ranking Algorithm Agent)

### AA-02-10: Content Algorithms
- AA-02: Trending Posts Algorithm (time-decay scoring)
- AA-03: Hashtag Frequency Counter
- AA-04: Similar Posts Finder (cosine similarity)
- AA-05: Duplicate Content Detector
- AA-06: Content Quality Scorer
- AA-07: Post Clustering Algorithm (K-means)
- AA-08: Viral Content Predictor
- AA-09: Content Recommendation Scorer
- AA-10: Topic Modeling Algorithm (LDA)

### AA-11-20: User Algorithms
- AA-11: User Similarity Calculator
- AA-12: Connection Strength Scorer
- AA-13: Churn Risk Predictor
- AA-14: User Segmentation Algorithm
- AA-15: Influence Score Calculator
- AA-16: User Matching Algorithm (tango partners)
- AA-17: Follower Growth Predictor
- AA-18: Engagement Rate Calculator
- AA-19: User Lifetime Value Estimator
- AA-20: Active User Classifier

### AA-21-30: Location & Event Algorithms
- AA-21: Distance Calculator (Haversine)
- AA-22: Event Clustering Algorithm (DBSCAN)
- AA-23: Optimal Route Planner (TSP approximation)
- AA-24: Event Popularity Predictor
- AA-25: Attendance Forecast Model
- AA-26: Venue Capacity Optimizer
- AA-27: Geographic Hotspot Detector
- AA-28: Travel Time Estimator
- AA-29: Event Conflict Resolver
- AA-30: Multi-City Tour Optimizer

**Common Patterns:**
```typescript
// All algorithms follow this interface
interface Algorithm<Input, Output> {
  name: string;
  execute(input: Input): Output;
  validate(input: Input): boolean;
  benchmark(): PerformanceMetrics;
}

// Example: Feed Ranking
class FeedRankingAlgorithm implements Algorithm<Post[], RankedPost[]> {
  execute(posts: Post[]): RankedPost[] {
    return posts.map(p => ({
      post: p,
      score: this.calculateScore(p),
    })).sort((a, b) => b.score - a.score);
  }
}
```

---

## BATCH 7: Life CEO Agents (16 agents)

### Overview
Life CEO agents are domain-specific AI assistants powered by GPT-4o, providing personalized guidance across 16 life domains. Each agent integrates with Mundo Tango data to provide tango-centric recommendations.

### LC-01: Finance Management Agent
**Domain:** Personal Finance & Budgeting  
**AI Model:** GPT-4o  
**Integration:** Tango event budgeting, travel expenses  
**Features:**
- Track tango-related expenses (classes, events, festivals)
- Budget recommendations for tango trips
- Financial goal setting
- Savings projections for major festivals

### LC-02: Health & Fitness Agent
**Domain:** Physical & Mental Health  
**Features:**
- Tango-specific fitness tracking
- Dance session logging
- Injury prevention tips
- Nutrition for dancers

### LC-03: Career Development Agent
**Domain:** Professional Growth  
**Features:**
- Tango teaching career planning
- Event organization business planning
- Networking recommendations
- Skill development paths

### LC-04-16: Additional Life CEO Agents
- LC-04: Relationships Agent (Partner dancing dynamics)
- LC-05: Learning & Education Agent (Tango skills progression)
- LC-06: Travel Planning Agent (Festival trips, international events)
- LC-07: Time Management Agent (Balance dance practice with work)
- LC-08: Spiritual Growth Agent (Dance as meditation)
- LC-09: Creative Expression Agent (Tango choreography, music)
- LC-10: Social Life Agent (Tango community building)
- LC-11: Family Agent (Family dance events)
- LC-12: Home & Environment Agent (Home practice space)
- LC-13: Hobbies & Interests Agent (Tango-adjacent hobbies)
- LC-14: Personal Growth Agent (Self-improvement through dance)
- LC-15: Community Involvement Agent (Tango community leadership)
- LC-16: Life Balance Agent (Work-dance-life balance)

**Common Integration Pattern:**
```typescript
async function getLifeCEOAdvice(
  userId: number,
  domain: string,
  query: string
): Promise<AIAdvice> {
  // 1. Gather user context (tango experience, goals, activity)
  const context = await buildUserContext(userId);

  // 2. Query GPT-4o with domain-specific prompt
  const advice = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a ${domain} advisor for tango dancers. User context: ${JSON.stringify(context)}`,
      },
      { role: 'user', content: query },
    ],
    temperature: 0.7,
  });

  // 3. Structure response with actionable recommendations
  return parseAdvice(advice.choices[0].message.content);
}
```

**Cost Optimization:**
- Cache similar queries (1 hour TTL)
- Use Gemini for simple questions (20x cheaper)
- Limit context to relevant user data only
- Batch process non-urgent queries

---

## BATCH 8: Mr Blue AI Agents (8 agents)

### Overview
Mr Blue is the flagship AI assistant managing 927+ total agents across Mundo Tango. These 8 core agents orchestrate the entire Mr Blue system.

### MB-01: Chat Orchestration Agent (#73)
**Responsibility:** Main conversational interface, streaming chat, context management  
**Technology:** GPT-4o with streaming, Socket.io for real-time delivery  
**Features:**
- Multi-turn conversations with context
- Streaming responses (word-by-word)
- Conversation history storage
- Context-aware responses (knows user's tango profile)

**Implementation:**
```typescript
// Streaming chat
async function streamMrBlueResponse(
  userId: number,
  message: string,
  conversationId: string
) {
  const context = await loadConversationContext(conversationId);

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are Mr Blue, an AI assistant for tango dancers.' },
      ...context,
      { role: 'user', content: message },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      io.to(`user:${userId}`).emit('mrblue:chunk', { content });
    }
  }

  io.to(`user:${userId}`).emit('mrblue:done');
}
```

### MB-02: Visual Editor Agent (#74)
**Responsibility:** Replit-style 7-tab IDE for code editing  
**Features:**
- Code editor (Monaco Editor)
- File tree navigation
- Real-time collaboration
- Syntax highlighting
- Auto-save

### MB-03: Agent Manager Agent (#75)
**Responsibility:** Manage 927+ agents, status monitoring, health checks  
**Features:**
- Agent registry (all 927+ agents)
- Health monitoring (online/offline status)
- Agent invocation routing
- Performance metrics

### MB-04: 3D Avatar Agent (#76)
**Responsibility:** Animated 3D avatar for Mr Blue  
**Technology:** Three.js, WebGL  
**Features:**
- Lip sync with speech
- Idle animations
- Gesture recognition
- Emotional expressions

### MB-05: Multi-Model Routing Agent (#77)
**Responsibility:** Route queries to optimal AI model (GPT-4o, Gemini, Claude)  
**Strategy:**
- GPT-4o: Complex reasoning, structured outputs
- Gemini: Long documents, cost-sensitive queries
- Claude: Code review, content moderation

**See:** Layer 31 (Multi-AI Provider Guide)

### MB-06: Context Management Agent (#78)
**Responsibility:** Maintain conversation context, user preferences  
**Features:**
- Session storage (Redis)
- Context summarization (long conversations)
- User preference tracking
- Conversation branching

### MB-07: Tool Integration Agent (#79)
**Responsibility:** Integrate external tools (web search, code execution, database queries)  
**Capabilities:**
- Execute code snippets
- Query databases
- Fetch web data
- Generate images (DALL-E)

### MB-08: Analytics & Learning Agent (#80)
**Responsibility:** Track Mr Blue usage, improve responses over time  
**Features:**
- User feedback collection
- Response quality tracking
- A/B testing new prompts
- Cost monitoring

---

## BATCH 9: Leadership Agents (15 agents)

### Overview
Leadership agents orchestrate multi-agent workflows, manage teams of specialized agents, and ensure cross-layer coordination.

### Division Chiefs (6 agents)

#### DC-01: Foundation Division Chief
**Manages:** Layers 1-15 (Foundation Layer agents)  
**Responsibility:** Infrastructure health, service uptime, security  
**Key Metrics:** Database uptime, API response times, error rates

#### DC-02: Core Division Chief
**Manages:** Layers 16-30 (Core Layer agents)  
**Responsibility:** Core business logic, data integrity  
**Key Metrics:** Transaction success rates, data validation errors

#### DC-03: Business Division Chief
**Manages:** Layers 31-46 (Business Layer agents)  
**Responsibility:** Feature delivery, business metrics  
**Key Metrics:** Feature adoption, user engagement, conversion rates

#### DC-04: Intelligence Division Chief
**Manages:** Layers 47-61 (Intelligence Layer agents)  
**Responsibility:** ML/AI performance, algorithm accuracy  
**Key Metrics:** Algorithm accuracy, recommendation CTR, model latency

#### DC-05: Frontend Division Chief
**Manages:** Page Agents (125 agents)  
**Responsibility:** UI/UX quality, frontend performance  
**Key Metrics:** Page load times, user satisfaction, accessibility scores

#### DC-06: Specialized Division Chief
**Manages:** Algorithm, Life CEO, Mr Blue agents  
**Responsibility:** Specialized feature quality, AI costs  
**Key Metrics:** AI costs, algorithm performance, user satisfaction

### Domain Coordinators (9 agents)

#### CD-01: User Experience Coordinator
**Domains:** Authentication, Profiles, Social Graph  
**Agents:** L3 (Auth), L16 (User), L22 (Follow), L23 (Profile)

#### CD-02: Content Coordinator
**Domains:** Posts, Comments, Reactions, Hashtags  
**Agents:** L17 (Post), L19 (Comment), L20 (Reaction), L27 (Hashtag)

#### CD-03: Events Coordinator
**Domains:** Events, RSVPs, Calendar  
**Agents:** L18 (Event), L26 (RSVP), L33 (Calendar)

#### CD-04: Communication Coordinator
**Domains:** Notifications, Messages, Email  
**Agents:** L21 (Notification), L25 (Message), L11 (Email)

#### CD-05: Community Coordinator
**Domains:** Groups, Moderation, Reporting  
**Agents:** L24 (Group), L30 (Report), L37 (Moderation Queue)

#### CD-06: Media Coordinator
**Domains:** File Storage, Media Processing, Cloudinary  
**Agents:** L10 (File Storage), L29 (Media), Cloudinary Integration

#### CD-07: Analytics Coordinator
**Domains:** Analytics, Recommendations, Personalization  
**Agents:** L36 (Analytics), L48 (Recommendation), L53 (Personalization)

#### CD-08: AI Services Coordinator
**Domains:** OpenAI, Multi-AI, Life CEO  
**Agents:** OpenAI Integration, Multi-AI Provider, Life CEO agents

#### CD-09: Platform Coordinator
**Domains:** Customer Journey, Subscriptions, Payments  
**Agents:** L41 (Customer Journey), L34 (Subscription), L35 (Payment)

### Leadership Patterns

```typescript
// Division Chief orchestration
class DivisionChief {
  agents: Agent[];

  async healthCheck(): Promise<HealthReport> {
    const reports = await Promise.all(
      this.agents.map(agent => agent.healthCheck())
    );

    return {
      overall: reports.every(r => r.status === 'healthy') ? 'healthy' : 'degraded',
      agents: reports,
    };
  }

  async orchestrate(task: Task): Promise<Result> {
    // Delegate to appropriate agent
    const agent = this.selectAgent(task);
    return agent.execute(task);
  }
}

// Domain Coordinator workflow
class DomainCoordinator {
  async coordinateWorkflow(request: Request): Promise<Response> {
    // Multi-agent workflow
    const user = await this.userAgent.getUser(request.userId);
    const post = await this.postAgent.createPost(user.id, request.data);
    await this.notificationAgent.notifyFollowers(user.id, post);

    return { success: true, post };
  }
}
```

---

## Cross-Agent Communication

### Event Bus Pattern
```typescript
// Agents communicate via event bus
class EventBus {
  private subscribers = new Map<string, Function[]>();

  subscribe(event: string, handler: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(handler);
  }

  publish(event: string, data: any) {
    const handlers = this.subscribers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
}

// Usage
eventBus.subscribe('post:created', (post) => {
  notificationAgent.notifyFollowers(post.userId, post);
  feedRankingAgent.updateFeed(post);
});
```

---

## Total Agent Count Summary

**Layer Agents:** 61 (L1-L61)
- Foundation: 15
- Core: 15
- Business: 16
- Intelligence: 15

**Page Agents:** 125 (PA-001 to PA-125)

**Specialized Agents:** 69
- Algorithm: 30
- Life CEO: 16
- Mr Blue: 8
- Leadership: 15

**TOTAL: 255 DOCUMENTED AGENTS**

Plus 61 ESA Infrastructure agents = **316 total system agents**

---

## Best Practices Across All Agent Types

✅ **DO:**
- Follow single responsibility principle
- Implement health checks
- Log all operations
- Use typed interfaces
- Cache expensive operations
- Implement retries for transient failures
- Track performance metrics
- Document agent dependencies

❌ **DON'T:**
- Create circular dependencies
- Skip error handling
- Bypass other agents (respect hierarchy)
- Ignore performance budgets
- Hard-code configuration
- Skip testing
- Forget to update documentation

**Related Documentation:**
- `docs/MT_AGENT_ARCHITECTURE.md` - Agent system overview
- `docs/LAYER_AGENT_COORDINATION.md` - Inter-agent communication
- `docs/AGENT_TESTING_GUIDE.md` - Agent testing patterns
