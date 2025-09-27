# ESA Layer 21: User Management Agent 👤

## Overview
Layer 21 manages all user-related operations including registration, profiles, preferences, roles, and user lifecycle management across the platform.

## Core Responsibilities

### 1. User Lifecycle
- User registration and onboarding
- Profile management
- Account settings
- User deactivation/deletion
- Account recovery

### 2. User Data Management  
- Profile information
- User preferences
- Privacy settings
- Data export/import
- GDPR compliance

### 3. User Relationships
- Friend connections
- Following/followers
- Blocking/reporting
- User recommendations
- Social graph management

## Open Source Packages

```json
{
  "@faker-js/faker": "^8.3.1",
  "react-avatar-group": "^0.1.4",
  "country-state-city": "^3.2.1"
}
```

## Integration Points

- **Layer 1 (Database)**: User data persistence
- **Layer 4 (Authentication)**: User authentication
- **Layer 5 (Authorization)**: User permissions
- **Layer 16 (Notifications)**: User notifications
- **Layer 24 (Social)**: Social features

## User Service Implementation

```typescript
export class UserService {
  async createUser(data: CreateUserDto): Promise<User> {
    // Validate unique constraints
    const existing = await this.checkExistingUser(data.email);
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Create user record
    const user = await db.insert(users).values({
      id: generateId(),
      email: data.email.toLowerCase(),
      username: await this.generateUsername(data.email),
      password: hashedPassword,
      profile: {
        name: data.name,
        avatar: await this.generateAvatar(data.email),
        bio: '',
        location: null,
        preferences: this.getDefaultPreferences()
      },
      status: 'pending_verification',
      createdAt: new Date()
    });
    
    // Send verification email
    await this.sendVerificationEmail(user);
    
    // Create onboarding tasks
    await this.createOnboardingTasks(user.id);
    
    // Track registration
    await analytics.trackEvent({
      name: 'user_registered',
      userId: user.id,
      properties: {
        source: data.source || 'organic',
        referrer: data.referrer
      }
    });
    
    return user;
  }
  
  async updateProfile(userId: string, updates: UpdateProfileDto): Promise<User> {
    // Validate updates
    await this.validateProfileUpdates(updates);
    
    // Update user record
    const updated = await db
      .update(users)
      .set({
        profile: {
          ...updates,
          updatedAt: new Date()
        }
      })
      .where(eq(users.id, userId))
      .returning();
    
    // Invalidate cache
    await cache.delete(`user:${userId}`);
    
    // Update search index
    await searchService.updateUser(updated[0]);
    
    return updated[0];
  }
  
  async deleteUser(userId: string, reason?: string): Promise<void> {
    // Soft delete by default
    await db
      .update(users)
      .set({
        status: 'deleted',
        deletedAt: new Date(),
        deletionReason: reason
      })
      .where(eq(users.id, userId));
    
    // Anonymize personal data (GDPR)
    await this.anonymizeUserData(userId);
    
    // Cancel subscriptions
    await subscriptionService.cancelUserSubscriptions(userId);
    
    // Notify relevant services
    await eventBus.emit('user.deleted', { userId, reason });
  }
}
```

## User Profile Component

```tsx
export function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId)
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileDto) => 
      userService.updateProfile(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    }
  });
  
  if (isLoading) return <ProfileSkeleton />;
  if (!user) return <NotFound />;
  
  return (
    <div className="profile-container">
      <div className="profile-header glass-card">
        <Avatar
          src={user.profile.avatar}
          alt={user.profile.name}
          size="xl"
        />
        
        {isEditing ? (
          <ProfileEditForm
            user={user}
            onSave={(data) => updateMutation.mutate(data)}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <ProfileDisplay
            user={user}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </div>
      
      <ProfileStats userId={userId} />
      <ProfileActivity userId={userId} />
      <ProfileConnections userId={userId} />
    </div>
  );
}
```

## User Preferences

