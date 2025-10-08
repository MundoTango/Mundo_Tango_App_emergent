import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, Video, X, CheckCircle, AlertCircle } from 'lucide-react';
import { processMultipleMedia } from '@/utils/advancedMediaProcessor';

interface UploadedFile {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

interface InternalUploaderProps {
  onUploadComplete: (files: UploadedFile[]) => void;
  onProgress?: (progress: number, isUploading: boolean) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export function InternalUploader({
  onUploadComplete,
  onProgress,
  maxFiles = 30,
  maxFileSize = 500,
  accept = "image/*,video/*,.heic,.heif,.mov,.mp4,.webm,.avi,.mkv,.flv,.wmv,.m4v,.3gp,.3g2",
  multiple = true,
  className = ""
}: InternalUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    console.log(`📁 [InternalUploader] File selection: ${files.length} files`, files.map(f => ({
      name: f.name,
      type: f.type,
      size: `${(f.size/1024/1024).toFixed(2)}MB`
    })));

    // Validate file count
    if (files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    onProgress?.(0, true);

    // Check for special formats (HEIC, MOV, etc)
    const fileTypes = files.map(f => {
      const name = f.name.toLowerCase();
      if (name.endsWith('.heic') || name.endsWith('.heif')) return 'HEIC (iPhone)';
      if (name.endsWith('.mov')) return 'MOV (iPhone Video)';
      return f.type.split('/')[0] || 'file';
    });

    toast({
      title: "🎬 Processing media...",
      description: `Optimizing ${fileTypes.join(', ')} for upload`
    });

    let currentPhase = 'file-selection';

    try {
      // PHASE 1: Compression (0-40%)
      currentPhase = 'compression';
      console.log(`🔄 [InternalUploader] Phase 1: Starting compression for ${files.length} files`);
      
      const processedFiles = await processMultipleMedia(
        files,
        (current, total, status) => {
          const progress = Math.min((current / total) * 40, 40); // First 40% for compression
          setUploadProgress(progress);
          onProgress?.(progress, true);
          console.log(`📊 [InternalUploader] Compression progress: ${current}/${total} - ${status} (${progress.toFixed(0)}%)`);
        }
      );
      
      console.log(`✅ [InternalUploader] Phase 1 complete: ${processedFiles.length} files compressed`);

      // Check if files are now within size limits after processing
      const oversizedFiles = processedFiles.filter(file => file.size > maxFileSize * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast({
          title: "Files still too large",
          description: `Even after compression, some files exceed ${maxFileSize}MB`,
          variant: "destructive"
        });
        // Continue with the files that are within limits
        const validFiles = processedFiles.filter(file => file.size <= maxFileSize * 1024 * 1024);
        if (validFiles.length === 0) {
          setIsUploading(false);
          return;
        }
      }

      // PHASE 2: Upload preparation (40-50%)
      currentPhase = 'upload-preparation';
      setUploadProgress(45);
      onProgress?.(45, true);
      
      const formData = new FormData();
      processedFiles.forEach(file => {
        formData.append('files', file);
      });

      const originalSize = files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024;
      const processedSize = processedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024;
      const compressionRatio = ((1 - processedSize / originalSize) * 100).toFixed(1);
      console.log(`📦 [InternalUploader] Phase 2: Upload ready - Compressed ${originalSize.toFixed(1)}MB → ${processedSize.toFixed(1)}MB (-${compressionRatio}%)`);

      // PHASE 3: Network upload (50-95%)
      currentPhase = 'network-upload';
      console.log(`🌐 [InternalUploader] Phase 3: Starting network upload to /api/upload`);
      
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const uploadProgress = 50 + Math.round((e.loaded / e.total) * 45); // 50-95%
          setUploadProgress(uploadProgress);
          onProgress?.(uploadProgress, true);
          console.log(`📡 [InternalUploader] Network upload: ${uploadProgress}% (${(e.loaded/1024/1024).toFixed(2)}MB / ${(e.total/1024/1024).toFixed(2)}MB)`);
        }
      });

