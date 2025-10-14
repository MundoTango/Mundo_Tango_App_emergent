# Multi-AI User Guide

**For:** End users and administrators  
**Platform:** Mundo Tango - Life CEO & Community Platform  
**Features:** Smart AI routing, parallel consultation, ensemble synthesis  

---

## What is Multi-AI Orchestration?

The Multi-AI system gives you access to **3 world-class AI models** through a single interface:

- **Claude Sonnet 4.5** - Best reasoning and complex analysis
- **GPT-4o** - Balanced performance and versatility  
- **Gemini 2.5 Pro/Flash** - Fast responses at lowest cost

Instead of choosing manually, the system **automatically selects the best AI** for your question, saving 40-85% in costs while maintaining quality.

---

## How to Access

### 1. Multi-AI Dashboard

Navigate to: **Admin > Multi-AI Dashboard** (`/admin/multi-ai`)

**What you'll see:**
- System status (all AIs operational)
- Model availability
- Agent status (Router, Ensemble, Meta-Orchestrator)
- Usage statistics
- Cost savings

### 2. Analytics Dashboard

Navigate to: **Admin > Multi-AI Analytics** (`/admin/multi-ai/analytics`)

**What you'll see:**
- Cost savings over time
- Model usage distribution
- Query volume by AI
- Performance metrics
- Historical trends

---

## Features

### Feature 1: Smart AI Routing (Agent #115)

**What it does:** Automatically picks the best AI for your question

**How it works:**
1. You ask a question
2. System analyzes complexity
3. Routes to optimal model based on your preferences
4. You get the answer + routing explanation

**Example:**
- **Simple question:** "What is 2+2?" → Routed to Gemini Flash (cheapest)
- **Medium question:** "Explain photosynthesis" → Routed to GPT-4o (balanced)
- **Complex question:** "Analyze quantum computing implications" → Routed to Claude (best)

**Your control:**
- **Auto-Route (Smart):** Let the system decide
- **Cost Priority:** Choose cheap/balanced/quality
- **Manual Selection:** Pick a specific AI

---

### Feature 2: Model Selection UI

**How to use:**

**Option A: Smart Routing (Recommended)**
1. Toggle "Smart Routing" ON
2. Set cost priority slider:
   - 💰 **Lowest Cost** - Prioritizes Gemini Flash
   - ⚖️ **Balanced** - Best value for complexity
   - 🎯 **Best Quality** - Prioritizes Claude
3. Ask your question
4. System automatically routes

**Option B: Manual Selection**
1. Toggle "Smart Routing" OFF
2. Choose preferred model:
   - Claude Sonnet 4.5 (Best reasoning)
   - GPT-4o (Balanced performance)
   - Gemini 2.5 Flash (Fastest & cheapest)
3. Ask your question
4. Always uses selected model

---

### Feature 3: Parallel Consultation (Agent #117)

**What it does:** Ask multiple AIs the same question simultaneously

**When to use:**
- Important decisions
- Fact-checking
- Comparing perspectives
- Getting diverse viewpoints

**How to use:**
1. Select 2-3 AI models (checkboxes)
2. Enter your question
3. Click "Consult X AI Models"
4. See side-by-side responses
5. Compare answers and latency

**Example:**
```
Question: "Should our company adopt remote work?"

Claude says: [Detailed analysis with pros/cons...]
GPT-4o says: [Balanced perspective with data...]
Gemini says: [Quick summary with key points...]
```

---

### Feature 4: Ensemble Synthesis (Agent #116)

**What it does:** Combines multiple AI opinions into one authoritative answer

**When to use:**
- Complex decisions requiring consensus
- High-stakes questions
- When you need confidence scoring
- Research and analysis

**How to use:**
1. Select 2-3 AI models
2. Enter complex question
3. Click "Generate Ensemble Synthesis"
4. Review:
   - **Consensus Score** (0-100%)
   - **Combined Answer** (synthesized response)
   - **Disagreements** (areas of uncertainty)
   - **Individual Responses** (what each AI said)

