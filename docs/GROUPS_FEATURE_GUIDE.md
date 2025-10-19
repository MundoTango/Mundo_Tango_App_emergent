# Groups Feature Guide
**Owner:** Layer #22 (Group Management)  
**Created:** October 19, 2025  
**Purpose:** Complete guide to Mundo Tango groups/communities system

---

## 🎯 Overview

The Groups system enables tango communities worldwide to organize, connect, and grow. Features include:

- City-based auto-group creation
- Manual group creation
- Membership management
- Group posts and discussions
- Event organization
- Group moderation

---

## 📊 Database Schema

```typescript
// shared/schema.ts
export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  
  // Location
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  isLocationBased: boolean('is_location_based').default(true),
  
  // Visibility
  isPublic: boolean('is_public').default(true),
  requiresApproval: boolean('requires_approval').default(false),
  
  // Media
  coverImage: varchar('cover_image', { length: 500 }),
  groupImage: varchar('group_image', { length: 500 }),
  
  // Auto-creation
  isAutoCreated: boolean('is_auto_created').default(false),
  autoCreatedFrom: varchar('auto_created_from', { length: 50 }), // 'city'
  
  // Metadata
  memberCount: integer('member_count').default(0),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const groupMembers = pgTable('group_members', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => groups.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: varchar('role', { length: 50 }).default('member'), // member, moderator, admin
  joinedAt: timestamp('joined_at').defaultNow()
});
```

---

## 🏙️ City-Based Auto-Groups

### Auto-Creation Logic

```typescript
// server/services/groupService.ts
export async function assignUserToLocationGroups(userId: number, city: string, country: string) {
  // Find or create city-based group
  let group = await db.select()
    .from(groups)
    .where(
      and(
        eq(groups.city, city),
        eq(groups.country, country),
        eq(groups.isAutoCreated, true)
      )
    )
    .limit(1);
  
  if (!group.length) {
    // Create auto-group for this city
    group = await db.insert(groups).values({
      name: `${city}, ${country} Tango Community`,
      slug: slugify(`${city}-${country}`),
      description: `Tango community for ${city}, ${country}`,
      city,
      country,
      isLocationBased: true,
      isPublic: true,
      isAutoCreated: true,
      autoCreatedFrom: 'city'
    }).returning();
  }
  
  // Add user to group
  await db.insert(groupMembers).values({
    groupId: group[0].id,
    userId,
    role: 'member'
  });
  
  return group[0];
}
```

### Triggered On

- User registration (based on city from profile)
- User updates location in profile
- User attends event in new city

---

## 🔌 API Endpoints

### Create Group
```typescript
POST /api/groups
Content-Type: application/json

{
  "name": "Buenos Aires Tango Lovers",
  "description": "Community for tango enthusiasts in BA",
  "city": "Buenos Aires",
  "country": "Argentina",
  "isPublic": true
}

Response: 201 Created
```

### Get Group
```typescript
GET /api/groups/:id

Response: 200 OK
{
  "id": 123,
  "name": "Buenos Aires Tango Lovers",
  "memberCount": 450,
  "members": [...],
  "recentPosts": [...]
}
```

### Join Group
```typescript
POST /api/groups/:id/join

Response: 200 OK
{
  "message": "Joined group successfully",
  "role": "member"
}
```

### Leave Group
```typescript
POST /api/groups/:id/leave

Response: 200 OK
```

### Get Group Members
```typescript
GET /api/groups/:id/members?page=1&limit=20

Response: 200 OK
{
  "members": [...],
  "total": 450
}
```

---

## 🎨 Frontend Components

### Group Card

```typescript
// client/src/components/groups/GroupCard.tsx
export function GroupCard({ group }) {
  return (
    <Card data-testid={`card-group-${group.id}`}>
      <img src={group.coverImage} alt={group.name} />
      <h3>{group.name}</h3>
      <p>{group.description}</p>
      <div>
        <Users size={16} />
        <span>{group.memberCount} members</span>
      </div>
      {group.isLocationBased && (
        <div>
          <MapPin size={16} />
          <span>{group.city}, {group.country}</span>
        </div>
      )}
      <Button data-testid={`button-join-${group.id}`}>
        Join Group
      </Button>
    </Card>
  );
}
```