      // Handle upload completion
      const uploadPromise = new Promise<UploadedFile[]>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                console.log('[Internal Upload] ✅ Upload successful:', response);
                resolve(response.files);
              } else {
                reject(new Error(response.error || 'Upload failed'));
              }
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error during upload'));
        };

        xhr.ontimeout = () => {
          reject(new Error('Upload timeout'));
        };
      });

      xhr.open('POST', '/api/upload');
      xhr.timeout = 0; // No timeout for large files
      xhr.send(formData);

      const newFiles = await uploadPromise;
      
      // PHASE 4: Storage & Display (95-100%)
      currentPhase = 'storage-display';
      console.log(`💾 [InternalUploader] Phase 4: Storage successful, displaying files`);
      setUploadProgress(98);
      onProgress?.(98, true);
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      onUploadComplete(newFiles);
      
      setUploadProgress(100);
      onProgress?.(100, true);
      
      console.log(`🎉 [InternalUploader] COMPLETE! ${newFiles.length} files uploaded successfully:`, newFiles);
      
      toast({
        title: "✅ Upload successful",
        description: `${newFiles.length} files uploaded (${compressionRatio}% compressed)`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reset progress after delay
      setTimeout(() => {
        setUploadProgress(0);
        onProgress?.(0, false);
      }, 2000);

    } catch (error) {
      // Enhanced error handling with phase detection
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      
      console.error(`❌ [InternalUploader] UPLOAD FAILED at phase: ${currentPhase}`);
      console.error(`❌ Error message:`, errorMessage);
      console.error(`❌ Error stack:`, errorStack);
      console.error(`❌ Error object:`, error);
      
      // Reset progress
      setUploadProgress(0);
      onProgress?.(0, false);
      
      // User-friendly error messages based on phase
      let userMessage = errorMessage;
      let phaseContext = '';
      
      switch(currentPhase) {
        case 'compression':
          phaseContext = 'during media compression';
          userMessage = `Compression failed: ${errorMessage}. Try smaller files or different format.`;
          break;
        case 'upload-preparation':
          phaseContext = 'preparing upload';
          userMessage = `Upload preparation failed: ${errorMessage}`;
          break;
        case 'network-upload':
          phaseContext = 'during network upload';
          userMessage = `Network error: ${errorMessage}. Check your connection and try again.`;
          break;
        case 'storage-display':
          phaseContext = 'saving files';
          userMessage = `Storage error: ${errorMessage}. Files may not have been saved.`;
          break;
        default:
          phaseContext = 'unknown phase';
      }
      
      console.error(`❌ [InternalUploader] User will see: "${userMessage}" (failed ${phaseContext})`);
      
      toast({
        title: `❌ Upload failed ${phaseContext}`,
        description: userMessage,
        variant: "destructive"
      });
      
      // Reset file input to allow retry
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        onProgress?.(0, false);
      }, 2000);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div className="flex flex-col space-y-3">
        <Button
          onClick={handleFileSelect}
          disabled={isUploading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
         data-testid="button-flex">
          {isUploading ? (
            <>
              <Upload className="h-5 w-5 animate-pulse" />
              <span>Uploading... {uploadProgress}%</span>
            </>
          ) : (
            <>
              <Camera className="h-5 w-5" />
              <span>Upload Media Files</span>
              <Video className="h-5 w-5" />
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />

        <p className="text-sm text-gray-600 text-center dark:text-neutral-600 dark:text-neutral-400">
          Support images and videos • Max {maxFiles} files • Up to {maxFileSize}MB each
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700 dark:text-neutral-600 dark:text-neutral-300">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 dark:bg-neutral-800">
                  {file.mimetype.startsWith('image/') ? (
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.originalname}
                      className="w-full h-full object-cover"
                    />
                  ) : file.mimetype.startsWith('video/') ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <button
                    onClick={()> removeFile(file.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  
                  {/* Success indicator */}
                  <div className="absolute bottom-1 right-1 p-1 bg-green-500 text-white rounded-full">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mt-1 truncate dark:text-neutral-600 dark:text-neutral-400" title={file.originalname}>
                  {file.originalname}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}