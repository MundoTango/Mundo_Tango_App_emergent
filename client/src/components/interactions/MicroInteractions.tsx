/**
 * Aurora Tide - Micro-Interaction Patterns
 * Reusable interactive components with 100-300ms timing for delightful UX
 */

import { ReactNode, useRef, useState, MouseEvent, ButtonHTMLAttributes } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * MagneticButton Component
 * Button with magnetic hover effect that follows cursor
 * 
 * @timing 200ms for position transitions
 */
interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  strength?: number; // Magnetic pull strength (0-1)
  className?: string;
}

const MagneticButton = ({
  children,
  strength = 0.3,
  className = '',
  onClick,
  disabled,
  type,
  ...props
}: MagneticButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion()) return;

    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn('relative', className)}>

      {children}
    </motion.button>);

};

/**
 * RippleButton Component
 * Button with gradient ripple effect on click
 * 
 * @timing 300ms ripple animation
 */
interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  rippleColor?: string;
  className?: string;
}

const RippleButton = ({
  children,
  rippleColor = 'rgba(6, 182, 212, 0.4)',
  className = '',
  onClick,
  ...props
}: RippleButtonProps) => {
  const [ripples, setRipples] = useState<{x: number;y: number;size: number;id: number;}[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!prefersReducedMotion()) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, size, id }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 300);
    }

    onClick?.(e);
  };

  return (
    <button
      className={cn('relative overflow-hidden', className)}
      onClick={handleClick}
      {...props} data-testid="button-element">

      {ripples.map((ripple) =>
      <span
        key={ripple.id}
        className="absolute rounded-full pointer-events-none animate-ripple"
        style={{
          left: ripple.x,
          top: ripple.y,
          width: ripple.size,
          height: ripple.size,
          background: `radial-gradient(circle, ${rippleColor} 0%, transparent 70%)`
        }} />

      )}
      {children}
    </button>);

};

/**
 * HoverGlowButton Component
 * Button with gradient glow on hover
 * 
 * @timing 200ms glow transition
 */
interface HoverGlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  glowColor?: string;
  className?: string;
}

