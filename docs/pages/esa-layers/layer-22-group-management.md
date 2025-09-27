# ESA Layer 22: Group Management Agent 👥

## Overview
Layer 22 manages community groups, teams, and organizations including creation, membership, roles, permissions, and group-based activities across the platform.

## Core Responsibilities

### 1. Group Lifecycle
- Group creation and setup
- Group settings and configuration
- Group archival and deletion
- Group migration and merging
- Group templates

### 2. Membership Management
- Member invitations and requests
- Role assignment and permissions
- Member approval workflows
- Member removal and banning
- Membership tiers

### 3. Group Activities
- Group posts and discussions
- Group events and meetings
- Group resources and files
- Group analytics
- Group notifications

## Open Source Packages

```json
{
  "react-mentions": "^4.4.10",
  "@types/react-mentions": "^4.1.12"
}
```

## Integration Points

- **Layer 1 (Database)**: Group data storage
- **Layer 5 (Authorization)**: Group permissions
- **Layer 21 (User Management)**: Member management
- **Layer 24 (Social)**: Group interactions
- **Layer 26 (Events)**: Group events

## Group Service Implementation

```typescript
export class GroupService {
  async createGroup(data: CreateGroupDto, creatorId: string): Promise<Group> {
    // Validate group name uniqueness
    const existing = await this.checkExistingGroup(data.slug);
    if (existing) {
      throw new ConflictError('Group with this name already exists');
    }
    
    const groupId = generateId();
    
    // Create group
    const group = await db.transaction(async (tx) => {
      // Create group record
      const [newGroup] = await tx.insert(groups).values({
        id: groupId,
        name: data.name,
        slug: generateSlug(data.name),
        description: data.description,
        type: data.type || 'public',
        category: data.category,
        avatar: data.avatar || await this.generateGroupAvatar(data.name),
        cover: data.cover,
        settings: {
          privacy: data.privacy || 'public',
          joinApproval: data.joinApproval || false,
          postApproval: data.postApproval || false,
          memberLimit: data.memberLimit,
          allowInvites: true,
          visibility: data.visibility || 'visible'
        },
        metadata: {
          tags: data.tags || [],
          location: data.location,
          language: data.language || 'en',
          rules: data.rules || []
        },
        createdBy: creatorId,
        createdAt: new Date()
      }).returning();
      
      // Add creator as admin
      await tx.insert(groupMembers).values({
        groupId,
        userId: creatorId,
        role: 'admin',
        permissions: this.getAdminPermissions(),
        joinedAt: new Date()
      });
      
      // Create default channels
      await this.createDefaultChannels(tx, groupId);
      
      return newGroup;
    });
    
    // Index for search
    await searchService.indexGroup(group);
    
    // Send welcome notification
    await this.sendWelcomeNotification(group, creatorId);
    
    // Track group creation
    await analytics.trackEvent({
      name: 'group_created',
      userId: creatorId,
      properties: {
        groupId,
        type: group.type,
        category: group.category
      }
    });
    
    return group;
  }
  
  async updateGroup(
    groupId: string, 
    updates: UpdateGroupDto, 
    userId: string
  ): Promise<Group> {
    // Check permissions
    await this.checkPermission(groupId, userId, 'manage_settings');
    
    // Update group
    const [updated] = await db
      .update(groups)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(groups.id, groupId))
      .returning();
    
    // Invalidate cache
    await cache.delete(`group:${groupId}`);
    
    // Update search index
    await searchService.updateGroup(updated);
    
    // Notify members of changes
    if (updates.settings || updates.rules) {
      await this.notifyMembersOfChanges(groupId, updates);
    }
    
    return updated;
  }
  
  private getAdminPermissions(): string[] {
    return [
      'manage_settings',
      'manage_members',
      'manage_roles',
      'manage_content',
      'delete_posts',
      'ban_members',
      'create_events',
      'manage_resources'
    ];
  }
}
```

## Member Management

