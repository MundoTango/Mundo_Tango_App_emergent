/**
 * ESA LIFE CEO 61x21 - MTModal Component Tests
 * Comprehensive testing for the MT Ocean modal component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MTModal from '@/components/ui-library/modals/MTModal';
import { useModal } from '@/lib/modal-utils';

// Mock the modal utilities
jest.mock('@/lib/modal-utils', () => ({
  useModal: jest.fn(),
  useFocusTrap: jest.fn(),
  useScrollLock: jest.fn(),
  useClickOutside: jest.fn(),
  modalAnimations: {
    fadeIn: 'fadeIn',
    slideUp: 'slideUp',
    scaleIn: 'scaleIn',
  },
}));

describe('MTModal Component', () => {
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useModal as jest.Mock).mockReturnValue({
      isOpen: true,
      open: jest.fn(),
      close: mockOnClose,
      toggle: jest.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      render(
        <MTModal open onClose={mockOnClose} title="Test Modal">
          <p>Modal Content</p>
        </MTModal>
      );
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <MTModal open={false} onClose={mockOnClose} title="Test Modal">
          <p>Modal Content</p>
        </MTModal>
      );
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render with all size variants', () => {
      const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
      
      sizes.forEach(size => {
        const { rerender } = render(
          <MTModal open onClose={mockOnClose} size={size} title={`${size} Modal`}>
            <p>Content</p>
          </MTModal>
        );
        
        const modal = screen.getByRole('dialog');
        expect(modal).toHaveClass(`mt-modal--${size}`);
        rerender(<></>);
      });
    });

    it('should render header, body, and footer', () => {
      render(
        <MTModal
          open
          onClose={mockOnClose}
          title="Header Title"
          description="Header Description"
          footer={
            <div data-testid="modal-footer">
              <button>Cancel</button>
              <button>Confirm</button>
            </div>
          }
        >
          <div data-testid="modal-body">Body Content</div>
        </MTModal>
      );
      
      expect(screen.getByText('Header Title')).toBeInTheDocument();
      expect(screen.getByText('Header Description')).toBeInTheDocument();
      expect(screen.getByTestId('modal-body')).toBeInTheDocument();
      expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <MTModal open onClose={mockOnClose} title="Test Modal">
          <p>Content</p>
        </MTModal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking outside (if closeOnClickOutside)', async () => {
      const user = userEvent.setup();
      
      render(
        <MTModal 
          open 
          onClose={mockOnClose} 
          title="Test Modal"
          closeOnClickOutside
          data-testid="modal"
        >
          <p>Content</p>
        </MTModal>
      );
      
      const backdrop = screen.getByTestId('modal-backdrop');
      await user.click(backdrop);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking inside modal content', async () => {
      const user = userEvent.setup();
      
      render(
        <MTModal 
          open 
          onClose={mockOnClose} 
          title="Test Modal"
          closeOnClickOutside
        >
          <p data-testid="modal-content">Content</p>
        </MTModal>
      );
      
      const content = screen.getByTestId('modal-content');
      await user.click(content);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should handle escape key press', async () => {
      const user = userEvent.setup();
      
      render(
        <MTModal 
          open 
          onClose={mockOnClose} 
          title="Test Modal"
          closeOnEscape
        >
          <p>Content</p>
        </MTModal>
      );
      
      await user.keyboard('{Escape}');
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close on escape if closeOnEscape is false', async () => {
      const user = userEvent.setup();
      
      render(
        <MTModal 
          open 
          onClose={mockOnClose} 
          title="Test Modal"
          closeOnEscape={false}
        >
          <p>Content</p>
        </MTModal>
      );
      
      await user.keyboard('{Escape}');
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      
      render(
        <MTModal open onClose={mockOnClose} title="Test Modal">
          <button data-testid="first-button">First</button>
          <button data-testid="second-button">Second</button>
          <button data-testid="last-button">Last</button>
        </MTModal>
      );
      
      const firstButton = screen.getByTestId('first-button');
      const lastButton = screen.getByTestId('last-button');
      
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      // Tab through elements
      await user.tab();
      expect(screen.getByTestId('second-button')).toHaveFocus();
      
      await user.tab();
      expect(lastButton).toHaveFocus();
      
      // Should wrap to first element
      await user.tab();
      expect(firstButton).toHaveFocus();
    });

    it('should restore focus on close', async () => {
      const TriggerButton = () => {
        const [open, setOpen] = React.useState(false);
        
        return (
          <>
            <button 
              data-testid="trigger" 
              onClick={() => setOpen(true)}
            >
              Open Modal
            </button>
            <MTModal 
              open={open} 
              onClose={() => setOpen(false)} 
              title="Test Modal"
            >
              <p>Content</p>
            </MTModal>
          </>
        );
      };
      
      const user = userEvent.setup();
      render(<TriggerButton />);
      
      const trigger = screen.getByTestId('trigger');
      trigger.focus();
      expect(trigger).toHaveFocus();
      
      await user.click(trigger);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });
  });

  describe('Animations', () => {
    it('should apply animation classes', () => {
      render(
        <MTModal 
          open 
          onClose={mockOnClose} 
          title="Test Modal"
          animation="slideUp"
        >
          <p>Content</p>
        </MTModal>
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('mt-modal--slideUp');
    });

    it('should handle custom animation duration', () => {
      render(
        <MTModal 
          open 
          onClose={mockOnClose} 
          title="Test Modal"
          animationDuration={500}
        >
          <p>Content</p>
        </MTModal>
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({ '--animation-duration': '500ms' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <MTModal 
          open 
          onClose={mockOnClose} 
          title="Test Modal"
          aria-describedby="modal-description"
        >
          <p id="modal-description">Modal description</p>
        </MTModal>
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
      expect(modal).toHaveAttribute('aria-describedby', 'modal-description');
    });

    it('should announce to screen readers', () => {
      render(
        <MTModal 
          open 
          onClose={mockOnClose} 
          title="Important Modal"
          role="alertdialog"
        >
          <p>Important content</p>
        </MTModal>
      );
      
      const modal = screen.getByRole('alertdialog');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Scroll Lock', () => {
    it('should lock body scroll when open', () => {
      const originalOverflow = document.body.style.overflow;
      
      render(
        <MTModal open onClose={mockOnClose} title="Test Modal">
          <p>Content</p>
        </MTModal>
      );
      
      expect(document.body.style.overflow).toBe('hidden');
      
      // Cleanup
      document.body.style.overflow = originalOverflow;
    });

    it('should restore scroll when closed', () => {
      const { rerender } = render(
        <MTModal open onClose={mockOnClose} title="Test Modal">
          <p>Content</p>
        </MTModal>
      );
      
      rerender(
        <MTModal open={false} onClose={mockOnClose} title="Test Modal">
          <p>Content</p>
        </MTModal>
      );
      
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      render(
        <MTModal 
          open 
          onClose={mockOnClose} 
          title="Test Modal"
          className="custom-modal"
        >
          <p>Content</p>
        </MTModal>
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('mt-modal', 'custom-modal');
    });

    it('should accept custom styles', () => {
      render(
        <MTModal 
          open 
          onClose={mockOnClose} 
          title="Test Modal"
          style={{ backgroundColor: 'blue' }}
        >
          <p>Content</p>
        </MTModal>
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({ backgroundColor: 'blue' });
    });
  });
});