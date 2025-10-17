import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import toast from 'react-hot-toast';
import { z } from 'zod';

// Validation schema based on Zod best practices
export const memorySchema = z.object({
  content: z
    .string()
    .min(1, 'Please write something to share')
    .max(5000, 'Content must be less than 5000 characters'),
  hashtags: z
    .array(z.string())
    .max(10, 'Maximum 10 hashtags allowed')
    .optional(),
  isPublic: z.boolean(),
  location: z.string().nullable(),
  imageUrl: z.string().url().nullable().optional(),
  videoUrl: z.string().url().nullable().optional(),
});

export type MemoryInput = z.infer<typeof memorySchema>;

// Custom hook following React Query best practices
// Separates mutation logic from components (Smart/Presentational pattern)
export const useCreateMemory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: MemoryInput) => {
      // Validate input using Zod schema
      const validatedData = memorySchema.parse(data);
      
      return await apiRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(validatedData),
      });
    },
    onSuccess: () => {
      toast.success('Memory shared successfully!');
      // Invalidate queries to refetch latest data
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create post:', error);
      // Specific error messages based on error type
      if (error.message.includes('5000 characters')) {
        toast.error('Content too long (max 5000 characters)');
      } else if (error.message.includes('hashtags')) {
        toast.error('Too many hashtags (max 10)');
      } else {
        toast.error('Failed to share memory. Please try again.');
      }
    },
  });
};
