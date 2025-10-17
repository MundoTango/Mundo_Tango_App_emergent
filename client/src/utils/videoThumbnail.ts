/**
 * ESA LIFE CEO 61x21 - Layer 13: Media Processing
 * Extract thumbnail from video file for preview display
 * Returns thumbnail data URL on success, or fallback video URL on failure
 */

export async function extractVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Graceful fallback: return video object URL if canvas not available
    if (!ctx) {
      console.warn('[Video Thumbnail] Canvas context not available, using video URL fallback');
      const fallbackUrl = URL.createObjectURL(file);
      resolve(fallbackUrl);
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    // Create object URL for the video file
    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;

    // Timeout fallback: if thumbnail extraction takes too long (>5s), use video URL
    const timeoutId = setTimeout(() => {
      console.warn('[Video Thumbnail] Extraction timeout, using video URL fallback');
      URL.revokeObjectURL(videoUrl);
      const fallbackUrl = URL.createObjectURL(file);
      resolve(fallbackUrl);
    }, 5000);

    // Extract frame when metadata is loaded
    video.onloadedmetadata = () => {
      // Seek to 1 second or 10% into video (whichever is smaller)
      const seekTime = Math.min(1, video.duration * 0.1);
      video.currentTime = seekTime;
    };

    // Extract frame when seeked
    video.onseeked = () => {
      try {
        clearTimeout(timeoutId);
        
        // Set canvas dimensions to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current frame onto canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 data URL
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Clean up
        URL.revokeObjectURL(videoUrl);
        
        resolve(thumbnailDataUrl);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('[Video Thumbnail] Frame extraction failed:', error);
        URL.revokeObjectURL(videoUrl);
        // Fallback to video object URL
        const fallbackUrl = URL.createObjectURL(file);
        resolve(fallbackUrl);
      }
    };

    video.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error('[Video Thumbnail] Video load failed:', error);
      URL.revokeObjectURL(videoUrl);
      // Fallback to video object URL
      const fallbackUrl = URL.createObjectURL(file);
      resolve(fallbackUrl);
    };
  });
}