**Example:**
```
Question: "What are the long-term effects of AI on employment?"

Consensus: 75% agreement

Combined Answer: [Synthesized response incorporating all viewpoints...]

Disagreements:
- Timeline estimates vary (5-20 years)
- Severity of impact debated

Individual Responses:
- Claude: [Detailed analysis...]
- GPT-4o: [Balanced view...]
- Gemini: [Data-focused...]
```

---

## Understanding Results

### Response Fields

**Model Used:** Which AI answered (Claude, GPT-4o, Gemini)  
**Complexity:** How difficult the question was (low/medium/high)  
**Estimated Cost:** What this query cost ($0.0001 - $0.025)  
**Routing Reasoning:** Why this model was selected  

**Example Result:**
```
Model: gpt-4o
Complexity: medium
Cost: $0.001
Reasoning: "Selected GPT-4o for medium complexity and balanced cost priority"

Answer: [AI response here]
```

---

## Analytics & Insights

### Cost Savings

**What it shows:** How much money you saved vs. always using premium models

**Example:**
- **Baseline (Always Claude):** $100
- **Smart Routing:** $35
- **Savings:** $65 (65%)

### Model Usage

**What it shows:** How queries are distributed across AIs

**Example:**
- Claude Sonnet 4.5: 25% (complex queries)
- GPT-4o: 45% (medium queries)
- Gemini Flash: 30% (simple queries)

### Quality Retention

**What it shows:** Answer quality compared to always using best model

**Target:** 95%+ (meaning smart routing maintains 95% of Claude's quality)

---

## Best Practices

### When to Use Each Feature

**Smart Routing:**
- ✅ Everyday questions
- ✅ Cost-conscious usage
- ✅ Varied complexity
- ❌ When you need specific AI style

**Parallel Consultation:**
- ✅ Comparing perspectives
- ✅ Fact-checking
- ✅ Brainstorming
- ❌ Simple yes/no questions

**Ensemble Synthesis:**
- ✅ High-stakes decisions
- ✅ Research projects
- ✅ When consensus matters
- ❌ Time-sensitive queries (slower)

### Cost Optimization Tips

1. **Use Smart Routing** - Saves 40-85% automatically
2. **Set appropriate priority** - "Balanced" for most use cases
3. **Avoid ensemble for simple questions** - Uses 2-3x resources
4. **Cache frequent questions** - Reuse answers when possible

---

## Troubleshooting

### "No response" or timeout
**Cause:** Model temporarily unavailable  
**Solution:** System auto-retries with backup model

### "Rate limit exceeded"
**Cause:** Too many queries in short time  
**Solution:** Wait 60 seconds or contact admin

### Response quality seems low
**Cause:** Using cost-optimized routing  
**Solution:** Change cost priority to "Quality"

### Want specific AI personality
**Cause:** Smart routing varies models  
**Solution:** Disable smart routing, select preferred model

---

## FAQ

**Q: Which AI is best?**  
A: Depends on the task. Claude excels at reasoning, GPT-4o is well-rounded, Gemini is fastest/cheapest.

**Q: How much does it cost per query?**  
A: $0.0001 (Gemini Flash) to $0.025 (Claude Sonnet 4.5)

**Q: Can I see which AI answered?**  
A: Yes, every response shows the model used

**Q: What if I disagree with routing?**  
A: Disable smart routing and pick your preferred model

**Q: Is my data safe?**  
A: Yes, all queries are encrypted and follow ESA security protocols

**Q: Can I access this on mobile?**  
A: Yes, all features are mobile-responsive

---

## Support

**Dashboard Issues:** Contact system admin  
**Feature Requests:** Submit via Admin Center  
**Bug Reports:** Use error reporting system  
**Training:** Request demo from Agent #117  

---

## Next Steps

- Try the [Multi-AI Dashboard](/admin/multi-ai)
- View [Analytics Dashboard](/admin/multi-ai/analytics)
- Read [Integration Guide](./INTEGRATION_GUIDE.md) (for developers)
- Check [API Reference](./API_REFERENCE.md) (for developers)
