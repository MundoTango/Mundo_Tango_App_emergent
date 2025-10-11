# Admin Center Design Standards
## ESA Admin Center - UI/UX Guidelines

**Based on:** Attached reference image (ESA Admin Center)  
**Date:** October 11, 2025  
**Purpose:** Maintain design consistency across all admin pages

---

## 🎨 Design Standards to Maintain

### **Top Bar (Required Elements)**
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] ESA Admin Center [61x21]   [Search Bar]  [🔔] [👤]  │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **Logo**: ESA Admin Center branding with teal/ocean color
- **Badge**: "61x21" version indicator
- **Search**: Full-width search bar for "users, content, or settings..."
- **Notifications**: Bell icon with notification count badge
- **User Profile**: Avatar with user initial (letter in circle)

**Aurora Tide Implementation:**
- Top bar: GlassCard with glassmorphic-header class
- Background: Subtle MT Ocean gradient
- Search: glassmorphic input with backdrop-blur
- Icons: Teal/ocean colors from MT Ocean Theme

---

### **Sidebar Navigation (Required Sections)**

#### **OVERVIEW Section**
- Dashboard (grid icon)
- Real-time Activity (with "Live" badge in green)

#### **USER MANAGEMENT Section**
- Users (users icon)
- Roles & Permissions (shield icon)
- Verification Queue (shield icon with count badge: 12)

#### **CONTENT MODERATION Section**
- Moderation Queue (flag icon with count: 8)
- Reports (warning triangle icon with count: 3)
- Content Filters (filter icon)

#### **ANALYTICS Section**
- Analytics Dashboard (bar chart icon)
- User Insights (trending up icon)
- Revenue (trending up icon)

#### **SYSTEM Section**
- Configuration (gear icon)

**Aurora Tide Implementation:**
- Sidebar: GlassCard with fixed position
- Each section: Uppercase gray heading (text-sm font-medium)
- Items: Hover effects with MT Ocean gradient
- Active state: Teal/ocean background with white text
- Badges: Circular with count, subtle gradient
- "Live" badge: Green gradient (from-green-500 to-emerald-600)

---

### **Main Content Area (Dashboard Cards)**

**Stat Cards Layout:**
```
┌─────────────┐  ┌─────────────┐
│ Total Users │  │  Revenue    │
│     0       │  │    $0       │
│ % this mo.  │  │ % decline   │
└─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐
│  Content    │  │ System      │
│  Activity   │  │  Health     │
│     0       │  │   99.9%     │
└─────────────┘  └─────────────┘
```

**Card Components:**
- **Container**: GlassCard with glassmorphic-card class
- **Icons**: Colored icons in top-right (user=teal, revenue=blue, activity=purple, health=green)
- **Large Number**: Bold, prominent display
- **Metrics**: Smaller text below with color coding (red=decline, green=increase)
- **Sub-metrics**: ARR, Churn, Response time, Errors, Queue

**Aurora Tide Implementation:**
- Cards: backdrop-blur-xl with border-white/10
- Gradients: from-turquoise-500/5 to-ocean-600/5
- Dark mode: dark:from-turquoise-900/10 dark:to-ocean-900/10
- Hover: Transform scale-105 with transition

---

### **Chart Section**

**User Growth Chart:**
- Container: GlassCard with full-width
- Title: "User Growth" with "Last 6 months" filter
- Chart: Line/area chart with MT Ocean gradient fill
- Axis: Subtle gray colors
- Grid: Minimal, low opacity

**Aurora Tide Implementation:**
- Chart colors: Turquoise to ocean gradient
- Area fill: MT Ocean gradient with 20% opacity
- Tooltips: GlassCard mini components
- Responsive: Full mobile support

---

## 🚫 Elements to Update/Fix

Based on "things are outdated and incorrect":

### **Issues to Address:**
1. ❌ **Typography inconsistencies** → Use consistent font sizes/weights
2. ❌ **Color mismatches** → Apply MT Ocean Theme colors throughout
3. ❌ **Non-glassmorphic elements** → Convert all cards to GlassCard
4. ❌ **Missing dark mode** → Add dark: variants everywhere
5. ❌ **Inconsistent spacing** → Use Tailwind spacing scale
6. ❌ **Old icon styles** → Standardize with lucide-react icons
7. ❌ **Broken responsive layout** → Fix mobile breakpoints
8. ❌ **Missing accessibility** → Add ARIA labels, data-testids
9. ❌ **No i18n** → Wrap all text in t() functions
10. ❌ **Performance issues** → Add lazy loading, optimize renders

