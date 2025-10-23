# Mr Blue - AI Assistant User Guide
## Using MB.MD Methodology for Maximum Productivity

**Version:** 1.0  
**Last Updated:** October 23, 2025  
**For:** Mundo Tango Platform

---

## Table of Contents

1. [What is Mr Blue?](#what-is-mr-blue)
2. [What is MB.MD?](#what-is-mbmd)
3. [Quick Start Guide](#quick-start-guide)
4. [Using MB.MD with Mr Blue](#using-mbmd-with-mr-blue)
5. [Feature Guide](#feature-guide)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## What is Mr Blue?

**Mr Blue** is Mundo Tango's unified AI assistant - your intelligent companion for building, managing, and enhancing the platform. Think of it as having an expert developer, designer, and analyst available 24/7.

### Core Capabilities

**🧠 Omniscient Mode** (Super Admins Only)
- Full database access and modification
- Codebase analysis and editing
- Documentation generation
- 11 specialized tools for platform management

**🎤 Voice Mode** (All Users)
- Natural conversation with AI
- Real-time voice transcription
- Auto-speak responses
- Multiple language support (10 languages)

**💬 Chat Mode** (All Users)
- Text-based conversations
- Code generation and debugging
- Feature planning and architecture
- Project management assistance

**🎨 Visual Editor Integration**
- Click-to-select UI elements
- AI-powered design suggestions
- Real-time code generation
- Point-and-ask workflow

---

## What is MB.MD?

**MB.MD** stands for **Mapping → Breakdown → Mitigation → Deployment** - a systematic methodology that ensures every task is thoroughly planned and executed without errors.

### The Four Phases

```
Phase 1: MAPPING (Research & Understand)
    ↓
Phase 2: BREAKDOWN (Plan & Design)
    ↓
Phase 3: MITIGATION (Build & Risk Management)
    ↓
Phase 4: DEPLOYMENT (Test & Deploy)
```

### Why MB.MD?

**Without MB.MD:**
- ❌ Features built without understanding requirements
- ❌ Missing edge cases and errors
- ❌ No rollback plan when things fail
- ❌ Incomplete implementations

**With MB.MD:**
- ✅ Complete understanding before building
- ✅ All edge cases documented
- ✅ Risk mitigation strategies ready
- ✅ 100% functional features

---

## Quick Start Guide

### Step 1: Access Mr Blue

**Super Admin Access:**
1. Log in to Mundo Tango
2. Look for the **blue chat icon** in the bottom-right corner
3. Click to open the Mr Blue modal
4. You'll see a comprehensive AI chat interface

**Regular User Access:**
1. Navigate to your profile or dashboard
2. Look for "AI Assistant" or "Mr Blue" button
3. Limited features available (no database access)

### Step 2: Choose Your Mode

**Chat Mode:**
- Click the keyboard/message icon
- Type your question or request
- Get instant AI responses

**Voice Mode:**
- Click the headphone icon 🎧
- Speak naturally to Mr Blue
- AI responds with voice (auto-speak enabled by default)
- View live transcript of your conversation

**Omniscient Mode:** (Super Admins only)
- Automatically available when you're logged in as admin
- Access to 11 powerful tools
- Full platform control

### Step 3: Start a Conversation

**Example Starter Prompts:**

```
"Use mb.md: I need to add a new feature for event reminders"

"Use mb.md: Debug why my profile photo isn't uploading"

"Use mb.md: Create a comprehensive report on user engagement"

"Use mb.md: Help me optimize the database queries for memories"
```

**Note:** All messages are automatically prefixed with "Use mb.md:" behind the scenes to ensure AI follows the methodology!

---

## Using MB.MD with Mr Blue

### The Magic Prefix: "Use mb.md:"

**When you say:** "Use mb.md: I want to add user notifications"

**Mr Blue will:**

1. **PHASE 1 - MAPPING** (Research)
   - Ask clarifying questions
   - Research existing notification systems
   - Analyze database schema
   - Review similar features

2. **PHASE 2 - BREAKDOWN** (Planning)
   - Create detailed task list
   - Design database changes
   - Plan API endpoints
   - Map UI components

3. **PHASE 3 - MITIGATION** (Building)
   - Identify risks (what could go wrong?)
   - Build features incrementally
   - Test each component
   - Handle edge cases

4. **PHASE 4 - DEPLOYMENT** (Shipping)
   - Run comprehensive tests
   - Deploy to production
   - Monitor for issues
   - Document everything

### Example Conversation Flow

**You:**
```
Use mb.md: I need to create a feature where users can bookmark their 
favorite events and get reminders 24 hours before
```

**Mr Blue:**
```
🔍 MB.MD PHASE 1: MAPPING

Let me research this systematically:

1. Checking existing event system...
   ✅ Events table exists with 15 fields
   ✅ RSVP system already implemented
   
2. Checking notification infrastructure...
   ✅ Email system configured (SendGrid)
   ⚠️ No scheduled job system yet
   
3. Analyzing database requirements...
   Need: event_bookmarks table
   Need: notification_queue table
   
4. Similar features found...
   Referenced: Memories save feature
   Referenced: Event RSVP notifications

📋 MB.MD PHASE 2: BREAKDOWN

I've created a comprehensive plan with 8 tasks:
1. Create event_bookmarks table schema
2. Create notification_queue table
3. Build bookmark API endpoints
4. Build reminder scheduler service
5. Create bookmark UI components
6. Integrate email notifications
7. Add settings for reminder preferences
8. Test entire flow

Risk Assessment:
⚠️ HIGH: Scheduler needs to handle timezone differences
⚠️ MEDIUM: Email deliverability could fail
⚠️ LOW: UI performance with many bookmarks

Mitigation strategies documented.

Would you like me to proceed with Phase 3 (building)?
```

**You:**
```
Yes, proceed!
```

**Mr Blue:**
```
🔨 MB.MD PHASE 3: MITIGATION

Building event bookmark system...

[Task 1/8] Creating event_bookmarks table schema
✅ Added to shared/schema.ts
✅ Includes: userId, eventId, reminderSent, createdAt

[Task 2/8] Creating notification_queue table
✅ Added to shared/schema.ts
✅ Includes: scheduling and retry logic

[Task 3/8] Building bookmark API endpoints
✅ POST /api/events/:id/bookmark
✅ DELETE /api/events/:id/bookmark
✅ GET /api/events/bookmarked
✅ Security: All endpoints check user authentication

[Progress continues...]

🚀 MB.MD PHASE 4: DEPLOYMENT

All tasks complete! Running final tests...
✅ Database migration successful
✅ API endpoints tested
✅ UI components rendering
✅ Email notifications sending
✅ Scheduler running correctly

Feature is LIVE! Users can now bookmark events and receive reminders.

📊 Summary:
- 2 new database tables
- 5 new API endpoints
- 3 new UI components
- 1 background scheduler
- 100% test coverage

Documentation automatically generated at:
docs/features/event-bookmarks.md
```

---

## Feature Guide

### 1. Conversation Management

**Search Conversations:**
```
Open Mr Blue → Click search icon 🔍
Filter by: Date range, AI model, conversation type
Export results as: JSON, Markdown, PDF
```

**Export Conversations:**
```
Open Mr Blue → Click export icon 📥
Choose format: JSON (raw data), Markdown (readable), PDF (shareable)
Options: Include voice transcripts, timestamps, metadata
Download or save to cloud
```

**Analytics Dashboard:**
```
Open Mr Blue → Click analytics icon 📊
View:
- Total conversations
- Message count by model
- Token usage
- Cost analysis
- Conversation trends
```

### 2. Voice Features

**Start Voice Conversation:**
```
1. Click headphone icon 🎧
2. Grant microphone permission (first time only)
3. Start speaking naturally
4. AI responds with voice
5. View live transcript
```

**Voice Settings:**
```
Click settings icon → Voice tab

Configure:
- Voice speed (0.5x - 2.0x)
- Voice volume
- Auto-speak toggle
- Language detection (10 languages)
- TTS provider (Browser native or OpenAI)
```

**Voice Visualization:**
```
While speaking, see:
- Waveform: Real-time audio visualization
- Frequency: Spectral analysis
- Bars: VU meter display
```

### 3. Template Library

**Using Templates:**
```
Open Mr Blue → Click templates icon 📋

Categories:
- Featured: Curated best practices
- Technical: Code reviews, debugging
- Creative: Content generation, brainstorming
- Productivity: Planning, documentation
- Business: Strategy, analysis
- Learning: Tutorials, Q&A
- Lifestyle: Personal assistant tasks

Click any template → Conversation starts with pre-filled context
```

**Example Templates:**
- **Code Review:** Systematic code analysis with best practices
- **Debug Session:** Step-by-step bug investigation
- **Feature Planning:** Complete MB.MD feature specification
- **API Design:** RESTful API architecture
- **Database Optimization:** Query analysis and indexing
- **Content Creation:** Blog posts, documentation
- **Business Strategy:** Market analysis, competitor research
- **Learning Path:** Personalized curriculum

### 4. Visual Editor Integration

**Point-and-Ask Workflow:**
```
1. Open Visual Editor (super admin)
2. Click any UI element to select it
3. Open Mr Blue
4. AI automatically knows which element you selected
5. Ask: "Make this button bigger" or "Change this color to teal"
6. AI generates code changes
7. Review in Inspector panel
8. Apply changes with one click
```

**Example:**
```
You: (Select login button in Visual Editor)
     "Make this button more prominent with our brand colors"

Mr Blue: "I can see you've selected the login button. I'll enhance it with:
         - Larger size (16px → 18px padding)
         - Teal background (#14B8A6)
         - White text with shadow
         - Hover animation
         
         Apply these changes?"

You: "Yes"

Mr Blue: "✅ Button updated! Changes applied to:
         client/src/components/AuthButton.tsx"
```

### 5. Omniscient Mode Tools (Super Admin)

Mr Blue has access to 11 specialized tools:

**Database Tools:**
1. **Database Query** - Read/write database records
2. **Schema Analysis** - Analyze table structure
3. **Migration Generator** - Create schema changes

**Codebase Tools:**
4. **Code Search** - Find code patterns
5. **Code Editor** - Modify source files
6. **Component Generator** - Create React components

**Documentation Tools:**
7. **Doc Reader** - Read all documentation
8. **Doc Writer** - Generate documentation
9. **API Documentation** - Auto-generate API docs

**System Tools:**
10. **Log Analyzer** - Debug application errors
11. **Performance Monitor** - Analyze system metrics

**Example Tool Usage:**
```
You: "Use mb.md: Show me all users who joined last week"

Mr Blue: "Using Database Query tool...
         
         Found 47 users who joined Oct 16-23, 2025:
         
         Top cities:
         - Buenos Aires: 18 users
         - Paris: 12 users
         - New York: 8 users
         - Barcelona: 5 users
         - Tokyo: 4 users
         
         Would you like me to export this as CSV or create 
         a visualization?"
```

---

## Best Practices

### 1. Always Use "Use mb.md:" for Complex Tasks

**❌ DON'T:**
```
"Add a search feature"
```

**✅ DO:**
```
"Use mb.md: Add a search feature that lets users find events by 
location, date, and tango style with autocomplete suggestions"
```

**Why?** MB.MD ensures complete planning, risk mitigation, and testing.

### 2. Be Specific with Context

**❌ DON'T:**
```
"Fix the bug"
```

**✅ DO:**
```
"Use mb.md: When I click the 'Join Event' button on the Events page,
I get a 404 error. The console shows 'POST /api/events/join failed'.
I'm logged in as a regular user, not admin."
```

**Why?** More context = better solutions faster.

### 3. Use Voice for Brainstorming

**Best for Voice:**
- Initial feature ideation
- Explaining complex problems
- Collaborative design sessions
- Quick questions

**Best for Chat:**
- Code reviews
- Detailed specifications
- Documentation generation
- Step-by-step debugging

### 4. Leverage Templates for Common Tasks

Instead of typing the same requests, use templates:
- Code Review → Consistent quality checks
- Debug Session → Systematic troubleshooting
- Feature Planning → Complete MB.MD workflow

### 5. Export Important Conversations

**Export when:**
- Planning a major feature (save the plan)
- Debugging a critical issue (save the solution)
- Learning something new (save for reference)
- Need to share with team members

**Formats:**
- **Markdown:** Share via docs or wiki
- **JSON:** Import into other tools
- **PDF:** Email to stakeholders

### 6. Monitor Your Usage

Check Analytics Dashboard monthly:
- Are you using expensive models unnecessarily?
- Which features are most valuable?
- Optimize your workflow based on data

---

## Troubleshooting

### Mr Blue Not Responding

**Problem:** Chat sends but no response appears

**Solutions:**
1. Check your internet connection
2. Refresh the page
3. Check if API keys are configured (super admin)
4. Look at browser console for errors (F12)
5. Try a different AI model (GPT-4 → Claude 3.5)

### Voice Mode Not Working

**Problem:** Microphone not picking up audio

**Solutions:**
1. Grant microphone permissions in browser
2. Check your microphone is working (test in another app)
3. Ensure you're on HTTPS (required for mic access)
4. Try a different browser (Chrome recommended)
5. Check Voice Settings → Language detection

**Problem:** AI responds with text instead of voice

**Solutions:**
1. Check Voice Settings → Auto-speak is enabled
2. Increase volume slider
3. Try different TTS provider (Browser native ↔ OpenAI)
4. Check browser audio isn't muted

### Omniscient Mode Not Available

**Problem:** No database/codebase tools visible

**Solutions:**
1. Verify you're logged in as super admin
2. Check user role in database: `role = 'super_admin'`
3. Log out and log back in
4. Clear browser cache
5. Contact platform administrator

### Conversation Export Fails

**Problem:** Export button downloads empty file

**Solutions:**
1. Check conversation has messages (minimum 1)
2. Try different format (JSON instead of PDF)
3. Check browser download settings
4. Disable popup blockers
5. Try exporting smaller date range

### Template Not Loading

**Problem:** Template opens but content is blank

**Solutions:**
1. Refresh templates list
2. Try different template category
3. Clear browser cache
4. Check internet connection
5. Report bug to platform team

---

## Advanced Tips

### 1. Chain Multiple Requests

```
Use mb.md: I need to:
1. Create a new "Tango Styles" feature where users can tag their 
   preferred dance styles
2. Add filters to the Events page to show only events matching 
   their styles
3. Send weekly email digests of matching events

Please research and plan all three features together as they're connected.
```

### 2. Request Architect Review

```
Use mb.md: I just added a new payment processing feature. Please review
the code for security issues, performance problems, and best practices.

Files to review:
- server/routes/payments.ts
- client/src/pages/SubscriptionPage.tsx
- shared/schema.ts (subscriptions table)
```

### 3. Generate Documentation

```
Use mb.md: Generate comprehensive documentation for the Events API,
including:
- All endpoints
- Request/response examples
- Error codes
- Authentication requirements
- Rate limits

Format as OpenAPI 3.0 specification.
```

### 4. Parallel Track Execution

```
Use mb.md: I need to implement three independent features simultaneously:

Track A: User notification preferences
Track B: Event image gallery
Track C: Export event as calendar file (.ics)

Use SIMULTANEOUS execution mode to build all three in parallel.
```

### 5. Historical Context

```
Use mb.md: I'm seeing errors similar to what we fixed last month.
Search my conversation history for "event RSVP bug" and apply the
same solution to the current "event bookmark" issue.
```

---

## MB.MD Success Metrics

**How to know MB.MD is working:**

✅ **Phase 1 (Mapping) Complete when:**
- All requirements clearly understood
- Existing code/database analyzed
- Dependencies identified
- Edge cases documented

✅ **Phase 2 (Breakdown) Complete when:**
- Detailed task list created
- Database schema designed
- API endpoints planned
- UI mockups/components specified
- Risk assessment documented

✅ **Phase 3 (Mitigation) Complete when:**
- All code implemented
- Tests written and passing
- Edge cases handled
- Security validated
- Performance optimized

✅ **Phase 4 (Deployment) Complete when:**
- Feature deployed to production
- Monitoring enabled
- Documentation generated
- Team notified
- Success metrics tracked

---

## Getting Help

**In-App Support:**
- Click help icon (?) in Mr Blue modal
- Search documentation
- View example conversations

**Documentation:**
- `/docs/MB_MD_QA_PROTOCOL.md` - The methodology
- `/docs/AGENT_LEARNINGS.md` - Best practices
- `/docs/MrBlue/` - Complete Mr Blue documentation

**Community:**
- Post in Tango Community forum
- Tag your post with #mrblue or #ai-help
- Share your use cases with other users

**Admin Support:**
- Contact super administrators
- Report bugs via platform issue tracker
- Request new features through feedback form

---

## Summary

**Key Takeaways:**

1. **Always use "Use mb.md:"** for complex tasks
2. **Be specific** with your requests - more context = better results
3. **Use Voice Mode** for brainstorming and quick questions
4. **Use Chat Mode** for detailed work and code generation
5. **Leverage Templates** for common workflows
6. **Export important conversations** for documentation
7. **Monitor your usage** with Analytics Dashboard
8. **Trust the 4-phase process** - it prevents errors

**Mr Blue is your 24/7 AI developer, designer, and analyst.**

The MB.MD methodology ensures every feature is:
- ✅ Fully researched
- ✅ Completely planned
- ✅ Risk-mitigated
- ✅ Thoroughly tested

Start your first MB.MD conversation today and experience the difference! 🚀

---

**Version History:**
- v1.0 (Oct 23, 2025) - Initial release
