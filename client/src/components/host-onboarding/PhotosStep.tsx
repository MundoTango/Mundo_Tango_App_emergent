import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import MediaUploader from '@/components/media/MediaUploader';

interface PhotosStepProps {
  data: any;
  updateData: (data: any) => void;
}

export default function PhotosStep({ data, updateData }: PhotosStepProps) {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaOrder, setMediaOrder] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  const handleMediaChange = (files: File[], order: string[], thumbIndex: number) => {
    setMediaFiles(files);
    setMediaOrder(order);
    setThumbnailIndex(thumbIndex);
    
    // Update parent component
    updateData({
      photos: files,
      mediaOrder: order,
      thumbnailIndex: thumbIndex
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Add photos & videos of your place</h2>
        <p className="text-gray-600">
          Great media is key to attracting guests. Upload at least 5 photos or videos to get started.
        </p>
      </div>

      {/* Media tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Media tips for success</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use natural lighting when possible</li>
          <li>• Show accurate representations of your space</li>
          <li>• Include photos of all rooms guests can access</li>
          <li>• Highlight unique features and amenities</li>
          <li>• Videos can showcase the space walkthrough</li>
          <li>• Drag to reorder, click star to set thumbnail</li>
        </ul>
      </div>

      {/* Media Uploader */}
      <div>
        <Label className="text-lg font-medium mb-4 block">
          Your media ({mediaFiles.length})
        </Label>
        
        <MediaUploader
          maxFiles={10}
          acceptedFormats={['image/*', 'video/*']}
          onMediaChange={handleMediaChange}
        />
      </div>

      {/* Minimum media warning */}
      {mediaFiles.length > 0 && mediaFiles.length < 5 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            <strong>Almost there!</strong> Properties with at least 5 photos/videos get 
            more views and bookings. Add {5 - mediaFiles.length} more to complete your listing.
          </p>
        </div>
      )}
    </div>
  );
}
