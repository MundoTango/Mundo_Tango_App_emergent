/**
 * ESA LIFE CEO 61x21 - MTButton Component Tests
 * Comprehensive testing for the MT Ocean button component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MTButton from '@/components/ui-library/buttons/MTButton';

describe('MTButton Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<MTButton>Click Me</MTButton>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('mt-button');
    });

    it('should render with all variants', () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const;
      
      variants.forEach(variant => {
        const { rerender } = render(
          <MTButton variant={variant}>Button</MTButton>
        );
        const button = screen.getByRole('button');
        expect(button).toHaveClass(`mt-button--${variant}`);
        rerender(<></>);
      });
    });

    it('should render with all sizes', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'] as const;
      
      sizes.forEach(size => {
        const { rerender } = render(
          <MTButton size={size}>Button</MTButton>
        );
        const button = screen.getByRole('button');
        expect(button).toHaveClass(`mt-button--${size}`);
        rerender(<></>);
      });
    });

    it('should render with icon', () => {
      const Icon = () => <span data-testid="icon">📋</span>;
      render(
        <MTButton icon={<Icon />}>
          With Icon
        </MTButton>
      );
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('should render as different HTML element when asChild is true', () => {
      render(
        <MTButton asChild>
          <a href="/test">Link Button</a>
        </MTButton>
      );
      
      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(
        <MTButton onClick={handleClick} data-testid="button-click">
          Click Me
        </MTButton>
      );
      
      const button = screen.getByTestId('button-click');
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(
        <MTButton onClick={handleClick} disabled data-testid="button-disabled">
          Disabled Button
        </MTButton>
      );
      
      const button = screen.getByTestId('button-disabled');
      expect(button).toBeDisabled();
      
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should show loading state', () => {
      render(
        <MTButton loading data-testid="button-loading">
          Loading Button
        </MTButton>
      );
      
      const button = screen.getByTestId('button-loading');
      expect(button).toHaveClass('mt-button--loading');
      expect(button).toBeDisabled();
    });

    it('should handle keyboard navigation', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      render(
        <MTButton onClick={handleClick} data-testid="button-keyboard">
          Keyboard Button
        </MTButton>
      );
      
      const button = screen.getByTestId('button-keyboard');
      button.focus();
      expect(button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <MTButton
          aria-label="Custom label"
          aria-pressed="true"
          data-testid="button-aria"
        >
          Accessible Button
        </MTButton>
      );
      
      const button = screen.getByTestId('button-aria');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should handle focus visible', async () => {
      const user = userEvent.setup();
      
      render(
        <MTButton data-testid="button-focus">
          Focus Button
        </MTButton>
      );
      
      const button = screen.getByTestId('button-focus');
      
      // Tab to focus
      await user.tab();
      expect(button).toHaveFocus();
      expect(button).toHaveClass('focus-visible');
    });

    it('should have correct role', () => {
      render(<MTButton>Role Button</MTButton>);
      const button = screen.getByRole('button', { name: /role button/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Ocean Theme Integration', () => {
    it('should apply ocean wave animation on hover', async () => {
      const user = userEvent.setup();
      
      render(
        <MTButton variant="primary" data-testid="button-ocean">
          Ocean Button
        </MTButton>
      );
      
      const button = screen.getByTestId('button-ocean');
      
      await user.hover(button);
      expect(button).toHaveClass('mt-button--ocean-hover');
      
      await user.unhover(button);
      expect(button).not.toHaveClass('mt-button--ocean-hover');
    });

    it('should have ripple effect on click', async () => {
      const user = userEvent.setup();
      
      render(
        <MTButton ripple data-testid="button-ripple">
          Ripple Button
        </MTButton>
      );
      
      const button = screen.getByTestId('button-ripple');
      await user.click(button);
      
      const ripple = button.querySelector('.mt-button__ripple');
      expect(ripple).toBeInTheDocument();
    });
  });

  describe('Full Width', () => {
    it('should expand to full width when fullWidth prop is true', () => {
      render(
        <MTButton fullWidth data-testid="button-full">
          Full Width Button
        </MTButton>
      );
      
      const button = screen.getByTestId('button-full');
      expect(button).toHaveClass('mt-button--full-width');
    });
  });

  describe('Custom Classes and Styles', () => {
    it('should accept custom className', () => {
      render(
        <MTButton className="custom-class" data-testid="button-custom">
          Custom Button
        </MTButton>
      );
      
      const button = screen.getByTestId('button-custom');
      expect(button).toHaveClass('mt-button', 'custom-class');
    });

    it('should accept custom styles', () => {
      render(
        <MTButton style={{ backgroundColor: 'red' }} data-testid="button-style">
          Styled Button
        </MTButton>
      );
      
      const button = screen.getByTestId('button-style');
      expect(button).toHaveStyle({ backgroundColor: 'red' });
    });
  });
});