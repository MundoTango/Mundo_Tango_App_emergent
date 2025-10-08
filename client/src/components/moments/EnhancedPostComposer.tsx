import React, { useState, useRef, useCallback, useMemo, useEffect, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next';;
import { useMutation, useQueryClient } from '@tanstack/react-query';
import 'quill/dist/quill.snow.css';

// Type definition for ReactQuill
type ReactQuillType = any;

// ESA Framework Line 87: Memory posting with rich text editor (react-quill integration)
// Use React.lazy for proper dynamic import in React 18 applications
const ReactQuill = lazy(() => import('react-quill'))
import {
  const { t } = useTranslation(); 
  Camera, Video, MapPin, Globe, Users, Lock, X, 
  ImageIcon, Smile, AtSign, Hash, Link, 
  Bold, Italic, List, Quote, Type, Palette 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  InstagramEmbed, 
  TwitterEmbed, 
  YouTubeEmbed,
  TikTokEmbed,
  FacebookEmbed 
} from 'react-social-media-embed';
// import { Mention, MentionsInput } from 'react-mentions';
import { useAuth } from '@/contexts/auth-context';

interface EnhancedPostComposerProps {
  onPostCreated?: () => void;
  onPostUpdated?: (id: number, data: any) => void;
  onClose?: () => void;
  initialContent?: string;
  replyToPostId?: number;
  editMode?: boolean;
  existingPost?: {
    id: number;
    content: string;
    location?: string;
    visibility?: 'public' | 'friends' | 'private';
    isPublic?: boolean;
    imageUrl?: string | null;
    videoUrl?: string | null;
  };
}

interface MediaEmbed {
  type: 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'facebook' | 'image' | 'video';
  url: string;
  id?: string;
  preview?: string;
}

interface Mention {
  id: string;
  display: string;
  type: 'user' | 'hashtag';
}

export default function EnhancedPostComposer({ 
  onPostCreated,
  onPostUpdated, 
  onClose,
  initialContent = '',
  replyToPostId,
  editMode = false,
  existingPost 
}: EnhancedPostComposerProps) {
  
  console.log('[ESA FRAMEWORK] EnhancedPostComposer initialized with:', {
    timestamp: new Date().toISOString(),
    editMode,
    hasExistingPost: !!existingPost,
    existingPostId: existingPost?.id,
    existingPostContent: existingPost?.content?.substring(0, 50),
    initialContent: initialContent?.substring(0, 50),
    ESARequirement: 'Line 87: Memory posting with rich text editor (react-quill integration)'
  });
  
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const quillRef = useRef<ReactQuillType>(null);
  
  
  // ESA LIFE CEO 61×21 AGENTS Framework - Layer 7: Social Features
  // Unified posting module requirement: ALWAYS show full composer for edit mode
  const [showExpandedComposer, setShowExpandedComposer] = useState(editMode || !!existingPost); // ESA Framework: Unified experience for edit mode
  
  console.log('[ESA FRAMEWORK] Composer state:', { 
    showExpandedComposer,
    editMode,
    message: (editMode || !!existingPost) ? 'Rich text editor (react-quill) WILL BE VISIBLE' : 'Composer may start collapsed'
  });
  const [content, setContent] = useState(existingPost?.content || initialContent);
  const [mediaEmbeds, setMediaEmbeds] = useState<MediaEmbed[]>(() => {
    // Initialize media from existing post
    const embeds: MediaEmbed[] = [];
    if (existingPost?.imageUrl) {
      embeds.push({ type: 'image', url: existingPost.imageUrl });
    }
    if (existingPost?.videoUrl) {
      embeds.push({ type: 'video', url: existingPost.videoUrl });
    }
    return embeds;
  });
  const [embedUrl, setEmbedUrl] = useState('');
  const [location, setLocation] = useState(existingPost?.location || '');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>(() => {
    // Handle both visibility string and isPublic boolean
    if (existingPost?.visibility) {
      return existingPost.visibility;
    }
    return existingPost && 'isPublic' in existingPost ? 
      (existingPost.isPublic ? 'public' : 'private') : 'public';
  });
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);

  // Rich text editor modules configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet',
    'blockquote', 'code-block', 'link', 'image'
  ];

  // Detect and parse social media URLs
  const detectSocialMediaUrl = useCallback((url: string): MediaEmbed | null => {
    const cleanUrl = url.trim();
    
    // Instagram
    if (cleanUrl.includes('instagram.com/p/') || cleanUrl.includes('instagram.com/reel/')) {
      return { type: 'instagram', url: cleanUrl };
    }
    
    // Twitter/X
    if (cleanUrl.includes('twitter.com/') || cleanUrl.includes('x.com/')) {
      return { type: 'twitter', url: cleanUrl };
    }
    
    // YouTube
    if (cleanUrl.includes('youtube.com/watch') || cleanUrl.includes('youtu.be/')) {
      return { type: 'youtube', url: cleanUrl };
    }
    
    // TikTok
    if (cleanUrl.includes('tiktok.com/')) {
      return { type: 'tiktok', url: cleanUrl };
    }
    
    // Facebook
    if (cleanUrl.includes('facebook.com/')) {
      return { type: 'facebook', url: cleanUrl };
    }
    
    return null;
  }, []);

  // Add media embed
  const handleAddEmbed = useCallback(() => {
    if (!embedUrl.trim()) return;
    
    const mediaEmbed = detectSocialMediaUrl(embedUrl);
    if (mediaEmbed) {
      setMediaEmbeds(prev => [...prev, mediaEmbed]);
      setEmbedUrl('');
      toast({
        title: "Media Added",
        description: `${mediaEmbed.type.charAt(0).toUpperCase() + mediaEmbed.type.slice(1)} content embedded successfully`,
      });
    } else {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid social media URL (Instagram, Twitter, YouTube, TikTok, Facebook)",
        variant: "destructive"
      });
    }
  }, [embedUrl, detectSocialMediaUrl]);

  // Remove media embed
  const removeEmbed = useCallback((index: number) => {
    setMediaEmbeds(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle emoji selection
  const commonEmojis = ['😀', '😍', '🥰', '😎', '🤩', '😂', '🤣', '😊', '😉', '😋', '💃', '🕺', '❤️', '🔥', '👏', '🎉', '💯', '🌟', '✨', '🎵', '🎶', '🌹', '🥳', '😘', '🤗'];
  
  const addEmoji = useCallback((emoji: string) => {
    if (quillRef.current && typeof quillRef.current.getEditor === 'function') {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      const position = range ? range.index : quill.getLength();
      quill.insertText(position, emoji);
      setContent(quill.root.innerHTML);
    } else {
      // Fallback: append emoji to content if editor not available
      setContent(prevContent => prevContent + emoji);
    }
    setShowEmojiPicker(false);
  }, []);

  // Handle mentions - this would integrate with user search
  const handleMentionSearch = useCallback(async (query: string, callback: (data: any[]) => void) => {
    if (query.length < 2) {
      callback([]);
      return;
    }
    
    try {
      // This would call your user search API
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include'
      });
      const users = await response.json();
      
      const mentionData = users.map((user: any) => ({
        id: user.id,
        display: `@${user.username}`,
        username: user.username,
        name: user.name,
        avatar: user.profileImage
      }));
      
      callback(mentionData);
    } catch (error) {
      console.error('Error searching users:', error);
      callback([]);
    }
  }, []);

  // Submit post
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      setContent('');
      setMediaEmbeds([]);
      setLocation('');
      setMentions([]);
      setShowExpandedComposer(false);
      onPostCreated?.();
      toast({
        title: "Post Created",
        description: "Your tango moment has been shared successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: {t('states.error', 'Error')},
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update post mutation for edit mode
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      // ESA Framework: Pass complete updated data to parent
      const updatedData = {
        content: content.trim(),
        location: location.trim(),
        visibility,
        mediaEmbeds,
        hashtags: extractHashtags(content),
        isPublic: visibility === 'public'
      };
      onPostUpdated?.(existingPost!.id, updatedData);
      onClose?.();
      toast({
        title: "Post Updated",
        description: "Your tango moment has been updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = useCallback(async () => {
    if (!content.trim() && mediaEmbeds.length === 0) {
      toast({
        title: "Empty Post",
        description: "Please add some content or media to your post",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    const postData = {
      content: content.trim(),
      location: location.trim(),
      visibility,
      mediaEmbeds,
      mentions: mentions.map(m => ({ userId: m.id, username: m.display })),
      replyToPostId,
      hashtags: extractHashtags(content),
      isPublic: visibility === 'public'
    };

    try {
      if (editMode && existingPost) {
        await updatePostMutation.mutateAsync({ id: existingPost.id, data: postData });
      } else {
        await createPostMutation.mutateAsync(postData);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [content, mediaEmbeds, location, visibility, mentions, replyToPostId, editMode, existingPost, createPostMutation, updatePostMutation]);

  // Extract hashtags from content
  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    while ((match = hashtagRegex.exec(text)) !== null) {
      hashtags.push(match[1]);
    }
    return hashtags;
  };

  // Render media embed preview
  const renderMediaEmbed = (embed: MediaEmbed, index: number) => {
    const embedProps = {
      url: embed.url,
      width: '100%',
      height: 'auto'
    };

    return (
      <div key={index} className="relative mb-4 border border-[var(--color-border)] rounded-lg overflow-hidden">
        <button
          onClick={() => removeEmbed(index)} aria-label="Button"
          className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="p-2">
          {embed.type === 'instagram' && <InstagramEmbed {...embedProps} />}
          {embed.type === 'twitter' && <TwitterEmbed {...embedProps} />}
          {embed.type === 'youtube' && <YouTubeEmbed {...embedProps} />}
          {embed.type === 'tiktok' && <TikTokEmbed {...embedProps} />}
          {embed.type === 'facebook' && <FacebookEmbed {...embedProps} />}
        </div>
      </div>
    );
  };

  // ESA LIFE CEO 61×21 Framework - Never show collapsed view for edit mode
  // Skip collapsed view entirely when editing to ensure rich text editor is always available
  if (!showExpandedComposer && !editMode && !existingPost) {
    return (
      <div className="bg-[var(--color-surface)] dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <button
            onClick={() => setShowExpandedComposer(true)} aria-label="Button"
            className="flex-1 text-left px-4 py-3 bg-[var(--color-surface-elevated)] hover:bg-[var(--color-neutral-100)] rounded-full text-gray-500 dark:text-gray-400 transition-colors"
          >
            Share your tango moment...
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowExpandedComposer(true)} aria-label="Button"
              className="flex items-center space-x-2 px-3 py-2 hover:bg-pink-50 rounded-lg text-pink-600 transition-colors"
            >
              <Camera className="h-4 w-4" />
              <span className="text-sm font-medium">Photo</span>
            </button>
            <button 
              onClick={() => setShowExpandedComposer(true)} aria-label="Button"
              className="flex items-center space-x-2 px-3 py-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
            >
              <Video className="h-4 w-4" />
              <span className="text-sm font-medium">Video</span>
            </button>
            <button 
              onClick={() => setShowExpandedComposer(true)} aria-label="Button"
              className="flex items-center space-x-2 px-3 py-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Location</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="enhanced-composer" className="bg-[var(--color-surface)] dark:bg-gray-900 rounded-xl shadow-lg border border-[var(--color-border)] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-semibold text-[var(--color-text)] dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{user?.username}</p>
          </div>
        </div>
        <button
          onClick={() => {
            // ESA Layer 7: In edit mode or when modal is used, close the modal entirely
            if (editMode || existingPost || onClose) {
              onClose?.();} aria-label="Button" else {
              setShowExpandedComposer(false);
            }
          }}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Rich Text Editor - ESA Framework Line 87 Requirement */}
      <div className="mb-4">
        <Suspense fallback={
          <div className="w-full">
            <div className="animate-pulse bg-[var(--color-neutral-100)] rounded-lg p-4 min-h-[200px]">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        }>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="What's happening in your tango world?"
            className="bg-[var(--color-surface)] dark:bg-gray-900"
          />
        </Suspense>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="mb-4 p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-elevated)]">
          <div className="grid grid-cols-10 gap-2">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => addEmoji(emoji)} aria-label="Button"
                className="text-xl hover:bg-gray-200 dark:bg-gray-700 rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Media Embed Input */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={embedUrl}
            onChange={(e) = aria-label="Input field"> setEmbedUrl(e.target.value)}
            placeholder="Paste Instagram, Twitter, YouTube, TikTok, or Facebook URL..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <button
            onClick={handleAddEmbed}
            disabled={!embedUrl.trim()}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
           aria-label="Button">
            <Link className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Media Embeds Preview */}
      {mediaEmbeds.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Embedded Media:</h4>
          {mediaEmbeds.map((embed, index) => renderMediaEmbed(embed, index))}
        </div>
      )}

      {/* Location Input */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={location}
            onChange={(e) = aria-label="Input field"> setLocation(e.target.value)}
            placeholder="Add location..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} aria-label="Button"
            className="flex items-center space-x-2 px-3 py-2 hover:bg-[var(--color-neutral-100)] rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
          >
            <Smile className="h-4 w-4" />
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 hover:bg-[var(--color-neutral-100)] rounded-lg text-gray-600 dark:text-gray-300 transition-colors" aria-label="Button">
            <Camera className="h-4 w-4" />
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 hover:bg-[var(--color-neutral-100)] rounded-lg text-gray-600 dark:text-gray-300 transition-colors" aria-label="Button">
            <Video className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Visibility Selector */}
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'public' | 'friends' | 'private')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="public">🌍 Public</option>
            <option value="friends">👥 Friends</option>
            <option value="private">🔒 Private</option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && mediaEmbeds.length === 0)}
            className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
           aria-label="Button">
            {isSubmitting ? (editMode ? 'Updating...' : 'Sharing...') : (editMode ? 'Update' : 'Share')}
          </button>
        </div>
      </div>
    </div>
  );
}