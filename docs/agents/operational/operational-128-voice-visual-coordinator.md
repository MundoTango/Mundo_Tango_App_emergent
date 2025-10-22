# Agent #128 - Voice + Visual Context Coordinator

**Type:** Operational Agent  
**Category:** Mr Blue Integration  
**Created:** October 22, 2025  
**Status:** Active

---

## 🎯 Purpose

Seamlessly integrate voice commands with Visual Editor element selection, enabling users to click UI elements and ask contextual questions via voice.

**Core Mission:** Make Mr Blue understand "what you're pointing at" during voice conversations.

---

## 🔧 Responsibilities

### 1. **Context Capture**
- Track Visual Editor selected element during voice recording
- Bind element data (tag, id, className, attributes) to transcript
- Maintain element context across voice session lifecycle

### 2. **Multi-Modal Prompt Engineering**
- Format element context for AI consumption
- Enhance system prompts with visual context
- Generate context-aware responses

### 3. **Real-Time Integration**
- Sync transcript streaming with element selection
- Update UI when element context changes
- Clear context on element deselection

### 4. **Intent Detection**
- Recognize element-specific intents ("what does this do?")
- Detect creation intents ("make a button like this")
- Identify modification requests ("change this color to blue")

---

## 📋 Implementation Details

### **API Endpoints**
- `POST /api/chat/summarize` - Enhanced with `visualContext` field
- `POST /api/mrblue/chat` - Includes element context in system prompt
- WebSocket `/api/realtime/connect` - Streams transcript + element binding

### **Frontend Components**
- `UnifiedVoiceModal` - Receives `selectedElement` prop
- Element context badge - Purple indicator showing selected element
- Real-time transcript - Auto-scrolling with context highlights

### **Backend Processing**
```typescript
// System prompt enhancement
const systemPrompt = `You are Mr Blue, an AI assistant.
${visualContext ? `
VISUAL CONTEXT: User has selected element:
- Tag: <${visualContext.tagName}>
- ID: ${visualContext.id}
- Purpose: ${detectPurpose(visualContext)}
Consider this context when answering.
` : ''}
`;
```

---

## 🧪 Testing Protocol

### **Minimum 8 Functional Tests Required:**

1. **Context Capture Test**
   - Select element → Start recording → Verify context captured

2. **Transcript + Context Binding**
   - Record audio with element selected → Check API receives both

3. **AI Response Accuracy**
   - Ask "what does this do?" → Verify response mentions element

4. **Fallback Without Selection**
   - Record without selecting element → Verify graceful fallback

5. **Context Change During Session**
   - Select element A → Record → Select element B → Verify update

6. **WebSocket Parsing**
   - Send transcript chunk → Verify no parsing errors

7. **Summary with Context**
   - Generate AI summary → Verify element mentioned in bullets

8. **Permission Handling**
   - Deny microphone → Verify clear error message

---

## 📊 Success Metrics

- ✅ Transcript appears in < 500ms
- ✅ Element context included in 100% of queries when selected
- ✅ AI responses reference element correctly
- ✅ 0 WebSocket parsing errors
- ✅ Fallback works when no element selected

---

## 🔗 Integration Points

**Coordinates With:**
- **Agent #79 (Quality Validator)** - Validates implementation quality
- **Agent #80 (Learning Coordinator)** - Learns voice+visual patterns
- **Visual Editor** - Receives selected element data
- **Mr Blue AI** - Consumes context for responses

**Reports To:**
- Agent #79 for quality validation
- Agent #0 (ESA Orchestrator) for coordination

---

## 📝 Example User Journey

```
User Flow:
1. User opens Visual Editor
2. Clicks "Share Memory" button (purple outline appears)
3. Clicks headphone icon to open voice modal
4. Sees purple badge: "<button> #share-memory"
5. Speaks: "What does this button do?"
6. Mr Blue responds: "The 'Share Memory' button opens a modal 
   allowing users to create and share tango memories. It 
   triggers the createMemory() function in MemoriesPage.tsx."
```

---

## 🚀 Dependencies

- `useVisualEditorOptional()` hook (already exists)
- `UnifiedVoiceModal` component (already exists)
- OpenAI Realtime API WebSocket connection
- Claude 3.5 Sonnet for summarization

---

## 📖 Documentation

- Implementation: `docs/VOICE_VISUAL_INTEGRATION_COMPLETE.md`
- Testing: `docs/ESA_AGENT_TESTING_PROTOCOL.md`
- User Guide: `docs/MrBlue/VOICE_MODE_USER_GUIDE.md`

---

**Last Updated:** October 22, 2025  
**Next Review:** After 100 voice+visual sessions logged