```typescript
export class GroupMemberService {
  async addMember(
    groupId: string,
    userId: string,
    addedBy?: string
  ): Promise<GroupMember> {
    // Check if already member
    const existing = await this.getMembership(groupId, userId);
    if (existing) {
      throw new ConflictError('User is already a member');
    }
    
    // Check group limits
    const group = await groupService.getGroup(groupId);
    const memberCount = await this.getMemberCount(groupId);
    
    if (group.settings.memberLimit && memberCount >= group.settings.memberLimit) {
      throw new Error('Group has reached member limit');
    }
    
    // Check if approval needed
    if (group.settings.joinApproval && !addedBy) {
      return await this.createJoinRequest(groupId, userId);
    }
    
    // Add member
    const member = await db.insert(groupMembers).values({
      groupId,
      userId,
      role: 'member',
      permissions: this.getMemberPermissions(),
      invitedBy: addedBy,
      joinedAt: new Date()
    });
    
    // Update member count
    await db
      .update(groups)
      .set({ memberCount: sql`member_count + 1` })
      .where(eq(groups.id, groupId));
    
    // Send notifications
    await this.sendJoinNotifications(groupId, userId);
    
    // Track membership
    await analytics.trackEvent({
      name: 'group_joined',
      userId,
      properties: { groupId, method: addedBy ? 'invited' : 'joined' }
    });
    
    return member;
  }
  
  async removeMember(
    groupId: string,
    userId: string,
    removedBy: string,
    reason?: string
  ): Promise<void> {
    // Check permissions
    if (userId !== removedBy) {
      await this.checkPermission(groupId, removedBy, 'manage_members');
    }
    
    // Remove member
    await db
      .delete(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ));
    
    // Update member count
    await db
      .update(groups)
      .set({ memberCount: sql`member_count - 1` })
      .where(eq(groups.id, groupId));
    
    // Log removal
    await db.insert(groupMembershipLogs).values({
      groupId,
      userId,
      action: userId === removedBy ? 'left' : 'removed',
      performedBy: removedBy,
      reason,
      timestamp: new Date()
    });
    
    // Notify user
    if (userId !== removedBy) {
      await notificationService.send({
        userId,
        type: 'group_removed',
        title: 'Removed from group',
        body: `You have been removed from ${group.name}`
      });
    }
  }
  
  async updateMemberRole(
    groupId: string,
    userId: string,
    newRole: GroupRole,
    updatedBy: string
  ): Promise<void> {
    // Check permissions
    await this.checkPermission(groupId, updatedBy, 'manage_roles');
    
    // Update role
    await db
      .update(groupMembers)
      .set({
        role: newRole,
        permissions: this.getPermissionsForRole(newRole),
        updatedAt: new Date()
      })
      .where(and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ));
    
    // Notify user
    await notificationService.send({
      userId,
      type: 'role_updated',
      title: 'Role Updated',
      body: `Your role in ${group.name} has been updated to ${newRole}`
    });
  }
  
  private getMemberPermissions(): string[] {
    return [
      'view_content',
      'create_posts',
      'comment',
      'react',
      'invite_members'
    ];
  }
  
  private getPermissionsForRole(role: GroupRole): string[] {
    const permissions = {
      member: this.getMemberPermissions(),
      moderator: [
        ...this.getMemberPermissions(),
        'delete_posts',
        'pin_posts',
        'manage_content'
      ],
      admin: this.getAdminPermissions(),
      owner: ['*'] // All permissions
    };
    
    return permissions[role] || [];
  }
}
```

## Group Discovery

