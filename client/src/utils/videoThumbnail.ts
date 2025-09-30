/**
 * ESA LIFE CEO 61x21 - Layer 13: Media Processing
 * Extract thumbnail from video file for preview display
 */

export async function extractVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    // Create object URL for the video file
    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;

    // Extract frame when metadata is loaded
    video.onloadedmetadata = () => {
      // Seek to 1 second or 10% into video (whichever is smaller)
      const seekTime = Math.min(1, video.duration * 0.1);
      video.currentTime = seekTime;
    };

    // Extract frame when seeked
    video.onseeked = () => {
      try {
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
        URL.revokeObjectURL(videoUrl);
        reject(error);
      }
    };

    video.onerror = (error) => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('Failed to load video for thumbnail extraction'));
    };
  });
}
