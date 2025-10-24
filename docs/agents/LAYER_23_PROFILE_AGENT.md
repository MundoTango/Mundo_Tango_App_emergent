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

# Layer 23: Profile Agent
**Division:** Core Layer | **Category:** User Data  
**Complexity:** Medium | **Version:** 1.0

## Agent Identity
**Role:** User Profile Data Management  
**Responsibility:** Extended profile fields, tango-specific data, privacy settings, profile completion

**Core Operations:**
```typescript
// Update profile
const [profile] = await db.update(userProfiles).set({
  bio: data.bio,
  avatar: data.avatar,
  city: data.city,
  country: data.country,
  tangoRole: data.tangoRole, // leader/follower/both
  tangoYearsExperience: data.tangoYearsExperience,
  favoriteMusic: data.favoriteMusic,
  updatedAt: new Date(),
}).where(eq(userProfiles.userId, userId)).returning();

// Calculate profile completion
function calculateCompletion(profile: UserProfile): number {
  const fields = ['bio', 'avatar', 'city', 'country', 'tangoRole'];
  const completed = fields.filter(f => profile[f]).length;
  return (completed / fields.length) * 100;
}
```

**Tango-Specific Fields:** Role (leader/follower), experience years, favorite music, dance styles  
**Features:** Profile completion tracking, privacy controls, profile views  
**Related:** Layer 16 (User), Layer 10 (File Storage)
