# CONVERSATION MODULE - MB.MD COMPREHENSIVE PLAN
**Date:** October 23, 2025  
**Methodology:** MB.MD (Mapping → Breakdown → Mitigation → Deployment)  
**Execution Mode:** SIMULTANEOUS (All agents work in parallel)

---

## 📋 EXECUTIVE SUMMARY

The Conversation Module is the **unified communication system** across Mundo Tango's Mr Blue AI platform, integrating:
- **Text Chat** (multi-model AI conversations)
- **Voice Conversations** (GPT-4o Realtime API with 320ms latency)
- **Project Management** (ChatGPT-style folders)
- **Conversation History** (persistence, replay, analytics)
- **Tool Execution** (11 Omniscient Mode tools via function calling)

**Current Status:** ⚠️ **CRITICAL ISSUE** - Voice mode WebSocket connection race condition causing disconnects
**Goal:** Fix existing issues + Build comprehensive conversation ecosystem in SIMULTANEOUS mode

---

## 🗺️ PHASE 1: MAPPING - Complete Architecture

### 1.1 DATABASE LAYER (5 Tables)

| Table | Purpose | Status | Agent |
|-------|---------|--------|-------|
| `chat_projects` | ChatGPT-style project folders | ✅ Exists | Agent #121 (Data) |
| `ai_chat_messages` | Text chat messages (multi-model) | ✅ Exists | Agent #121 (Data) |
| `voice_conversation_turns` | Voice transcript/audio history | ✅ Exists | Agent #121 (Data) |
| `model_usage` | Cost/performance tracking | ✅ Exists | Agent #121 (Data) |
| `chat_messages` | Legacy chat (groups/rooms) | ✅ Exists | Agent #122 (Legacy) |

**Missing Tables:**
- `conversation_analytics` - Advanced metrics, sentiment, engagement scores
- `conversation_bookmarks` - Saved moments/highlights
- `conversation_sharing` - Share links, privacy controls

### 1.2 BACKEND API LAYER (9 Route Files)

| Route File | Endpoints | Status | Agent |
|------------|-----------|--------|-------|
| `chatProjectsRoutes.ts` | `/api/chat/projects/*` | ✅ Working | Agent #123 (API) |
| `voiceConversationRoutes.ts` | `/api/voice/conversations/*` | ✅ Working | Agent #123 (API) |
| `realtimeRoutes.ts` | WebSocket `/api/realtime/connect` | ⚠️ Race Condition | Agent #124 (Realtime) |
| `chatSummarizationRoutes.ts` | `/api/chat/summarize` | ✅ Working | Agent #125 (AI) |
| `ttsRoutes.ts` | `/api/tts/*` | ✅ Working | Agent #125 (AI) |
| `multiModelRoutes.ts` | `/api/multi-model/*` | ✅ Working | Agent #125 (AI) |
| `messagesRoutes.ts` | Legacy `/api/messages/*` | ✅ Working | Agent #122 (Legacy) |

**Missing Routes:**
- `/api/conversations/search` - Full-text search across all conversations
- `/api/conversations/export` - Export conversations (PDF, markdown, JSON)
- `/api/conversations/analytics` - Dashboard metrics

### 1.3 FRONTEND COMPONENTS (21 Components)

| Component | Purpose | Status | Agent |
|-----------|---------|--------|-------|
| `ChatInterface.tsx` | Main chat UI (Mr Blue) | ✅ Working | Agent #126 (UI) |
| `UnifiedVoiceModal.tsx` | Voice session interface | ⚠️ Connection Issues | Agent #127 (Voice) |
| `ConversationHistoryPanel.tsx` | Voice history replay | ✅ Working | Agent #127 (Voice) |
| `ModelSelector.tsx` | AI model dropdown | ✅ Working | Agent #126 (UI) |
| `PersonalitySelector.tsx` | Mr Blue personality modes | ✅ Working | Agent #126 (UI) |
| `VoiceSelector.tsx` | TTS voice selection | ✅ Working | Agent #127 (Voice) |
| `EnhancedMessageBubble.tsx` | Message rendering | ✅ Working | Agent #126 (UI) |
| `CodeChangeCard.tsx` | Code diff preview | ✅ Working | Agent #126 (UI) |
| `ProjectSelector.tsx` | Project switcher | ✅ Working | Agent #126 (UI) |
| `CompactVoiceToggle.tsx` | Voice mode toggle | ✅ Working | Agent #127 (Voice) |
| `RealtimeVoiceMode.tsx` | Realtime voice UI | ✅ Working | Agent #127 (Voice) |
| `VoiceControls.tsx` | Mute/unmute controls | ✅ Working | Agent #127 (Voice) |

