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
