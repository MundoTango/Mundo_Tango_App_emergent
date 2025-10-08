// MT Ocean Form File Upload Component
// ESA LIFE CEO 61x21 File Upload Field

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Upload, X, FileIcon, ImageIcon, VideoIcon, Music } from 'lucide-react';
import { useState, useRef } from 'react';

export interface MTFormFileUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  showPreview?: boolean;
  'data-testid'?: string;
}

export default function MTFormFileUpload<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  accept = 'image/*',
  multiple = false,
  maxSize = 5,
  maxFiles = 5,
  disabled = false,
  className,
  required = false,
  showPreview = true,
  'data-testid': testId,
}: MTFormFileUploadProps<TFieldValues, TName>) {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-8 w-8" />;
    if (fileType.startsWith('video/')) return <VideoIcon className="h-8 w-8" />;
    if (fileType.startsWith('audio/')) return <Music className="h-8 w-8" />;
    return <FileIcon className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const handleFiles = (files: FileList | null) => {
          if (!files) return;

          const validFiles = Array.from(files).filter(file => {
            // Check file size
            if (file.size > maxSize * 1024 * 1024) {
              console.error(`File ${file.name} exceeds max size of ${maxSize}MB`);
              return false;
            }
            return true;
          });

          // Limit number of files
          const filesToAdd = multiple 
            ? validFiles.slice(0, maxFiles) 
            : validFiles.slice(0, 1);

          // Update form field
          if (multiple) {
            const currentFiles = field.value || [];
            field.onChange([...currentFiles, ...filesToAdd]);
          } else {
            field.onChange(filesToAdd[0]);
          }

          // Generate previews for images
          if (showPreview) {
            const newPreviews: string[] = [];
            filesToAdd.forEach(file => {
              if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  newPreviews.push(reader.result as string);
                  setPreviews(prev => multiple ? [...prev, ...newPreviews] : newPreviews);
                };
                reader.readAsDataURL(file);
              }
            });
          }
        };

        const handleDrop = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
          
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
          }
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          e.preventDefault();
          if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
          }
        };

        const removeFile = (index: number) => {
          if (multiple) {
            const newFiles = [...(field.value || [])];
            newFiles.splice(index, 1);
            field.onChange(newFiles);
            
            const newPreviews = [...previews];
            newPreviews.splice(index, 1);
            setPreviews(newPreviews);
          } else {
            field.onChange(null);
            setPreviews([]);
          }
        };

        const files = multiple ? (field.value || []) : (field.value ? [field.value] : []);

        return (
          <FormItem className={cn('space-y-2', className)}>
            {label && (
              <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1 dark:text-neutral-600 dark:text-neutral-300">
                {label}
                {required && <span className="text-red-500">*</span>}
              </FormLabel>
            )}
            
            <FormControl>
              <div
                className={cn(
                  'relative rounded-xl border-2 border-dashed p-6',
                  'transition-all duration-200 cursor-pointer',
                  dragActive ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-300',
                  disabled && 'opacity-50 cursor-not-allowed',
                  fieldState.error && 'border-red-500'
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
                data-testid={testId || `file-upload-${name}`}
               role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); () => !disabled && inputRef.current?.click()(e); } }}>
                <input
                  ref={inputRef}
                  type="file"
                  multiple={multiple}
                  accept={accept}
                  onChange={handleChange}
                  disabled={disabled}
                  className="hidden"
                />
                
                <div className="text-center">
                  <Upload className={cn(
                    'mx-auto h-12 w-12 text-gray-600 dark:text-gray-400',
                    dragActive && 'text-ocean-500'
                  )} />
                  <p className="mt-2 text-sm text-gray-600 dark:text-neutral-600 dark:text-neutral-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {accept} (Max {maxSize}MB{multiple && `, up to ${maxFiles} files`})
                  </p>
                </div>
              </div>
            </FormControl>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file: File, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors dark:bg-neutral-800"
                  >
                    {showPreview && previews[index] ? (
                      <img 
                        src={previews[index]} 
                        alt={file.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="text-gray-600 dark:text-gray-400">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate dark:text-neutral-100">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                      data-testid={`remove-file-${index}`}
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {description && (
              <FormDescription className="text-xs text-gray-500">
                {description}
              </FormDescription>
            )}
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        );
      }}
    />
  );
}