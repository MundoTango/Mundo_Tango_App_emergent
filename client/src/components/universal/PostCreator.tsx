import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UnifiedLocationPicker from './UnifiedLocationPicker';
import { Progress } from '@/components/ui/progress';
import { InternalUploader } from '@/components/upload/InternalUploader';
import { useTranslation } from 'react-i18next';
// ESA Layer 13: Advanced media processing with universal format support
import { processMultipleMedia, getUploadStrategy } from '@/utils/advancedMediaProcessor';
import { extractVideoThumbnail } from '@/utils/videoThumbnail';
import { extractMentions } from '@/utils/mentionUtils';
import SimpleMentionsInput from '../memory/SimpleMentionsInput';
// VideoURLInput removed per user request
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  MapPin, 
  Image, 
  Video, 
  Hash, 
  Sparkles,
  X,
  ChevronDown,
  Globe,
  Lock,
  Users,
  Loader,
  Lightbulb,
  Camera,
  Mic,
  Eye,
  EyeOff,
  Cloud,
  Upload,
  Link2,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useCsrfToken } from '@/contexts/CsrfContext';
// Temporarily disabled microInteractions to fix performance issue
// import { 
//   createTypingParticle, 
//   createRipple, 
//   createConfetti,
//   magneticButton,
//   resetMagneticButton 
// } from '@/utils/microInteractions';

interface PostCreatorProps {
  context?: {
    type: 'feed' | 'event' | 'group' | 'memory';
    id?: string;
    name?: string;
  };
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  onPostCreated?: () => void;
  // Custom submit handler for memories feed integration
  onSubmit?: (data: {
    content: string;
    richContent?: string;
    emotions?: string[];
    location?: string;
    tags: string[];
    mentions?: string[];
    media: File[];
    internalMediaUrls?: string[]; // ESA Layer 13: Include uploaded media URLs
    visibility: string;
    isRecommendation: boolean;
    recommendationType?: string;
    priceRange?: string;
    // ESA Layer 8: Context-aware posting fields
    contextType?: string;
    contextId?: string;
  }) => void;
  // ESA Layer 7 & 23: Edit mode support for unified UI/UX
  editMode?: boolean;
  existingPost?: {
    id: number;
    content: string;
    richContent?: string;
    location?: string;
    visibility?: 'public' | 'friends' | 'private';
    hashtags?: string[];
    media?: Array<{ url: string; type: string; }>;
  };
  onEditComplete?: () => void;
  // Callback for user activity (to reset inactivity timer)
  onActivity?: () => void;
}

