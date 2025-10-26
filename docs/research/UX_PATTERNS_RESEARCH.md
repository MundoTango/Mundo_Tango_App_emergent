# UX Patterns for AI Interfaces Research

**Research Date:** October 26, 2025  
**Research Agent:** Agent #136 - UX Research Specialist  
**Objective:** Document conversational UI patterns, error messaging, loading states, and accessibility standards for non-technical users

---

## Executive Summary

AI interfaces require fundamentally different UX patterns than traditional software. Non-technical users expect natural conversations, forgiveness for ambiguity, and clear feedback when systems are uncertain.

**Key Findings:**
1. **Simplicity beats sophistication** for non-technical users
2. **Typing animations** need minimum 2-second delay for natural feel
3. **Error messages must offer alternatives**, not just explanations
4. **AI can only catch 30% of WCAG issues** - human testing is essential
5. **Conversational tone** (e.g., "Let me check") outperforms technical language ("Processing request")

---

## 1. Conversational UI Best Practices

### 1.1 Core Design Principles

**Set Clear Expectations from the Start:**
- Communicate purpose upfront: "I can help you edit your website. Try asking: 'Make the title bigger'"
- Use onboarding prompts with example questions
- Identify as non-human: "I'm Mr Blue, your AI coding assistant"

**Use Simple, Natural Language:**
- ❌ "Initializing DOM manipulation subroutine"
- ✅ "Let me update that for you"
- Write at 6th-8th grade reading level
- Break complex info into bite-sized chunks (1-3 sentences)

**Guide Users with Structured Options:**
- Multi-choice buttons limit free-text confusion
- Quick replies: "Yes", "No", "Tell me more"
- Progressive disclosure: Start simple, expand details on request

---

### 1.2 Interaction Patterns

**Pattern 1: Handle Errors Gracefully**
```
❌ "Sorry, I didn't understand that."
❌ "Sorry, I didn't understand that." (repeated endlessly)

✅ "I'm not sure which button you mean. Could you point to it or describe it?"
✅ "Hmm, I'm having trouble with that. Would you like to try something else?"
```

