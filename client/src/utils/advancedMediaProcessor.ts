/**
 * ESA LIFE CEO 61x21 - Advanced Media Processor
 * Facebook/Instagram-style universal media handling
 * Supports ALL formats using FFmpeg.wasm and WebCodecs API
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import heic2any from 'heic2any';
import imageCompression from 'browser-image-compression';

// Singleton FFmpeg instance
let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoaded = false;

/**
 * Initialize FFmpeg.wasm (20MB download, one-time)
 */
async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegLoaded) {
    return ffmpegInstance;
  }

  console.log('🎬 Loading FFmpeg.wasm for universal media support...');
  
  ffmpegInstance = new FFmpeg();
  
  // Configure with CDN URLs for core files
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  
  try {
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    ffmpegLoaded = true;
    console.log('✅ FFmpeg.wasm loaded successfully');
    return ffmpegInstance;
  } catch (error) {
    console.error('❌ FFmpeg.wasm failed to load:', error);
    throw error;
  }
}

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
        
        const processFrame = () => {
          if (video.ended) {
            encoder.flush();
            
            // Convert chunks to file
            const blob = new Blob(chunks as any, { type: 'video/webm' });
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.webm'),
              { type: 'video/webm' }
            );
            
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
 */
async function compressVideoFallback(file: File): Promise<File> {
  const sizeMB = file.size / 1024 / 1024;
  console.log(`🎥 Compressing ${sizeMB.toFixed(2)}MB video (fallback method)`);
  
  // Return if already small
  if (sizeMB < 25) {
    return file;
  }
  
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.src = URL.createObjectURL(file);
    
    video.onloadedmetadata = () => {
      canvas.width = Math.min(video.videoWidth, 1080);
      canvas.height = Math.min(video.videoHeight, 1920);
      
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 1_000_000
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const compressedFile = new File(
          [blob],
          file.name.replace(/\.[^/.]+$/, '.webm'),
          { type: 'video/webm' }
        );
        resolve(compressedFile);
      };
      
      video.play();
      mediaRecorder.start();
      
      const drawFrame = () => {
        if (!video.ended && ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        } else {
          mediaRecorder.stop();
        }
      };
      drawFrame();
    };
  });
}

/**
 * Use FFmpeg.wasm for universal video format conversion
 */
async function convertVideoWithFFmpeg(file: File, targetFormat: string = 'mp4'): Promise<File> {
  console.log(`🎬 Converting video to ${targetFormat} using FFmpeg.wasm`);
  
  const ffmpeg = await loadFFmpeg();
  
  // Write input file
  const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
  const outputName = `output.${targetFormat}`;
  
  await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
  
  // Instagram-quality conversion
  await ffmpeg.exec([
    '-i', inputName,
    '-vf', 'scale=1080:-2',  // Scale to 1080p width
    '-c:v', 'libx264',        // H.264 codec
    '-preset', 'fast',        // Fast encoding
    '-crf', '28',            // Quality (lower = better, 23 default)
    '-c:a', 'aac',           // AAC audio
    '-b:a', '128k',          // Audio bitrate
    '-movflags', '+faststart', // Web optimization
    outputName
  ]);
  
  // Read output
  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data], { type: `video/${targetFormat}` });
  
  // Cleanup
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);
  
  return new File(
    [blob],
    file.name.replace(/\.[^/.]+$/, `.${targetFormat}`),
    { type: `video/${targetFormat}` }
  );
}

/**
 * Smart image compression with format detection
 */
async function compressImageSmart(file: File): Promise<File> {
  const sizeMB = file.size / 1024 / 1024;
  console.log(`🖼️ Compressing ${sizeMB.toFixed(2)}MB image`);
  
  // Instagram-style settings
  const options = {
    maxSizeMB: sizeMB > 10 ? 0.8 : 1.5,
    maxWidthOrHeight: 1080,
    useWebWorker: false, // Disabled - Vite worker issue causes upload hang
    fileType: file.type === 'image/png' ? 'image/jpeg' : file.type as any,
    initialQuality: sizeMB > 5 ? 0.8 : 0.9,
    alwaysKeepResolution: false
  };
  
  try {
    const compressed = await imageCompression(file, options);
    console.log(`✅ Compressed to ${(compressed.size / 1024 / 1024).toFixed(2)}MB`);
    return compressed;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file;
  }
}

/**
 * Main processing function - handles ANY media format
 */
export async function processMediaUniversal(
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<File> {
  const mediaInfo = detectMediaType(file);
  console.log(`📁 Processing ${file.name} (${mediaInfo.format})`);
  
  onProgress?.('Analyzing file...', 10);
  
  try {
    // Handle HEIC/HEIF (iPhone photos)
    if (mediaInfo.format === 'heic') {
      onProgress?.('Converting iPhone photo...', 30);
      const jpegFile = await convertHeicToJpeg(file);
      onProgress?.('Compressing image...', 60);
      const compressed = await compressImageSmart(jpegFile);
      onProgress?.('Complete!', 100);
      return compressed;
    }
    
    // Handle MOV/ProRes (iPhone videos)
    if (mediaInfo.format === 'mov') {
      onProgress?.('Converting iPhone video...', 30);
      const mp4File = await convertVideoWithFFmpeg(file, 'mp4');
      onProgress?.('Compressing video...', 60);
      const compressed = await compressVideoWebCodecs(mp4File);
      onProgress?.('Complete!', 100);
      return compressed;
    }
    
    // Handle standard images
    if (mediaInfo.type === 'image') {
      onProgress?.('Compressing image...', 50);
      const compressed = await compressImageSmart(file);
      onProgress?.('Complete!', 100);
      return compressed;
    }
    
    // Handle standard videos
    if (mediaInfo.type === 'video') {
      if (mediaInfo.needsConversion) {
        onProgress?.('Converting video format...', 30);
        const converted = await convertVideoWithFFmpeg(file, 'mp4');
        onProgress?.('Compressing video...', 60);
        const compressed = await compressVideoWebCodecs(converted);
        onProgress?.('Complete!', 100);
        return compressed;
      } else {
        onProgress?.('Compressing video...', 50);
        const compressed = await compressVideoWebCodecs(file);
        onProgress?.('Complete!', 100);
        return compressed;
      }
    }
    
    // Unknown format - try FFmpeg conversion
    if (mediaInfo.type === 'unknown') {
      onProgress?.('Processing unknown format...', 30);
      try {
        // Try as video first
        const converted = await convertVideoWithFFmpeg(file, 'mp4');
        onProgress?.('Complete!', 100);
        return converted;
      } catch {
        // If video fails, return original
        console.warn('Unknown format, returning original');
        onProgress?.('Complete!', 100);
        return file;
      }
    }
    
    return file;
    
  } catch (error) {
    console.error('Processing failed:', error);
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
  const results: File[] = [];
  let completed = 0;
  
  // Process in parallel but limit concurrency
  const batchSize = 3;
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(async (file) => {
        const processed = await processMediaUniversal(file, (status, progress) => {
          const overallProgress = ((completed + (progress / 100)) / files.length) * 100;
          onProgress?.(completed + 1, files.length, status);
        });
        
        completed++;
        onProgress?.(completed, files.length, `Processed ${file.name}`);
        return processed;
      })
    );
    
    results.push(...batchResults);
  }
  
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
  detectMediaType,
  loadFFmpeg
};