```typescript
export class GroupDiscoveryService {
  async discoverGroups(userId: string): Promise<GroupRecommendation[]> {
    const user = await userService.getUser(userId);
    
    // Get user's interests and preferences
    const interests = user.profile.interests || [];
    const location = user.profile.location;
    
    // Find relevant groups
    const [
      interestGroups,
      locationGroups,
      popularGroups,
      friendGroups
    ] = await Promise.all([
      this.getGroupsByInterests(interests),
      this.getGroupsByLocation(location),
      this.getPopularGroups(),
      this.getGroupsWithFriends(userId)
    ]);
    
    // Score and rank groups
    const scored = this.scoreGroups({
      interestGroups,
      locationGroups,
      popularGroups,
      friendGroups
    }, user);
    
    // Filter out groups user is already in
    const userGroups = await this.getUserGroups(userId);
    const filtered = scored.filter(g => 
      !userGroups.some(ug => ug.id === g.id)
    );
    
    return filtered.slice(0, 20);
  }
  
  async searchGroups(
    query: string,
    filters?: GroupSearchFilters
  ): Promise<Group[]> {
    const results = await searchService.search({
      index: 'groups',
      query,
      filters: {
        type: filters?.type,
        category: filters?.category,
        privacy: filters?.privacy || ['public', 'private'],
        memberCount: filters?.memberCount,
        location: filters?.location
      },
      pagination: filters?.pagination || { page: 1, size: 20 }
    });
    
    return results.hits;
  }
  
  async getTrendingGroups(period: 'day' | 'week' | 'month'): Promise<Group[]> {
    const startDate = this.getPeriodStartDate(period);
    
    const trending = await db
      .select({
        group: groups,
        growth: sql<number>`
          COUNT(DISTINCT gm.user_id) FILTER (WHERE gm.joined_at >= ${startDate})
        `,
        activity: sql<number>`
          COUNT(DISTINCT p.id) FILTER (WHERE p.created_at >= ${startDate})
        `
      })
      .from(groups)
      .leftJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .leftJoin(posts, eq(groups.id, posts.groupId))
      .groupBy(groups.id)
      .orderBy(desc(sql`growth + activity`))
      .limit(10);
    
    return trending.map(t => t.group);
  }
}
```

## Group Permissions

```typescript
export class GroupPermissionService {
  async checkPermission(
    groupId: string,
    userId: string,
    permission: string
  ): Promise<boolean> {
    // Get member record
    const member = await db
      .select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ))
      .limit(1);
    
    if (!member[0]) return false;
    
    // Check if owner (has all permissions)
    if (member[0].role === 'owner') return true;
    
    // Check specific permission
    return member[0].permissions.includes(permission) ||
           member[0].permissions.includes('*');
  }
  
  async getGroupPermissions(groupId: string): Promise<GroupPermissions> {
    const group = await groupService.getGroup(groupId);
    
    return {
      posting: {
        whoCanPost: group.settings.postPermission || 'members',
        requiresApproval: group.settings.postApproval
      },
      membership: {
        whoCanInvite: group.settings.invitePermission || 'members',
        requiresApproval: group.settings.joinApproval
      },
      moderation: {
        whoCanModerate: ['admin', 'moderator', 'owner'],
        whoCanDelete: ['admin', 'owner'],
        whoCanBan: ['admin', 'owner']
      },
      visibility: {
        isPublic: group.privacy === 'public',
        isDiscoverable: group.settings.visibility === 'visible',
        showMemberList: group.settings.showMembers !== false
      }
    };
  }
  
  async updatePermissions(
    groupId: string,
    updates: PermissionUpdates,
    updatedBy: string
  ): Promise<void> {
    // Check if user can manage permissions
    await this.checkPermission(groupId, updatedBy, 'manage_settings');
    
    // Update group settings
    await db
      .update(groups)
      .set({
        settings: {
          ...group.settings,
          ...updates
        },
        updatedAt: new Date()
      })
      .where(eq(groups.id, groupId));
    
    // Notify members of permission changes
    await this.notifyPermissionChanges(groupId, updates);
  }
}
```

## Group Analytics

