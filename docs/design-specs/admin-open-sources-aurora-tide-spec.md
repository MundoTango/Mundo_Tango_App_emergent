# Admin Open Sources Dashboard - Aurora Tide Design Specification

**Agent #11 (UI/UX Design Expert) - APPROVED ✅**  
**Date:** October 11, 2025  
**Feature:** `/admin/open-sources` - Platform-Wide Open Source Deployment Status  
**Design System:** Aurora Tide / MT Ocean Theme

---

## 🎨 Design Overview

A glassmorphic admin dashboard showing real-time deployment status of all 18 open source tools in the platform stack. Features turquoise-to-ocean gradients, status indicators, agent training queue, and CEO approval workflow.

---

## 📐 Layout Structure

### Page Container
```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
  <Header />
  <StatusOverview />
  <OpenSourceGrid />
  <TrainingQueue />
  <ConsolidationQueue />
</div>
```

---

## 🧩 Component Specifications

### 1. Header Component

**Import:**
```tsx
import { GlassCard } from '@/components/glass/GlassComponents';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';
```

**Structure:**
```tsx
<GlassCard className="glassmorphic-card backdrop-blur-xl p-6 mb-6">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-500 to-ocean-600 dark:from-turquoise-400 dark:to-ocean-500 bg-clip-text text-transparent">
        Open Source Deployment Status
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        Agent #59 - Platform-Wide Open Source Excellence Verification
      </p>
    </div>
    <div className="flex gap-3">
      <button className="px-4 py-2 bg-gradient-to-r from-turquoise-500 to-ocean-600 hover:from-turquoise-600 hover:to-ocean-700 text-white rounded-lg transition-all" data-testid="button-run-audit">
        <Package className="inline mr-2 h-4 w-4" />
        Run Platform Audit
      </button>
    </div>
  </div>
</GlassCard>
```

**Design Tokens:**
- Background: `glassmorphic-card backdrop-blur-xl`
- Title Gradient: `from-turquoise-500 to-ocean-600`
- Dark Mode: `dark:from-turquoise-400 dark:to-ocean-500`
- Button: `from-turquoise-500 to-ocean-600 hover:from-turquoise-600 hover:to-ocean-700`

---

### 2. Status Overview Component

**Structure:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  {/* Total Open Sources */}
  <GlassCard className="glassmorphic-card backdrop-blur-xl p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Open Sources</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">18</p>
      </div>
      <div className="p-3 bg-gradient-to-br from-turquoise-500/10 to-ocean-600/10 dark:from-turquoise-900/20 dark:to-ocean-900/20 rounded-xl">
        <Package className="h-6 w-6 text-turquoise-600 dark:text-turquoise-400" />
      </div>
    </div>
  </GlassCard>

  {/* Fully Deployed */}
  <GlassCard className="glassmorphic-card backdrop-blur-xl p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">🟢 Fully Deployed</p>
        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">12</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">67%</p>
      </div>
    </div>
  </GlassCard>

  {/* Partial */}
  <GlassCard className="glassmorphic-card backdrop-blur-xl p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">🟡 Partial</p>
        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">4</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">22%</p>
      </div>
    </div>
  </GlassCard>

  {/* Not Deployed */}
  <GlassCard className="glassmorphic-card backdrop-blur-xl p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">🔴 Not Deployed</p>
        <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">2</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">11%</p>
      </div>
    </div>
  </GlassCard>