export default function PostCreator({ 
  context = { type: 'feed' }, 
  user,
  onPostCreated,
  onSubmit,
  editMode = false,
  existingPost,
  onEditComplete,
  onActivity
}: PostCreatorProps) {
  // ESA Layer 7 & 23: Initialize with existing post data in edit mode
  // ESA Layer 9: Rich text editing implementation
  const [content, setContent] = useState(existingPost?.content || '');
  const [richContent, setRichContent] = useState(existingPost?.richContent || existingPost?.content || '');
  const editorRef = useRef<HTMLDivElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(editMode); // Show advanced in edit mode
  const [showTags, setShowTags] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);
  const [visibility, setVisibility] = useState(existingPost?.visibility || 'public');
  const [selectedTags, setSelectedTags] = useState<string[]>(existingPost?.hashtags || []);
  const [mentions, setMentions] = useState<string[]>([]); // ESA Layer 24: Store extracted mention IDs
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  // Load existing media previews in edit mode
  const [mediaPreviews, setMediaPreviews] = useState<string[]>(
    editMode && existingPost?.media ? existingPost.media.map(m => m.url) : []
  );
  // ESA Layer 13: Internal-only media URLs system
  // In edit mode, initialize with existing media URLs
  const [internalMediaUrls, setInternalMediaUrls] = useState<string[]>(
    editMode && existingPost?.media ? existingPost.media.map(m => m.url) : []
  );
  const [cloudMediaUrls, setCloudMediaUrls] = useState<string[]>([]);
  const [isRecommendation, setIsRecommendation] = useState(false);
  const [recommendationType, setRecommendationType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState('');
  const [showEnhancement, setShowEnhancement] = useState(false);

  // Location states - simplified for Google Maps
  const [location, setLocation] = useState(existingPost?.location || '');
  const [locationCoordinates, setLocationCoordinates] = useState<{ lat: number; lng: number } | undefined>();
  const [locationDetails, setLocationDetails] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // ESA LIFE CEO 61x21 - CSRF Token for secure API requests
  const { csrfToken } = useCsrfToken();

  // ESA LIFE CEO 61x21 - @mention functionality
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  // Fetch users for @mention autocomplete
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users/search', mentionSearch],
    queryFn: async () => {
      if (!mentionSearch || mentionSearch.length < 1) return [];
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(mentionSearch)}`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || [];
    },
    enabled: showMentions && mentionSearch.length > 0
  });

  // Predefined tags with emojis
  const predefinedTags = [
    { value: 'milonga', label: t('memories.categories.milonga'), emoji: '💃' },
    { value: 'practica', label: t('memories.categories.practica'), emoji: '🎯' },
    { value: 'performance', label: t('memories.categories.performance'), emoji: '🎭' },
    { value: 'workshop', label: t('memories.categories.workshop'), emoji: '📚' },
    { value: 'festival', label: t('memories.categories.festival'), emoji: '🎪' },
    { value: 'travel', label: t('memories.categories.travel'), emoji: '✈️' },
    { value: 'music', label: t('memories.categories.music'), emoji: '🎵' },
    { value: 'fashion', label: t('memories.categories.fashion'), emoji: '👗' }
  ];

  // Handle location selection from Google Maps
  const handleLocationChange = useCallback(
    (locationName: string, coordinates?: { lat: number; lng: number }, details?: any) => {
      setLocation(locationName);
      setLocationCoordinates(coordinates);
      setLocationDetails(details);
      
      // Log the location details for debugging
      if (details) {
        console.log('📍 Location selected:', {
          name: details.name,
          address: details.address,
          rating: details.rating,
          types: details.types,
          coordinates: coordinates
        });
        
        // Show enhanced toast if business has rating
        if (details.rating) {
          toast({
            title: t('memories.creator.locationSelected', { name: details.name }),
            description: t('memories.creator.locationDetails', { rating: details.rating, address: details.address }),
          });
        }
      }
    },
    [toast]
  );

  // Handle media upload
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ESA LIFE CEO 61x21 - DISABLED TO PREVENT SERVER UPLOADS
    console.error('❌ BLOCKED: Old file upload mechanism triggered!');
    toast({
      title: t('memories.creator.useCloudUpload'),
      description: t('memories.creator.useCloudUploadDesc'),
      variant: "destructive"
    });
    return; // Block completely
    const files = Array.from(e.target.files || []);
    console.log('📸 Files selected:', files.length, files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 500 * 1024 * 1024; // 500MB for videos

      if (!isValidType) {
        toast({
          title: t('memories.creator.invalidFileType'),
          description: t('memories.creator.invalidFileTypeDesc'),
          variant: "destructive"
        });
        return false;
      }

      if (!isValidSize) {
        toast({
          title: t('memories.creator.fileTooLarge'),
          description: t('memories.creator.fileTooLargeDesc', { filename: file.name }),
          variant: "destructive"
        });
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      console.log('❌ No valid files after filtering');
      return;
    }

    console.log('✅ Valid files:', validFiles);
    setMediaFiles(prev => {
      const updated = [...prev, ...validFiles];
      console.log('📁 Media files state updated:', updated);
      return updated;
    });

    // Create previews - handle videos differently
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        // For images, create data URL preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        // For videos, create object URL for preview
        const videoUrl = URL.createObjectURL(file);
        setMediaPreviews(prev => [...prev, videoUrl]);
      }
    });

    // Show success message
    toast({
      title: t('memories.creator.mediaAdded'),
      description: t('memories.creator.mediaAddedDesc', { count: validFiles.length }),
    });

    // Reset the file input to allow re-selecting the same file
    fileInputRef.current!.value = '';
  };

  // ESA Layer 7 & 23: Unified post mutation for create and edit modes
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      // Handle edit mode
      if (editMode && existingPost?.id) {
        console.log('📝 Editing post:', existingPost.id);
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (csrfToken) {
          headers['x-csrf-token'] = csrfToken;
        }
        
        // ESA Layer 13: Format media as mediaEmbeds with type detection
        const mediaEmbeds = internalMediaUrls.map(url => ({
          url,
          type: url.match(/\.(mp4|webm|mov|avi)$/i) ? 'video' : 'image'
        }));

        const response = await fetch(`/api/posts/${existingPost.id}`, {
          method: 'PATCH',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            content: postData.content,
            richContent: richContent,
            location: postData.location,
            visibility: postData.visibility,
            hashtags: postData.tags,
            // ESA Framework: Send media as properly formatted mediaEmbeds
            mediaEmbeds: mediaEmbeds.length > 0 ? mediaEmbeds : undefined
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update post: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        // ESA Layer 7 & 23: Ensure proper cache invalidation and callbacks for edit mode
        if (editMode) {
          // Invalidate caches immediately
          queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
          queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
          queryClient.invalidateQueries({ queryKey: ['/api/memories'] });
          
          // Call the edit complete callback to close dialog
          if (onEditComplete) {
            onEditComplete();
          }
        }
        
        return result;
      }
      // Starting post creation
      console.log('📦 Post data received:', postData);
      console.log('🏠 Internal media URLs:', internalMediaUrls.length);
      console.log('📸 Legacy media files:', mediaFiles.length);

      // ESA Layer 13: Internal URLs only - single reliable upload solution
      if (internalMediaUrls.length > 0) {
        // Use internal URLs directly - no file upload needed!
        console.log('🏠 Using Internal URLs - reliable local upload!');
        const endpoint = '/api/posts/direct'; // Direct endpoint that accepts URLs only
        
        // ESA LIFE CEO 61x21 - Build headers with CSRF token
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (csrfToken) {
          headers['x-csrf-token'] = csrfToken;
        }
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            ...postData,
            richContent: richContent,
            mediaUrls: internalMediaUrls, // Send internal URLs directly
            mediaType: 'internal'
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Server response error:', response.status, errorText);
          throw new Error(`Failed to create post: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Post created successfully:', result);
        return result;
      }
      // ESA LIFE CEO 61x21 - COMPLETELY BLOCK ALL FILE UPLOADS
      else if (mediaFiles.length > 0) {
        console.error('❌ ESA LIFE CEO 61x21: SERVER UPLOAD BLOCKED!');
        console.error('Files detected:', mediaFiles);

        // Clear the files immediately
        setMediaFiles([]);
        setMediaPreviews([]);

        toast({
          title: t('memories.creator.uploadBlocked'),
          description: t('memories.creator.uploadBlockedDesc'),
          variant: "destructive"
        });

        setIsUploading(false);
        setUploadProgress(0);

        // Force stop any ongoing uploads
        throw new Error('ESA LIFE CEO 61x21: Server uploads are completely disabled. Use Internal Upload only.');

        /* DISABLED - DO NOT USE SERVER UPLOADS
        const formData = new FormData();
        formData.append('content', postData.content);
        formData.append('visibility', postData.visibility);
        // ESA LIFE CEO 61x21 - Ensure location is properly sent
        const locationValue = location || postData.location || '';
        // Location being sent
        formData.append('location', locationValue);
        formData.append('tags', JSON.stringify(postData.tags));
        formData.append('isRecommendation', String(postData.isRecommendation));
        if (postData.recommendationType) formData.append('recommendationType', postData.recommendationType);
        if (postData.priceRange) formData.append('priceRange', postData.priceRange);

        // ESA LIFE CEO 61x21 - Append each media file with debug logging
        mediaFiles.forEach((file, index) => {
          // Appending file to upload
          formData.append('media', file);
        });
        */

        // ESA LIFE CEO 61x21 - FormData logging disabled (server uploads blocked)

        // ESA LIFE CEO 61x21 FIX - Use /api/memories for memories feed
        const uploadEndpoint = context.type === 'memory' || context.type === 'feed' ? '/api/memories' : '/api/posts';
        console.log(`📤 Sending FormData to ${uploadEndpoint} with progress tracking`);

        // Use XMLHttpRequest for REAL progress tracking only (no simulation)
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Calculate total size for progress estimation
          const totalSize = mediaFiles.reduce((sum, file) => sum + file.size, 0);
          console.log(`📦 Total upload size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

          // FIXED upload progress tracking
          let lastProgress = 0;
          let progressInterval: NodeJS.Timeout;
          console.log('🚀 Initializing upload progress tracking');

          // Start progress immediately when upload begins
          setIsUploading(true);
          setUploadProgress(1);

          // ESA LIFE CEO 61x21 FIX: Simulate progress based on file size and estimated upload speed
          const startTime = Date.now();
          const estimatedBytesPerSecond = 1024 * 1024 * 2; // Estimate 2MB/s upload speed
          const estimatedDuration = (totalSize / estimatedBytesPerSecond) * 1000; // in milliseconds

          // Update progress smoothly every 100ms
          progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            // ESA LIFE CEO 61x21 FIX - Allow progress to reach 100%
            const estimatedProgress = Math.min(100, Math.round((elapsed / estimatedDuration) * 100));

            if (estimatedProgress > lastProgress) {
              lastProgress = estimatedProgress;
              setUploadProgress(estimatedProgress);
              console.log(`📊 Upload progress: ${estimatedProgress}%`);
            }
          }, 100);

          xhr.upload.addEventListener('progress', (e) => {
            console.log(`📡 Progress Event:`, {
              loaded: e.loaded,
              total: e.total,
              computable: e.lengthComputable,
              percentage: e.total > 0 ? Math.round((e.loaded / e.total) * 100) : 0
            });

            if (e.lengthComputable && e.total > 0) {
              // If we get real progress, use it instead
              clearInterval(progressInterval);
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              if (percentComplete >= lastProgress) {
                lastProgress = percentComplete;
                const mbLoaded = (e.loaded / 1024 / 1024).toFixed(2);
                const mbTotal = (e.total / 1024 / 1024).toFixed(2);
                console.log(`📊 REAL Progress: ${percentComplete}% (${mbLoaded}MB / ${mbTotal}MB)`);
                setUploadProgress(percentComplete);

                // Ensure we show 100% when bytes are complete
                if (e.loaded >= e.total && percentComplete >= 99) {
                  console.log('✅ Upload bytes complete, forcing 100%');
                  setUploadProgress(100);
                }
              }
            }
          }, false);

          // Monitor upload start
          xhr.upload.addEventListener('loadstart', () => {
            console.log('📤 Upload started');
            setUploadProgress(1); // Show minimal progress to indicate start
          });

          xhr.addEventListener('load', () => {
            clearInterval(progressInterval); // Clear the progress interval
            // XHR load event triggered

            if (xhr.status >= 200 && xhr.status < 300) {
              // Success - show 100% progress
              setUploadProgress(100);
              // Debug log removed

              try {
                const response = JSON.parse(xhr.responseText);
                // Debug log removed

                // Give user time to see 100% before resetting
                setTimeout(() => {
                  setIsUploading(false);
                  setUploadProgress(0);
                  // Debug log removed
                }, 1500);

                resolve(response);
              } catch (e) {
                // Error log removed
                setIsUploading(false);
                setUploadProgress(0);
                reject(new Error('Invalid response format'));
              }
            } else {
              // Error log removed
              setIsUploading(false);
              setUploadProgress(0);
              reject(new Error(`Failed to create post: ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            clearInterval(progressInterval); // Clear the progress interval
            setIsUploading(false);
            setUploadProgress(0);
            // Error log removed
            reject(new Error('Network error during upload'));
          });

          xhr.addEventListener('abort', () => {
            clearInterval(progressInterval); // Clear the progress interval
            setIsUploading(false);
            setUploadProgress(0);
            // Debug log removed
            reject(new Error('Upload cancelled'));
          });

          // ESA LIFE CEO 61x21 FIX - Use /api/posts endpoint for all posts
          const endpoint = '/api/posts';
          // Debug log removed
          xhr.open('POST', endpoint);
          xhr.withCredentials = true;
          xhr.timeout = 0; // ESA LIFE CEO 61x21 - Disable client timeout, let server handle it

          // ESA LIFE CEO 61x21 - Removed client timeout handler since we disabled timeout

          // Log xhr state changes for debugging
          xhr.onreadystatechange = () => {
            console.log(`🔄 XHR State: ${xhr.readyState} - Status: ${xhr.status}`);
          };

          // Create FormData for server upload (legacy path - blocked)
          const serverFormData = new FormData();
          xhr.send(serverFormData);
        });
      } else {
        // No media files, use JSON
        // ESA LIFE CEO 61x21 FIX - Use /api/posts endpoint for all posts
        const endpoint = '/api/posts';
        // Debug log removed
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(postData)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('❌ API Error:', response.status, errorData);
          throw new Error(`Failed to create post: ${response.status} - ${errorData}`);
        }

        const result = await response.json();
        console.log('✅ Text-only post created successfully:', result);
        return result;
      }
    },
    onSuccess: (response) => {
      console.log('✅ ESA Layer 13: Post mutation success!', response);
      toast({
        title: editMode ? t('memories.toasts.postUpdatedEmoji') : t('memories.toasts.postCreatedEmoji'), 
        description: editMode ? t('memories.toasts.changesSaved') : t('memories.toasts.memorySharedDescription'),
      });

      // Trigger confetti celebration
      // createConfetti(); // Temporarily disabled for performance

      // Reset form
      setContent('');
      setRichContent('');
      setLocation('');
      setSelectedTags([]);
      setMediaFiles([]);
      setMediaPreviews([]);
      setCloudMediaUrls([]); // Reset cloud URLs
      setIsRecommendation(false);
      setUploadProgress(0);
      setIsUploading(false);
      setEnhancedContent('');
      setShowEnhancement(false);

      // Invalidate queries to trigger immediate refetch with staleTime: 0
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/memories'] });
      
      // Call appropriate callback
      if (editMode) {
        onEditComplete?.();
      } else {
        onPostCreated?.();
      }
    },
    onError: (error: any) => {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: t('memories.toasts.createFailed'),
        description: error.message || t('memories.toasts.createFailedDesc'),
        variant: "destructive"
      });
    }
  });

  const handleEnhanceContent = async () => {
    if (!content.trim()) {
      toast({
        title: t('memories.creator.noContentToEnhance'),
        description: t('memories.creator.noContentToEnhanceDesc'),
        variant: "destructive"
      });
      return;
    }

    setIsEnhancing(true);
    try {
      // ESA Layer 31-35 Fix: Use correct AI enhancement endpoint
      const response = await fetch('/api/posts/enhance-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        body: JSON.stringify({ content })
      });

      const result = await response.json();

      if (response.ok && result.enhanced) {
        setEnhancedContent(result.enhanced);
        setShowEnhancement(true);
        toast({
          title: t('memories.creator.contentEnhanced'),
        });
      } else {
        toast({
          title: t('postCreator.aiUnavailable'),
          description: result.message || 'Could not enhance content',
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      toast({
        title: t('postCreator.aiEnhanceFailed'),
        description: 'An error occurred. Please try again later.',
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const useEnhancedContent = () => {
    setContent(enhancedContent);
    setRichContent(enhancedContent);
    setShowEnhancement(false);
    setEnhancedContent(''); // Clear enhanced content after use
    toast({
      title: t('postCreator.aiEnhanced'),
    });
  };

  const dismissEnhancement = () => {
    setShowEnhancement(false);
    setEnhancedContent(''); // Clear enhanced content on dismiss
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && internalMediaUrls.length === 0 && mediaFiles.length === 0) {
      toast({
        title: t('postCreator.emptyPost'),
        description: t('postCreator.emptyPostDesc'),
        variant: "destructive"
      });
      return;
    }

    // Don't allow submission while uploading
    if (isUploading) {
      toast({
        title: t('postCreator.uploadInProgress'),
        description: t('postCreator.uploadInProgressDesc'),
        variant: "destructive"
      });
      return;
    }

    // If custom submit handler is provided (for memories feed), use it
    if (onSubmit) {
      console.log('🔄 ESA Layer 13: Using custom onSubmit handler!');
      console.log('🔍 [PostCreator] Content being submitted:', content);
      console.log('🏠 [PostCreator] Internal media URLs:', internalMediaUrls.length);
      console.log('📍 [PostCreator ESA Layer 8] Context:', context);
      onSubmit({
        content,
        emotions: [], // PostCreator doesn't have emotions
        location: location || undefined,
        tags: selectedTags,
        mentions: mentions, // ESA Layer 24: Send validated mention IDs to API
        media: mediaFiles,
        internalMediaUrls, // ESA Layer 13 FIX: Include uploaded media URLs
        visibility,
        isRecommendation,
        recommendationType,
        priceRange,
        // ESA Layer 8: Context-aware posting - include context for group/event posts
        contextType: context?.type !== 'feed' ? context?.type : undefined,
        contextId: context?.type === 'group' || context?.type === 'event' ? context?.id : undefined
      });

      // Reset form after submission
      setContent('');
      setRichContent('');
      setLocation('');
      setSelectedTags([]);
      setMediaFiles([]);
      setMediaPreviews([]);
      setInternalMediaUrls([]); // ESA Layer 13 FIX: Reset uploaded media URLs
      setCloudMediaUrls([]); // Reset cloud URLs
      setIsRecommendation(false);
      setRecommendationType('');
      setPriceRange('');
      setEnhancedContent('');
      setShowEnhancement(false);

      // Show success notification
      toast({
        title: t('postCreator.memoryCreated'),
        description: t('postCreator.memoryCreatedDesc'),
      });

      // Trigger confetti
      // createConfetti(); // Temporarily disabled for performance

      onPostCreated?.();
      return;
    }

    // Default behavior: use internal mutation
    console.log('✅ ESA Layer 13: Using default mutation path!');
    const postData = {
      content,
      richContent,
      visibility,
      tags: selectedTags,
      mentions: mentions, // ESA Layer 24: Include mentions in post data
      location: location || undefined,
      locationCoordinates: locationCoordinates || undefined,
      locationDetails: locationDetails || undefined,
      contextType: context.type,
      contextId: context.id,
      isRecommendation,
      recommendationData: isRecommendation ? {
        type: recommendationType,
        priceRange
      } : undefined
    };
    console.log('🚀 Submitting post via mutation:', postData);
    createPostMutation.mutate(postData);
  };

  // Handle typing with particle effects
  const handleTyping = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // createTypingParticle(e); // Temporarily disabled for performance
  };
  
  // ESA Layer 9: Initialize editor content
  useEffect(() => {
    if (editorRef.current && richContent && !editorRef.current.innerHTML) {
      // Only set initial content if editor is empty
      editorRef.current.innerHTML = richContent;
    }
  }, []); // Only run once on mount
  
  // ESA Layer 9: Apply text formatting
  const applyFormatting = (format: string) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (selectedText) {
      document.execCommand(format, false);
      const html = editorRef.current.innerHTML;
      setRichContent(html);
    }
  };
  
  // Insert emoji at cursor position
  const insertEmoji = (emoji: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    document.execCommand('insertText', false, emoji);
    const text = editorRef.current.innerText;
    const html = editorRef.current.innerHTML;
    setContent(text);
    setRichContent(html);
  };

  // Handle file selection with universal format support
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // ESA Layer 13: Accept ANY file format - we'll convert if needed
    setIsUploading(true);
    setUploadProgress(0);

    // Check for HEIC/HEIF and other special formats
    const fileTypes = files.map(f => {
      const name = f.name.toLowerCase();
      if (name.endsWith('.heic') || name.endsWith('.heif')) return 'HEIC/HEIF (iPhone)';
      if (name.endsWith('.mov')) return 'MOV (iPhone Video)';
      if (f.type.startsWith('image/')) return 'Image';
      if (f.type.startsWith('video/')) return 'Video';
      return 'Unknown';
    });

    toast({
      title: "🎬 Processing media...",
      description: `Converting ${fileTypes.join(', ')} for optimal upload`
    });

    try {
      console.log(`🚀 [PostCreator] Starting media processing for ${files.length} files`);
      console.log(`📊 [PostCreator] File details:`, files.map(f => ({ name: f.name, type: f.type, size: `${(f.size/1024/1024).toFixed(2)}MB` })));
      
      // Process all files with the advanced processor
      const processedFiles = await processMultipleMedia(
        files,
        (current, total, status) => {
          const progress = (current / total) * 100;
          setUploadProgress(progress);
          console.log(`📸 [PostCreator] Processing ${current}/${total} (${progress.toFixed(0)}%): ${status}`);
        }
      );
      
      console.log(`✅ [PostCreator] Processing complete! Got ${processedFiles.length} files`);

      // Check upload strategy for each file
      processedFiles.forEach(file => {
        const strategy = getUploadStrategy(file);
        console.log(`📁 ${file.name}: ${strategy.method} - ${strategy.reason}`);
      });

      setMediaFiles(prev => [...prev, ...processedFiles]);

      // Generate previews for processed files
      for (const file of processedFiles) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => setMediaPreviews(prev => [...prev, reader.result as string]);
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
          try {
            // Extract thumbnail from video for preview
            const thumbnail = await extractVideoThumbnail(file);
            setMediaPreviews(prev => [...prev, thumbnail]);
          } catch (error) {
            console.error('Failed to extract video thumbnail:', error);
            // Fallback to video URL if thumbnail extraction fails
            const videoUrl = URL.createObjectURL(file);
            setMediaPreviews(prev => [...prev, videoUrl]);
          }
        }
      }

      // Calculate size reduction
      const originalSize = files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024;
      const processedSize = processedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024;
      const reduction = ((1 - processedSize / originalSize) * 100).toFixed(0);

      toast({
        title: "✅ Media optimized!",
        description: `${processedFiles.length} file(s) ready (${reduction}% smaller)`
      });

    } catch (error) {
      console.error('Media processing failed:', error);
      toast({
        title: "⚠️ Processing issue",
        description: t('postCreator.formatWarning'),
        variant: "destructive"
      });
      
      // Fallback to original files if processing fails
      setMediaFiles(prev => [...prev, ...files]);
      files.forEach(file => {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          const url = URL.createObjectURL(file);
          setMediaPreviews(prev => [...prev, url]);
        }
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  return (
    <div 
      className="w-full"
      onClick={onActivity}
      onFocus={onActivity}
      onKeyDown={onActivity}
    >
      <Card className="relative border-0 glassmorphic-card beautiful-hover shadow-2xl">
        {/* Enhanced gradient background with advanced animations */}
        <div className="absolute inset-0">
          {/* Simple gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-turquoise-400/30 via-cyan-400/20 to-blue-500/30 animate-gradient" />
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/10 via-transparent to-pink-400/10 animate-gradient-reverse" />
        </div>

        <div className="relative z-10 p-8">
          {/* Enhanced Header with better styling */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-turquoise-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">{user?.name}</h3>
              <p className="text-sm text-gray-500">@{user?.username}</p>
            </div>
          </div>

          {/* Main content area */}
          <div className="space-y-5">

            {/* ESA Layer 9: Rich Text Editor - Simplified for stability */}
            <div className="relative group/textarea">
              <SimpleMentionsInput
                value={content}
                onChange={(value: string) => {
                  setContent(value);
                  setRichContent(value); // For now, keep them in sync
                }}
                onMentionsChange={(mentionIds: string[]) => {
                  setMentions(mentionIds); // ESA Layer 24: Capture mention IDs
                  console.log('📌 Mentions extracted:', mentionIds);
                }}
                placeholder={editMode ? t('memories.creator.editPlaceholder') : t('memories.creator.sharePlaceholder')}
                className="w-full transition-all duration-300 focus-within:ring-2 focus-within:ring-turquoise-400/50"
                disabled={isUploading || createPostMutation.isPending}
                rows={6}
              />
              {/* Magic sparkles that appear when typing */}
              {content.length > 0 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                  <div className="absolute top-2 right-2 w-2 h-2 bg-turquoise-400 rounded-full animate-sparkle-float opacity-60" style={{ animationDelay: '0s' }} />
                  <div className="absolute top-4 right-8 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-sparkle-float opacity-50" style={{ animationDelay: '0.3s' }} />
                  <div className="absolute top-6 right-4 w-1 h-1 bg-blue-400 rounded-full animate-sparkle-float opacity-40" style={{ animationDelay: '0.6s' }} />
                </div>
              )}
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 transition-all duration-300">
                {content.length > 0 && (
                  <span className="animate-fade-in">{content.length} characters</span>
                )}
              </div>

              {/* ESA LIFE CEO 61x21 - @Mention Dropdown - Now handled by SimpleMentionsInput */}
              {false && showMentions && users.length > 0 && (
                <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-48 overflow-y-auto">
                  {users.map((user: any) => (
                    <button
                      key={user.id}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-turquoise-50 flex items-center gap-2 transition-colors"
                      onClick={() => {
                        // Insert mention into rich text editor
                        const plainTextIndex = content.lastIndexOf('@', content.length);
                        if (plainTextIndex !== -1) {
                          const beforeMention = richContent.substring(0, richContent.lastIndexOf('@'));
                          const afterMention = '';
                          const mentionHtml = `${beforeMention}<strong>@${user.username}</strong>&nbsp;${afterMention}`;
                          setRichContent(mentionHtml);
                          setContent(content.replace(/@[^\s]*$/, `@${user.username} `));
                          setShowMentions(false);
                          setMentionSearch('');
                        }
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-turquoise-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">@{user.username}</div>
                        {user.email && (
                          <div className="text-xs text-gray-500">{user.email}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Media previews - supports both cloud URLs and local files */}
            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {mediaPreviews.map((preview, index) => {
                  // Check if this is an internal URL or local file
                  const isInternalUrl = internalMediaUrls.includes(preview) || preview.includes('/uploads/');
                  const file = !isInternalUrl ? mediaFiles[index] : null;
                  const isVideo = isInternalUrl ? preview.includes('.mp4') || preview.includes('.mov') || preview.includes('.webm') : file?.type?.startsWith('video/');

                  return (
                    <div key={index} className="relative group rounded-lg overflow-hidden bg-gray-100">
                      {isVideo ? (
                        <div className="relative w-full h-32">
                          <video 
                            src={preview} 
                            className="w-full h-full object-cover"
                            controls
                            muted
                            playsInline
                          />
                          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Video
                          </div>
                        </div>
                      ) : (
                        <img src={preview} alt={`Media ${index + 1}`} className="w-full h-32 object-cover" />
                      )}
                      <button
                        onClick={() => {
                          // Handle removal for internal and local media
                          const isInternalUrl = internalMediaUrls.includes(preview) || preview.includes('/uploads/');

                          if (isInternalUrl) {
                            // Remove from internal URLs
                            setInternalMediaUrls(prev => prev.filter(url => url !== preview));
                          } else {
                            // Remove from local files
                            setMediaFiles(prev => prev.filter((_, i) => i !== index));
                          }

                          setMediaPreviews(prev => {
                            // Clean up object URLs for videos to prevent memory leaks
                            if (!isInternalUrl && isVideo && preview.startsWith('blob:')) {
                              URL.revokeObjectURL(preview);
                            }
                            return prev.filter((_, i) => i !== index);
                          });
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Icon Buttons Row: Hidden Gems, Tags, Camera, AI Enhance, Visibility, Share */}
            <div className="flex items-center justify-between gap-3">
              {/* Left Side: Action Icons */}
              <div className="flex items-center gap-3">
              {/* 🗺️ Hidden Gems */}
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsRecommendation(!isRecommendation)}
                      style={{ 
                        animation: 'iconEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0s backwards',
                      }}
                      className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 group ${
                        isRecommendation 
                          ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white shadow-xl animate-pulse' 
                          : 'bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-600 shadow-lg hover:shadow-2xl'
                      }`}
                      onMouseEnter={(e) => {
                        // Ripple to next siblings
                        const siblings = e.currentTarget.parentElement?.parentElement?.querySelectorAll('button');
                        if (siblings) {
                          siblings.forEach((sibling, idx) => {
                            if (sibling !== e.currentTarget) {
                              setTimeout(() => {
                                sibling.style.transform = 'translateY(-4px)';
                                setTimeout(() => {
                                  sibling.style.transform = '';
                                }, 150);
                              }, idx * 30);
                            }
                          });
                        }
                      }}
                    >
                      <MapPin className={`h-6 w-6 transition-transform duration-300 ${isRecommendation ? 'animate-bounce-drop' : 'group-hover:animate-pin-drop'}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 border-2 border-amber-400 text-white px-4 py-3 animate-in zoom-in-95 duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✨</span>
                      <div>
                        <p className="font-bold text-sm">{t('postCreator.hiddenGems')}</p>
                        <p className="text-xs text-amber-200">{t('postCreator.hiddenGemsDesc')}</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* # Tags */}
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowTags(!showTags)}
                      style={{ 
                        animation: 'iconEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards',
                      }}
                      className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 group ${
                        showTags || selectedTags.length > 0
                          ? 'bg-gradient-to-br from-turquoise-500 to-cyan-600 text-white shadow-xl animate-pulse' 
                          : 'bg-gradient-to-br from-turquoise-50 to-cyan-100 hover:from-turquoise-100 hover:to-cyan-200 text-turquoise-600 shadow-lg hover:shadow-2xl'
                      }`}
                    >
                      <Hash className={`h-6 w-6 transition-transform duration-500 ${showTags ? 'rotate-180' : 'group-hover:animate-hash-flip'}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    className="bg-gradient-to-br from-turquoise-900 via-cyan-800 to-blue-900 border-2 border-cyan-400 text-white px-4 py-3 animate-in zoom-in-95 duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏷️</span>
                      <p className="font-bold text-sm">{t('postCreator.addTags')}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* 📷 Camera Upload */}
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        const fileInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement;
                        if (fileInput) fileInput.click();
                      }}
                      style={{ 
                        animation: 'iconEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards',
                      }}
                      className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-100 hover:from-blue-100 hover:to-purple-200 text-blue-600 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 group"
                    >
                      <Camera className="h-6 w-6 group-hover:animate-camera-shutter" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    className="bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 border-2 border-blue-400 text-white px-4 py-3 animate-in zoom-in-95 duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📸</span>
                      <div>
                        <p className="font-bold text-sm">{t('postCreator.uploadMediaTitle')}</p>
                        <p className="text-xs text-blue-200">{t('postCreator.uploadMediaDesc')}</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* ✨ AI Enhancement Icon Button */}
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleEnhanceContent}
                      disabled={isEnhancing || !content.trim()}
                      style={{ 
                        animation: 'iconEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards',
                      }}
                      className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 group ${
                        isEnhancing
                          ? 'bg-gradient-to-br from-purple-400 via-purple-500 to-pink-600 text-white shadow-xl animate-pulse'
                          : 'bg-gradient-to-br from-purple-50 to-pink-100 hover:from-purple-100 hover:to-pink-200 text-purple-600 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className={`h-6 w-6 ${isEnhancing ? 'animate-spin' : 'group-hover:animate-sparkle-twinkle'}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 border-2 border-purple-400 text-white px-4 py-3 animate-in zoom-in-95 duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✨</span>
                      <div>
                        <p className="font-bold text-sm">{isEnhancing ? t('postCreator.aiEnhancing') : t('postCreator.aiEnhance')}</p>
                        <p className="text-xs text-purple-200">{t('postCreator.aiEnhanceDesc')}</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* 🌍 Visibility Icon Button */}
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowVisibility(!showVisibility)}
                      style={{ 
                        animation: 'iconEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s backwards',
                      }}
                      className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 group ${
                        showVisibility
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl animate-pulse'
                          : 'bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 text-green-600 shadow-lg hover:shadow-2xl'
                      }`}
                    >
                      {visibility === 'public' && <Globe className={`h-6 w-6 ${showVisibility ? 'animate-globe-spin' : 'group-hover:animate-globe-spin'}`} />}
                      {visibility === 'friends' && <Users className="h-6 w-6" />}
                      {visibility === 'private' && <Lock className="h-6 w-6" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    className="bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 border-2 border-green-400 text-white px-4 py-3 animate-in zoom-in-95 duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {visibility === 'public' && '🌍'}
                        {visibility === 'friends' && '👥'}
                        {visibility === 'private' && '🔒'}
                      </span>
                      <div>
                        <p className="font-bold text-sm">{t('postCreator.visibilityTitle')}</p>
                        <p className="text-xs text-green-200">{t('postCreator.visibilityDesc')}</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              </div>

              {/* Right Side: Share Memory Button (Larger & Prominent) */}
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => {
                        handleSubmit(e);
                      }}
                      disabled={createPostMutation.isPending || isUploading || (!content.trim() && internalMediaUrls.length === 0 && mediaFiles.length === 0)}
                      style={{ 
                        animation: 'iconEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s backwards',
                      }}
                      className={`relative group p-6 rounded-2xl transition-all duration-500 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                        createPostMutation.isPending || isUploading
                          ? 'bg-gradient-to-br from-turquoise-400 via-cyan-500 to-blue-500 text-white shadow-2xl animate-pulse'
                          : 'bg-gradient-to-br from-turquoise-500 via-cyan-500 to-blue-600 hover:from-turquoise-600 hover:via-cyan-600 hover:to-blue-700 text-white shadow-xl hover:shadow-3xl'
                      }`}
                    >
                      {/* Animated gradient overlay */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Pulsing glow ring when ready to post */}
                      {!createPostMutation.isPending && !isUploading && (content.trim() || internalMediaUrls.length > 0) && (
                        <div className="absolute -inset-1 bg-gradient-to-r from-turquoise-400 via-cyan-400 to-blue-500 rounded-2xl opacity-75 blur animate-pulse" />
                      )}
                      
                      {(createPostMutation.isPending || isUploading) ? (
                        <Loader className="h-7 w-7 animate-spin relative z-10" />
                      ) : (
                        <Send className="h-7 w-7 relative z-10 group-hover:animate-send-fly" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    className="bg-gradient-to-br from-turquoise-900 via-cyan-800 to-blue-900 border-2 border-turquoise-400 text-white px-4 py-3 animate-in zoom-in-95 duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✨</span>
                      <div>
                        <p className="font-bold text-sm">
                          {createPostMutation.isPending || isUploading ? t('postCreator.sharing') : editMode ? t('postCreator.saveChanges') : t('postCreator.shareMemory')}
                        </p>
                        <p className="text-xs text-turquoise-200">
                          {(!content.trim() && internalMediaUrls.length === 0) ? t('postCreator.writeFirst') : t('postCreator.shareWithCommunity')}
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Visibility Options Table - Shows when icon is clicked */}
            {showVisibility && (
              <div className="grid grid-cols-3 gap-3 mt-3 animate-in slide-in-from-top-2 duration-300">
                <button
                  onClick={() => {
                    setVisibility('public');
                    setShowVisibility(false);
                  }}
                  className={`group relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    visibility === 'public'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl'
                      : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200/60 hover:border-green-300 shadow-sm hover:shadow-lg'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Globe className={`h-6 w-6 ${visibility === 'public' ? 'text-white' : 'text-green-600'}`} />
                    <span className="text-sm font-semibold">{t('postCreator.public')}</span>
                    <span className="text-xs opacity-75">{t('postCreator.everyone')}</span>
                  </div>
                  {visibility === 'public' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setVisibility('friends');
                    setShowVisibility(false);
                  }}
                  className={`group relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    visibility === 'friends'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl'
                      : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200/60 hover:border-blue-300 shadow-sm hover:shadow-lg'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Users className={`h-6 w-6 ${visibility === 'friends' ? 'text-white' : 'text-blue-600'}`} />
                    <span className="text-sm font-semibold">{t('postCreator.friends')}</span>
                    <span className="text-xs opacity-75">{t('postCreator.friendsOnly')}</span>
                  </div>
                  {visibility === 'friends' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setVisibility('private');
                    setShowVisibility(false);
                  }}
                  className={`group relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    visibility === 'private'
                      ? 'bg-gradient-to-br from-gray-500 to-gray-700 text-white shadow-xl'
                      : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200/60 hover:border-gray-300 shadow-sm hover:shadow-lg'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Lock className={`h-6 w-6 ${visibility === 'private' ? 'text-white' : 'text-gray-600'}`} />
                    <span className="text-sm font-semibold">{t('postCreator.private')}</span>
                    <span className="text-xs opacity-75">{t('postCreator.onlyMe')}</span>
                  </div>
                  {visibility === 'private' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </div>
            )}

            {/* Hidden file input from InternalUploader */}
            <div className="hidden">
              <InternalUploader
                onUploadComplete={(files) => {
                  const urls = files.map(f => f.url);
                  setInternalMediaUrls(prev => [...prev, ...urls]);
                  setMediaPreviews(prev => [...prev, ...urls]);
                  console.log(`[Internal Upload] ✅ Added ${files.length} files to post`);
                }}
                onProgress={(progress, uploading) => {
                  setIsUploading(uploading);
                  setUploadProgress(progress);
                }}
                maxFiles={30}
                maxFileSize={500}
                className=""
              />
            </div>
            
            <div className="relative">

              {/* Aurora Tide Recommendations - Glassmorphic Design */}
              {isRecommendation && (
                <div 
                  className="mt-3 p-6 rounded-2xl space-y-5 shadow-xl animate-in slide-in-from-top-4 duration-500 relative backdrop-blur-xl dark:backdrop-blur-2xl"
                  style={{
                    background: 'linear-gradient(135deg, hsl(173 80% 64% / 0.15) 0%, hsl(177 72% 56% / 0.12) 25%, hsl(180 64% 50% / 0.10) 50%, hsl(194 53% 27% / 0.12) 75%, hsl(173 80% 64% / 0.15) 100%)', // ocean-300 to ocean-500
                    backdropFilter: 'blur(20px)',
                    border: '1px solid hsl(173 80% 64% / 0.3)', // ocean-300
                    boxShadow: '0 8px 32px hsl(220 29% 33% / 0.15), inset 0 1px 1px hsl(0 0% 100% / 0.5)'
                  }}
                >
                  {/* Glassmorphic Header */}
                  <div className="flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-turquoise-400/30 dark:border-turquoise-300/20"></div>
                    </div>
                    <div 
                      className="relative px-6 py-3 rounded-full shadow-lg backdrop-blur-md"
                      style={{
                        background: 'linear-gradient(135deg, hsl(173 80% 64% / 0.25), hsl(177 72% 56% / 0.20))', // ocean-300 to ocean-500
                        border: '1px solid hsl(173 80% 64% / 0.4)' // ocean-300
                      }}
                    >
                      <span className="text-sm font-bold bg-gradient-to-r from-turquoise-700 to-cyan-700 dark:from-turquoise-300 dark:to-cyan-300 bg-clip-text text-transparent flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-turquoise-600 dark:text-turquoise-400" />
                        Share a Recommendation
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5 relative z-10">
                    {/* Category Selection */}
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        Category
                      </span>
                      <div className="relative">
                        <select
                          value={recommendationType}
                          onChange={(e) => setRecommendationType(e.target.value)}
                          className="w-full p-4 pl-12 pr-12 rounded-xl backdrop-blur-md border border-turquoise-300/40 dark:border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-turquoise-400/50 dark:focus:ring-cyan-400/50 focus:border-turquoise-500 dark:focus:border-cyan-500 font-medium text-gray-900 dark:text-gray-100 appearance-none cursor-pointer transition-all hover:border-turquoise-400 dark:hover:border-cyan-400 shadow-md"
                          style={{
                            background: 'linear-gradient(to bottom, hsl(0 0% 100% / 0.85), hsl(166 76% 97% / 0.75))', // white to teal-50
                            backdropFilter: 'blur(12px)'
                          }}
                          data-testid="select-recommendation-type"
                        >
                          <option value="">Select a category...</option>
                          <option value="restaurant">🍽️ Restaurant</option>
                          <option value="cafe">☕ Cafe</option>
                          <option value="hotel">🏨 Hotel</option>
                          <option value="venue">💃 Venue</option>
                        </select>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                          {recommendationType === 'restaurant' ? '🍽️' : 
                           recommendationType === 'cafe' ? '☕' :
                           recommendationType === 'hotel' ? '🏨' :
                           recommendationType === 'venue' ? '💃' : '📍'}
                        </div>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-turquoise-600 dark:text-cyan-400 pointer-events-none" />
                      </div>
                    </label>

                    {/* Price Range */}
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                        <span className="text-lg">💵</span>
                        Price Range
                      </span>
                      <div className="grid grid-cols-3 gap-3">
                        {['$', '$$', '$$$'].map((price, idx) => (
                          <button
                            key={price}
                            type="button"
                            onClick={() => setPriceRange(price)}
                            className={`relative p-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden backdrop-blur-md ${
                              priceRange === price
                                ? 'text-white shadow-xl transform scale-105'
                                : 'text-gray-700 dark:text-gray-300 hover:scale-105 border border-turquoise-200/60 dark:border-cyan-400/30 shadow-md hover:shadow-lg'
                            }`}
                            style={
                              priceRange === price
                                ? {
                                    background: 'linear-gradient(135deg, hsl(173 80% 64%), hsl(177 72% 56%), hsl(180 64% 50%))', // ocean-300 to ocean-500 to ocean-600
                                    border: '1px solid hsl(173 80% 64% / 0.5)', // ocean-300
                                    boxShadow: '0 8px 24px hsl(177 72% 56% / 0.4)' // ocean-500
                                  }
                                : {
                                    background: 'linear-gradient(to bottom, hsl(0 0% 100% / 0.7), hsl(166 76% 97% / 0.6))', // white to teal-50
                                    backdropFilter: 'blur(10px)'
                                  }
                            }
                            data-testid={`button-price-${price}`}
                          >
                            <div className="text-xl mb-1">{price}</div>
                            <div className="text-xs font-medium">
                              {price === '$' ? t('memories.price.budget') : price === '$$' ? t('memories.price.moderate') : t('memories.price.luxury')}
                            </div>
                          </button>
                        ))}
                      </div>
                    </label>

                    {/* Location Search */}
                    <label className="block">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                        <span className="text-lg">🗺️</span>
                        Location
                      </span>
                      <div 
                        className="relative p-1 rounded-xl shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, hsl(173 80% 64% / 0.15), hsl(177 72% 56% / 0.10))', // ocean-300 to ocean-500
                          border: '1px solid hsl(173 80% 64% / 0.3)' // ocean-300
                        }}
                      >
                        <div className="relative">
                          <UnifiedLocationPicker
                            value={location}
                            onChange={handleLocationChange}
                            placeholder={t('memories.creator.searchPlace')}
                            className="border-turquoise-300/40 dark:border-cyan-500/30 rounded-lg shadow-sm"
                            biasToLocation={{ lat: -34.6037, lng: -58.3816 }}
                            searchTypes={[]}
                            showBusinessDetails={true}
                            allowManualEntry={true}
                          />
                        </div>
                      </div>
                      {location && (
                        <div 
                          className="mt-2 p-3 rounded-lg flex items-center gap-2 backdrop-blur-md"
                          style={{
                            background: 'linear-gradient(135deg, hsl(173 80% 64% / 0.2), hsl(177 72% 56% / 0.15))', // ocean-300 to ocean-500
                            border: '1px solid hsl(173 80% 64% / 0.4)' // ocean-300
                          }}
                        >
                          <MapPin className="h-5 w-5 text-turquoise-600 dark:text-turquoise-400" />
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {location}
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Tags Selection Area - Shows when # icon is clicked */}
            {showTags && (
              <div className="flex flex-wrap gap-3 mt-3 animate-in slide-in-from-top-2 duration-300">
                {predefinedTags.map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag.value) 
                          ? prev.filter(t => t !== tag.value)
                          : [...prev, tag.value]
                      );
                    }}
                    className={`group relative px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      selectedTags.includes(tag.value)
                        ? 'bg-gradient-to-r from-turquoise-500 to-cyan-600 text-white shadow-xl hover:shadow-2xl hover:from-turquoise-600 hover:to-cyan-700'
                        : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200/60 hover:border-turquoise-300 shadow-sm hover:shadow-lg'
                    }`}
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <span className="text-lg transform group-hover:rotate-12 transition-transform">{tag.emoji}</span>
                      <span>{tag.label}</span>
                    </span>
                    {selectedTags.includes(tag.value) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-turquoise-600 to-cyan-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ESA LIFE CEO 61x21 - Enhanced Upload Progress Bar */}
          {(isUploading || uploadProgress > 0) && (
            <div className="mt-4 p-6 bg-gradient-to-r from-turquoise-100 to-cyan-100 rounded-xl border-2 border-turquoise-400 shadow-2xl animate-pulse">
              <div className="flex items-center justify-between text-base mb-4">
                <span className="text-gray-800 flex items-center gap-3">
                  <Loader className="h-7 w-7 animate-spin text-turquoise-700" />
                  <span className="font-bold text-lg">Uploading your media...</span>
                </span>
                <span className="font-bold text-3xl text-turquoise-800">{uploadProgress}%</span>
              </div>
              <div className="relative h-8 bg-gray-300 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-turquoise-500 via-cyan-500 to-blue-500 transition-all duration-300 ease-out rounded-full shadow-lg"
                  style={{ 
                    width: `${uploadProgress}%`,
                    boxShadow: '0 4px 6px hsl(192 100% 43% / 0.5)' // cyan-600
                  }}
                >
                  {/* Animated stripe effect */}
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-3 flex items-center gap-2 font-medium">
                📤 Upload progress
                {uploadProgress > 0 && uploadProgress < 100 && `: ${uploadProgress}%`}
                {uploadProgress === 100 && ': Complete! Processing...'}
              </p>
            </div>
          )}


          {/* ESA LIFE CEO 61x21 - OLD FILE INPUT DISABLED - USE CLOUDINARY ONLY */}
          {/* <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="hidden"
          /> */}


          {/* AI Enhancement Preview Modal */}
          {showEnhancement && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                      AI Enhanced Content
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={dismissEnhancement}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Original:</h4>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        {content}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Enhanced:</h4>
                      <div className="p-3 bg-purple-50 rounded-lg text-sm">
                        {enhancedContent}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <Button
                      onClick={useEnhancedContent}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Use Enhanced Version
                    </Button>
                    <Button
                      variant="outline"
                      onClick={dismissEnhancement}
                      className="flex-1"
                    >
                      Keep Original
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}