**Key Rules:**
- Vary error messages (don't repeat the same one)
- Offer workarounds: "Would you like to speak with a human?" or show menu
- Allow natural corrections: "No, I meant the blue button"

---

**Pattern 2: Maintain Conversation Context**
```typescript
// Bad: Stateless interactions
User: "Make the button red"
AI: "Which button?"
User: "The submit button"
AI: "Which button?" // Lost context

// Good: Context-aware
User: "Make the button red"
AI: "Which button?"
User: "The submit button"
AI: "Got it! Making the submit button red." // Remembers previous exchange
```

**Implementation:**
- Remember previous messages in session
- Provide conversation history (scroll back)
- Context-aware responses reference earlier topics

---

**Pattern 3: Efficient Conversation Flow**

**Structure like a sandwich:**
1. **Opening** - "Hello, how can I help?"
2. **Main activity** - Answering questions, completing tasks
3. **Closing** - "Anything else?" → "Goodbye"

**Keep utterances concise:**
- Default to brief responses
- Expand only when user needs require it
- Use "Show more" buttons for additional details

---

### 1.3 Visual & Interaction Design

**Clear Message Bubbles:**
```css
.user-message {
  background: #E8F4F8; /* Light teal */
  align-self: flex-end;
  border-radius: 18px 18px 4px 18px;
}

.ai-message {
  background: #FFFFFF;
  align-self: flex-start;
  border-radius: 18px 18px 18px 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
```

**High Contrast:**
- Text: Minimum 4.5:1 contrast ratio (WCAG AA)
- 7:1 for AAA compliance

**Responsive Design:**
- Mobile-first approach
- Touch-friendly buttons (minimum 44x44px)
- Adapt layout for mobile, tablet, desktop

**Whitespace:**
- 16px between message bubbles
- Avoid cluttering interface

---

### 1.4 Accessibility Requirements

**Screen Reader Support:**
```html
<div role="log" aria-live="polite" aria-atomic="false">
  <div role="article" aria-label="Message from Mr Blue">
    Let me update that for you
  </div>
</div>
```

**Keyboard Navigation:**
- Tab through interface easily
- Enter to send message
- Esc to close modals
- Arrow keys for history

**Alt Text for Images:**
```html
<img src="/generated-component.png" alt="Preview of blue submit button with white text" />
```

**Voice Commands:**
- Offer speech-to-text for users who can't type
- Captions for voice responses

---

### 1.5 Balance Proactivity with User Control

**Don't Overwhelm:**
- ❌ Auto-popup immediately when page loads
- ✅ Minimized state until user clicks

**Let Users Initiate:**
- Floating button in corner
- Clear "Start Chat" call-to-action

**Provide Escape Hatches:**
- Always offer "Exit chat" or "Speak to human" options
- Don't trap users in AI-only paths

---

## 2. Error Messaging Patterns

### 2.1 Graceful Degradation Messaging

**Pattern: Offer Alternatives When Uncertain**
```
❌ "Error: Could not parse command"
✅ "I'm not sure I understood that. Did you mean:
    • Change button color to red
    • Change background color to red
    Or could you rephrase?"
```

---

### 2.2 Tiered Error Management

**Level 1 - Auto-Recovery:**
- AI handles common errors independently
- Example: API rate-limit retries (exponential backoff)

**Level 2 - Guided Assistance:**
- System helps users correct issues
- Example: "The color 'blu' isn't valid. Did you mean 'blue'?"

**Level 3 - Human Handoff:**
- Seamless transition to support
- Example: "This is complex. Connecting you to the team..."

---

### 2.3 Error Message Best Practices

✅ **Explain clearly** what went wrong  
✅ **Offer actionable solutions** or alternative paths  
✅ **Maintain consistent tone** across error states  
✅ **Show context**: Reference what the user was trying to do  
✅ **Enable retry/edit**: Let users modify inputs without starting over  

**Example:**
```
❌ "Operation failed. Error code: 422."

✅ "I couldn't save your changes because the button name is too long.
    Try shortening it to under 50 characters.
    [Edit Button Name] [Cancel]"
```

---

## 3. Loading States Patterns

### 3.1 Status Indicators (AI SDK Pattern)

**Four States:**
1. **`submitted`** - Message sent, awaiting response
2. **`streaming`** - AI actively generating response chunks
3. **`ready`** - Response complete, can accept new input
4. **`error`** - Request failed

**Implementation:**
```typescript
import { useChat } from 'ai/react';

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, status, error } = useChat();
  
  return (
    <div>
      {messages.map(m => <Message key={m.id} {...m} />)}
      
      {status === 'submitted' && <div>Sending message...</div>}
      {status === 'streaming' && <TypingIndicator />}
      
      {error && (
        <ErrorMessage>
          <p>Something went wrong. {error.message}</p>
          <button onClick={handleSubmit}>Try Again</button>
        </ErrorMessage>
      )}
      
      <form onSubmit={handleSubmit}>
        <input 
          value={input} 
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
        <button type="submit" disabled={status !== 'ready'}>Send</button>
        {status === 'streaming' && <button onClick={stop}>Stop</button>}
      </form>
    </div>
  );
}
```

---

### 3.2 Visual Feedback During Generation

**Typing Animation:**
```tsx
function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
    </div>
  );
}
```

```css
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
```

**⚠️ Important:** Add minimum 2-second delay for natural feel, even if response is instant.

---

**Processing Status Messages:**
```
❌ "Retrieving data..."
✅ "Let me check that for you..."

❌ "Executing query..."
✅ "Looking through your files..."
```

**Progress Indicators:**
```tsx
<div className="progress">
  <span>✅ Understanding your request</span>
  <span>⏳ Generating code...</span>
  <span>⏸️ Applying changes</span>
</div>
```

---

**Partial Results (Streaming):**
```typescript
// Display content as it streams
{messages.map(msg => (
  <div key={msg.id}>
    {msg.content} {/* Updates in real-time */}
    {msg.isStreaming && <span className="cursor">▌</span>}
  </div>
))}
```

---

**Stop Button:**
```tsx
{status === 'streaming' && (
  <button onClick={stop} className="stop-btn">
    Stop Generating
  </button>
)}
```

---

### 3.3 Context Preservation

**Show conversation history while generating:**
```tsx
<div className="chat-container">
  {/* Previous messages always visible */}
  {messages.slice(0, -1).map(msg => <Message key={msg.id} {...msg} />)}
  
  {/* Current streaming message */}
  {currentMessage && (
    <Message {...currentMessage} isStreaming={true} />
  )}
</div>
```

**Persist user context if they navigate away:**
```typescript
// Save to localStorage
localStorage.setItem('mrblue-session', JSON.stringify({
  messages,
  context: editorState,
  timestamp: Date.now()
}));

// Restore on return
const savedSession = localStorage.getItem('mrblue-session');
if (savedSession) {
  const { messages, context } = JSON.parse(savedSession);
  restoreSession(messages, context);
}
```

---

## 4. WCAG Accessibility for AI Editors

### 4.1 Critical Limitations of AI Accessibility Tools

**What AI Can't Do:**
- ❌ Only catches ~30% of WCAG issues
- ❌ Can't test real screen reader experience
- ❌ Struggles with context (e.g., alt text often generic: "a person sitting at a desk")
- ❌ Misses dynamic content issues (pop-ups, dropdowns)
- ❌ Can't verify form error message clarity
- ❌ No keyboard support validation

**Example:** ChatGPT, Bard, Fix My Code all produced tab components with major accessibility flaws when asked for "WCAG-compliant code".

---

### 4.2 Best Practices for AI + WCAG

**Use AI as a Starting Point:**
- Leverage AI for quick wins: alt text generation, contrast checking, ARIA labeling
- Scan regularly for new issues

**Always Follow Up with Human Review:**
- Test with actual screen readers (JAWS, NVDA, VoiceOver)
- Verify keyboard navigation manually
- Check that alt text is meaningful, not just descriptive
- Validate forms and error messages with real users

---

### 4.3 WCAG Key Guidelines

**WCAG 1.1.1 - All images need meaningful alt text:**
```html
❌ <img src="component.png" alt="Image">
✅ <img src="component.png" alt="Blue submit button with white text and rounded corners">
```

**WCAG 2.4.4 - Link text must be descriptive:**
```html
❌ <a href="/docs">Click here</a>
✅ <a href="/docs">View component documentation</a>
```

**WCAG 1.4.3 - Minimum contrast ratio of 4.5:1:**
```css
/* Check with browser DevTools */
color: #333; /* Dark gray */
background: #FFF; /* White */
/* Contrast ratio: 12.6:1 ✅ */
```

**WCAG 3.1.5 - Content should be clear and simple:**
- Use plain language (6th-8th grade level)
- Break up long paragraphs
- Use headings and lists

---

### 4.4 Code-Level Best Practices

**Semantic HTML:**
```html
<!-- Good heading hierarchy -->
<h1>Mr Blue - AI Coding Assistant</h1>
<h2>Recent Conversations</h2>
<h3>Today</h3>
```

**ARIA Attributes:**
```html
<button 
  aria-label="Send message to Mr Blue"
  aria-controls="chat-input"
>
  Send
</button>

<div 
  role="log" 
  aria-live="polite"
  aria-label="Chat messages"
>
  <!-- Messages appear here -->
</div>
```

**Keyboard Accessibility:**
```tsx
<div 
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') closeChat();
  }}
>
  Chat interface
</div>
```

**Focus Indicators:**
```css
button:focus-visible {
  outline: 2px solid #0EA5E9; /* Teal */
  outline-offset: 2px;
}
```

---

### 4.5 Testing Tools

**Automated Testing:**
- **WAVE** - https://wave.webaim.org/
- **axe DevTools** - Browser extension
- **Google Lighthouse** - Built into Chrome DevTools

**Screen Readers for Manual Testing:**
- **JAWS** (Windows) - Industry standard
- **NVDA** (Windows, free) - https://www.nvaccess.org/
- **VoiceOver** (macOS/iOS, built-in) - Cmd+F5 to enable

---

## 5. Real-World Examples

| Interface | Error Pattern | Loading Pattern | Accessibility |
|-----------|--------------|-----------------|--------------|
| **ChatGPT** | Offers to regenerate responses; shows model limitations | Streaming text with stop button | Screen reader support, keyboard nav |
| **Grammarly** | Refines suggestions based on user corrections | Real-time inline feedback | WCAG AA compliant |
| **Replit Agent** | Provides alternative approaches on failure | Visual "thinking" animation with steps | Alt text for screenshots |
| **Cursor** | Suggests fixes when code fails | Progress bar for multi-file operations | Keyboard shortcuts for all actions |

---

## 6. Implementation Checklist for Mundo Tango

### Phase 1: Conversational UI (Week 1)
- [ ] Set clear expectations in onboarding
- [ ] Use simple, natural language in all AI responses
- [ ] Implement multi-choice buttons for ambiguous requests
- [ ] Add varied error messages (no repetition)
- [ ] Maintain conversation context across session

### Phase 2: Loading & Error States (Week 2)
- [ ] Implement typing animation with 2s minimum delay
- [ ] Add processing status messages ("Let me check...")
- [ ] Show progress indicators for multi-step tasks
- [ ] Enable streaming display of partial results
- [ ] Add stop button for long-running generations
- [ ] Implement tiered error management (auto-recovery → guided → human)

### Phase 3: Accessibility (Week 3)
- [ ] Add ARIA labels to all interactive elements
- [ ] Test with NVDA/VoiceOver screen readers
- [ ] Verify keyboard navigation (Tab, Enter, Esc)
- [ ] Add focus indicators with high contrast
- [ ] Generate meaningful alt text for screenshots/previews
- [ ] Test color contrast ratios (4.5:1 minimum)
- [ ] Validate with WAVE and axe DevTools

### Phase 4: Polish (Week 4)
- [ ] User testing with non-technical users
- [ ] A/B test error message variations
- [ ] Monitor analytics (drop-off points, error frequencies)
- [ ] Iterate based on feedback
- [ ] Document patterns in design system

---

## Resources

- Conversational UI: https://www.eleken.co/blog-posts/conversational-ui-how-to-create-a-brisk-human-machine-dialogue
- AI SDK UI Patterns: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- AI Accessibility Limitations: https://tetralogical.com/blog/2024/02/12/can-generative-ai-help-write-accessible-code/
- Error Messaging UX: https://smart-interface-design-patterns.com/articles/error-messages-ux/
- Shape of AI (Pattern Library): https://www.shapeof.ai