</div>
```

**Design Tokens:**
- Card: `glassmorphic-card backdrop-blur-xl`
- Icon Background: `from-turquoise-500/10 to-ocean-600/10 dark:from-turquoise-900/20 dark:to-ocean-900/20`
- Status Colors:
  - Green (100%): `text-green-600 dark:text-green-400`
  - Yellow (Partial): `text-yellow-600 dark:text-yellow-400`
  - Red (Not Deployed): `text-red-600 dark:text-red-400`

---

### 3. Open Source Grid Component

**Structure:**
```tsx
<GlassCard className="glassmorphic-card backdrop-blur-xl p-6 mb-6">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
    Open Source Inventory (18)
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {openSources.map(os => (
      <div 
        key={os.name}
        className="p-4 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-turquoise-500 dark:hover:border-turquoise-400 transition-all cursor-pointer"
        data-testid={`opensource-card-${os.name.toLowerCase()}`}
      >
        {/* Status Indicator */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-2xl ${getStatusEmoji(os.status)}`}>
            {getStatusEmoji(os.status)}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(os.status)}`}>
            {os.status}
          </span>
        </div>
        
        {/* Name & Layer */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {os.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Layer {os.layer} - {os.layerName}
        </p>
        
        {/* 5-Criteria Checklist */}
        <div className="space-y-1 mb-3">
          {os.criteria.map(criterion => (
            <div key={criterion.name} className="flex items-center gap-2 text-xs">
              <span className={criterion.met ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-600"}>
                {criterion.met ? "✓" : "○"}
              </span>
              <span className={criterion.met ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}>
                {criterion.name}
              </span>
            </div>
          ))}
        </div>
        
        {/* Responsible Agent */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Agent {os.responsibleAgent}
          </span>
          {os.trainingStory && (
            <span className="ml-auto text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
              In Training
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
</GlassCard>
```

**Design Tokens:**
- Card Outer: `glassmorphic-card backdrop-blur-xl`
- Card Inner: `from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50`
- Hover Border: `hover:border-turquoise-500 dark:hover:border-turquoise-400`
- Status Badges:
  - 100%: `bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400`
  - Partial: `bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400`
  - Not Deployed: `bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400`

---

### 4. Training Queue Component

**Structure:**
```tsx
<GlassCard className="glassmorphic-card backdrop-blur-xl p-6 mb-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
      Agent Training Queue
    </h2>
    <span className="text-sm px-3 py-1 bg-gradient-to-r from-turquoise-500/10 to-ocean-600/10 dark:from-turquoise-900/20 dark:to-ocean-900/20 text-turquoise-700 dark:text-turquoise-400 rounded-full">
      {trainingQueue.length} Active
    </span>
  </div>
  
  <div className="space-y-3">
    {trainingQueue.map(training => (
      <div 
        key={training.id}
        className="p-4 bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
        data-testid={`training-${training.storyKey}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                Agent #{training.agentNumber}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">→</span>
              <span className="text-sm font-medium text-turquoise-600 dark:text-turquoise-400">
                {training.openSource}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Phase {training.currentPhase}/6</span>
                <span>{training.estimatedHours}h total</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-turquoise-500 to-ocean-600 transition-all"
                  style={{ width: `${(training.currentPhase / 6) * 100}%` }}
                />
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Due: {training.dueDate}
            </p>
          </div>
          
          <button className="ml-4 text-sm text-turquoise-600 dark:text-turquoise-400 hover:underline" data-testid={`button-view-${training.storyKey}`}>
            View Story
          </button>
        </div>
      </div>
    ))}
  </div>
</GlassCard>
```

**Design Tokens:**
- Progress Bar Background: `bg-gray-200 dark:bg-gray-700`
- Progress Bar Fill: `from-turquoise-500 to-ocean-600`
- Badge Background: `from-turquoise-500/10 to-ocean-600/10 dark:from-turquoise-900/20 dark:to-ocean-900/20`

---

### 5. Consolidation Queue Component

**Structure:**
```tsx
<GlassCard className="glassmorphic-card backdrop-blur-xl p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
      CEO Approval Queue
    </h2>
    <span className="text-sm px-3 py-1 bg-gradient-to-r from-orange-500/10 to-red-600/10 dark:from-orange-900/20 dark:to-red-900/20 text-orange-700 dark:text-orange-400 rounded-full">
      {consolidationQueue.length} Pending
    </span>
  </div>
  
  <div className="space-y-3">
    {consolidationQueue.map(consolidation => (
      <div 
        key={consolidation.id}
        className="p-4 bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg border border-orange-200 dark:border-orange-800"
        data-testid={`consolidation-${consolidation.id}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {consolidation.duplicates.join(" vs ")}
              </span>
            </div>
            
            <div className="p-3 bg-turquoise-50 dark:bg-turquoise-900/10 rounded-lg border-l-4 border-turquoise-500 dark:border-turquoise-400 mb-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Recommendation:</strong> {consolidation.recommendation}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {consolidation.reason}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                ✓ {consolidation.domainChiefApproval}
              </span>
              <span className="text-gray-500 dark:text-gray-500">
                Effort: {consolidation.estimatedEffort}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-sm transition-all" data-testid={`button-approve-${consolidation.id}`}>
            ✓ CEO Approve
          </button>
          <button className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg text-sm transition-all" data-testid={`button-reject-${consolidation.id}`}>
            ✗ Reject
          </button>
        </div>
      </div>
    ))}
  </div>
</GlassCard>
```

**Design Tokens:**
- Border: `border-orange-200 dark:border-orange-800`
- Info Box: `bg-turquoise-50 dark:bg-turquoise-900/10 border-l-4 border-turquoise-500 dark:border-turquoise-400`
- Approve Button: `from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700`
- Reject Button: `from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700`

---

## 🎨 Color Palette (MT Ocean Theme)

### Primary Gradients
```css
/* Turquoise to Ocean */
from-turquoise-500 to-ocean-600
from-turquoise-600 to-ocean-700 (hover)

/* Dark Mode */
dark:from-turquoise-400 dark:to-ocean-500
dark:from-turquoise-500 dark:to-ocean-600 (hover)
```

### Status Colors
```css
/* 100% Deployed (Green) */
text-green-600 dark:text-green-400
bg-green-100 dark:bg-green-900/30

/* Partial (Yellow) */
text-yellow-600 dark:text-yellow-400
bg-yellow-100 dark:bg-yellow-900/30

/* Not Deployed (Red) */
text-red-600 dark:text-red-400
bg-red-100 dark:bg-red-900/30
```

### Glassmorphic Effects
```css
/* Card Background */
glassmorphic-card backdrop-blur-xl

/* Gradient Overlays */
from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50
```

---

## 📱 Responsive Breakpoints

```tsx
// Mobile (default)
<div className="grid grid-cols-1 gap-4">

// Tablet (md: 768px)
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Desktop (lg: 1024px)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## ♿ Accessibility

- All interactive elements have `data-testid` attributes
- Color is not the only indicator (use emojis + text)
- Proper heading hierarchy (h1 → h2 → h3)
- Button labels are descriptive
- Dark mode support with proper contrast ratios

---

## 🚀 Animation & Micro-Interactions

### Hover Effects
```css
/* Cards */
hover:border-turquoise-500 dark:hover:border-turquoise-400

/* Buttons */
hover:from-turquoise-600 hover:to-ocean-700
transition-all
```

### Progress Bars
```css
transition-all
```

---

## 📦 Required Components

**From Aurora Tide:**
- ✅ `GlassCard` from `@/components/glass/GlassComponents`

**From Lucide React:**
- ✅ `Package`, `TrendingUp`, `AlertTriangle`, `Check`, `X`

**From Tailwind:**
- ✅ All MT Ocean gradient classes
- ✅ All glassmorphic utility classes
- ✅ Dark mode variants

---

## ✅ Agent #11 Approval

**Design Status:** ✅ APPROVED  
**Date:** October 11, 2025  
**Agent:** #11 (UI/UX Design Expert)

**Compliance:**
- ✅ Aurora Tide design system
- ✅ MT Ocean Theme gradients
- ✅ Glassmorphic components (GlassCard)
- ✅ Complete dark mode coverage
- ✅ Responsive layouts
- ✅ Accessibility standards
- ✅ All data-testid attributes

**Next Steps:**
1. Agent #8 builds using this spec
2. Agent #66 enforces via ESLint
3. Agent #14 validates post-build

---

**END OF DESIGN SPECIFICATION**
