/**
 * ESA LIFE CEO 61x21 - Advanced Media Processor
 * Facebook/Instagram-style universal media handling
 * FIXED: Removed FFmpeg dependency - uses native browser APIs for reliability
 */

import heic2any from 'heic2any';
import { compressImageNative } from './nativeImageCompression';

console.log('📦 [Media Processor] Initialized with native compression (FFmpeg disabled for Replit compatibility)');

/**
 * Detect file format and capabilities
 */
function detectMediaType(file: File): {
  type: 'image' | 'video' | 'audio' | 'unknown';
  format: string;
  needsConversion: boolean;
  targetFormat?: string;
} {
  const mimeType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  // HEIC/HEIF detection (iPhone photos)
  if (fileName.endsWith('.heic') || fileName.endsWith('.heif') || 
      mimeType.includes('heic') || mimeType.includes('heif')) {
    return {
      type: 'image',
      format: 'heic',
      needsConversion: true,
      targetFormat: 'jpeg'
    };
  }
  
  // ProRes/MOV detection (iPhone videos)
  if (fileName.endsWith('.mov') || mimeType.includes('quicktime')) {
    return {
      type: 'video',
      format: 'mov',
      needsConversion: true,
      targetFormat: 'mp4'
    };
  }
  
  // RAW image formats (DSLR)
  const rawFormats = ['.cr2', '.nef', '.arw', '.dng', '.orf', '.rw2'];
  if (rawFormats.some(ext => fileName.endsWith(ext))) {
    return {
      type: 'image',
      format: 'raw',
      needsConversion: true,
      targetFormat: 'jpeg'
    };
  }
  
  // Standard formats
  if (mimeType.startsWith('image/')) {
    return {
      type: 'image',
      format: mimeType.split('/')[1],
      needsConversion: false
    };
  }
  
  if (mimeType.startsWith('video/')) {
    return {
      type: 'video',
      format: mimeType.split('/')[1],
      needsConversion: !['mp4', 'webm'].includes(mimeType.split('/')[1])
    };
  }
  
  return { type: 'unknown', format: 'unknown', needsConversion: true };
}

/**
 * Convert HEIC/HEIF to JPEG (iPhone photos)
 */
async function convertHeicToJpeg(file: File): Promise<File> {
  console.log('📱 Converting HEIC/HEIF to JPEG...');
  
  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    }) as Blob;
    
    const convertedFile = new File(
      [convertedBlob],
      file.name.replace(/\.(heic|heif)$/i, '.jpg'),
      { type: 'image/jpeg' }
    );
    
    console.log('✅ HEIC conversion successful');
    return convertedFile;
  } catch (error) {
    console.error('❌ HEIC conversion failed:', error);
    throw error;
  }
}

/**
 * Use WebCodecs API for hardware-accelerated video compression
 * Falls back to MediaRecorder if WebCodecs not available
 */
