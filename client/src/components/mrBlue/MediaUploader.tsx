/**
 * Media Uploader Component
 * Drag-drop upload with AI analysis
 * MB.MD Track 4: Media Upload UI - Oct 21, 2025
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, Image, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadMedia } from '@/lib/mrBlue/mediaUpload';

interface MediaUploaderProps {
  onUploadComplete?: (result: { url: string; analysis: any }) => void;
  accept?: Record<string, string[]>;
}

export function MediaUploader({ onUploadComplete, accept }: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setPreview(null);
    setAnalysis(null);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload and analyze
      const result = await uploadMedia(file);
      setAnalysis(result.analysis);
      onUploadComplete?.(result);

      toast({
        title: 'Upload Complete',
        description: `Analyzed ${file.name}`,
      });
    } catch (error) {
      console.error('[MediaUploader] Error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Could not upload media',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const clearPreview = () => {
    setPreview(null);
    setAnalysis(null);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-300 dark:border-gray-700'}
            ${uploading ? 'opacity-50 pointer-events-none' : 'hover:border-cyan-500/50'}
          `}
          data-testid="dropzone-media-upload"
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
              <p className="text-sm">Analyzing media...</p>
            </div>
          ) : isDragActive ? (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-cyan-500" />
              <p className="text-sm font-medium">Drop file here</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Image className="h-8 w-8 text-gray-400" />
              <p className="text-sm font-medium">Drag & drop or click to upload</p>
              <p className="text-xs text-muted-foreground">Images or audio (max 10MB)</p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            onClick={clearPreview}
            className="absolute top-2 right-2 z-10"
            data-testid="button-clear-media"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full rounded-lg max-h-64 object-contain bg-black/5"
            data-testid="img-media-preview"
          />
          
          {analysis && (
            <div className="mt-2 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <p className="text-xs font-medium mb-2">AI Analysis:</p>
              {analysis.labels && (
                <div className="flex flex-wrap gap-1">
                  {analysis.labels.slice(0, 5).map((label: any, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-cyan-500/20 rounded text-xs"
                      data-testid={`label-${i}`}
                    >
                      {label.label} ({Math.round(label.score * 100)}%)
                    </span>
                  ))}
                </div>
              )}
              {analysis.transcription && (
                <p className="text-xs mt-2" data-testid="text-transcription">
                  {analysis.transcription}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
