import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LocationInput from './LocationInput';
import { Progress } from '@/components/ui/progress';
import { InternalUploader } from '@/components/upload/InternalUploader';
// ESA Layer 13: Advanced media processing with universal format support
import { processMultipleMedia, getUploadStrategy } from '@/utils/advancedMediaProcessor';
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
  Link2
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
    visibility: string;
    isRecommendation: boolean;
    recommendationType?: string;
    priceRange?: string;
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
}

export default function BeautifulPostCreator({ 
  context = { type: 'feed' }, 
  user,
  onPostCreated,
  onSubmit,
  editMode = false,
  existingPost,
  onEditComplete 
}: PostCreatorProps) {
  // ESA Layer 7 & 23: Initialize with existing post data in edit mode
  // ESA Layer 9: Rich text editing implementation
  const [content, setContent] = useState(existingPost?.content || '');
  const [richContent, setRichContent] = useState(existingPost?.richContent || existingPost?.content || '');
  const editorRef = useRef<HTMLDivElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(editMode); // Show advanced in edit mode
  const [showTags, setShowTags] = useState(false);
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
    { value: 'milonga', label: 'Milonga', emoji: '💃' },
    { value: 'practica', label: 'Práctica', emoji: '🎯' },
    { value: 'performance', label: 'Performance', emoji: '🎭' },
    { value: 'workshop', label: 'Workshop', emoji: '📚' },
    { value: 'festival', label: 'Festival', emoji: '🎪' },
    { value: 'travel', label: 'Travel', emoji: '✈️' },
    { value: 'music', label: 'Music', emoji: '🎵' },
    { value: 'fashion', label: 'Fashion', emoji: '👗' }
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
            title: `${details.name} selected! 📍`,
            description: `⭐ ${details.rating}/5 • ${details.address}`,
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
      title: "⚠️ Use Cloud Upload Instead",
      description: "Please use the '☁️ Cloud Upload' button for all media uploads",
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
          title: "Invalid file type",
          description: "Please upload only images or videos",
          variant: "destructive"
        });
        return false;
      }

      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 500MB limit`,
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
      title: "Media added! 📸",
      description: `${validFiles.length} file(s) ready to upload`,
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
          title: "❌ Server Upload Blocked!",
          description: "Please use the 'Upload Media Files' button for ALL media. Direct file uploads are disabled.",
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
        title: editMode ? "Post updated! ✏️" : "Post created! 🎉", 
        description: editMode ? "Your changes have been saved" : "Your memory has been shared",
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

      // ESA LIFE CEO 61x21 - Layer 13: Complete cache invalidation for media display
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/memories'] });
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['/api/posts'] });
      
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
        title: "Error creating post",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  const handleEnhanceContent = async () => {
    if (!content.trim()) {
      toast({
        title: "No content to enhance",
        description: 'Please add some content to enhance',
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
          title: "Content enhanced with AI! ✨",
        });
      } else {
        toast({
          title: "AI enhancement unavailable",
          description: result.message || 'Could not enhance content',
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      toast({
        title: "Failed to enhance content",
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
      title: "Enhanced content applied!",
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
        title: "Please add content",
        description: "Your post can't be empty.",
        variant: "destructive"
      });
      return;
    }

    // Don't allow submission while uploading
    if (isUploading) {
      toast({
        title: "Upload in progress",
        description: "Please wait for the upload to complete",
        variant: "destructive"
      });
      return;
    }

    // If custom submit handler is provided (for memories feed), use it
    if (onSubmit) {
      console.log('🔄 ESA Layer 13: Using custom onSubmit handler!');
      console.log('🔍 [BeautifulPostCreator] Content being submitted:', content);
      onSubmit({
        content,
        emotions: [], // BeautifulPostCreator doesn't have emotions
        location: location || undefined,
        tags: selectedTags,
        mentions: mentions, // ESA Layer 24: Send validated mention IDs to API
        media: mediaFiles,
        visibility,
        isRecommendation,
        recommendationType,
        priceRange
      });

      // Reset form after submission
      setContent('');
      setRichContent('');
      setLocation('');
      setSelectedTags([]);
      setMediaFiles([]);
      setMediaPreviews([]);
      setCloudMediaUrls([]); // Reset cloud URLs
      setIsRecommendation(false);
      setRecommendationType('');
      setPriceRange('');
      setEnhancedContent('');
      setShowEnhancement(false);

      // Show success notification
      toast({
        title: "Memory created! 🎉",
        description: "Your moment has been shared",
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
      // Process all files with the advanced processor
      const processedFiles = await processMultipleMedia(
        files,
        (current, total, status) => {
          const progress = (current / total) * 100;
          setUploadProgress(progress);
          console.log(`📸 Processing ${current}/${total}: ${status}`);
        }
      );

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
          const videoUrl = URL.createObjectURL(file);
          setMediaPreviews(prev => [...prev, videoUrl]);
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
        description: "Some formats couldn't be converted, using originals",
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
    <div className="w-full">
      <Card className="relative overflow-hidden border-0 glassmorphic-card beautiful-hover shadow-2xl">
        {/* Enhanced gradient background with animation */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-turquoise-400/30 via-cyan-400/20 to-blue-500/30 animate-gradient" />
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/10 via-transparent to-pink-400/10 animate-gradient-reverse" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-turquoise-300/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="relative z-10 p-8">
          {/* Enhanced Header with better styling */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-turquoise-400 to-blue-600 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-turquoise-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-xl transform transition-transform group-hover:scale-110">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover border-2 border-white/50" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">{user?.name}</h3>
              <p className="text-sm text-gray-500">@{user?.username}</p>
            </div>
          </div>

          {/* Main content area */}
          <div className="space-y-5">
            {/* Visibility Dropdown - Added above post body */}
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-gray-600">Post visibility:</span>
              <div className="relative">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'friends' | 'private')}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-turquoise-300 focus:outline-none focus:ring-2 focus:ring-turquoise-400/30 focus:border-turquoise-400 transition-all cursor-pointer"
                >
                  <option value="public">🌍 Public</option>
                  <option value="friends">👥 Friends Only</option>
                  <option value="private">🔒 Private</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* ESA Layer 9: Rich Text Editor - Simplified for stability */}
            <div className="relative">
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
                placeholder={editMode ? "✏️ Edit your post..." : "✨ Share your tango moment and @mention people..."}
                className="w-full"
                disabled={isUploading || createPostMutation.isPending}
                rows={6}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {content.length > 0 && `${content.length} characters`}
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

            {/* Icon Buttons Row: Hidden Gems, Tags, Upload */}
            <div className="flex items-center gap-3">
              {/* 🗺️ Hidden Gems */}
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsRecommendation(!isRecommendation)}
                      className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 hover:rotate-3 ${
                        isRecommendation 
                          ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white shadow-xl animate-pulse' 
                          : 'bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-600 shadow-lg hover:shadow-2xl'
                      }`}
                    >
                      <MapPin className="h-6 w-6" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 border-2 border-amber-400 text-white px-4 py-3 animate-in zoom-in-95 duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✨</span>
                      <div>
                        <p className="font-bold text-sm">Discover Hidden Gems</p>
                        <p className="text-xs text-amber-200">Share your treasure map with the community</p>
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
                      className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 hover:-rotate-3 ${
                        showTags || selectedTags.length > 0
                          ? 'bg-gradient-to-br from-turquoise-500 to-cyan-600 text-white shadow-xl animate-pulse' 
                          : 'bg-gradient-to-br from-turquoise-50 to-cyan-100 hover:from-turquoise-100 hover:to-cyan-200 text-turquoise-600 shadow-lg hover:shadow-2xl'
                      }`}
                    >
                      <Hash className="h-6 w-6" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    className="bg-gradient-to-br from-turquoise-900 via-cyan-800 to-blue-900 border-2 border-cyan-400 text-white px-4 py-3 animate-in zoom-in-95 duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏷️</span>
                      <p className="font-bold text-sm">#add tags to your memory</p>
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
                      className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-100 hover:from-blue-100 hover:to-purple-200 text-blue-600 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:rotate-3"
                    >
                      <Camera className="h-6 w-6" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    className="bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 border-2 border-blue-400 text-white px-4 py-3 animate-in zoom-in-95 duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📸</span>
                      <div>
                        <p className="font-bold text-sm">Upload Media Files</p>
                        <p className="text-xs text-blue-200">support images and videos - max 30 files - up to 500mb each</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Hidden file input from InternalUploader */}
            <div className="hidden">
              <InternalUploader
                onUploadComplete={(files) => {
                  const urls = files.map(f => f.url);
                  setInternalMediaUrls(prev => [...prev, ...urls]);
                  setMediaPreviews(prev => [...prev, ...urls]);
                  console.log(`[Internal Upload] ✅ Added ${files.length} files to post`);
                }}
                maxFiles={30}
                maxFileSize={500}
                className=""
              />
            </div>
            
            <div className="relative">

              {/* Treasure Map Unfolding - Content Area */}
              {isRecommendation && (
                <div 
                  className="mt-3 p-6 rounded-2xl space-y-5 border-2 shadow-2xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 25%, #fcd34d 50%, #fde68a 75%, #fef3c7 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-shift 8s ease infinite',
                    borderColor: '#d97706'
                  }}
                >
                  {/* Vintage paper texture overlay */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" 
                       style={{
                         backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(120, 53, 15, 0.03) 2px, rgba(120, 53, 15, 0.03) 4px)`
                       }}
                  />
                  
                  {/* Compass Rose Header */}
                  <div className="flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-dashed border-amber-700/30"></div>
                    </div>
                    <div className="relative bg-gradient-to-br from-yellow-50 to-amber-100 px-4 py-2 rounded-full border-2 border-amber-700/40 shadow-md">
                      <span className="text-sm font-bold text-amber-900 flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="9"/>
                          <path d="M12 3 L12 6 M12 18 L12 21 M3 12 L6 12 M18 12 L21 12"/>
                          <path d="M12 12 L15 9"/>
                        </svg>
                        MARK YOUR TREASURE
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    {/* Category Selection - Treasure Type */}
                    <label className="block">
                      <span className="text-sm font-bold text-amber-950 mb-2 flex items-center gap-2">
                        <span className="text-xl">💎</span>
                        What treasure did you find?
                      </span>
                      <div className="relative">
                        <select
                          value={recommendationType}
                          onChange={(e) => setRecommendationType(e.target.value)}
                          className="w-full p-4 pl-12 pr-12 rounded-xl bg-white/95 backdrop-blur-sm border-2 border-amber-700/40 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:border-amber-600 font-semibold text-gray-900 appearance-none cursor-pointer transition-all hover:border-amber-600 shadow-inner"
                          style={{
                            backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(254,243,199,0.3))'
                          }}
                        >
                          <option value="">Choose your treasure type...</option>
                          <option value="restaurant">🍽️ Dining Hall</option>
                          <option value="cafe">☕ Cozy Tavern</option>
                          <option value="hotel">🏨 Inn & Lodge</option>
                          <option value="venue">💃 Grand Ballroom</option>
                        </select>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
                          {recommendationType === 'restaurant' ? '🍽️' : 
                           recommendationType === 'cafe' ? '☕' :
                           recommendationType === 'hotel' ? '🏨' :
                           recommendationType === 'venue' ? '💃' : '🗺️'}
                        </div>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-800 pointer-events-none" />
                      </div>
                    </label>

                    {/* Price Range - Treasure Value */}
                    <label className="block">
                      <span className="text-sm font-bold text-amber-950 mb-2 flex items-center gap-2">
                        <span className="text-xl">💰</span>
                        Treasure value
                      </span>
                      <div className="grid grid-cols-3 gap-3">
                        {['$', '$$', '$$$'].map((price, idx) => (
                          <button
                            key={price}
                            type="button"
                            onClick={() => setPriceRange(price)}
                            className={`relative p-4 rounded-xl font-bold transition-all duration-300 overflow-hidden ${
                              priceRange === price
                                ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-white shadow-xl transform scale-105 border-2 border-amber-600'
                                : 'bg-white/90 text-amber-800 hover:bg-amber-50 border-2 border-amber-300/60 hover:border-amber-400 shadow-md hover:shadow-lg'
                            }`}
                          >
                            <div className="text-2xl mb-1">{price}</div>
                            <div className="text-xs font-semibold">
                              {price === '$' ? '⭐ Budget' : price === '$$' ? '⭐⭐ Moderate' : '⭐⭐⭐ Luxury'}
                            </div>
                            {priceRange === price && (
                              <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 to-transparent animate-pulse" />
                            )}
                          </button>
                        ))}
                      </div>
                    </label>

                    {/* Location Search - Mark on Map */}
                    <label className="block">
                      <span className="text-sm font-bold text-amber-950 mb-2 flex items-center gap-2">
                        <span className="text-xl">📍</span>
                        Mark it on the map
                      </span>
                      <div className="relative p-1 rounded-xl bg-gradient-to-br from-amber-200 via-yellow-200 to-amber-200 shadow-inner">
                        <div className="relative">
                          <LocationInput
                            value={location}
                            onChange={handleLocationChange}
                            placeholder="🔍 Search for your hidden gem..."
                            className="border-2 border-amber-600/40 rounded-lg shadow-md"
                            biasToLocation={{ lat: -34.6037, lng: -58.3816 }}
                            searchTypes={[]}
                            showBusinessDetails={true}
                          />
                        </div>
                      </div>
                      {location && (
                        <div className="mt-2 p-3 bg-white/80 rounded-lg border-2 border-dashed border-amber-600/40 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-amber-700 animate-bounce" />
                          <span className="text-sm font-semibold text-amber-900">
                            Treasure marked: {location}
                          </span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Decorative map corner markers */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-t-3 border-l-3 border-amber-800/30" style={{ borderTopWidth: '3px', borderLeftWidth: '3px' }} />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-3 border-r-3 border-amber-800/30" style={{ borderTopWidth: '3px', borderRightWidth: '3px' }} />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b-3 border-l-3 border-amber-800/30" style={{ borderBottomWidth: '3px', borderLeftWidth: '3px' }} />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b-3 border-r-3 border-amber-800/30" style={{ borderBottomWidth: '3px', borderRightWidth: '3px' }} />
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
                    boxShadow: '0 4px 6px rgba(0, 184, 217, 0.5)'
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

          {/* Enhanced Action bar with better visual design */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* AI Enhancement Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleEnhanceContent}
                  disabled={isEnhancing || !content.trim()}
                  className="text-purple-600 hover:bg-purple-50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
                </Button>
              </div>

              <button
                onClick={(e) => {
                  // createRipple(e); // Temporarily disabled for performance
                  handleSubmit(e);
                }}
                // onMouseMove={magneticButton} // Temporarily disabled for performance
                // onMouseLeave={resetMagneticButton} // Temporarily disabled for performance
                disabled={createPostMutation.isPending || isUploading || (!content.trim() && internalMediaUrls.length === 0 && mediaFiles.length === 0)}
                className="group relative px-5 py-2 overflow-hidden rounded-lg font-medium text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                style={{
                  background: createPostMutation.isPending || isUploading || (!content.trim() && mediaFiles.length === 0) 
                    ? 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)'
                    : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-turquoise-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center space-x-2 text-white">
                  {createPostMutation.isPending ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>{editMode ? '💾 Save Changes' : '📝 Share Memory'}</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

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