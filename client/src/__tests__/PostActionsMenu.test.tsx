/**
 * ESA LIFE CEO 61x21 - PostActionsMenu Unit Test
 * Tests Layer 7 & 23 post edit callback functionality
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { PostActionsMenu } from '@/components/ui/PostActionsMenu';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the auth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Test User' } })
}));

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() })
}));

const mockPost = {
  id: 123,
  userId: 1,
  content: 'Test post content',
  visibility: 'public' as const,
  user: {
    id: 1,
    name: 'Test User',
    username: 'testuser'
  }
};

describe('PostActionsMenu', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
  });

  it('should call onEdit with correct post when Edit post is clicked', () => {
    const onEditMock = jest.fn();
    
    render(
      <QueryClientProvider client={queryClient}>
        <PostActionsMenu 
          post={mockPost}
          onEdit={onEditMock}
        />
      </QueryClientProvider>
    );

    // Open the dropdown menu
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    // Click Edit post option
    const editOption = screen.getByText('Edit post');
    fireEvent.click(editOption);

    // Verify onEdit was called with the correct post
    expect(onEditMock).toHaveBeenCalledTimes(1);
    expect(onEditMock).toHaveBeenCalledWith(mockPost);
  });

  it('should not show Edit option for non-owners', () => {
    const differentUserPost = {
      ...mockPost,
      userId: 999, // Different user ID
      user: { id: 999, name: 'Other User', username: 'otheruser' }
    };

    render(
      <QueryClientProvider client={queryClient}>
        <PostActionsMenu 
          post={differentUserPost}
          onEdit={jest.fn()}
        />
      </QueryClientProvider>
    );

    // Open the dropdown menu
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    // Edit option should not be visible
    expect(screen.queryByText('Edit post')).not.toBeInTheDocument();
  });
});