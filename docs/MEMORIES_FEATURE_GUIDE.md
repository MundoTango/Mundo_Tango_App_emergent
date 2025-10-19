# Memories Feature Guide
**Owner:** Layer #24 (Social Features)  
**Created:** October 19, 2025  
**Purpose:** Complete guide to Mundo Tango memories/posts system

---

## 🎯 Overview

Memories (also called "posts" or "feeds") are the heart of Mundo Tango's social experience. Users share tango moments, stories, photos, and videos. Features include:

- Rich text content with media
- Hashtag indexing and discovery
- Location tagging
- Privacy controls
- AI content enhancement
- Reactions and comments
- Feed algorithms

---

## 📊 Database Schema

```typescript
// shared/schema.ts
export const memories = pgTable('memories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  
  // Content
  content: text('content').notNull(),
  caption: text('caption'),
  
  // Media
  mediaUrl: varchar('media_url', { length: 500 }),
  mediaType: varchar('media_type', { length: 50 }), // photo, video, audio
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  
  // Location
  location: varchar('location', { length: 255 }),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  
  // Categorization
  hashtags: text('hashtags').array(),
  mentions: text('mentions').array(), // @username mentions
  
  // Privacy
  visibility: varchar('visibility', { length: 50 }).default('public'), // public, friends, private, group
  groupId: integer('group_id').references(() => groups.id),
  
  // AI Enhancement
  aiEnhanced: boolean('ai_enhanced').default(false),
  aiSuggestions: text('ai_suggestions'), // JSON: { hashtags, location, etc }
  
  // Engagement
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  sharesCount: integer('shares_count').default(0),
  
  // Status
  isPinned: boolean('is_pinned').default(false),
  isArchived: boolean('is_archived').default(false),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const memoryLikes = pgTable('memory_likes', {
  id: serial('id').primaryKey(),
  memoryId: integer('memory_id').references(() => memories.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  reactionType: varchar('reaction_type', { length: 50 }).default('like'), // like, love, applaud
  createdAt: timestamp('created_at').defaultNow()
});

export const memoryComments = pgTable('memory_comments', {
  id: serial('id').primaryKey(),
  memoryId: integer('memory_id').references(() => memories.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  parentCommentId: integer('parent_comment_id').references(() => memoryComments.id),
  createdAt: timestamp('created_at').defaultNow()
});
```

---

## 🔌 API Endpoints

### Create Memory
```typescript
POST /api/memories
Content-Type: application/json

{
  "content": "Amazing milonga tonight! #tango #BuenosAires",
  "location": "Salon Canning",
  "city": "Buenos Aires",
  "country": "Argentina",
  "visibility": "public",
  "mediaUrl": "https://cloudinary.com/...",
  "mediaType": "photo"
}

Response: 201 Created
{
  "id": 123,
  "content": "Amazing milonga tonight! #tango #BuenosAires",
  "hashtags": ["tango", "BuenosAires"],
  "likesCount": 0,
  "commentsCount": 0
}
```

### Get Feed
```typescript
GET /api/memories/feed?page=1&limit=20

Response: 200 OK
{
  "memories": [
    {
      "id": 123,
      "user": {
        "id": 1,
        "name": "Elena Rodriguez",
        "profileImage": "..."
      },
      "content": "Amazing milonga tonight!",
      "hashtags": ["tango", "BuenosAires"],
      "likesCount": 42,
      "commentsCount": 5,
      "hasLiked": false,
      "createdAt": "2025-10-19T20:00:00Z"
    }
  ],
  "hasMore": true
}
```

### Like Memory
```typescript
POST /api/memories/:id/like
Content-Type: application/json

{
  "reactionType": "love"  // like, love, applaud
}

Response: 200 OK
{
  "likesCount": 43
}
```

### Comment on Memory
```typescript
POST /api/memories/:id/comments
Content-Type: application/json

{
  "content": "Beautiful photo! Where was this taken?",
  "parentCommentId": null  // or ID for replies
}

Response: 201 Created
```

### Delete Memory
```typescript
DELETE /api/memories/:id

Response: 204 No Content
```

---

## 🎨 Frontend Components

### Memory Card

```typescript
// client/src/components/memories/MemoryCard.tsx
export function MemoryCard({ memory }) {
  const { user } = useUser();
  const isAuthor = user?.id === memory.userId;
  
  const likeMutation = useMutation({
    mutationFn: () => apiRequest(`/api/memories/${memory.id}/like`, {
      method: 'POST',
      body: JSON.stringify({ reactionType: 'like' })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/memories'] });
    }
  });
  
  return (
    <Card data-testid={`card-memory-${memory.id}`}>
      <div className="memory-header">
        <Avatar>
          <AvatarImage src={memory.user.profileImage} />
        </Avatar>
        <div>
          <Link to={`/profile/${memory.user.id}`}>
            {memory.user.name}
          </Link>
          <span>{formatTimeAgo(memory.createdAt)}</span>
        </div>
      </div>
      
      {memory.mediaUrl && (
        <img 
          src={memory.mediaUrl} 
          alt="Memory"
          className="memory-media"
        />
      )}
      
      <div className="memory-content">
        <p>{memory.content}</p>
        {memory.hashtags?.map(tag => (
          <Link key={tag} to={`/hashtags/${tag}`}>
            #{tag}
          </Link>
        ))}
      </div>
      
      {memory.location && (
        <div className="memory-location">
          <MapPin size={14} />
          <span>{memory.location}</span>
        </div>
      )}
      
      <div className="memory-actions">
        <Button 
          variant="ghost" 
          onClick={() => likeMutation.mutate()}
          data-testid={`button-like-${memory.id}`}
        >
          <Heart fill={memory.hasLiked ? 'red' : 'none'} />
          {memory.likesCount}
        </Button>
        
        <Button variant="ghost">
          <MessageCircle />
          {memory.commentsCount}
        </Button>
        
        <Button variant="ghost">
          <Share2 />
        </Button>
      </div>
    </Card>
  );
}
```