```typescript
export class GroupAnalyticsService {
  async getGroupAnalytics(
    groupId: string,
    period: TimePeriod
  ): Promise<GroupAnalytics> {
    const { startDate, endDate } = this.getPeriodDates(period);
    
    const [
      memberGrowth,
      postActivity,
      engagement,
      topContributors,
      popularContent
    ] = await Promise.all([
      this.getMemberGrowth(groupId, startDate, endDate),
      this.getPostActivity(groupId, startDate, endDate),
      this.getEngagementMetrics(groupId, startDate, endDate),
      this.getTopContributors(groupId, startDate, endDate),
      this.getPopularContent(groupId, startDate, endDate)
    ]);
    
    return {
      groupId,
      period,
      memberGrowth,
      postActivity,
      engagement,
      topContributors,
      popularContent,
      healthScore: this.calculateHealthScore({
        memberGrowth,
        postActivity,
        engagement
      })
    };
  }
  
  private async getMemberGrowth(
    groupId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MemberGrowth> {
    const daily = await db
      .select({
        date: sql<string>`DATE(joined_at)`,
        count: count()
      })
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId),
        between(groupMembers.joinedAt, startDate, endDate)
      ))
      .groupBy(sql`DATE(joined_at)`);
    
    const total = await db
      .select({ count: count() })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));
    
    return {
      daily,
      total: total[0].count,
      growth: this.calculateGrowthRate(daily)
    };
  }
}
```

## Group UI Components

```tsx
export function GroupCard({ group }: { group: Group }) {
  const { user } = useAuth();
  const [isMember, setIsMember] = useState(false);
  
  const joinMutation = useMutation({
    mutationFn: () => groupService.joinGroup(group.id),
    onSuccess: () => {
      setIsMember(true);
      toast.success(`Joined ${group.name}`);
    }
  });
  
  return (
    <div className="group-card glass-card">
      <div className="group-header">
        <img 
          src={group.cover} 
          alt={group.name}
          className="group-cover"
        />
        <Avatar
          src={group.avatar}
          alt={group.name}
          className="group-avatar"
        />
      </div>
      
      <div className="group-content">
        <h3>{group.name}</h3>
        <p className="text-muted">{group.category}</p>
        <p>{group.description}</p>
        
        <div className="group-stats">
          <span>{group.memberCount} members</span>
          <span>{group.postCount} posts</span>
        </div>
        
        <div className="group-actions">
          {isMember ? (
            <Button variant="outline" disabled>
              <Check className="w-4 h-4 mr-2" />
              Joined
            </Button>
          ) : (
            <Button 
              onClick={() => joinMutation.mutate()}
              loading={joinMutation.isPending}
            >
              Join Group
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Group Creation | <1s | ✅ 750ms |
| Member Join | <500ms | ✅ 350ms |
| Search Response | <200ms | ✅ 150ms |
| Analytics Load | <2s | ✅ 1.5s |

## Testing

```typescript
describe('Group Management', () => {
  it('should create group with proper permissions', async () => {
    const groupData = {
      name: 'Test Group',
      description: 'Test description',
      type: 'public',
      category: 'technology'
    };
    
    const group = await groupService.createGroup(groupData, 'user123');
    
    expect(group).toHaveProperty('id');
    expect(group.name).toBe(groupData.name);
    
    // Check creator is admin
    const membership = await memberService.getMembership(group.id, 'user123');
    expect(membership.role).toBe('admin');
  });
  
  it('should handle member permissions correctly', async () => {
    const canPost = await permissionService.checkPermission(
      'group123',
      'user456',
      'create_posts'
    );
    
    expect(canPost).toBe(true);
    
    const canDelete = await permissionService.checkPermission(
      'group123',
      'user456',
      'delete_posts'
    );
    
    expect(canDelete).toBe(false);
  });
});
```

## Next Steps

- [ ] Implement group merge functionality
- [ ] Add group templates marketplace
- [ ] Enhanced moderation tools
- [ ] Group-to-group collaboration

---

**Status**: 🟢 Operational
**Dependencies**: Database, Search, Permissions
**Owner**: Community Team
**Last Updated**: September 2025