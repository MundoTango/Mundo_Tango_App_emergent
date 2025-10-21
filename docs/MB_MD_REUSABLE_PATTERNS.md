# MB.MD Reusable Patterns Library v1.0
**Created**: October 21, 2025  
**Purpose**: Documented patterns for all 350+ agents to follow  
**Benefit**: Prevent reinventing the wheel, ensure consistency

---

## Pattern 1: Route Mounting (Backend + Frontend)

### Problem
Routes defined but not mounted → Always returns 404

### Solution Template

**Backend (`server/routes.ts`):**
```typescript
import myNewRoutes from "./routes/myNewRoutes";

export function registerRoutes(app: Express) {
  // ... existing routes
  
  app.use("/api/my-feature", myNewRoutes); // ← Add here
}
```

**Frontend (`client/src/App.tsx`):**
```typescript
// 1. Add lazy import
const MyFeaturePage = lazy(() => import("@/pages/MyFeaturePage"));

// 2. Add route entry in JSX
<Route path="/my-feature" component={MyFeaturePage} />
<Route path="/my-feature/:id" component={MyFeatureDetail} />
```

**Verification:**
```bash
# Backend
curl http://localhost:5000/api/my-feature -v 2>&1 | grep "200 OK"

# Frontend
screenshot --path=/my-feature
```

---

## Pattern 2: Zod Validation (Without .omit() Issues)

### Problem
`.omit()` on insert schemas causes "Type 'true' is not assignable to 'never'"

### Solution Template

**Define Schema (`shared/schema.ts`):**
```typescript
export const myTable = pgTable("my_table", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schema - omit auto-generated fields
export const insertMyTableSchema = createInsertSchema(myTable).omit({
  id: true,
  createdAt: true,
});

export type MyTable = typeof myTable.$inferSelect;
export type InsertMyTable = z.infer<typeof insertMyTableSchema>;
```

**Validate in Route (NO .omit() here!):**
```typescript
router.post("/", async (req, res) => {
  // Build data object first
  const dataToInsert = {
    userId: req.user.id, // From session
    content: req.body.content,
  };
  
  // Validate (no .omit needed - already done in schema)
  insertMyTableSchema.parse(dataToInsert);
  
  // Insert
  const result = await storage.createMyTable(dataToInsert);
  res.status(201).json(result);
});
```

**Key Principle:** `.omit()` once in schema definition, NOT in route handlers

---

## Pattern 3: Database Table Setup

### Problem
Table in schema but not in database, or vice versa

### Solution Template

**1. Define in Schema (`shared/schema.ts`):**
```typescript
export const myTable = pgTable("my_table", {
  id: serial("id").primaryKey(),
  // ... columns
});
```

**2. Push to Database:**
```bash
npm run db:push
# If data loss warning: npm run db:push --force
```

**3. Verify Table Exists:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'my_table';
```

**4. Update Storage Interface (`server/storage.ts`):**
```typescript
export interface IStorage {
  // Add CRUD methods
  createMyTable(data: InsertMyTable): Promise<MyTable>;
  getMyTable(id: number): Promise<MyTable | null>;
  updateMyTable(id: number, data: Partial<InsertMyTable>): Promise<MyTable>;
  deleteMyTable(id: number): Promise<void>;
}
```

---

## Pattern 4: Component Integration

### Problem
Component built but never imported → Code exists but never renders

### Solution Template

**1. Build Component (`client/src/components/MyComponent.tsx`):**
```typescript
export function MyComponent() {
  return <div>Hello</div>;
}
```

**2. Import in Parent (IMMEDIATE, NOT LATER):**
```typescript
import { MyComponent } from "@/components/MyComponent";

export function ParentPage() {
  return (
    <div>
      <MyComponent /> {/* ← Use immediately */}
    </div>
  );
}
```

**3. Verify Renders:**
```bash
screenshot --path=/parent-page
# Check: Does MyComponent appear in screenshot?
```

**Key Principle:** Import as you build, not after

---

## Pattern 5: React Query Mutations

### Problem
UI action triggers mutation but cache never invalidates

### Solution Template

**Define Mutation:**
```typescript
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