const HoverGlowButton = ({
  children,
  glowColor = 'rgba(6, 182, 212, 0.5)',
  className = '',
  onClick,
  disabled,
  type,
  ...props
}: HoverGlowButtonProps) => {
  return (
    <motion.button
      whileHover={prefersReducedMotion() ? {} : {
        boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`
      }}
      whileTap={prefersReducedMotion() ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn('transition-all duration-200', className)}>

      {children}
    </motion.button>);

};

/**
 * ScaleButton Component
 * Simple button with scale animation on hover/tap
 * 
 * @timing 150ms scale transition
 */
interface ScaleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  hoverScale?: number;
  tapScale?: number;
  className?: string;
}

const ScaleButton = ({
  children,
  hoverScale = 1.05,
  tapScale = 0.95,
  className = '',
  onClick,
  disabled,
  type,
  ...props
}: ScaleButtonProps) => {
  return (
    <motion.button
      whileHover={prefersReducedMotion() ? {} : { scale: hoverScale }}
      whileTap={prefersReducedMotion() ? {} : { scale: tapScale }}
      transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={className}>

      {children}
    </motion.button>);

};

/**
 * IconMorphButton Component
 * Button with icon that rotates/scales on hover
 * 
 * @timing 200ms icon morph
 */
interface IconMorphButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon: ReactNode;
  iconPosition?: 'left' | 'right';
  morphType?: 'rotate' | 'scale' | 'both';
  className?: string;
}

const IconMorphButton = ({
  children,
  icon,
  iconPosition = 'left',
  morphType = 'scale',
  className = '',
  onClick,
  disabled,
  type,
  ...props
}: IconMorphButtonProps) => {
  const morphVariants = {
    rotate: { rotate: 180 },
    scale: { scale: 1.2 },
    both: { rotate: 180, scale: 1.2 }
  };

  return (
    <motion.button
      whileHover={prefersReducedMotion() ? {} : { x: iconPosition === 'left' ? 2 : -2 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn('flex items-center gap-2', className)}>

      {iconPosition === 'left' &&
      <motion.span
        whileHover={prefersReducedMotion() ? {} : morphVariants[morphType]}
        transition={{ duration: 0.2 }}>

          {icon}
        </motion.span>
      }
      {children}
      {iconPosition === 'right' &&
      <motion.span
        whileHover={prefersReducedMotion() ? {} : morphVariants[morphType]}
        transition={{ duration: 0.2 }}>

          {icon}
        </motion.span>
      }
    </motion.button>);

};

/**
 * PulseButton Component
 * Button with pulsing animation for important CTAs
 * 
 * @timing 1500ms pulse cycle
 */
interface PulseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  pulseColor?: string;
  className?: string;
}

const PulseButton = ({
  children,
  pulseColor = 'rgba(6, 182, 212, 0.6)',
  className = '',
  onClick,
  disabled,
  type,
  ...props
}: PulseButtonProps) => {
  return (
    <motion.button
      className={cn('relative', className)}
      whileTap={prefersReducedMotion() ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      type={type}>

      {!prefersReducedMotion() &&
      <motion.span
        className="absolute inset-0 rounded-lg"
        animate={{
          boxShadow: [
          `0 0 0 0 ${pulseColor}`,
          `0 0 0 8px ${pulseColor.replace('0.6', '0')}`]

        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut'
        }} />

      }
      <span className="relative z-10">{children}</span>
    </motion.button>);

};

/**
 * GradientShiftButton Component
 * Button with animated gradient on hover
 * 
 * @timing 300ms gradient transition
 */
interface GradientShiftButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

const GradientShiftButton = ({
  children,
  className = '',
  onClick,
  disabled,
  type,
  ...props
}: GradientShiftButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('relative overflow-hidden', className)}
      whileTap={prefersReducedMotion() ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      type={type}>

      {!prefersReducedMotion() &&
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '0%' : '-100%' }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} />

      }
      <span className="relative z-10">{children}</span>
    </motion.button>);

};

/**
 * FloatingActionButton Component
 * FAB with hover lift and shadow expansion
 * 
 * @timing 200ms lift and shadow
 */
interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

const FloatingActionButton = ({
  children,
  className = '',
  onClick,
  disabled,
  type,
  ...props
}: FloatingActionButtonProps) => {
  return (
    <motion.button
      whileHover={prefersReducedMotion() ? {} : {
        y: -4,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
      }}
      whileTap={prefersReducedMotion() ? {} : { scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(
        'rounded-full shadow-lg',
        'bg-gradient-to-r from-cyan-500 to-teal-500',
        'text-white',
        className
      )}>

      {children}
    </motion.button>);

};

/**
 * RotateOnHoverIcon Component
 * Icon that rotates continuously on hover
 * 
 * @timing 1000ms rotation
 */
interface RotateOnHoverIconProps {
  children: ReactNode;
  className?: string;
}

const RotateOnHoverIcon = ({ children, className = '' }: RotateOnHoverIconProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={!prefersReducedMotion() && isHovered ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 1, ease: 'linear', repeat: isHovered ? Infinity : 0 }}
      className={className}>

      {children}
    </motion.div>);

};

/**
 * BounceOnClick Component
 * Element that bounces when clicked
 * 
 * @timing 300ms bounce
 */
interface BounceOnClickProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const BounceOnClick = ({ children, className = '', onClick }: BounceOnClickProps) => {
  const [isBouncing, setIsBouncing] = useState(false);

  const handleClick = () => {
    if (!prefersReducedMotion()) {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 300);
    }
    onClick?.();
  };

  return (
    <motion.div
      animate={isBouncing ? { y: [0, -10, 0] } : { y: 0 }}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      className={cn('cursor-pointer', className)}
      onClick={handleClick}>

      {children}
    </motion.div>);

};

/**
 * ShakeOnError Component
 * Element that shakes to indicate error
 * 
 * @timing 250ms shake
 */
interface ShakeOnErrorProps {
  children: ReactNode;
  trigger: boolean;
  className?: string;
}

const ShakeOnError = ({ children, trigger, className = '' }: ShakeOnErrorProps) => {
  return (
    <motion.div
      animate={trigger && !prefersReducedMotion() ? {
        x: [0, -10, 10, -10, 10, 0]
      } : {}}
      transition={{ duration: 0.25 }}
      className={className}>

      {children}
    </motion.div>);

};

/**
 * Export all micro-interaction components
 */
export {
  MagneticButton,
  RippleButton,
  HoverGlowButton,
  ScaleButton,
  IconMorphButton,
  PulseButton,
  GradientShiftButton,
  FloatingActionButton,
  RotateOnHoverIcon,
  BounceOnClick,
  ShakeOnError };