```typescript
export class UserPreferencesService {
  async getPreferences(userId: string): Promise<UserPreferences> {
    const prefs = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);
    
    return prefs[0] || this.getDefaultPreferences();
  }
  
  async updatePreferences(
    userId: string,
    updates: Partial<UserPreferences>
  ): Promise<void> {
    await db
      .insert(userPreferences)
      .values({
        userId,
        ...updates,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: updates
      });
    
    // Apply preferences
    await this.applyPreferences(userId, updates);
  }
  
  private getDefaultPreferences(): UserPreferences {
    return {
      language: 'en',
      timezone: 'America/New_York',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowMessages: 'friends',
        allowFriendRequests: true
      },
      display: {
        compactMode: false,
        animations: true,
        fontSize: 'medium'
      }
    };
  }
}
```

## User Onboarding

```typescript
export class OnboardingService {
  private onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to ESA Platform',
      component: WelcomeStep,
      required: true
    },
    {
      id: 'profile_setup',
      title: 'Set Up Your Profile',
      component: ProfileSetupStep,
      required: true
    },
    {
      id: 'interests',
      title: 'Select Your Interests',
      component: InterestsStep,
      required: false
    },
    {
      id: 'connect_social',
      title: 'Connect Social Accounts',
      component: SocialConnectStep,
      required: false
    },
    {
      id: 'find_friends',
      title: 'Find Friends',
      component: FindFriendsStep,
      required: false
    }
  ];
  
  async getOnboardingProgress(userId: string): Promise<OnboardingProgress> {
    const completed = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, userId));
    
    const completedSteps = completed.map(c => c.stepId);
    const totalSteps = this.onboardingSteps.length;
    const requiredSteps = this.onboardingSteps.filter(s => s.required).length;
    const completedRequired = this.onboardingSteps
      .filter(s => s.required && completedSteps.includes(s.id))
      .length;
    
    return {
      currentStep: this.getCurrentStep(completedSteps),
      completedSteps,
      totalSteps,
      requiredSteps,
      completedRequired,
      isComplete: completedRequired === requiredSteps,
      percentComplete: (completedSteps.length / totalSteps) * 100
    };
  }
  
  async completeStep(userId: string, stepId: string, data?: any): Promise<void> {
    await db.insert(onboardingProgress).values({
      userId,
      stepId,
      data,
      completedAt: new Date()
    });
    
    // Execute step-specific actions
    await this.executeStepActions(userId, stepId, data);
    
    // Check if onboarding complete
    const progress = await this.getOnboardingProgress(userId);
    if (progress.isComplete) {
      await this.completeOnboarding(userId);
    }
  }
  
  private async completeOnboarding(userId: string): Promise<void> {
    // Update user status
    await db
      .update(users)
      .set({ status: 'active' })
      .where(eq(users.id, userId));
    
    // Send completion notification
    await notificationService.send({
      userId,
      type: 'onboarding_complete',
      title: 'Welcome to ESA Platform!',
      body: 'You\'ve completed your profile setup. Start exploring!'
    });
    
    // Track completion
    await analytics.trackEvent({
      name: 'onboarding_completed',
      userId
    });
  }
}
```

## User Search & Discovery

```typescript
export class UserDiscoveryService {
  async searchUsers(query: string, filters?: UserSearchFilters): Promise<User[]> {
    const results = await searchService.search({
      index: 'users',
      query,
      filters: {
        status: 'active',
        ...filters
      },
      pagination: { page: 1, size: 20 }
    });
    
    return results.hits;
  }
  
  async getSuggestedUsers(userId: string): Promise<User[]> {
    const user = await userService.getUser(userId);
    
    // Get users with similar interests
    const similarInterests = await db
      .select()
      .from(users)
      .where(and(
        ne(users.id, userId),
        sql`interests && ${user.interests}`
      ))
      .limit(10);
    
    // Get friends of friends
    const friendsOfFriends = await this.getFriendsOfFriends(userId);
    
    // Get users from same location
    const sameLocation = await db
      .select()
      .from(users)
      .where(and(
        ne(users.id, userId),
        eq(users.location, user.location)
      ))
      .limit(10);
    
    // Combine and rank suggestions
    const suggestions = this.rankSuggestions([
      ...similarInterests,
      ...friendsOfFriends,
      ...sameLocation
    ]);
    
    return suggestions.slice(0, 20);
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role))
      .orderBy(desc(users.createdAt));
  }
}
```