**Missing Components:**
- `ConversationSearchModal.tsx` - Search interface
- `ConversationExportModal.tsx` - Export options
- `ConversationAnalyticsDashboard.tsx` - Visual analytics
- `VoiceVisualizerWaveform.tsx` - Real-time audio visualization
- `ConversationSettingsPanel.tsx` - Preferences, notifications
- `SharedConversationView.tsx` - Public share links
- `ConversationTemplates.tsx` - Quick-start templates
- `VoiceLanguageDetector.tsx` - Auto-detect & switch languages
- `ConversationMergeModal.tsx` - Combine conversations

### 1.4 CUSTOM HOOKS (8 Hooks)

| Hook | Purpose | Status | Agent |
|------|---------|--------|-------|
| `useRealtimeConversation.ts` | GPT-4o Realtime WebSocket | ⚠️ Race Condition | Agent #128 (Hooks) |
| `useAudioCapture.ts` | Microphone capture (PCM16) | ✅ Working | Agent #128 (Hooks) |
| `useAudioPlayback.ts` | Audio queue playback | ✅ Working | Agent #128 (Hooks) |
| `useVoiceOutput.ts` | TTS orchestration | ✅ Working | Agent #128 (Hooks) |
| `useVoiceInput.ts` | Speech-to-text | ✅ Working | Agent #128 (Hooks) |
| `useSpeechRecognition.ts` | Browser speech API | ✅ Working | Agent #128 (Hooks) |
| `useMultiModel.ts` | Model switching logic | ✅ Working | Agent #128 (Hooks) |

**Missing Hooks:**
- `useConversationSearch.ts` - Search state management
- `useConversationExport.ts` - Export flow
- `useConversationAnalytics.ts` - Analytics fetching
- `useVoiceVisualization.ts` - Audio visualization data
- `useConversationSync.ts` - Cross-device sync
- `useConversationSharing.ts` - Share link generation

### 1.5 SERVICES LAYER (6 Services)

| Service | Purpose | Status | Agent |
|---------|---------|--------|-------|
| `multiModelOrchestrator.ts` | Route to correct AI model | ✅ Working | Agent #129 (Services) |
| `universalToolOrchestrator.ts` | Execute function calls | ✅ Working | Agent #129 (Services) |
| `realtimeToolAdapter.ts` | Realtime API tool schema | ✅ Working | Agent #129 (Services) |
| `lifeCEOChatService.ts` | Life CEO agent chats | ✅ Working | Agent #129 (Services) |
| `aiModelService.ts` | Model configs | ✅ Working | Agent #129 (Services) |

**Missing Services:**
- `conversationSearchService.ts` - Vector search, full-text
- `conversationExportService.ts` - Multi-format export
- `conversationAnalyticsService.ts` - Metrics calculation
- `conversationCacheService.ts` - Redis caching layer
- `conversationNotificationService.ts` - @mention alerts

---

## 📊 PHASE 2: BREAKDOWN - Agent Responsibilities

### Agent #121: Database Architecture Specialist
**Role:** Schema design, migrations, query optimization  
**Current Work:** Maintain 5 conversation tables  
**New Tasks:**
1. Create 3 missing tables (`conversation_analytics`, `conversation_bookmarks`, `conversation_sharing`)
2. Add indexes for search performance
3. Implement soft delete for conversations
4. Add conversation tags/labels column

**Learnings Needed:**
- Vector embeddings for semantic search
- Time-series data for analytics
- Privacy models for sharing

### Agent #122: Legacy Integration Specialist
**Role:** Maintain backward compatibility with old chat system  
**Current Work:** `messagesRoutes.ts`, `chat_messages` table  
**New Tasks:**
1. Migration path from old chat to new projects
2. Deprecation warnings
3. Data export for old users

**Learnings Needed:**
- Data migration strategies
- Graceful deprecation UX

### Agent #123: API Routes Specialist
**Role:** RESTful endpoint design, authentication, validation  
**Current Work:** `/api/chat/projects/*`, `/api/voice/conversations/*`  
**New Tasks:**
1. Build `/api/conversations/search` (full-text + semantic)
2. Build `/api/conversations/export` (PDF, MD, JSON)
3. Build `/api/conversations/analytics` (dashboards)
4. Add rate limiting
5. Add pagination

