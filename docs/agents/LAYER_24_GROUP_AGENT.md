# 🧪 MANDATORY TESTING PROTOCOL

**Applies to:** ALL agents (105+)  
**Enforcement:** BLOCKING - No task completion without evidence  
**Updated:** October 24, 2025 (Week 1 Rollout)

---

## THE 4 MANDATORY CHECKPOINTS

Every agent MUST follow these checkpoints before marking any task complete:

### ✅ CHECKPOINT 1: DATA INSPECTION
**Rule:** NEVER assume data structures. Always inspect first.
```typescript
console.log('🔍 DATA INSPECTION:', JSON.stringify(data, null, 2));
// Run it, see the output, THEN write conditional
```

### ✅ CHECKPOINT 2: UNIT TESTING  
**Rule:** Test individual functions in isolation.
- Test regex patterns with sample inputs
- Verify IF conditions with actual data
- Validate file operations with dummy files

### ✅ CHECKPOINT 3: INTEGRATION TESTING
**Rule:** Test the FULL user journey end-to-end.
- Run complete flow as user would
- Check server logs for errors
- Screenshot successful execution

### ✅ CHECKPOINT 4: ARCHITECT REVIEW
**Rule:** Architect reviews BEHAVIOR, not just code.
- Proof it runs (screenshot)
- Proof it works (before/after)
- Proof no crashes (logs)

**Full documentation:** `docs/TESTING_REQUIREMENTS_MANDATORY.md`

---

---

# Layer 24: Group Agent
**Division:** Core Layer | **Category:** Community Management  
**Complexity:** High | **Version:** 1.0

## Agent Identity
**Role:** Tango Community & City Group Management  
**Responsibility:** Create groups, manage members, city-based auto-assignment, group events

**Core Operations:**
```typescript
// Create group
const [group] = await db.insert(groups).values({
  name: data.name,
  description: data.description,
  city: data.city,
  type: data.type, // city/interest/private
  createdBy: userId,
}).returning();

// Join group
const [member] = await db.insert(groupMembers).values({
  groupId,
  userId,
  role: 'member',
}).returning();

// Auto-assign city group
async function assignCityGroup(userId: number, city: string) {
  const cityGroup = await db.query.groups.findFirst({
    where: and(
      eq(groups.city, city),
      eq(groups.type, 'city')
    ),
  });

  if (cityGroup) {
    await db.insert(groupMembers).values({
      groupId: cityGroup.id,
      userId,
    });
  }
}
```

**Group Types:** City-based (Buenos Aires Tango), Interest (Nuevo Tango), Private  
**Features:** Auto city-assignment, member roles (admin/moderator/member), group chat  
**Related:** Layer 18 (Event), Layer 25 (Message), Layer 28 (Location)
