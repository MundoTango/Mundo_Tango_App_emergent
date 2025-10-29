# Component Autonomy Standards
## Phase 11 Critical Behavior Patterns

This document defines what makes a UI component "correct" and autonomous. All 559 components must learn and apply these standards.

## 🎯 Core Autonomy Principles

### 1. Self-Awareness
Every component must know:
- ✅ Its current health status (healthy/warning/error)
- ✅ Its design system compliance score
- ✅ Its dark mode coverage %
- ✅ Its translation coverage %
- ✅ Its accessibility score (WCAG 2.1 AA)
- ✅ Its performance metrics
- ✅ Its parent agent and layer agents
- ✅ Its colleague components (similar type/purpose)

### 2. Critical Thinking Process
When a component detects an issue, it must:

```
1. DETECT: "Am I doing it correctly?"
   - Run self-assessment framework
   - Compare against design system standards
   - Check dark mode, i18n, a11y, performance

2. ANALYZE: "If not, what do I need to plan to fix it?"
   - Identify root cause
   - Research similar issues in history
   - Consult pattern library (Agent #79)

3. COLLABORATE: "Make a plan with colleagues"
   - Query peer components for solutions
   - Escalate to parent agent if needed
   - Get approval from manager (Agent #11)

4. FIX: "Execute the fix"
   - Apply changes to code
   - Update design tokens if needed
   - Maintain consistency with design system

5. TEST: "Validate the fix works"
   - Re-run self-assessment
   - Check health score improved
   - Verify no regressions

6. CONFIRM: "If pass, inform colleagues and management"
   - Update component history
   - Share learning with peers (Agent #80)
   - Report to coordinator (Agent #11)

7. REPEAT: "Continuous improvement"
   - Monitor for new issues
   - Learn from Visual Editor changes
   - Apply learned patterns to future fixes
```

## 🎨 Design System Standards

### Dark Mode (Agent #11.1)
**Target**: 100% coverage

**Critical Patterns**:
```tsx
// ❌ WRONG - Missing dark mode
<div className="bg-white text-black">

// ✅ CORRECT - Full dark mode
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
```

**Rules**:
- Every `bg-white` needs `dark:bg-gray-800`
- Every `text-black` needs `dark:text-white`
- Every `border-gray-200` needs `dark:border-gray-700`
- Maintain color contrast ratios in both modes

### Internationalization (Agent #11.2)
**Target**: 100% translation coverage

**Critical Patterns**:
```tsx
// ❌ WRONG - Hardcoded text
<Button>Submit Form</Button>

// ✅ CORRECT - Translated
const { t } = useTranslation();
<Button>{t('common.submitForm')}</Button>
```

**Rules**:
- All user-facing text must use `t()` function
- No hardcoded strings (except technical IDs)
- Support all 68 languages
- Use international icons with tooltips

### Accessibility (Agent #11.3)
**Target**: WCAG 2.1 AA compliance

**Critical Patterns**:
```tsx
// ❌ WRONG - Missing accessibility
<img src="photo.jpg" />
<button><Icon /></button>
<div onClick={handler}>Click me</div>

// ✅ CORRECT - Fully accessible
<img src="photo.jpg" alt="Description of photo" />
<button aria-label="Close dialog"><CloseIcon /></button>
<button onClick={handler}>Click me</button>
```

**Rules**:
- All images need `alt` text
- Icon buttons need `aria-label`
- Interactive divs should be `<button>` with proper roles
- Keyboard navigation must work (tabIndex)
- Color contrast ≥ 4.5:1 for text

### Performance (Agent #11.4)
**Target**: Fast, responsive UIs

**Critical Patterns**:
```tsx
// ❌ WRONG - No optimization
const ExpensiveComponent = ({ data }) => {
  const result = heavyCalculation(data);
  return <div>{result}</div>;
};

// ✅ CORRECT - Optimized
const ExpensiveComponent = ({ data }) => {
  const result = useMemo(() => heavyCalculation(data), [data]);
  return <div>{result}</div>;
};
```

