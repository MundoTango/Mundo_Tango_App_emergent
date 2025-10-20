# Mundo Tango - Component Registry
**Last Updated:** October 20, 2025  
**Purpose:** Prevent duplicate component creation  
**Status:** All production-ready components catalogued

---

## 🎨 LAYOUT COMPONENTS (Production Ready)

### BottomNav
**Location:** `client/src/components/layout/BottomNav.tsx`  
**Status:** ✅ Production Ready (95 lines)  
**Features:**
- Fixed bottom navigation (mobile only <768px)
- 5 core actions: Home, Events, Messages, Profile, More
- 56x56px touch targets (WCAG AA)
- Aurora Tide design
- Active state highlighting
- iOS safe-area support

**Props:**
```typescript
interface BottomNavProps {
  onMenuClick?: () => void;
}
```

**Usage:**
```tsx
import BottomNav from '@/components/layout/BottomNav';

<BottomNav onMenuClick={() => setSidebarOpen(true)} />
```

**Integrate Into:** All 107 pages via App.tsx wrapper

---

### Sidebar
**Location:** `client/src/components/layout/sidebar.tsx`  
**Status:** ✅ Production Ready (426 lines)  
**Features:**
- Full navigation sidebar (72 organized sections)
- User profile section
- Global statistics display
- Dark blue design variant available
- Collapsible sections
- Admin-only sections (RBAC)
- Mobile hamburger menu

**Props:**
```typescript
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onClose?: () => void;
}
```

**Usage:**
```tsx
import Sidebar from '@/components/layout/sidebar';

<Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
```

**Integrate Into:** Desktop views (>768px) all pages

---

## 📸 MEDIA COMPONENTS

### ResponsiveImage
**Location:** `client/src/components/ui/responsive-image.tsx`  
**Status:** ✅ Production Ready  
**Features:**
- WebP/AVIF support
- Lazy loading (Intersection Observer)
- Srcset for multiple resolutions
- Fallback for unsupported formats
- Loading skeleton

**Props:**
```typescript
interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}
```

---

### ObjectUploader
**Location:** Various  
**Status:** ✅ Production Ready  
**Features:**
- Replit Object Storage integration
- Drag-and-drop
- Multiple file upload
- Progress tracking
- Image compression
- ACL support (public/private)

---

## 🎯 FEED COMPONENTS

### MemoryCard
**Location:** `client/src/pages/MemoriesPage.tsx` (lines 47-106)  
**Status:** ✅ Production Ready  
**Features:**
- Aurora Tide design
- User avatar
- Content display
- Media support
- Like/Comment/Share buttons
- 44px touch targets

**Props:**
```typescript
interface MemoryCardProps {
  memory: {
    id: number;
    user: { name: string; username: string; profileImage?: string };
    content: string;
    imageUrl?: string;
    likesCount?: number;
    commentsCount?: number;
    sharesCount?: number;
  };
}
```

---

## 🛠️ UI LIBRARY COMPONENTS (shadcn/ui)

### All shadcn Components Available:
- Avatar, AvatarImage, AvatarFallback
- Button
- Card, CardContent, CardHeader
- Textarea
- Input
- Select, SelectItem
- Dialog, DialogContent
- Dropdown, DropdownMenu
- Toast, useToast
- Tabs, TabsContent
- Form, FormField, FormControl
- Label
- Checkbox
- RadioGroup
- Switch
- Slider
- Progress
- Separator
- ScrollArea
- Accordion
- Alert
- Badge
- Popover
- Tooltip
- HoverCard

**Location:** `client/src/components/ui/*`  
**Status:** ✅ All Production Ready  
**Usage:** Import from `@/components/ui/{component}`

---

## 📱 MOBILE-SPECIFIC COMPONENTS

### Mobile Page Variants
**Locations:**
- `client/src/pages/messages-mobile.tsx`
- `client/src/pages/groups-mobile.tsx`
- `client/src/pages/profile-mobile.tsx`
- `client/src/pages/notifications-mobile.tsx`

**Status:** ✅ Production Ready  
**Features:**
- Optimized for small screens
- Touch-friendly interactions
- Simplified layouts
- Mobile-specific navigation

---

## 🎨 THEME COMPONENTS

### Design Tokens
**Location:** `client/src/lib/theme/design-tokens.ts`  
**Status:** ✅ Production Ready (332 lines)  
**Exports:**
```typescript
export const defaultTokens: DesignTokens = {
  colors: { primary, secondary, accent, neutral, semantic, background, text, border },
  typography: { fontFamilies, fontSizes, fontWeights, lineHeights },
  spacing: { xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl },
  borderRadius: { none, sm, md, lg, xl, 2xl, full },
  shadows: { sm, md, lg, xl, 2xl, inner },
  animations: { durations, easings },
  breakpoints: { sm, md, lg, xl, 2xl }
};
```

**Usage:**
```tsx
import { defaultTokens } from '@/lib/theme/design-tokens';

// Use in Tailwind classes
className={`text-${defaultTokens.colors.primary[500]}`}
```

---

## 📊 ANALYTICS COMPONENTS

### Performance Monitoring
**Locations:**
- `client/src/hooks/usePerformanceMonitoring.ts`
- `client/src/hooks/usePerformanceOptimization.ts`
- `client/src/lib/performance-utils.ts`

**Status:** ✅ Production Ready  
**Features:**
- Core Web Vitals tracking
- Component render monitoring
- Bundle size analysis
- Performance budgets

---

## 🔍 DO NOT REBUILD

### Components That Already Exist:
❌ Bottom Navigation - Use `BottomNav.tsx`  
❌ Sidebar Navigation - Use `sidebar.tsx`  
❌ Image Uploader - Use `ObjectUploader`  
❌ Responsive Images - Use `ResponsiveImage`  
❌ Memory Cards - Use `MemoryCard`  
❌ Design Tokens - Use `design-tokens.ts`  
❌ Form Components - Use shadcn `Form`  
❌ Button/Card/Input - Use shadcn components

### Before Building ANY Component:
1. Search this registry
2. Search `client/src/components/` directory
3. Search shadcn/ui components
4. Ask: Does this exist? Can I reuse it?

---

## 📝 HOW TO USE THIS REGISTRY

### When Building a New Feature:
1. **Search First:** Check this registry + codebase
2. **Reuse if Possible:** Import existing component
3. **Extend if Needed:** Add props, don't rebuild
4. **Register if New:** Add to this document

### When Updating a Component:
1. Update component file
2. Update this registry entry
3. Test all usages
4. Update version/date

---

## 🚀 INTEGRATION STATUS

### BottomNav Integration Tracking:
- [ ] Add to App.tsx as global component
- [ ] Test on mobile (320px, 375px, 414px)
- [ ] Verify active states
- [ ] Test menu button opens sidebar
- [ ] Verify iOS safe-area
- [ ] Update all 107 pages

### Aurora Tide Component Audit:
- ✅ 30 pages fully Aurora Tide
- 🟡 50 pages partially Aurora Tide
- ❌ 27 pages not Aurora Tide

**Next:** Systematic rollout to 77 remaining pages

---

## 📚 RELATED DOCUMENTATION
- `docs/SERVICE_REGISTRY.md` - Backend services catalog
- `docs/MT_COMPLETION_REALITY_CHECK.md` - What exists vs what needs building
- `docs/MT_MASTER_PLAN_100PCT.md` - Overall roadmap
