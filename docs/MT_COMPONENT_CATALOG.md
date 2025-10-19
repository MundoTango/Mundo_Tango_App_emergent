# Mundo Tango Component Catalog
**Version:** 1.0  
**Last Updated:** October 19, 2025  
**Total Components:** 467 (estimated from codebase analysis)

## Purpose
This catalog provides a comprehensive inventory of all reusable components in the Mundo Tango platform, their purpose, location, ownership, and usage examples.

## Component Directory Structure

```
client/src/components/
├── Community/           # Community and city group components
├── GuestOnboarding/     # Guest user onboarding flow
├── GuestProfile/        # Guest profile display
├── Housing/             # Housing marketplace components
├── Recommendations/     # Recommendation system UI
├── admin/               # Admin dashboard components
├── auth/                # Authentication components
├── events/              # Events and calendar components
├── groups/              # Group management UI
├── memories/            # Memories/posts components
├── messaging/           # Chat and messaging UI
├── navigation/          # Navigation and routing
├── profiles/            # User profile components
├── shared/              # Shared utility components
├── subscriptions/       # Subscription management UI
├── ui/                  # Base UI components (Shadcn)
└── _archive/            # Deprecated/archived components
```

---

## Component Categories

### **1. Base UI Components (Shadcn-based)**
**Location:** `client/src/components/ui/`  
**Owner:** UI/UX Division (Layer #9)  
**Maintenance:** Core team

#### **Form Controls:**
| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| Button | `ui/button.tsx` | Primary action buttons with variants | ✅ Active |
| Input | `ui/input.tsx` | Text input fields | ✅ Active |
| Select | `ui/select.tsx` | Dropdown selections | ✅ Active |
| Checkbox | `ui/checkbox.tsx` | Checkbox inputs | ✅ Active |
| RadioGroup | `ui/radio-group.tsx` | Radio button groups | ✅ Active |
| Textarea | `ui/textarea.tsx` | Multi-line text input | ✅ Active |
| Form | `ui/form.tsx` | React Hook Form wrapper | ✅ Active |

#### **Layout:**
| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| Card | `ui/card.tsx` | Content containers | ✅ Active |
| Tabs | `ui/tabs.tsx` | Tab navigation | ✅ Active |
| Dialog | `ui/dialog.tsx` | Modal dialogs | ✅ Active |
| Sheet | `ui/sheet.tsx` | Side panels/drawers | ✅ Active |
| Accordion | `ui/accordion.tsx` | Collapsible sections | ✅ Active |
| Separator | `ui/separator.tsx` | Visual dividers | ✅ Active |

#### **Feedback:**
| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| Toast | `ui/toast.tsx` | Notification toasts | ✅ Active |
| Alert | `ui/alert.tsx` | Alert messages | ✅ Active |
| Badge | `ui/badge.tsx` | Status badges | ✅ Active |
| Progress | `ui/progress.tsx` | Progress indicators | ✅ Active |
| Skeleton | `ui/skeleton.tsx` | Loading placeholders | ✅ Active |

---

### **2. Feature Components**

#### **Community Components**
**Location:** `client/src/components/Community/`  
**Owner:** Community Management (Layer #21)

| Component | Purpose | Used In |
|-----------|---------|---------|
| CommunityCard | Display city/group info | Community page, Map |
| CommunityMapFilters | Filter options for map | Community Map |
| CommunityMapWithLayers | Interactive world map | Community page |
| EnhancedCityGroupCard | Rich city group display | Group listings |
| RankingsPanel | City rankings leaderboard | Community stats |
| WorldMap | Base map component | Multiple pages |

---

#### **Authentication Components**
**Location:** `client/src/components/auth/`  
**Owner:** Authentication Layer (Layer #21)

| Component | Purpose | Used In |
|-----------|---------|---------|
| LoginForm | User login | Login page (P1) |
| RegisterForm | User registration | Register page (P2) |
| ForgotPasswordForm | Password reset | Password reset |
| SocialAuthButtons | OAuth providers | Login/Register |
| AuthGuard | Protected route wrapper | App routing |

---

#### **Memories/Posts Components**
**Location:** `client/src/components/memories/`  
**Owner:** Content Management (Layer #13)

| Component | Purpose | Used In |
|-----------|---------|---------|
| MemoryCard | Display user post | Home feed (P10) |
| MemoryForm | Create/edit memory | Create post modal |
| MemoryList | Scrollable feed | Home feed |
| MemoryFilterBar | Filter/sort options | Feed controls |
| PostActionsMenu | Like/comment/share | Memory card |
| HashtagInput | Hashtag autocomplete | Memory form |

---

#### **Events Components**
**Location:** `client/src/components/events/`  
**Owner:** Events Management (Layer #19)

| Component | Purpose | Used In |
|-----------|---------|---------|
| EventCard | Display event info | Events page (P13) |
| EventCalendar | Calendar view | Calendar page (P14) |
| EventForm | Create/edit event | Event creation |
| RSVPButton | RSVP management | Event card |
| RecurringEventConfig | Recurring settings | Event form |
| AttendeesList | Show attendees | Event detail |

---

#### **Groups Components**
**Location:** `client/src/components/groups/`  
**Owner:** Groups Management (Layer #22)

| Component | Purpose | Used In |
|-----------|---------|---------|
| GroupCard | Display group | Groups page (P18) |
| GroupMembersList | Member management | Group detail (P19) |
| GroupSettings | Group configuration | Group admin |
| JoinGroupButton | Join/leave actions | Group card |
| GroupActivityFeed | Group posts | Group detail |

---

#### **Admin Components**
**Location:** `client/src/components/admin/`  
**Owner:** Admin Dashboard (P30)

| Component | Purpose | Used In |
|-----------|---------|---------|
| AdminLayout | Admin page layout | All admin pages |
| AuditTrailViewer | Audit logs | Admin audit |
| UserManagementTable | User CRUD | User management (P31) |
| ContentModerationQueue | Moderate posts | Moderation (P32) |
| AnalyticsDashboard | Metrics display | Analytics (P33) |
| StatsCard | Metric display card | Dashboard |

---

### **3. Shared Utility Components**
**Location:** `client/src/components/shared/`  
**Owner:** Multiple teams (as needed)

| Component | Purpose | Maintenance |
|-----------|---------|-------------|
| LoadingButton | Button with loading state | Core team |
| ErrorBoundary | React error catching | Core team |
| ImageUpload | File upload widget | Media team |
| DatePicker | Date selection | Forms team |
| LocationInput | Location autocomplete | Maps team |
| AvatarUpload | Profile photo upload | Profiles team |
| RichTextEditor | WYSIWYG editor | Content team |

---

## Component Versioning Policy

### **Semantic Versioning for Components:**

**MAJOR version** (Breaking change):
- Component API changes (prop names, types)
- Removed props or features
- Fundamental behavior changes

**MINOR version** (New features):
- New optional props
- New variants or styles
- Enhanced functionality (backward compatible)

**PATCH version** (Bug fixes):
- Bug fixes
- Performance improvements
- Documentation updates

**Example:**
```typescript
/**
 * Button Component
 * @version 2.1.3
 * 
 * Changelog:
 * - 2.1.3: Fixed loading spinner alignment
 * - 2.1.0: Added 'ghost' variant
 * - 2.0.0: Changed onClick prop type (BREAKING)
 */
```

---

## Component Ownership & Maintenance

### **Ownership Tiers:**

**Tier 1: Core Components (Shadcn UI)**
- **Owner:** UI/UX Division Chief (#5)
- **Maintainers:** Layer #9 (UI Framework) + Layer #10 (Component Library)
- **Update Frequency:** Monthly security/dependency updates
- **Breaking Changes:** Require 30-day deprecation notice

**Tier 2: Feature Components**
- **Owner:** Respective domain layer (e.g., Layer #13 for Memories)
- **Maintainers:** Domain coordinators + feature teams
- **Update Frequency:** Sprint-based (2 weeks)
- **Breaking Changes:** Coordinate with all consuming pages

**Tier 3: Shared Utilities**
- **Owner:** Infrastructure Division Chief (#1)
- **Maintainers:** Cross-functional team
- **Update Frequency:** As needed
- **Breaking Changes:** Must not break existing usage

---

## Component Lifecycle States

| State | Icon | Meaning | Action Required |
|-------|------|---------|-----------------|
| **Active** | ✅ | Production-ready, maintained | Use freely |
| **Beta** | 🔶 | Functional but evolving | Use with caution |
| **Deprecated** | ⚠️ | Being replaced | Migrate to new version |
| **Archived** | 📦 | No longer maintained | Do not use |
| **Experimental** | 🧪 | Proof of concept | Not for production |

**Example:**
```typescript
/**
 * OldButton Component
 * @status deprecated
 * @deprecated Use `Button` from @/components/ui/button instead
 * @removal-date 2025-12-01
 */
export function OldButton() {
  console.warn('OldButton is deprecated. Use Button from ui/button.');
  // Component code...
}
```

---

## Component Usage Guidelines

### **When to Create a New Component:**

✅ **DO create when:**
- Component is used in 3+ places
- Component has clear, single responsibility
- Component is generic enough for reuse
- Component reduces significant code duplication

❌ **DON'T create when:**
- Component is one-off and highly specific
- Component is simpler than the abstraction it creates
- Component is only used once
- Over-engineering a simple UI element

---

### **Component Contribution Process:**

1. **Propose:** Open discussion with component owner
2. **Design:** Create component spec (props, behavior, accessibility)
3. **Implement:** Build component following MT coding standards
4. **Document:** Add JSDoc, usage examples, Storybook stories
5. **Test:** Unit tests, accessibility tests, visual regression
6. **Review:** Code review by 2+ developers
7. **Publish:** Merge to main, update catalog, announce to team

---

## Component Quality Standards

### **All Components Must Have:**

✅ TypeScript types for all props  
✅ JSDoc documentation with examples  
✅ Accessibility (ARIA labels, keyboard support)  
✅ Mobile responsive design  
✅ Dark mode support  
✅ data-testid attributes  
✅ Error boundaries (for complex components)  
✅ Loading/skeleton states (for async components)

**Example:**
```typescript
/**
 * LoadingButton - Button with loading state
 * 
 * @param isLoading - Shows spinner when true
 * @param children - Button content
 * @param onClick - Click handler
 * @param variant - Button style variant
 * 
 * @example
 * <LoadingButton 
 *   isLoading={isSubmitting} 
 *   onClick={handleSubmit}
 *   variant="primary"
 * >
 *   Save
 * </LoadingButton>
 */
interface LoadingButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  'data-testid'?: string;
}

export function LoadingButton({ 
  isLoading, 
  children, 
  variant = 'primary',
  'data-testid': testId,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button 
      variant={variant} 
      disabled={isLoading}
      data-testid={testId || 'button-loading'}
      {...props}
    >
      {isLoading && <Spinner className="mr-2" aria-label="Loading" />}
      {children}
    </Button>
  );
}
```

---

## Component Testing Standards

### **Required Tests:**

**Unit Tests:**
```typescript
describe('LoadingButton', () => {
  it('renders children correctly', () => {
    render(<LoadingButton>Save</LoadingButton>);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
  
  it('shows spinner when loading', () => {
    render(<LoadingButton isLoading>Save</LoadingButton>);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });
  
  it('disables button when loading', () => {
    render(<LoadingButton isLoading>Save</LoadingButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

**Accessibility Tests:**
```typescript
it('meets WCAG 2.1 AA standards', async () => {
  const { container } = render(<LoadingButton>Save</LoadingButton>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Visual Regression:**
```typescript
it('matches visual snapshot', () => {
  const { container } = render(<LoadingButton>Save</LoadingButton>);
  expect(container).toMatchSnapshot();
});
```

---

## Integration with ESA Protocols

**Related Protocols:**
- `ESA_REUSABLE_COMPONENTS.md` - Component design patterns and guidelines
- `ESA_AGENT_CERTIFICATION.md` - Component creation is part of certification
- `ESA_PERFORMANCE_METRICS.md` - Component render time targets (<16ms)
- `ESA_CHECK_BEFORE_BUILD.md` - Verify components exist before using

---

## Component Discovery

### **How to Find Components:**

**1. Search this catalog**
**2. Browse Storybook** (when implemented):
```bash
npm run storybook
# Navigate to http://localhost:6006
```

**3. Search codebase:**
```bash
# Find all components
find client/src/components -name "*.tsx" | grep -v __tests__

# Search for specific component
grep -r "export function Button" client/src/components

# Find component usage
grep -r "<Button" client/src/pages
```

**4. Ask Documentation Agent (Layer #52)**

---

## Next Steps

**Immediate Actions:**
1. ✅ Catalog created (this document)
2. 🔲 Set up Storybook for visual component library
3. 🔲 Generate component dependency graph
4. 🔲 Audit all components for quality standards compliance
5. 🔲 Create component contribution guide
6. 🔲 Set up automated component documentation generation

**Long-Term Goals:**
- Automated component versioning
- Component performance monitoring
- Usage analytics (which components are most used)
- Deprecation tracking and alerts

---

**Catalog Maintainer:** Documentation Agent (Layer #52)  
**Review Cycle:** Monthly or when major components added  
**Last Audit:** October 19, 2025