**Learnings Needed:**
- ElasticSearch / PostgreSQL full-text search
- PDF generation libraries
- Rate limiting algorithms

### Agent #124: Realtime WebSocket Specialist
**Role:** WebSocket connections, OpenAI Realtime API proxy  
**Current Work:** `/api/realtime/connect`, OpenAI proxy  
**CRITICAL BUG:** Race condition - audio capture starts before connection ready  
**New Tasks:**
1. **FIX:** Add connection status polling before audio capture
2. Add connection health monitoring
3. Add automatic reconnection
4. Add WebSocket heartbeat/ping-pong
5. Add connection quality metrics

**Learnings Needed:**
- WebSocket lifecycle management
- Connection pooling
- Backpressure handling
- Audio streaming protocols

### Agent #125: AI Integration Specialist  
**Role:** Multi-model orchestration, summarization, TTS  
**Current Work:** `/api/chat/summarize`, `/api/tts/*`, `/api/multi-model/*`  
**New Tasks:**
1. Implement conversation summarization with visual context
2. Add multi-language TTS support
3. Add sentiment analysis
4. Add conversation templates

**Learnings Needed:**
- Claude vs GPT-4 summarization quality
- Multi-language TTS (OpenAI vs browser native)
- Sentiment analysis APIs

### Agent #126: UI Components Specialist
**Role:** React components, Tailwind CSS, shadcn/ui integration  
**Current Work:** 12 existing conversation UI components  
**New Tasks:**
1. Build `ConversationSearchModal.tsx`
2. Build `ConversationExportModal.tsx`
3. Build `ConversationAnalyticsDashboard.tsx`
4. Build `ConversationSettingsPanel.tsx`
5. Build `SharedConversationView.tsx`
6. Build `ConversationTemplates.tsx`
7. Build `ConversationMergeModal.tsx`
8. Add skeleton loaders
9. Add error boundaries

**Learnings Needed:**
- React Query infinite scrolling
- shadcn/ui advanced patterns
- Framer Motion animations
- Accessibility (ARIA labels)

### Agent #127: Voice Interface Specialist
**Role:** Voice UI/UX, audio controls, visualization  
**Current Work:** `UnifiedVoiceModal.tsx`, `ConversationHistoryPanel.tsx`, voice controls  
**CRITICAL BUG:** Connection race condition  
**New Tasks:**
1. **FIX:** Wait for WebSocket connection before starting audio
2. Build `VoiceVisualizerWaveform.tsx` (real-time waveform)
3. Build `VoiceLanguageDetector.tsx` (auto-detect language)
4. Add voice activity detection UI feedback
5. Add audio level meters
6. Add noise cancellation toggle

**Learnings Needed:**
- Web Audio API visualization
- Canvas rendering for waveforms
- Language detection algorithms
- Audio processing (noise cancellation)

### Agent #128: Custom Hooks Specialist
**Role:** React hooks, state management, data fetching  
**Current Work:** 7 voice/audio/multi-model hooks  
**CRITICAL BUG:** `useRealtimeConversation.ts` race condition  
**New Tasks:**
1. **FIX:** Add connection status polling in `useRealtimeConversation.ts`
2. Build `useConversationSearch.ts`
3. Build `useConversationExport.ts`
4. Build `useConversationAnalytics.ts`
5. Build `useVoiceVisualization.ts`
6. Build `useConversationSync.ts`
7. Build `useConversationSharing.ts`

**Learnings Needed:**
- React Query advanced patterns
- WebSocket state management
- Optimistic updates
- Cross-tab communication (BroadcastChannel)

### Agent #129: Backend Services Specialist
**Role:** Business logic, orchestration, external API integration  
**Current Work:** 5 existing services (multi-model, tools, Life CEO chat)  
**New Tasks:**
1. Build `conversationSearchService.ts` (vector + full-text)
2. Build `conversationExportService.ts` (multi-format)
3. Build `conversationAnalyticsService.ts`
4. Build `conversationCacheService.ts` (Redis)
5. Build `conversationNotificationService.ts`

**Learnings Needed:**
- pgvector for semantic search
- Redis caching strategies
- PDF generation (Puppeteer vs libraries)
- Email/push notification services

