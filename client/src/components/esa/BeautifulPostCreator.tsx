// ESA LIFE CEO 61×21 AGENTS FRAMEWORK
// Layer 9: UI Framework Agent - BeautifulPostCreator Component
// Multi-media post creation with AI assistance and theme support

import { useState, useRef, useCallback } from 'react';
import { 
  Sparkles, MapPin, Tag, Users, Globe, Lock, UserCheck,
  Camera, Video, Send, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/hooks/use-toast';
import MentionTextarea from './MentionTextarea';
import TypingIndicator from './TypingIndicator';
import { useSocket } from '@/contexts/socket-context';
import { useAuth } from '@/hooks/useAuth';
import { debounce } from 'lodash';

interface BeautifulPostCreatorProps {
  onCreatePost: (formData: FormData) => void;
  placeholder?: string;
  isSubmitting?: boolean;
}

export default function BeautifulPostCreator({ 
  onCreatePost, 
  placeholder = "✨ Share your tango moment, connect with dancers, and create lasting memories together",
  isSubmitting = false
}: BeautifulPostCreatorProps) {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [content, setContent] = useState('');  
  const [isTyping, setIsTyping] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [location, setLocation] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  
  const tags = [
    { id: 'milonga', label: '🎭 Milonga', color: 'from-purple-500 to-pink-500' },
    { id: 'practica', label: '💃 Práctica', color: 'from-blue-500 to-cyan-500' },
    { id: 'performance', label: '🌟 Performance', color: 'from-yellow-500 to-orange-500' },
    { id: 'workshop', label: '📚 Workshop', color: 'from-green-500 to-emerald-500' },
    { id: 'festival', label: '🎉 Festival', color: 'from-red-500 to-pink-500' },
    { id: 'travel', label: '✈️ Travel', color: 'from-indigo-500 to-purple-500' },
    { id: 'music', label: '🎵 Music', color: 'from-teal-500 to-cyan-500' },
    { id: 'fashion', label: '👗 Fashion', color: 'from-pink-500 to-rose-500' }
  ];

  const visibilityOptions = [
    { value: 'public', icon: Globe, label: 'Public', color: 'text-emerald-500' },
    { value: 'friends', icon: Users, label: 'Friends', color: 'text-cyan-500' },
    { value: 'private', icon: Lock, label: 'Private', color: 'text-gray-500' }
  ];

  const handleSubmit = () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please add content or media to share",
        variant: "destructive"
      });
      return;
    }
    
    // Create FormData for multipart submission
    const formData = new FormData();
    formData.append('content', content);
    formData.append('visibility', visibility);
    formData.append('location', location);
    
    // Add tags as JSON string
    if (selectedTags.length > 0) {
      formData.append('tags', JSON.stringify(selectedTags));
    }
    
    // Add media files with correct field name for backend
    mediaFiles.forEach((file, index) => {
      formData.append('images', file);
    });
    
    onCreatePost(formData);
    
    // Reset form
    setContent('');
    setSelectedTags([]);
    setLocation('');
    setMediaFiles([]);
    setMediaPreviewUrls([]);
    setIsExpanded(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    
    // Limit to 3 files
    if (mediaFiles.length + files.length > 3) {
      toast({
        title: "Too many files",
        description: "You can only upload up to 3 media files",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file sizes (10MB limit)
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: "Files too large",
        description: "Files must be less than 10MB",
        variant: "destructive"
      });
      return;
    }
    
    // Add files and create preview URLs
    const newMediaFiles = [...mediaFiles, ...files];
    setMediaFiles(newMediaFiles);
    
    // Create preview URLs for images
    const newPreviewUrls = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });
    setMediaPreviewUrls([...mediaPreviewUrls, ...newPreviewUrls]);
  };

  const removeMedia = (index: number) => {
    const newMediaFiles = mediaFiles.filter((_, i) => i !== index);
    const newPreviewUrls = mediaPreviewUrls.filter((_, i) => i !== index);
    setMediaFiles(newMediaFiles);
    setMediaPreviewUrls(newPreviewUrls);
    
    // Revoke object URL to prevent memory leaks
    if (mediaPreviewUrls[index]) {
      URL.revokeObjectURL(mediaPreviewUrls[index]);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  // Emit typing events
  const emitTyping = useCallback(
    debounce(() => {
      if (socket && user) {
        socket.emit('user:typing', {
          userId: user.id || user.username || 'anonymous',
          username: user.name || user.username || 'Anonymous User',
          avatar: user.profilePicture || user.avatar
        });
        setTimeout(() => {
          socket.emit('user:stopped-typing', { 
            userId: user.id || user.username || 'anonymous'
          });
        }, 3000);
      }
    }, 500),
    [socket, user]
  );

  const handleContentChange = (value: string) => {
    setContent(value);
    if (!isTyping) {
      setIsTyping(true);
    }
    emitTyping();
  };

  return (
    <div className={cn(
      "backdrop-blur-xl rounded-xl border p-6 shadow-2xl",
      theme === 'light'
        ? "bg-white/90 border-gray-200"
        : "bg-slate-900/50 border-slate-800/50"
    )}>
      {/* Header with Pierre Dubois mini profile */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5EEAD4] to-[#155E75] flex items-center justify-center text-white font-bold">
          P
        </div>
        <div className="flex-1">
          <div className={cn(
            "text-sm font-semibold",
            theme === 'light' ? "text-gray-900" : "text-white"
          )}>Pierre Dubois</div>
          <div className={cn(
            "text-xs",
            theme === 'light' ? "text-gray-500" : "text-slate-400"
          )}>Share a recommendation</div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
      </div>

      {/* Typing Indicator */}
      <TypingIndicator className="mb-2" />
      
      {/* Main Input Area */}
      <div className="space-y-4">
        <MentionTextarea
          value={content}
          onChange={handleContentChange}
          onFocus={() => setIsExpanded(true)}
          placeholder={placeholder}
          className={cn(
            "rounded-lg focus-within:ring-2 transition-all",
            theme === 'light'
              ? "focus-within:ring-purple-500/20"
              : "focus-within:ring-cyan-400/50"
          )}
        />

        {/* Location Input */}
        {isExpanded && (
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            theme === 'light' ? "bg-gray-100" : "bg-slate-800/30"
          )}>
            <MapPin className={cn(
              "w-4 h-4",
              theme === 'light' ? "text-purple-500" : "text-cyan-400"
            )} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location or business (restaurants, bars, cafés...)"
              className={cn(
                "flex-1 bg-transparent text-sm focus:outline-none",
                theme === 'light'
                  ? "text-gray-900 placeholder-gray-400"
                  : "text-white placeholder-slate-500"
              )}
            />
          </div>
        )}

        {/* Media Preview Section */}
        {mediaFiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {mediaFiles.map((file, index) => (
              <div key={index} className="relative flex-shrink-0">
                {file.type.startsWith('image/') && mediaPreviewUrls[index] ? (
                  <img 
                    src={mediaPreviewUrls[index]} 
                    alt={`Upload ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className={cn(
                    "w-24 h-24 rounded-lg flex items-center justify-center",
                    theme === 'light' ? "bg-gray-100" : "bg-slate-800/50"
                  )}>
                    <Video className="w-8 h-8 text-cyan-400" />
                  </div>
                )}
                <button
                  onClick={() => removeMedia(index)}
                  className={cn(
                    "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center",
                    "bg-red-500 text-white hover:bg-red-600 transition-colors"
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tags Section */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                selectedTags.includes(tag.id)
                  ? `bg-gradient-to-r ${tag.color} text-white shadow-lg scale-105`
                  : theme === 'light'
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Action Bar */}
        <div className={cn(
          "flex items-center justify-between pt-2 border-t",
          theme === 'light' ? "border-gray-200" : "border-slate-800/50"
        )}>
          <div className="flex items-center gap-2">
            {/* Combined Media Button */}
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button 
              onClick={() => mediaInputRef.current?.click()}
              disabled={mediaFiles.length >= 3}
              className={cn(
                "p-2 rounded-lg transition-colors group relative",
                mediaFiles.length >= 3
                  ? "text-gray-300 cursor-not-allowed"
                  : theme === 'light'
                    ? "text-gray-400 hover:text-purple-600 hover:bg-gray-100"
                    : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50"
              )}
              title="Add photos or videos"
            >
              <Camera className="w-5 h-5" />
              {mediaFiles.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-white text-xs rounded-full flex items-center justify-center">
                  {mediaFiles.length}
                </span>
              )}
            </button>
            
          </div>

          <div className="flex items-center gap-3">
            {/* Visibility Selector */}
            <div className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg",
              theme === 'light' ? "bg-gray-100" : "bg-slate-800/50"
            )}>
              {visibilityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setVisibility(option.value as any)}
                    className={cn(
                      "p-1.5 rounded transition-all",
                      visibility === option.value
                        ? theme === 'light'
                          ? `${option.color} bg-gray-200`
                          : `${option.color} bg-slate-700/50`
                        : theme === 'light'
                          ? "text-gray-400 hover:text-gray-600"
                          : "text-slate-500 hover:text-slate-300"
                    )}
                    title={option.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Share Button */}
            <button
              onClick={handleSubmit}
              disabled={(!content.trim() && mediaFiles.length === 0) || isSubmitting}
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-all duration-200",
                (content.trim() || mediaFiles.length > 0) && !isSubmitting
                  ? "bg-gradient-to-r from-[#5EEAD4] to-[#155E75] text-white shadow-lg hover:shadow-xl hover:scale-105"
                  : theme === 'light'
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-slate-800/50 text-slate-500 cursor-not-allowed"
              )}
            >
              {isSubmitting ? 'Sharing...' : 'Share Memory'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}