async function compressVideoWebCodecs(file: File): Promise<File> {
  // Check if WebCodecs is available (Chrome/Edge)
  if (!('VideoEncoder' in window)) {
    console.log('⚠️ WebCodecs not available, using fallback');
    return compressVideoFallback(file);
  }
  
  console.log('⚡ Using WebCodecs API for hardware acceleration');
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    video.src = URL.createObjectURL(file);
    
    video.onloadedmetadata = async () => {
      // Instagram-style dimensions
      const maxWidth = 1080;
      const maxHeight = 1920;
      
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      // Scale down if needed
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const chunks: EncodedVideoChunk[] = [];
      let encoder: VideoEncoder;
      
      try {
        encoder = new VideoEncoder({
          output: (chunk) => {
            chunks.push(chunk);
          },
          error: (error) => {
            console.error('WebCodecs error:', error);
            reject(error);
          }
        });
        
        // Instagram-quality settings
        encoder.configure({
          codec: 'vp09.00.10.08', // VP9 for better compression
          width,
          height,
          bitrate: 1_000_000, // 1 Mbps
          framerate: 30,
          latencyMode: 'quality',
          hardwareAcceleration: 'prefer-hardware'
        });
        
        // Process frames
        video.play();
        
        const processFrame = async () => {
          if (video.ended) {
            // CRITICAL FIX: Await flush() to ensure all frames are encoded before creating blob
            try {
              await encoder.flush();
              console.log('✅ WebCodecs encoder flushed successfully');
            } catch (flushError) {
              console.error('⚠️ WebCodecs flush error:', flushError);
              // Continue with available chunks even if flush fails
            }
            
            // Convert chunks to file AFTER flush completes
            const blob = new Blob(chunks as any, { type: 'video/webm' });
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.webm'),
              { type: 'video/webm' }
            );
            
            console.log(`✅ WebCodecs compression complete: ${(file.size/1024/1024).toFixed(2)}MB → ${(compressedFile.size/1024/1024).toFixed(2)}MB`);
            resolve(compressedFile);
            return;
          }
          
          ctx.drawImage(video, 0, 0, width, height);
          
          const frame = new VideoFrame(canvas, {
            timestamp: video.currentTime * 1_000_000
          });
          
          if (encoder.state === 'configured') {
            encoder.encode(frame);
          }
          frame.close();
          
          requestAnimationFrame(processFrame);
        };
        
        processFrame();
        
      } catch (error) {
        console.error('WebCodecs encoding failed:', error);
        // Fall back to standard compression
        resolve(await compressVideoFallback(file));
      }
    };
    
    video.onerror = () => {
      reject(new Error('Video loading failed'));
    };
  });
}

/**
 * Fallback video compression using MediaRecorder
 * Safari-compatible with automatic codec detection
 */
async function compressVideoFallback(file: File): Promise<File> {
  const sizeMB = file.size / 1024 / 1024;
  console.log(`🎥 Compressing ${sizeMB.toFixed(2)}MB video (fallback method)`);
  
  // Return if already small
  if (sizeMB < 25) {
    console.log(`🎥 Video already small enough (${sizeMB.toFixed(2)}MB), skipping compression`);
    return file;
  }
  
  // Detect Safari-compatible MIME types
  const supportedMimes = [
    'video/webm;codecs=vp9',      // Chrome/Edge
    'video/webm;codecs=vp8',      // Older Chrome/Firefox
    'video/webm',                 // Generic WebM
    'video/mp4;codecs=h264',      // Safari fallback
    'video/mp4'                   // Generic MP4 (Safari)
  ];
  
  let selectedMime = supportedMimes[0];
  let selectedExtension = 'webm';
  
  // Find first supported MIME type
  for (const mime of supportedMimes) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime)) {
      selectedMime = mime;
      selectedExtension = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
      console.log(`🎥 Selected MIME: ${selectedMime} (extension: ${selectedExtension})`);
      break;
    }
  }
  
  // If no supported MIME found (rare), return original
  if (!MediaRecorder.isTypeSupported || !MediaRecorder.isTypeSupported(selectedMime)) {
    console.warn(`⚠️ No supported video MIME types found, returning original file`);
    return file;
  }
  
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // iOS Safari compatibility settings
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', 'true');
    
    video.src = URL.createObjectURL(file);
    
    video.onloadedmetadata = async () => {
      canvas.width = Math.min(video.videoWidth, 1080);
      canvas.height = Math.min(video.videoHeight, 1920);
      
      // Create video stream from canvas
      const canvasStream = canvas.captureStream(30);
      const videoTrack = canvasStream.getVideoTracks()[0];
      
      // Attempt to preserve audio (Chrome/Firefox support)
      let finalStream = canvasStream;
      
      try {
        // Try to capture audio from the video element
        const mediaStream = (video as any).captureStream?.() || (video as any).mozCaptureStream?.();
        if (mediaStream) {
          const audioTracks = mediaStream.getAudioTracks();
          if (audioTracks.length > 0) {
            // Merge video from canvas + audio from original
            finalStream = new MediaStream([videoTrack, audioTracks[0]]);
            console.log('✅ Audio track preserved from original video');
          } else {
            console.log('ℹ️ No audio track in video (silent video or audio extraction failed)');
          }
        } else {
          console.log('ℹ️ captureStream not supported (Safari/iOS) - audio will not be included in compressed video');
        }
      } catch (audioError) {
        console.log('ℹ️ Could not capture audio stream, compressing video only:', audioError);
      }
      
      // Continue with compression regardless of audio capture success
      
      const mediaRecorder = new MediaRecorder(finalStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 1_000_000
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const mimeBase = selectedMime.split(';')[0];
        const blob = new Blob(chunks, { type: mimeBase });
        const compressedFile = new File(
          [blob],
          file.name.replace(/\.[^/.]+$/, `.${selectedExtension}`),
          { type: mimeBase }
        );
        console.log(`✅ Video compressed: ${sizeMB.toFixed(2)}MB → ${(compressedFile.size/1024/1024).toFixed(2)}MB (${selectedMime})`);
        
        // Cleanup
        URL.revokeObjectURL(video.src);
        resolve(compressedFile);
      };
      
      // iOS Safari playback handling
      try {
        await video.play();
        mediaRecorder.start();
        
        const drawFrame = () => {
          if (!video.ended && !video.paused && ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(drawFrame);
          } else if (video.ended) {
            mediaRecorder.stop();
          }
        };
        drawFrame();
        
      } catch (playError) {
        console.error(`❌ Video playback failed (likely iOS autoplay restriction):`, playError);
        // If playback fails, return original file
        URL.revokeObjectURL(video.src);
        resolve(file);
      }
    };
    
    video.onerror = () => {
      console.error(`❌ Video loading failed, returning original file`);
      URL.revokeObjectURL(video.src);
      resolve(file);
    };
  });
}

