// MT ESA LIFE CEO - Media Upload Component (Stub)
// TODO: Implement full media upload with drag-drop and preview

import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface UploadMediaProps {
  onUpload?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export default function UploadMedia({ onUpload, accept, multiple, className }: UploadMediaProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onUpload?.(files);
  };

  return (
    <div className={className}>
      <input
        type="file"
        id="media-upload"
        accept={accept || 'image/*,video/*'}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        data-testid="input-file-upload"
      />
      <label htmlFor="media-upload" className="cursor-pointer">
        <Button type="button" variant="outline" data-testid="button-upload-media">
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </label>
    </div>
  );
}
