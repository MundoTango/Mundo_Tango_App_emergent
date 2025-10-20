# Expert Round Table Protocol (ERT) v1.0
**MB.MD Extension: Collaborative Expert Analysis Methodology**

## Overview

The Expert Round Table Protocol (ERT) extends MB.MD by bringing together 10 domain experts to debate, discuss, and reach consensus on complex design decisions. Unlike individual expert research, ERT creates a collaborative environment where experts challenge each other's assumptions and produce superior solutions through constructive conflict.

## When to Use ERT

**ALWAYS use ERT for:**
- ✅ Major platform design decisions affecting UX
- ✅ Architecture choices with significant long-term impact
- ✅ Complex features requiring multi-disciplinary expertise
- ✅ Critical production issues requiring diverse perspectives
- ✅ Strategic roadmap planning and prioritization

**NEVER skip ERT when:**
- ❌ Decision affects >50% of users
- ❌ Investment >100 hours of development time
- ❌ Technical debt implications >6 months
- ❌ Brand/reputation impact potential

---

## Phase 1: Expert Assembly (30 min)

### Step 1: Define Problem Domain
- [ ] Clearly articulate the problem statement
- [ ] Identify required expertise areas (e.g., UI/UX, performance, accessibility)
- [ ] Set success criteria for the discussion

### Step 2: Select 10 Experts
**Selection Criteria:**
- Diversity of perspectives (avoid groupthink)
- Real-world experience in domain
- Track record of shipped products
- Willingness to challenge consensus

**Standard 10-Expert Panel Structure:**
1. **Visionary** - Big picture, future trends, innovation
2. **Pragmatist** - Practical implementation, constraints
3. **User Advocate** - End-user experience, usability
4. **Technical Architect** - System design, scalability
5. **Accessibility Champion** - WCAG compliance, inclusive design
6. **Performance Expert** - Speed, optimization, efficiency
7. **Design Purist** - Aesthetics, visual consistency
8. **Business Strategist** - ROI, metrics, business impact
9. **Security Specialist** - Privacy, data protection
10. **Innovation Rebel** - Unconventional ideas, disruption

### Step 3: Prepare Materials
- [ ] Current state screenshot/demo
- [ ] Expected state specification
- [ ] Relevant metrics/data
- [ ] Technical constraints
- [ ] Business requirements

---

## Phase 2: Round Table Discussion (90-120 min)

### Opening Round: Individual Assessment (20 min)
Each expert independently reviews materials and writes:
- 3 strengths observed
- 3 critical issues identified
- 1 bold recommendation

**Output Format:**
```markdown
**Expert #N (Role):**
Strengths: [list]
Issues: [list]
Recommendation: [statement]
```

### Debate Round: Constructive Conflict (40 min)
Experts discuss disagreements and challenge assumptions:

**Rules of Engagement:**
1. **Challenge ideas, not people** - Attack arguments, respect experts
2. **Evidence required** - Cite data, research, or real-world examples
3. **No sacred cows** - Everything is open to debate
4. **Build on ideas** - "Yes, and..." over "No, but..."
5. **Time limits** - 5 min per topic, moderator enforces

**Key Topics:**
- What's the root cause of identified issues?
- Which recommendation has highest impact/effort ratio?
- What are we missing (blind spots)?
- What trade-offs are we willing to accept?

### Consensus Round: Prioritization (30 min)
Experts vote on findings and recommendations:

**Voting Method:**
- Each expert has 10 points to distribute
- Must allocate at least 1 point to top 5 issues
- Highest scoring items become priorities

**Output Format:**
```markdown
| Issue/Recommendation | Points | Priority |
|---------------------|--------|----------|
| [Description]       | 28     | P0       |
| [Description]       | 22     | P1       |
```

### Summary Round: Action Items (20 min)
Convert priorities into actionable next steps:

**For each P0/P1 item:**
- Clear description
- Owner/responsible party
- Success criteria
- Estimated effort (S/M/L/XL)
- Dependencies

---

## Phase 3: Documentation (30 min)

### Round Table Report Structure

```markdown
# Expert Round Table Report: [Topic]
**Date:** [Date]
**Participants:** [10 Expert Names/Roles]
**Moderator:** [Name]
**Duration:** [Time]

## Problem Statement
[Clear articulation of what was discussed]

## Expert Panel
1. Expert Name (Role) - Background
2. [... 10 experts total]

## Key Findings

### Strengths (What's Working)
1. [Consensus strength #1]
2. [Consensus strength #2]
3. [Consensus strength #3]

### Critical Issues (What's Broken)
1. **[P0 Issue]** - [Description] (28 points)
   - Expert consensus: [Summary]
   - Evidence: [Data/research]
   - Impact: [User/business impact]

### Recommendations (What to Do)
1. **[P0 Recommendation]** - [Description] (32 points)
   - Proposed by: [Expert name]
   - Supported by: [Expert consensus]
   - Effort estimate: [S/M/L/XL]
   - Success criteria: [Measurable outcomes]

## Debate Highlights
- [Key disagreement #1 and resolution]
- [Key insight that changed minds]
- [Surprising consensus]

## Action Items
1. [Action] - Owner: [Name] - Due: [Date]
2. [Action] - Owner: [Name] - Due: [Date]

## 10 Critical Questions
1. [Question requiring further research/decision]
2. [Question requiring stakeholder input]
...
10. [Question requiring technical validation]

## Appendix: Individual Expert Assessments
[Full individual assessments from all 10 experts]
```