### Agent #130: Testing & QA Specialist
**Role:** E2E tests, integration tests, regression prevention  
**Current Work:** `06-mr-blue-tabs.spec.ts`  
**New Tasks:**
1. Write conversation flow E2E tests
2. Write voice mode E2E tests (mock WebSocket)
3. Write API integration tests
4. Write database migration tests
5. Add performance benchmarks

**Learnings Needed:**
- Playwright WebSocket mocking
- Audio testing strategies
- Database snapshot testing
- Performance profiling

---

## 🛠️ PHASE 3: MITIGATION - Detailed Build Plan

### 🚨 CRITICAL PATH (Must Fix First)

#### Task 3.1: Fix Voice WebSocket Race Condition
**Agent:** #124 (Realtime), #127 (Voice), #128 (Hooks)  
**Priority:** P0 (Blocking)  
**Files:**
- `client/src/hooks/useRealtimeConversation.ts`
- `client/src/components/mrBlue/UnifiedVoiceModal.tsx`
- `server/routes/realtimeRoutes.ts`

**Implementation:**
```typescript
// client/src/components/mrBlue/UnifiedVoiceModal.tsx
const startSession = async () => {
  await connect(); // Start WebSocket connection
  
  // Wait for connection to be ready
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), 10000);
    const interval = setInterval(() => {
      if (realtimeStatus === 'connected') {
        clearTimeout(timeout);
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
  
  await startCapture(); // NOW start audio capture
};
```

**Acceptance Criteria:**
- ✅ Connection establishes before audio starts
- ✅ No "disconnected" status after starting session
- ✅ OpenAI receives audio chunks
- ✅ VAD detects speech properly

---

### 🏗️ SIMULTANEOUS BUILD TRACKS (All agents work in parallel)

#### Track A: Database Foundation (Agent #121)
**Duration:** 2 days  
**Tasks:**
1. Create `conversation_analytics` table
2. Create `conversation_bookmarks` table
3. Create `conversation_sharing` table
4. Add GIN indexes for full-text search
5. Add pgvector extension for semantic search
6. Write migration scripts

**Deliverables:**
- [ ] 3 new tables in schema.ts
- [ ] Migration files
- [ ] Seed data for testing

#### Track B: Search & Export APIs (Agent #123 + #129)
**Duration:** 3 days  
**Tasks:**
1. Build `/api/conversations/search` endpoint
2. Build search service with PostgreSQL full-text
3. Build `/api/conversations/export` endpoint
4. Build export service (PDF, markdown, JSON)
5. Add pagination
6. Add rate limiting

**Deliverables:**
- [ ] 2 new route files
- [ ] 2 new service files
- [ ] API documentation

#### Track C: Analytics Dashboard (Agent #125 + #126 + #129)
**Duration:** 4 days  
**Tasks:**
1. Build analytics service (metrics calculation)
2. Build `/api/conversations/analytics` endpoint
3. Build `ConversationAnalyticsDashboard.tsx`
4. Add charts (usage, models, languages, tools)
5. Add sentiment analysis visualization

**Deliverables:**
- [ ] Analytics service
- [ ] API endpoint
- [ ] Dashboard component
- [ ] Chart components

#### Track D: Voice Enhancements (Agent #127 + #128)
**Duration:** 3 days  
**Tasks:**
1. Build `VoiceVisualizerWaveform.tsx`
2. Build `useVoiceVisualization.ts`
3. Build `VoiceLanguageDetector.tsx`
4. Add audio level meters
5. Add VAD visual feedback
6. Add noise cancellation controls

**Deliverables:**
- [ ] 2 new components
- [ ] 1 new hook
- [ ] Web Audio API integration

#### Track E: Conversation Management (Agent #126 + #128)
**Duration:** 3 days  
**Tasks:**
1. Build `ConversationSearchModal.tsx` + `useConversationSearch.ts`
2. Build `ConversationExportModal.tsx` + `useConversationExport.ts`
3. Build `ConversationSettingsPanel.tsx`
4. Build `ConversationMergeModal.tsx`
5. Build `SharedConversationView.tsx` + `useConversationSharing.ts`

**Deliverables:**
- [ ] 5 new components
- [ ] 3 new hooks
- [ ] UI/UX documentation

#### Track F: Conversation Templates (Agent #125 + #126)
**Duration:** 2 days  
**Tasks:**
1. Design template structure (JSON schema)
2. Build `ConversationTemplates.tsx`
3. Create 10 starter templates (code review, brainstorm, debug, etc.)
4. Add template CRUD API

