# VideoMemoryCard Component Documentation
*(ESA LIFE CEO 61×21 Platform)*

## 1. Overview
- **Route**: Video-specific card component (not a route)
- **Purpose**: Specialized card for displaying video posts with optimized playback, thumbnail generation, and streaming capabilities
- **ESA Framework Layer**: 
  - Layer 13 (Media Management - Video)
  - Layer 28 (Performance - Streaming)

## 2. Technical Implementation

### Components
```typescript
import { Play, Pause, Volume2, Maximize } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import RoleEmojiDisplay from '@/components/ui/RoleEmojiDisplay';
```

### APIs
- Video streaming endpoints
- Thumbnail generation service
- HLS/DASH support for adaptive bitrate

### Real-time Features
- View count updates
- Live streaming support (planned)
- Progress sync across devices

## 3. Database Schema

### Tables
- **posts**: Main post data with video flag
- **media**: Video metadata (duration, resolution, format)
- **video_progress**: User watch progress

### Relationships
```sql
posts.id → media.postId
video_progress.userId → users.id
video_progress.postId → posts.id
```

## 4. User Permissions
- **Access Control**: Video visibility based on post privacy
- **Roles**: 
  - Premium users: HD quality
  - Regular users: SD quality
  - Guests: Preview only

## 5. MT Ocean Theme
- **Design Implementation**:
  - Glassmorphic video controls
  - Gradient overlay for text readability
  - Rounded corners with overflow hidden
- **Animations**:
  - Smooth play/pause transitions
  - Progress bar animations
  - Hover effects on controls

## 6. Test Coverage
- **Current Status**: Basic playback tests
- **Requirements**:
  - Test video URL validation
  - Test playback controls
  - Test fullscreen mode
  - Test mobile responsiveness
  - Test memory cleanup

## 7. Known Issues

### Critical Fix Applied
```typescript
// TypeError fix for video URLs
const getVideoUrl = (media: any) => {
  if (!media || typeof media.url !== 'string') {
    console.error('Invalid video URL:', media);
    return null;
  }
  
  const url = media.url.toLowerCase();
  
  // YouTube embed handling
  if (url.includes('youtube') || url.includes('youtu.be')) {
    const videoId = extractYouTubeId(url);
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Direct video URL
  return media.url;
};
```

### Current Issues
- **Autoplay policy**: Browser restrictions need handling
- **Memory leaks**: Video elements not properly cleaned up
- **Mobile data**: No data saver mode
- **Captions**: No subtitle support

## 8. Agent Responsibilities
- **Media Agent (Layer 13)**: Manages video processing
- **Performance Agent (Layer 28)**: Optimizes streaming
- **Analytics Agent (Layer 30)**: Tracks watch time
- **CDN Agent**: Manages video delivery

## 9. Integration Points
- **External Services**:
  - YouTube/Vimeo embed APIs
  - Cloudinary video processing
  - HLS.js for streaming
  - Video.js player (optional)
- **Internal Systems**:
  - Progress tracking service
  - Analytics pipeline
  - CDN integration

## 10. Performance Metrics
- **Load Times**:
  - Thumbnail load: <200ms
  - Video start: <2s (adaptive)
  - Seek time: <500ms
- **Optimization**:
  - Lazy loading with intersection observer
  - Thumbnail preloading
  - Adaptive bitrate streaming
  - Memory cleanup on unmount
  - Video preload="metadata"
  - Canvas thumbnail generation

## Code Example - Complete Video Component
```tsx
const VideoMemoryCard = ({ post, media }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, []);
  
  // Safe URL processing
  const videoUrl = useMemo(() => {
    if (typeof media?.url !== 'string') return null;
    return media.url;
  }, [media]);
  
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.error('Playback failed:', err);
        // Handle autoplay restrictions
      });
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(progress);
  };
  
  if (!videoUrl) {
    return <div>Video unavailable</div>;
  }
  
  return (
    <div className="relative rounded-lg overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        preload="metadata"
        playsInline
      />
      
      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePlayPause}
            className="text-white hover:text-cyan-400 transition-colors"
          >
            {isPlaying ? <Pause /> : <Play />}
          </button>
          
          <div className="flex-1 bg-white/30 rounded-full h-1">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <span className="text-white text-sm">
            {formatDuration(duration)}
          </span>
        </div>
      </div>
      
      {/* Post Info Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2 text-white">
          <img src={post.user?.avatar} className="w-8 h-8 rounded-full" />
          <span>{post.user?.name}</span>
          <RoleEmojiDisplay role={post.user?.role} />
        </div>
      </div>
    </div>
  );
};
```

## Implementation Notes
1. **Memory Management**: Proper cleanup of video elements
2. **URL Validation**: Type guards for all URL processing
3. **Progress Tracking**: Save watch progress to database
4. **Adaptive Streaming**: HLS.js integration for quality selection
5. **Mobile Optimization**: Different quality for mobile networks
6. **Accessibility**: Keyboard controls and screen reader support