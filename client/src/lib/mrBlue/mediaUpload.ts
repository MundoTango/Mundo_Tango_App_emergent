/**
 * Media Upload Client Utility
 * Handles file uploads with AI analysis
 * MB.MD Track 4: Media Upload - Oct 21, 2025
 */

export async function uploadMedia(file: File): Promise<{
  url: string;
  analysis: any;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to upload media');
  }

  return response.json();
}

export async function analyzeImageUrl(url: string): Promise<{
  labels: Array<{ label: string; score: number }>;
}> {
  const response = await fetch('/api/media/analyze-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to analyze image');
  }

  return response.json();
}
