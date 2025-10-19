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