### Create Memory Form

```typescript
// client/src/components/memories/CreateMemory.tsx
export function CreateMemory() {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  
  const createMemory = useMutation({
    mutationFn: async (data) => {
      // Upload media first if exists
      let mediaUrl = null;
      if (mediaFile) {
        const formData = new FormData();
        formData.append('file', mediaFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const { url } = await uploadRes.json();
        mediaUrl = url;
      }
      
      // Create memory
      return apiRequest('/api/memories', {
        method: 'POST',
        body: JSON.stringify({ ...data, mediaUrl })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/memories'] });
      setContent('');
      setMediaFile(null);
      toast({ title: 'Memory shared!' });
    }
  });
  
  return (
    <Card data-testid="form-create-memory">
      <Textarea
        placeholder="Share your tango moment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        data-testid="input-memory-content"
      />
      
      <div className="actions">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setMediaFile(e.target.files[0])}
          style={{ display: 'none' }}
          id="media-upload"
        />
        <label htmlFor="media-upload">
          <Button variant="ghost" as="span">
            <Camera />
            Add Photo/Video
          </Button>
        </label>
        
        <Button 
          onClick={() => createMemory.mutate({ content })}
          disabled={!content.trim()}
          data-testid="button-share-memory"
        >
          Share
        </Button>
      </div>
    </Card>
  );
}
```

---

## 🔍 Hashtag System

### Automatic Hashtag Extraction

```typescript
// server/services/memoryService.ts
function extractHashtags(content: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
}

// Auto-populate hashtags field
const hashtags = extractHashtags(content);
await db.insert(memories).values({
  ...data,
  hashtags
});
```

### Hashtag Discovery

```typescript
GET /api/hashtags/:tag/memories?page=1&limit=20

Response: {
  "tag": "tango",
  "count": 5420,
  "memories": [...]
}
```

### Trending Hashtags

```typescript
GET /api/hashtags/trending

Response: [
  { "tag": "tango", "count": 5420 },
  { "tag": "milonga", "count": 3200 },
  { "tag": "BuenosAires", "count": 2100 }
]
```

---

## 🤖 AI Content Enhancement

### AI-Powered Suggestions

```typescript
// When user creates memory, AI suggests:
POST /api/memories/ai-enhance
Content-Type: application/json

{
  "content": "Had an amazing time dancing tonight",
  "location": "Salon Canning",
  "mediaUrl": "https://..."
}

Response: {
  "suggestedHashtags": ["tango", "milonga", "BuenosAires"],
  "suggestedCaption": "Magical evening at Salon Canning! 💃",
  "detectedLocation": "Buenos Aires, Argentina",
  "contentWarnings": null
}
```

### Auto-Apply Enhancements

Users can choose to accept AI suggestions:
- Hashtags
- Location completion
- Caption improvements
- Content categorization

---

## 📍 Location Tagging

### Location Discovery

```typescript
GET /api/memories/nearby?lat=34.0522&lng=-118.2437&radius=50

Response: {
  "memories": [...], // Memories within 50km
  "locations": [
    { "name": "Salon Canning", "count": 42 }
  ]
}
```

### Location-Based Feed

```typescript
// Memories from specific city
GET /api/memories?city=Buenos Aires

// Memories from specific location/venue
GET /api/memories?location=Salon Canning
```

---

## 🔒 Privacy Controls

### Visibility Options

- **Public:** Visible to everyone
- **Friends:** Only visible to connections
- **Private:** Only visible to user
- **Group:** Only visible to group members

### Privacy Settings

```typescript
{
  "defaultVisibility": "public",
  "allowComments": true,
  "allowSharing": true,
  "hideLikesCount": false
}
```

---

## 📊 Feed Algorithms

### Chronological Feed

Simple time-based ordering (newest first)

### Algorithmic Feed

Weighted by:
- Recency (newest = higher)
- Engagement (likes/comments)
- User connections (friends/followers)
- User interests (hashtags, locations)
- Content quality (AI score)

```typescript
GET /api/memories/feed?algorithm=recommended
```

---

## 💬 Comments System

### Nested Comments

```typescript
// Top-level comment
{
  "id": 1,
  "content": "Great photo!",
  "parentCommentId": null,
  "replies": [
    {
      "id": 2,
      "content": "Thanks!",
      "parentCommentId": 1
    }
  ]
}
```

### Comment Reactions

Users can react to comments (like, love, etc.)

---

## 🚀 Future Enhancements

- [ ] Video posts with playback
- [ ] Audio posts (tango music sharing)
- [ ] Multi-photo albums
- [ ] Story-style ephemeral posts (24h)
- [ ] Memory collections/albums
- [ ] Collaborative memories (tag multiple users)
- [ ] Memory insights (reach, engagement)
- [ ] Save/bookmark memories
- [ ] Share to external platforms

---

## 📚 Related Documentation

- Layer #24 (Social Features) - Agent documentation
- `API_REFERENCE.md` - Complete API specs
- `AI_INTEGRATION_GUIDE.md` - AI enhancement details

---

**Last Updated:** October 19, 2025  
**Maintained By:** Layer #24 (Social Features)
