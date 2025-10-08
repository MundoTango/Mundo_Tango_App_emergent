import React from 'react';
import { MediaUploadTest } from '@/components/media/MediaUploadTest';
import { Helmet } from 'react-helmet';

export default function MediaUploadTestPage() {
  return (
    <>
      <Helmet>
        <title>Media Upload Test | Life CEO</title>
      </Helmet>
      
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-neutral-800">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Media Upload Test</h1>
        <MediaUploadTest />
      </div>
    </div>
  
    </>
  );
}