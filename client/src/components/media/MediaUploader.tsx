import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { processMultipleMedia } from '@/utils/advancedMediaProcessor';
import { extractVideoThumbnail } from '@/utils/videoThumbnail';
import {
  Upload,
  X,
  Star,
  GripVertical,
  Image as ImageIcon,
  Video as VideoIcon,
  Loader
} from 'lucide-react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from 'react-beautiful-dnd';

interface MediaItem {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
  isProcessing?: boolean;
}

interface MediaUploaderProps {
  maxFiles?: number;
  acceptedFormats?: string[];
  onMediaChange?: (files: File[], order: string[], thumbnailIndex: number) => void;
  initialMedia?: string[]; // For edit mode
  initialThumbnailIndex?: number;
}

export default function MediaUploader({
  maxFiles = 10,
  acceptedFormats = ['image/*', 'video/*'],
  onMediaChange,
  initialMedia = [],
  initialThumbnailIndex = 0
}: MediaUploaderProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(initialThumbnailIndex);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Notify parent of changes
  const notifyChange = (items: MediaItem[], thumbIndex: number) => {
    const files = items.map(item => item.file);
    const order = items.map(item => item.id);
    onMediaChange?.(files, order, thumbIndex);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max files limit
    if (mediaItems.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Process files for optimization
      const processedFiles = await processMultipleMedia(
        files,
        (current, total, status) => {
          const progress = (current / total) * 100;
          setUploadProgress(progress);
        }
      );

      // Create media items with previews
      const newItems: MediaItem[] = [];
      
      for (const file of processedFiles) {
        const id = `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        let preview = '';

        if (type === 'image') {
          preview = URL.createObjectURL(file);
        } else {
          // Extract video thumbnail
          try {
            preview = await extractVideoThumbnail(file);
          } catch (error) {
            console.error('Failed to extract video thumbnail:', error);
            preview = URL.createObjectURL(file);
          }
        }

        newItems.push({ id, file, preview, type });
      }

      const updatedItems = [...mediaItems, ...newItems];
      setMediaItems(updatedItems);
      notifyChange(updatedItems, thumbnailIndex);

      toast({
        title: "✅ Media added!",
        description: `${newItems.length} file(s) optimized and ready`
      });

    } catch (error) {
      console.error('Media processing failed:', error);
      toast({
        title: "⚠️ Processing failed",
        description: "Some files couldn't be processed",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(mediaItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Adjust thumbnail index if needed
    let newThumbnailIndex = thumbnailIndex;
    if (result.source.index === thumbnailIndex) {
      newThumbnailIndex = result.destination.index;
    } else if (
      result.source.index < thumbnailIndex &&
      result.destination.index >= thumbnailIndex
    ) {
      newThumbnailIndex = thumbnailIndex - 1;
    } else if (
      result.source.index > thumbnailIndex &&
      result.destination.index <= thumbnailIndex
    ) {
      newThumbnailIndex = thumbnailIndex + 1;
    }

    setMediaItems(items);
    setThumbnailIndex(newThumbnailIndex);
    notifyChange(items, newThumbnailIndex);
  };

  const removeMedia = (index: number) => {
    const items = mediaItems.filter((_, i) => i !== index);
    let newThumbnailIndex = thumbnailIndex;

    // Adjust thumbnail index after removal
    if (index === thumbnailIndex) {
      newThumbnailIndex = 0; // Reset to first if thumbnail was removed
    } else if (index < thumbnailIndex) {
      newThumbnailIndex = thumbnailIndex - 1;
    }

    setMediaItems(items);
    setThumbnailIndex(newThumbnailIndex);
    notifyChange(items, newThumbnailIndex);
  };

  const setAsThumbnail = (index: number) => {
    setThumbnailIndex(index);
    notifyChange(mediaItems, index);
  };

  return (
    <div className="space-y-4" data-testid="media-uploader">
      {/* Upload Button */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || mediaItems.length >= maxFiles}
          className="flex items-center gap-2"
          data-testid="button-upload-media"
        >
          <Upload className="w-4 h-4" />
          {mediaItems.length === 0 ? 'Upload Media' : 'Add More'}
        </Button>
        
        {mediaItems.length > 0 && (
          <div className="text-sm text-gray-600 flex items-center dark:text-neutral-600 dark:text-neutral-400">
            {mediaItems.length} / {maxFiles} files
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-upload"
      />

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-gray-600 text-center dark:text-neutral-600 dark:text-neutral-400">
            Processing media... {uploadProgress.toFixed(0)}%
          </p>
        </div>
      )}

      {/* Media Grid with Drag & Drop */}
      {mediaItems.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="media-grid" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                data-testid="media-grid"
              >
                {mediaItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative group ${
                          snapshot.isDragging ? 'z-50' : ''
                        }`}
                        data-testid={`media-item-${index}`}
                      >
                        <Card className={`overflow-hidden border-2 ${
                          index === thumbnailIndex
                            ? 'border-yellow-500 shadow-lg'
                            : 'border-gray-200'
                        } ${snapshot.isDragging ? 'shadow-2xl scale-105' : ''} transition-all`}>
                          {/* Media Preview */}
                          <div className="aspect-square relative bg-gray-100 dark:bg-neutral-800">
                            <img
                              src={item.preview}
                              alt={`Media ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Video Indicator */}
                            {item.type === 'video' && (
                              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                <VideoIcon className="w-3 h-3" />
                                Video
                              </div>
                            )}

                            {/* Thumbnail Badge */}
                            {index === thumbnailIndex && (
                              <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1 font-semibold">
                                <Star className="w-3 h-3 fill-current" />
                                Thumbnail
                              </div>
                            )}

                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="absolute bottom-2 left-2 bg-white/90 p-1 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity dark:bg-neutral-900"
                              data-testid={`drag-handle-${index}`}
                            >
                              <GripVertical className="w-4 h-4 text-gray-600 dark:text-neutral-600 dark:text-neutral-400" />
                            </div>

                            {/* Action Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                              {index !== thumbnailIndex && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setAsThumbnail(index)}
                                  className="text-xs"
                                  data-testid={`button-set-thumbnail-${index}`}
                                >
                                  <Star className="w-3 h-3 mr-1" />
                                  Set as Thumbnail
                                </Button>
                              )}
                              
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => removeMedia(index)}
                                data-testid={`button-remove-media-${index}`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Helper Text */}
      {mediaItems.length === 0 && !isUploading && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            Upload images or videos (up to {maxFiles} files)
          </p>
          <p className="text-xs mt-1">
            Drag to reorder • Click star to set thumbnail
          </p>
        </div>
      )}
    </div>
  );
}
