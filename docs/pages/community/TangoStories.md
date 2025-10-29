# Tango Stories Documentation

## 1. Overview
- **Route**: `/tango-stories`
- **Purpose**: Story-sharing platform for tango experiences, memories, and cultural narratives
- **ESA Framework Layer**: Layer 3 - Content Platform

## 2. Technical Implementation

### Components
- `client/src/pages/TangoStories.tsx` - Stories main page
- `StoryFeed` - Story listing feed
- `StoryCard` - Individual story display
- `StoryEditor` - Rich text editor
- `StoryViewer` - Full story view
- `MediaGallery` - Photos/videos in stories
- `StoryReactions` - Likes and comments
- `AuthorProfile` - Writer information

### API Endpoints
- `GET /api/stories` - List stories
- `POST /api/stories` - Create story
- `GET /api/stories/:id` - Story details
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story
- `POST /api/stories/:id/react` - Add reaction
- `POST /api/stories/:id/comment` - Add comment
- `GET /api/stories/trending` - Trending stories

### Real-time Features
- Live story updates
- Real-time reactions
- Instant comments
- View count tracking
- Live notifications

### Database Tables
- `tango_stories` - Story content
- `story_media` - Associated media
- `story_reactions` - User reactions
- `story_comments` - Comments
- `story_views` - View tracking
- `story_tags` - Categorization

## 3. User Permissions
- **Guest**: Read public stories
- **User**: Create and share stories
- **Author**: Edit own stories
- **Moderator**: Content management
- **Admin**: Platform oversight

## 4. MT Ocean Theme Implementation
```css
/* Stories hero section */
.stories-hero {
  background: linear-gradient(180deg, #5EEAD4 0%, #14B8A6 25%, #0D9488 50%, #0F766E 75%, #155E75 100%);
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Story card design */
.story-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(94, 234, 212, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(94, 234, 212, 0.2);
}

.story-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(94, 234, 212, 0.2);
  border-color: #5EEAD4;
}

/* Author badge */
.author-badge {
  background: linear-gradient(45deg, #5EEAD4, #14B8A6);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* Story viewer gradient */
.story-viewer {
  background: linear-gradient(to bottom, white, rgba(94, 234, 212, 0.02));
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

/* Reaction buttons */
.reaction-button {
  background: rgba(94, 234, 212, 0.1);
  border: 2px solid transparent;
  border-radius: 25px;
  padding: 8px 20px;
  transition: all 0.2s;
}

.reaction-button:hover {
  border-color: #5EEAD4;
  background: rgba(94, 234, 212, 0.2);
}

.reaction-button.active {
  background: linear-gradient(45deg, #5EEAD4, #14B8A6);
  color: white;
  border-color: transparent;
}

/* Rich text editor */
.story-editor {
  border: 2px solid #5EEAD4;
  border-radius: 12px;
  padding: 20px;
  background: rgba(94, 234, 212, 0.02);
}
```

## 5. Test Coverage
- **Unit Tests**: 83% coverage
- **Integration Tests**: Story CRUD
- **E2E Tests**: Full story flow
- **Editor Tests**: Rich text features
- **Media Tests**: Upload handling

## 6. Known Issues
- Rich text editor mobile formatting
- Large image upload timeout
- Comment thread performance
- Story draft recovery

## 7. Agent Responsibilities
- **Content Agent**: Story management
- **Media Agent**: File handling
- **Moderation Agent**: Content review
- **Analytics Agent**: Engagement tracking
- **Notification Agent**: Story alerts

## 8. Integration Points
- **Rich Text Editor**: Content creation
- **Media Service**: Photo/video storage
- **Comment Service**: Discussion threads
- **Analytics Service**: View tracking
- **Share Service**: Social sharing
- **Translation Service**: Multi-language

## 9. Performance Metrics
- **Page Load**: < 2 seconds
- **Story Load**: < 1 second
- **Image Upload**: < 5 seconds
- **Comment Post**: < 300ms
- **Editor Save**: Auto-save 30s
- **Memory Usage**: < 120MB

## 10. Accessibility
- **Screen Reader**: Story narration
- **Keyboard Navigation**: Full support
- **Alt Text**: Media descriptions
- **Font Scaling**: Adjustable size
- **High Contrast**: Reading mode
- **Mobile Responsive**: Touch-optimized