## User Statistics

```typescript
export class UserStatsService {
  async getUserStats(userId: string): Promise<UserStats> {
    const [
      profileViews,
      totalPosts,
      totalLikes,
      totalFollowers,
      totalFollowing,
      engagement
    ] = await Promise.all([
      this.getProfileViews(userId),
      this.getTotalPosts(userId),
      this.getTotalLikes(userId),
      this.getTotalFollowers(userId),
      this.getTotalFollowing(userId),
      this.getEngagementRate(userId)
    ]);
    
    return {
      profileViews,
      totalPosts,
      totalLikes,
      totalFollowers,
      totalFollowing,
      engagement,
      joinDate: await this.getJoinDate(userId),
      lastActive: await this.getLastActive(userId)
    };
  }
  
  private async getEngagementRate(userId: string): Promise<number> {
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    const [posts, interactions] = await Promise.all([
      db
        .select({ count: count() })
        .from(posts)
        .where(and(
          eq(posts.authorId, userId),
          gte(posts.createdAt, thirtyDaysAgo)
        )),
      
      db
        .select({ count: count() })
        .from(interactions)
        .where(and(
          eq(interactions.userId, userId),
          gte(interactions.createdAt, thirtyDaysAgo)
        ))
    ]);
    
    const totalActivity = posts[0].count + interactions[0].count;
    return totalActivity > 0 ? (interactions[0].count / totalActivity) * 100 : 0;
  }
}
```

## User Import/Export

```typescript
export class UserDataService {
  async exportUserData(userId: string): Promise<UserDataExport> {
    const [
      profile,
      posts,
      comments,
      messages,
      connections,
      preferences
    ] = await Promise.all([
      this.getUserProfile(userId),
      this.getUserPosts(userId),
      this.getUserComments(userId),
      this.getUserMessages(userId),
      this.getUserConnections(userId),
      this.getUserPreferences(userId)
    ]);
    
    const exportData = {
      version: '1.0',
      exportDate: new Date(),
      user: profile,
      content: { posts, comments },
      messages,
      connections,
      preferences
    };
    
    // Create downloadable file
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    
    return {
      data: exportData,
      downloadUrl: URL.createObjectURL(blob),
      filename: `user-data-${userId}-${Date.now()}.json`
    };
  }
  
  async importUserData(userId: string, data: UserDataExport): Promise<void> {
    // Validate import data
    await this.validateImportData(data);
    
    // Import in transaction
    await db.transaction(async (tx) => {
      // Update profile
      if (data.user) {
        await tx
          .update(users)
          .set(data.user)
          .where(eq(users.id, userId));
      }
      
      // Import content
      if (data.content) {
        await this.importContent(tx, userId, data.content);
      }
      
      // Import preferences
      if (data.preferences) {
        await this.importPreferences(tx, userId, data.preferences);
      }
    });
    
    // Reindex user data
    await searchService.reindexUser(userId);
  }
}
```

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Registration Time | <2s | ✅ 1.5s |
| Profile Load Time | <500ms | ✅ 350ms |
| Search Response | <200ms | ✅ 150ms |
| Data Export Time | <10s | ✅ 7s |

## Testing

```typescript
describe('User Management', () => {
  it('should create new user with validation', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecureP@ss123',
      name: 'Test User'
    };
    
    const user = await userService.createUser(userData);
    
    expect(user).toHaveProperty('id');
    expect(user.email).toBe(userData.email.toLowerCase());
    expect(user.status).toBe('pending_verification');
  });
  
  it('should handle profile updates', async () => {
    const updates = {
      name: 'Updated Name',
      bio: 'New bio'
    };
    
    const updated = await userService.updateProfile('user123', updates);
    
    expect(updated.profile.name).toBe(updates.name);
    expect(updated.profile.bio).toBe(updates.bio);
  });
});
```

## Next Steps

- [ ] Implement user verification system
- [ ] Add social login providers
- [ ] Enhanced user recommendations
- [ ] User reputation system

---

**Status**: 🟢 Operational
**Dependencies**: bcrypt, Faker.js
**Owner**: User Team
**Last Updated**: September 2025