**Deliverables:**
- [ ] Template system
- [ ] 10 templates
- [ ] Template marketplace UI

#### Track G: Testing & Documentation (Agent #130)
**Duration:** Ongoing (parallel to all tracks)  
**Tasks:**
1. Write E2E tests for critical paths
2. Write integration tests for APIs
3. Write unit tests for hooks
4. Performance benchmarks
5. Update documentation

**Deliverables:**
- [ ] 50+ tests
- [ ] Performance reports
- [ ] Updated docs

---

## 🚀 PHASE 4: DEPLOYMENT - Execution Strategy

### 4.1 SIMULTANEOUS EXECUTION MODE

**Why SIMULTANEOUS?**
- Agents work **independently** on separate tracks
- **No dependencies** between most features
- **Fastest** time to complete system
- **Maximum parallelism**

**Coordination:**
- Daily standup (async via docs)
- Shared `docs/CONVERSATION_BUILD_STATUS.md`
- Git branches per track (`track-a-database`, `track-b-search`, etc.)
- Merge to `main` when track complete

### 4.2 EXECUTION ORDER

**Week 1:**
1. **Day 1:** Fix critical race condition (all hands on deck)
2. **Day 2-7:** All agents start their tracks SIMULTANEOUSLY

**Week 2:**
1. **Integration testing** - Combine all tracks
2. **QA review** - Agent #130 validates everything
3. **Performance tuning** - Optimize slow queries
4. **Documentation** - Update all docs

**Week 3:**
1. **Beta release** to super admins
2. **User feedback** collection
3. **Bug fixes**
4. **Production release** 🎉

### 4.3 SUCCESS METRICS

**Conversation Module Complete When:**
- [ ] All 9 agents complete their tracks
- [ ] All 50+ tests passing
- [ ] Voice mode works 100% reliably (no race conditions)
- [ ] Search finds conversations in <100ms
- [ ] Export generates PDFs in <2s
- [ ] Analytics dashboard loads in <500ms
- [ ] Zero LSP errors
- [ ] Zero console errors
- [ ] All features documented

---

## 📚 AGENT LEARNING RESOURCES

### For All Agents:
1. **MB.MD Methodology:** `docs/MB_MD_QA_PROTOCOL.md`
2. **Agent Learnings:** `docs/AGENT_LEARNINGS.md`
3. **5 Non-Negotiables:** `docs/DOCUMENTATION_VERIFICATION.md`

### By Agent:
**#121 (Database):** PostgreSQL full-text search, pgvector, JSONB indexing  
**#122 (Legacy):** Data migration patterns, backward compatibility  
**#123 (API):** REST best practices, rate limiting, pagination  
**#124 (Realtime):** WebSocket lifecycle, OpenAI Realtime API docs  
**#125 (AI):** Claude API, GPT-4o API, sentiment analysis  
**#126 (UI):** shadcn/ui docs, Framer Motion, React Query v5  
**#127 (Voice):** Web Audio API, Canvas rendering, audio processing  
**#128 (Hooks):** React Query patterns, WebSocket hooks, optimistic updates  
**#129 (Services):** Redis caching, PDF generation, vector search  
**#130 (Testing):** Playwright docs, WebSocket mocking, performance testing  

---

## 📝 BUILD STATUS TRACKING

**Location:** `docs/CONVERSATION_BUILD_STATUS.md`  
**Update Frequency:** Daily  
**Format:**
```markdown
## Track A: Database (Agent #121)
- [x] Task 1: Create conversation_analytics table
- [ ] Task 2: Create conversation_bookmarks table
- [ ] Task 3: Create conversation_sharing table
...
```

---

## 🎯 CONCLUSION

This MB.MD plan provides:
1. **Complete architecture map** (75+ components)
2. **Clear agent responsibilities** (10 specialized agents)
3. **Detailed task breakdown** (7 parallel tracks)
4. **Execution strategy** (SIMULTANEOUS mode)
5. **Success criteria** (measurable outcomes)

**Next Steps:**
1. **All agents:** Read this document
2. **All agents:** Read assigned learning resources
3. **All agents:** BEGIN work on your track
4. **Daily:** Update build status
5. **Week 2:** Integration & QA
6. **Week 3:** Launch! 🚀