**Rules**:
- Use `useMemo` for expensive calculations
- Use `React.memo` for pure components
- Lazy load non-critical components
- Optimize re-renders

## 🔄 Visual Editor Learning Loop

When user makes changes in Visual Editor:

### 1. Mr Blue Tracks Changes
```typescript
// Context tracked:
- Current page: "/admin/dashboard"
- Recent actions: ["moved Button", "changed text", "updated color"]
- Active component: "SubmitButton.tsx"
- Changes made: { position: "right", text: "Save Changes", color: "blue" }
```

### 2. Mr Blue Confirms with User
```
Mr Blue: "I noticed you moved the Submit button to the right and 
changed the text to 'Save Changes'. Is this what you want?"

User: "Yes"
```

### 3. Component Learns & Implements
```typescript
// SubmitButton.tsx autonomous process:
1. Receive change notification from Mr Blue
2. Analyze: "User wants button on right with new text"
3. Plan: "Update positioning, text, maintain dark mode & i18n"
4. Execute: Apply changes while preserving standards
5. Test: Verify health score maintained/improved
6. Confirm: "Changes applied successfully"
```

### 4. Share Learning with Colleagues
```typescript
// Agent #80 broadcasts to similar components:
"SubmitButton learned: User prefers action buttons right-aligned
with descriptive text. Apply pattern to all form buttons."
```

## 📊 Health Scoring System

Each component calculates health score (0-100):

```typescript
healthScore = (
  darkModeCoverage * 0.25 +      // 25% weight
  translationCoverage * 0.25 +    // 25% weight
  accessibilityScore * 0.30 +     // 30% weight
  performanceScore * 0.20         // 20% weight
)

Status:
- 90-100: healthy (green)
- 70-89:  warning (yellow)
- 0-69:   error (red)
```

## 🤝 Colleague Collaboration Patterns

### Query Peers
```typescript
// Button asks other buttons for help
const solution = await collaborationProtocol.queryPeers({
  question: "How did you handle dark mode for icon buttons?",
  componentType: "button",
  issueType: "dark_mode"
});
```

### Escalate to Manager
```typescript
// Component escalates complex issue
await collaborationProtocol.escalate({
  to: "AGENT-11",
  issue: "Conflicting design tokens between dark mode and brand colors",
  attempts: 3,
  needsGuidance: true
});
```

### Share Success
```typescript
// Component shares successful fix
await collaborationProtocol.shareLearning({
  pattern: "dark_mode_icon_button_fix",
  solution: "Use dark:invert filter for SVG icons",
  affectedComponents: ["IconButton", "ActionButton", "ToolbarButton"]
});
```

## 🎓 Organizational Learning

### Bottom → Up Learning Flow
```
1. Widget/Button discovers solution
2. Shares with peer components (horizontal)
3. Reports to parent agent (Agent #11.X)
4. Parent shares with coordinator (Agent #11)
5. Coordinator updates global standards
6. All components receive updated standards
```

### Top → Down Standards Distribution
```
1. User confirms change in Visual Editor
2. Mr Blue analyzes and validates
3. Agent #11 receives validated pattern
4. Pattern added to standards library
5. All 559 components notified
6. Components self-assess against new standard
7. Auto-fix where needed
```

## 🚀 Success Criteria

A component is "autonomous and correct" when:

✅ Health score ≥ 90%  
✅ Can self-assess and detect issues  
✅ Can research and plan fixes with colleagues  
✅ Can autonomously implement fixes  
✅ Can test and validate changes  
✅ Learns from Visual Editor interactions  
✅ Shares knowledge with peers  
✅ Reports to management hierarchy  
✅ Maintains design system compliance  
✅ Supports all 68 languages  
✅ Meets WCAG 2.1 AA standards  
✅ Performs efficiently  

## 📝 Next Steps for Rollout

1. Train all 559 components with these standards
2. Activate autonomous self-assessment
3. Enable Visual Editor learning loop
4. Monitor and validate autonomy
5. Prepare for first customer review