function MyComponent() {
  const mutation = useMutation({
    mutationFn: (data) => apiRequest("POST", "/api/my-route", data),
    onSuccess: () => {
      // CRITICAL: Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['/api/my-route'] });
      toast({ title: "Success!" });
    },
  });
  
  return (
    <Button 
      onClick={() => mutation.mutate({ content: "test" })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Saving..." : "Save"}
    </Button>
  );
}
```

**Key Principles:**
- Show loading state (`isPending`)
- Invalidate cache after success
- Handle errors gracefully

---

## Pattern 6: Service Singleton Export

### Problem
Service class defined but not exported → Import fails

### Solution Template

**Define + Export Service (`server/services/myService.ts`):**
```typescript
class MyService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.MY_API_KEY || "";
  }
  
  async doSomething(): Promise<string> {
    if (!this.apiKey) {
      throw new Error("MY_API_KEY not configured");
    }
    // ... implementation
  }
}

// Export singleton instance
export const myService = new MyService();
```

**Use in Routes:**
```typescript
import { myService } from "../services/myService";

router.post("/", async (req, res) => {
  const result = await myService.doSomething();
  res.json(result);
});
```

**Key Principle:** Export instance, not just class

---

## Pattern 7: Navigation Links

### Problem
Feature exists but users can't find it → No navigation link

### Solution Template

**Add to Sidebar (`client/src/components/layout/sidebar.tsx`):**
```typescript
<Link href="/my-feature">
  <Button variant="ghost" className="w-full justify-start">
    <MyIcon className="mr-2 h-4 w-4" />
    My Feature
  </Button>
</Link>
```

**Add to Top Nav (if prominent):**
```typescript
<Link href="/my-feature" className="nav-link">
  My Feature
</Link>
```

**Verify Discoverability:**
- [ ] User can find feature without knowing URL
- [ ] Link visible in main navigation
- [ ] Link highlighted when on that page

---

## Pattern 8: Feature Flags for Missing API Keys

### Problem
Service crashes if API key missing → Entire app breaks

### Solution Template

```typescript
class MyService {
  private enabled: boolean;
  
  constructor() {
    const apiKey = process.env.MY_API_KEY;
    this.enabled = !!apiKey;
    
    if (!this.enabled) {
      console.warn("⚠️ MY_API_KEY not set - MyService disabled");
    }
  }
  
  async doSomething(): Promise<string> {
    if (!this.enabled) {
      throw new Error("MyService not configured. Add MY_API_KEY to Secrets.");
    }
    // ... actual implementation
  }
  
  isEnabled(): boolean {
    return this.enabled;
  }
}
```

**UI Shows Status:**
```typescript
{myService.isEnabled() ? (
  <Button onClick={handleAction}>Use Feature</Button>
) : (
  <Alert>Feature requires API key configuration</Alert>
)}
```

---

## Pattern 9: Screenshot-Driven Development

### Problem
"Code works" but no visual proof

### Solution Template

**After Every UI Change:**
```bash
# Take screenshot
screenshot --path=/my-feature

# Verify in response:
# ✅ Component visible
# ✅ No console errors
# ✅ User can interact
```

**Before Marking Complete:**
- [ ] Screenshot of initial state
- [ ] Screenshot of loading state
- [ ] Screenshot of success state
- [ ] Screenshot of error state (if applicable)

---

## Pattern 10: Error Boundaries

### Problem
Component crashes, entire app white-screens

### Solution Template

**Wrap Risky Components:**
```typescript
import { ErrorBoundary } from "react-error-boundary";

<ErrorBoundary
  fallback={<div>Something went wrong. Please refresh.</div>}
  onError={(error) => console.error("Component error:", error)}
>
  <MyRiskyComponent />
</ErrorBoundary>
```

---

## Quick Reference Table

| Pattern | When to Use | Files Affected |
|---------|-------------|----------------|
| Route Mounting | New API/page | `server/routes.ts`, `App.tsx` |
| Zod Validation | User input | `shared/schema.ts`, route files |
| DB Table Setup | New data model | `schema.ts`, `storage.ts` |
| Component Integration | New UI element | Component file + parent |
| React Query | Data fetching/mutations | Component files |
| Service Singleton | External API | Service file |
| Navigation Links | New page/feature | `sidebar.tsx`, `nav.tsx` |
| Feature Flags | Optional integrations | Service files |
| Screenshots | Any UI change | N/A (proof) |
| Error Boundaries | Risky components | Parent component |

---

*Apply these patterns consistently across all 350+ agents for predictable, maintainable code.*