---

## Phase 4: Implementation Tracking

### Post-Round Table Activities
- [ ] Share report with stakeholders
- [ ] Create tracking issues for action items
- [ ] Schedule follow-up in 2 weeks
- [ ] Monitor metric improvements
- [ ] Iterate based on learnings

### Success Metrics
- **Decision Quality**: Did recommendations improve outcomes? (measure after 30 days)
- **Team Alignment**: Did discussion create shared understanding? (survey participants)
- **Implementation Rate**: What % of action items completed? (track in project management)
- **Expert Satisfaction**: Would experts participate again? (feedback survey)

---

## ERT Integration with MB.MD

### MB.MD Phase Mapping

**MAPPING Phase:**
- Use ERT to diagnose complex problems requiring diverse perspectives
- Expert panel reviews current state and identifies root causes

**BREAKDOWN Phase:**
- Use ERT to analyze solution options and trade-offs
- Expert debate surfaces hidden complexity and edge cases

**MITIGATION Phase:**
- Use ERT to design implementation approach
- Expert consensus provides validation before build

**DEPLOYMENT Phase:**
- Use ERT to review results and iterate
- Expert feedback loop ensures continuous improvement

---

## Example ERT Sessions

### Example 1: Social Feed Algorithm Design
**Experts:** Meta, TikTok, Twitter, LinkedIn, Pinterest, Reddit, Instagram, YouTube, Snapchat, BeReal
**Duration:** 120 min
**Outcome:** Hybrid chronological + algorithmic feed with friend-boosting

### Example 2: Mobile Navigation Pattern
**Experts:** iOS HIG, Material Design, Shopify, Airbnb, Uber, Instagram, Twitter, Spotify, TikTok, WhatsApp
**Duration:** 90 min
**Outcome:** Bottom tab bar with 5 core actions + hamburger menu for overflow

### Example 3: Accessibility Audit
**Experts:** WCAG, Apple Accessibility, Microsoft Inclusive Design, axe, Gov.uk, BBC, WebAIM, Deque, Level Access, A11y Project
**Duration:** 120 min
**Outcome:** ARIA label standards, keyboard navigation requirements, screen reader testing protocol

---

## Common Pitfalls to Avoid

### ❌ Groupthink
**Problem:** Experts agree too easily, no healthy debate
**Solution:** Deliberately include contrarian voices, reward dissent

### ❌ Analysis Paralysis
**Problem:** Discussion never reaches actionable conclusions
**Solution:** Time-box discussions, force voting, require decisions

### ❌ HiPPO (Highest Paid Person's Opinion)
**Problem:** Senior expert dominates, others defer
**Solution:** Anonymous voting, equal speaking time, round-robin format

### ❌ Bikeshedding
**Problem:** Experts debate trivial details, ignore critical issues
**Solution:** Pre-prioritize topics, moderator redirects to high-impact items

### ❌ Implementation Disconnect
**Problem:** Recommendations ignore real-world constraints
**Solution:** Include implementation team in discussion, validate feasibility

---

## Training All Agents on ERT

### Agent Certification Requirements
- [ ] Read this protocol document (15 min)
- [ ] Observe 1 live ERT session (90 min)
- [ ] Participate in 1 ERT as expert (120 min)
- [ ] Moderate 1 ERT session (120 min)
- [ ] Pass ERT methodology quiz (10 questions, 80% required)

### Quick Reference Card

**When to use ERT:**
- Complex problem requiring multiple perspectives
- High-stakes decision with significant impact
- Conflicting stakeholder requirements
- Innovative solution needed

**How to run ERT:**
1. Assemble 10 diverse experts
2. Individual assessment (20 min)
3. Debate round (40 min)
4. Consensus voting (30 min)
5. Action items (20 min)
6. Document findings

**Success criteria:**
- Clear action items with owners
- Measurable success metrics
- Expert consensus (80%+ agreement)
- Implementation plan within 2 weeks

---

## Version History
- **v1.0** - October 20, 2025 - Initial protocol creation
- Integrated with MB.MD methodology
- Training materials for all agents
- 10-expert standard panel structure

## Related Documentation
- `docs/MB_MD_PROTOCOL_TEMPLATE.md` - Core MB.MD methodology
- `docs/MrBlue/COMPREHENSIVE_EXPERT_RESEARCH_PHASE.md` - 10 expert research per agent
- `docs/AGENT_EXPERT_RESEARCH_COMPLETE.md` - Individual expert knowledge base