/**
 * REMOVED: FFmpeg dependency disabled for Replit compatibility
 * Videos are now compressed using native browser APIs (WebCodecs/MediaRecorder)
 */

/**
 * Smart image compression with format detection
 */
async function compressImageSmart(file: File): Promise<File> {
  const sizeMB = file.size / 1024 / 1024;
  console.log(`🖼️ [compressImageSmart] Using native Canvas compression for ${file.name} (${sizeMB.toFixed(2)}MB)`);
  
  // Use native Canvas-based compression (works in Replit, unlike browser-image-compression)
  const compressed = await compressImageNative(file, {
    maxSizeMB: sizeMB > 10 ? 0.8 : 1.5,
    maxWidthOrHeight: 1080,
    quality: sizeMB > 5 ? 0.8 : 0.9
  });
  
  console.log(`✅ [compressImageSmart] Native compression complete`);
  return compressed;
}

/**
 * Main processing function - handles ANY media format
 */
export async function processMediaUniversal(
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<File> {
  const mediaInfo = detectMediaType(file);
  console.log(`📁 [processMediaUniversal] ${file.name} detected as: type=${mediaInfo.type}, format=${mediaInfo.format}, needsConversion=${mediaInfo.needsConversion}`);
  
  onProgress?.('Analyzing file...', 10);
  
  try {
    // Handle HEIC/HEIF (iPhone photos)
    if (mediaInfo.format === 'heic') {
      console.log(`📱 [processMediaUniversal] Path: HEIC conversion`);
      onProgress?.('Converting iPhone photo...', 30);
      const jpegFile = await convertHeicToJpeg(file);
      onProgress?.('Compressing image...', 60);
      const compressed = await compressImageSmart(jpegFile);
      onProgress?.('Complete!', 100);
      return compressed;
    }
    
    // Handle MOV/ProRes (iPhone videos) - Direct compression without FFmpeg
    if (mediaInfo.format === 'mov') {
      console.log(`📱 [processMediaUniversal] Path: MOV direct compression (FFmpeg skipped for Replit)`);
      onProgress?.('Compressing iPhone video...', 50);
      const compressed = await compressVideoWebCodecs(file);
      onProgress?.('Complete!', 100);
      console.log(`✅ [processMediaUniversal] MOV processing complete for ${file.name}`);
      return compressed;
    }
    
    // Handle standard images
    if (mediaInfo.type === 'image') {
      console.log(`🖼️ [processMediaUniversal] Path: Standard image compression`);
      onProgress?.('Compressing image...', 50);
      const compressed = await compressImageSmart(file);
      onProgress?.('Complete!', 100);
      console.log(`✅ [processMediaUniversal] Image processing complete for ${file.name}`);
      return compressed;
    }
    
    // Handle standard videos - Direct compression (FFmpeg removed)
    if (mediaInfo.type === 'video') {
      console.log(`🎥 [processMediaUniversal] Path: Video compression (FFmpeg skipped for Replit)`);
      onProgress?.('Compressing video...', 50);
      const compressed = await compressVideoWebCodecs(file);
      onProgress?.('Complete!', 100);
      console.log(`✅ [processMediaUniversal] Video processing complete for ${file.name}`);
      return compressed;
    }
    
    // Unknown format - return original (FFmpeg conversion removed)
    if (mediaInfo.type === 'unknown') {
      console.warn(`❓ [processMediaUniversal] Unknown format, returning original file (FFmpeg disabled)`);
      onProgress?.('Using original file', 100);
      return file;
    }
    
    console.log(`🔄 [processMediaUniversal] No processing path matched, returning original file`);
    return file;
    
  } catch (error) {
    console.error(`❌ [processMediaUniversal] Processing failed for ${file.name}:`, error);
    onProgress?.('Processing failed, using original', 100);
    return file;
  }
}

/**
 * Process multiple files in parallel with progress tracking
 */
export async function processMultipleMedia(
  files: File[],
  onProgress?: (current: number, total: number, status: string) => void
): Promise<File[]> {
  console.log(`🎯 [processMultipleMedia] Starting with ${files.length} files`);
  const results: File[] = [];
  let completed = 0;
  
  // Process in parallel but limit concurrency
  const batchSize = 3;
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(`📦 [processMultipleMedia] Processing batch ${Math.floor(i/batchSize) + 1}, files: ${batch.map(f => f.name).join(', ')}`);
    
    const batchResults = await Promise.all(
      batch.map(async (file, batchIndex) => {
        const fileNum = i + batchIndex + 1;
        console.log(`⏰ [File ${fileNum}/${files.length}] Starting: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);
        const startTime = Date.now();
        
        const processed = await processMediaUniversal(file, (status, progress) => {
          const overallProgress = ((completed + (progress / 100)) / files.length) * 100;
          console.log(`📊 [File ${fileNum}/${files.length}] ${status} - ${progress}% (overall: ${overallProgress.toFixed(0)}%)`);
          onProgress?.(completed + 1, files.length, status);
        });
        
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        completed++;
        console.log(`✅ [File ${fileNum}/${files.length}] Done in ${elapsed}s: ${processed.name} (${(processed.size/1024/1024).toFixed(2)}MB)`);
        onProgress?.(completed, files.length, `Processed ${file.name}`);
        return processed;
      })
    );
    
    results.push(...batchResults);
  }
  
  console.log(`🎉 [processMultipleMedia] All ${files.length} files processed successfully`);
  return results;
}

/**
 * Smart upload decision based on file size and type
 */
export function getUploadStrategy(file: File): {
  method: 'direct' | 'compressed' | 'chunked' | 'background';
  reason: string;
} {
  const sizeMB = file.size / 1024 / 1024;
  const mediaInfo = detectMediaType(file);
  
  // Facebook/Instagram strategy
  if (sizeMB < 10 && !mediaInfo.needsConversion) {
    return {
      method: 'direct',
      reason: 'Small file, no compression needed'
    };
  }
  
  if (sizeMB < 100) {
    return {
      method: 'compressed',
      reason: 'Medium file, will compress before upload'
    };
  }
  
  if (sizeMB < 500) {
    return {
      method: 'chunked',
      reason: 'Large file, will upload in chunks'
    };
  }
  
  return {
    method: 'background',
    reason: 'Very large file, will upload in background'
  };
}

export default {
  processMediaUniversal,
  processMultipleMedia,
  getUploadStrategy,
  detectMediaType
};