### Group List Page

```typescript
// client/src/pages/Groups.tsx
export default function Groups() {
  const { data: groups, isLoading } = useQuery({
    queryKey: ['/api/groups'],
  });
  
  const userCity = useUser()?.city;
  
  // Separate user's location groups from others
  const locationGroups = groups?.filter(g => 
    g.city === userCity && g.isAutoCreated
  );
  
  const otherGroups = groups?.filter(g => 
    g.city !== userCity || !g.isAutoCreated
  );
  
  return (
    <div>
      {locationGroups?.length > 0 && (
        <section>
          <h2>Your City Groups</h2>
          {locationGroups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
        </section>
      )}
      
      <section>
        <h2>Discover Groups</h2>
        {otherGroups?.map(group => (
          <GroupCard key={group.id} group={group} />
        ))}
      </section>
    </div>
  );
}
```

---

## 👥 Membership Management

### Member Roles

- **Member:** Basic member, can post and comment
- **Moderator:** Can moderate posts, manage members
- **Admin:** Full control, can edit group settings

### Role Permissions

```typescript
const permissions = {
  member: ['post', 'comment', 'react'],
  moderator: ['post', 'comment', 'react', 'moderate_posts', 'remove_members'],
  admin: ['*'] // All permissions
};
```

### Promoting Members

```typescript
PATCH /api/groups/:groupId/members/:userId
Content-Type: application/json

{
  "role": "moderator"
}

// Requires: Current user must be admin
```

---

## 📝 Group Posts

### Group Feed Integration

```typescript
// Posts can be scoped to groups
POST /api/groups/:groupId/posts
Content-Type: application/json

{
  "content": "Check out this new milonga!",
  "visibility": "group" // Only group members see this
}
```

### Group-Only Posts

- Only visible to group members
- Appear in group feed
- Can be event announcements, discussions, etc.

---

## 🔒 Privacy & Moderation

### Public vs Private Groups

**Public Groups:**
- Visible to all users
- Anyone can join
- Posts visible to all members

**Private Groups:**
- Invite-only or require approval
- Not searchable
- Posts only visible to members

### Content Moderation

```typescript
// Moderators can remove posts
DELETE /api/groups/:groupId/posts/:postId

// Moderators can remove members
DELETE /api/groups/:groupId/members/:userId

// Report inappropriate content
POST /api/groups/:groupId/report
{
  "contentType": "post",
  "contentId": 123,
  "reason": "spam"
}
```

---

## 🔍 Group Discovery

### Search Groups

```typescript
GET /api/groups/search
  ?q=tango
  &city=Buenos Aires
  &country=Argentina
  &sort=memberCount
  &order=desc
```

### Suggested Groups

```typescript
// Based on user location and interests
GET /api/groups/suggested

Response: [
  // User's city groups (auto-created)
  // Groups with similar interests
  // Popular groups in user's country
]
```

---

## 📊 Group Analytics

### Metrics Tracked

- Member growth over time
- Post activity rate
- Event organization count
- Member engagement

```typescript
GET /api/groups/:id/analytics

Response: {
  "memberGrowth": [
    { "date": "2025-10-01", "count": 100 },
    { "date": "2025-10-15", "count": 120 }
  ],
  "postActivity": {
    "daily": 15,
    "weekly": 89,
    "monthly": 350
  },
  "eventsOrganized": 42
}
```

---

## 🚀 Future Enhancements

- [ ] Group chat/messaging
- [ ] Group events calendar
- [ ] Member directory with search
- [ ] Group announcements (pinned posts)
- [ ] Sub-groups for large communities
- [ ] Group badges and achievements
- [ ] Integration with external platforms

---

## 📚 Related Documentation

- Layer #22 (Group Management) - Agent documentation
- `EVENTS_FEATURE_GUIDE.md` - Group events integration
- `PROFILES_FEATURE_GUIDE.md` - Member profiles

---

**Last Updated:** October 19, 2025  
**Maintained By:** Layer #22 (Group Management)
