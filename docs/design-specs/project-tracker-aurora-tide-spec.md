# Project Tracker - Aurora Tide Design Specification
## Agent #11 (UI/UX Design Expert) - Approved Design

**Component:** Self-Hosted Project Tracker  
**Route:** `/admin/projects`  
**Agent Builder:** Agent #65  
**Design Review:** Agent #11 ✅ APPROVED  
**Date:** October 11, 2025

---

## 🎨 Aurora Tide Design Requirements

### **1. Component Usage (MANDATORY)**
❌ **NEVER USE:** Plain `Card` from shadcn/ui  
✅ **ALWAYS USE:** `GlassCard` from `@/components/glass/GlassComponents`

```tsx
// ❌ WRONG
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// ✅ CORRECT
import { GlassCard } from '@/components/glass/GlassComponents';
```

---

### **2. MT Ocean Theme Gradients**

**Primary Gradients:**
- Background: `from-turquoise-500/10 via-ocean-500/10 to-blue-600/10`
- Headers: `from-turquoise-600 to-ocean-600`
- Accents: `from-ocean-500 to-blue-600`

**Color Palette:**
- Turquoise: `#26b2ac` (primary)
- Ocean: `#0891b2` (secondary)
- Blue: `#0369a1` (accent)

---

### **3. Glassmorphic Effects (REQUIRED)**

**Every card must have:**
```tsx
className="glassmorphic-card backdrop-blur-xl bg-white/75 dark:bg-gray-900/75"
```

**Hover states:**
```tsx
className="beautiful-hover card-lift"
```

---

### **4. Dark Mode Compliance**

**All backgrounds need dark variants:**
```tsx
className="bg-white dark:bg-gray-900"
className="text-gray-900 dark:text-white"
className="border-gray-200 dark:border-gray-700"
```

---

### **5. Layout Structure**

**Page Container:**
```tsx
<div className="min-h-screen bg-gradient-to-br from-turquoise-500/10 via-ocean-500/10 to-blue-600/10 dark:from-turquoise-900/20 dark:via-ocean-900/20 dark:to-blue-900/20">
  {/* Content */}
</div>
```

**Stat Cards:**
```tsx
<GlassCard className="p-6 glassmorphic-card beautiful-hover">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Label</p>
      <p className="text-3xl font-bold bg-gradient-to-r from-turquoise-600 to-ocean-600 bg-clip-text text-transparent">Value</p>
    </div>
    <Icon className="h-8 w-8 text-turquoise-500" />
  </div>
</GlassCard>
```

**Epic/Story Cards:**
```tsx
<GlassCard className="glassmorphic-card card-lift p-4">
  {/* Content */}
</GlassCard>
```

---

### **6. Typography**

**Headings:**
```tsx
<h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-600 to-ocean-600 bg-clip-text text-transparent">
  Self-Hosted Project Tracker
</h1>
```

**Body Text:**
```tsx
<p className="text-gray-700 dark:text-gray-300">
```

---

### **7. Buttons & Interactive Elements**

**Primary Buttons:**
```tsx
<Button className="bg-gradient-to-r from-turquoise-500 to-ocean-600 hover:from-turquoise-600 hover:to-ocean-700 text-white">
  Create Epic
</Button>
```

**Secondary Buttons:**
```tsx
<Button variant="outline" className="border-turquoise-500 text-turquoise-600 hover:bg-turquoise-50 dark:hover:bg-turquoise-950">
  Create Story
</Button>
```

---

### **8. Status & Priority Badges**

**Status Colors:**
```tsx
const statusColors = {
  to_do: 'bg-gradient-to-r from-gray-400 to-gray-500',
  in_progress: 'bg-gradient-to-r from-turquoise-500 to-ocean-600',
  done: 'bg-gradient-to-r from-green-500 to-emerald-600',
  cancelled: 'bg-gradient-to-r from-red-500 to-rose-600'
};
```

**Priority Colors:**
```tsx
const priorityColors = {
  low: 'bg-gradient-to-r from-gray-300 to-gray-400',
  medium: 'bg-gradient-to-r from-yellow-400 to-amber-500',
  high: 'bg-gradient-to-r from-orange-500 to-red-500',
  critical: 'bg-gradient-to-r from-red-600 to-rose-700'
};
```

---

### **9. Tabs Component**

```tsx
<Tabs className="mt-8">
  <TabsList className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg">
    <TabsTrigger 
      value="dashboard" 
      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-turquoise-500 data-[state=active]:to-ocean-600 data-[state=active]:text-white"
    >
      Dashboard
    </TabsTrigger>
  </TabsList>
</Tabs>
```

---

### **10. Empty States**

```tsx
<GlassCard className="glassmorphic-card p-12 text-center">
  <div className="flex flex-col items-center gap-4">
    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-turquoise-400 to-ocean-500 flex items-center justify-center">
      <Icon className="h-8 w-8 text-white" />
    </div>
    <p className="text-gray-600 dark:text-gray-400">No items found</p>
  </div>
</GlassCard>
```

---

## ✅ Pre-Build Checklist

Before Agent #65 begins building:
- [x] Agent #11 design spec approved
- [x] GlassCard component identified
- [x] MT Ocean gradients specified
- [x] Dark mode variants defined
- [x] Glassmorphic classes documented
- [x] All components use Aurora Tide patterns

**Status:** ✅ APPROVED FOR BUILD  
**Builder:** Agent #65 may proceed with implementation  
**Reviewer:** Agent #14 will validate after build