### **Modernization Checklist:**
- [ ] Convert all Card → GlassCard
- [ ] Add MT Ocean gradients to all backgrounds
- [ ] Implement complete dark mode
- [ ] Add glassmorphic effects (backdrop-blur-xl)
- [ ] Standardize all icons to lucide-react
- [ ] Fix responsive layout for mobile
- [ ] Add full ARIA accessibility
- [ ] Implement i18n for all text
- [ ] Add data-testid attributes
- [ ] Optimize performance (React.memo, useMemo)

---

## 📐 Component Specifications

### **Sidebar Component**
```tsx
<aside className="fixed left-0 top-0 h-screen w-64 glassmorphic-card backdrop-blur-xl border-r border-white/10">
  <div className="p-6">
    {/* Logo */}
    <div className="flex items-center gap-3 mb-8">
      <Layers className="w-8 h-8 text-turquoise-500" />
      <h1 className="text-xl font-bold bg-gradient-to-r from-turquoise-500 to-ocean-600 bg-clip-text text-transparent">
        ESA Admin Center
      </h1>
      <span className="px-2 py-1 text-xs rounded bg-turquoise-500/10 text-turquoise-500">
        61x21
      </span>
    </div>
    
    {/* Navigation sections */}
    <nav className="space-y-6">
      {/* OVERVIEW */}
      <div>
        <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
          Overview
        </h2>
        {/* Nav items */}
      </div>
    </nav>
  </div>
</aside>
```

### **Top Bar Component**
```tsx
<header className="sticky top-0 z-50 glassmorphic-header backdrop-blur-xl border-b border-white/10">
  <div className="flex items-center justify-between px-6 py-4">
    <div className="flex-1 max-w-xl">
      <Input 
        placeholder="Search users, content, or settings..."
        className="glassmorphic-input backdrop-blur-sm"
      />
    </div>
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
          3
        </span>
      </Button>
      <Avatar>
        <AvatarFallback className="bg-gradient-to-br from-turquoise-500 to-ocean-600">
          P
        </AvatarFallback>
      </Avatar>
    </div>
  </div>
</header>
```

### **Dashboard Card Component**
```tsx
<GlassCard className="glassmorphic-card p-6 hover:scale-105 transition-transform">
  <div className="flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Total Users
      </p>
      <h3 className="text-3xl font-bold">0</h3>
      <p className="text-sm text-red-500 mt-1">
        ↓ % this month
      </p>
      <p className="text-xs text-gray-500 mt-2">
        0 active users
      </p>
    </div>
    <Users className="w-10 h-10 text-turquoise-500" />
  </div>
</GlassCard>
```

---

## ✅ Required Files to Update

### **Admin Pages:**
1. `/admin/dashboard` - Main admin dashboard (PRIORITY 1)
2. `/admin/users` - User management
3. `/admin/moderation` - Content moderation
4. `/admin/analytics` - Analytics dashboard
5. `/admin/agent-metrics` - Agent monitoring
6. `/admin/sprints` - Sprint management
7. `/admin/projects` - ✅ Already Aurora Tide compliant!

### **Shared Components to Create:**
1. `AdminSidebar.tsx` - Reusable sidebar for all admin pages
2. `AdminTopBar.tsx` - Reusable top bar
3. `AdminLayout.tsx` - Wrapper with sidebar + top bar
4. `DashboardCard.tsx` - Reusable stat card component

---

## 🎯 Agent Assignment (ESA 61x21)

**Agent #11 (Aurora Tide Design Expert):**
- Design approval for all admin pages
- Ensure MT Ocean Theme compliance
- Review glassmorphic effects

**Agent #65 (Builder):**
- Implement admin components
- Apply approved design specs
- Use GlassCard throughout

**Agent #66 (ESLint):**
- Enforce GlassCard usage
- Block non-Aurora Tide components

**Agent #14 (Code Quality):**
- Review final implementation
- Validate dark mode
- Check accessibility

---

## 📝 Next Steps

1. **Agent #11**: Create design specs for each admin page
2. **Build AdminLayout**: Create shared layout components
3. **Update Pages**: Apply design standards to all admin pages
4. **Validate**: Agent #14 reviews for compliance
5. **Document**: Update this file with any new patterns

**All admin pages MUST follow these standards to maintain the ESA Admin Center design language!** 🎨
