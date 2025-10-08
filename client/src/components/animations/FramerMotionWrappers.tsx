/**
 * Aurora Tide - Framer Motion Orchestration Components
 * Reusable animation wrappers for consistent motion design
 */

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * Check if user prefers reduced motion
 */
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Aurora Tide Animation Variants
 * Reusable animation configurations
 */
export const AuroraVariants: Record<string, Variants> = {
  // Fade In/Out
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Fade In with Y movement
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: prefersReducedMotion() ? 0.01 : 0.3, ease: [0.4, 0, 0.2, 1] },
    },
    exit: { 
      opacity: 0, 
      y: 10,
      transition: { duration: prefersReducedMotion() ? 0.01 : 0.2 },
    },
  },

  // Scale In
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: prefersReducedMotion() ? 0.01 : 0.2, ease: [0.34, 1.56, 0.64, 1] },
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: prefersReducedMotion() ? 0.01 : 0.15 },
    },
  },

  // Slide In from Left
  slideInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: prefersReducedMotion() ? 0.01 : 0.3, ease: [0.4, 0, 0.2, 1] },
    },
    exit: { 
      opacity: 0, 
      x: -10,
      transition: { duration: prefersReducedMotion() ? 0.01 : 0.2 },
    },
  },

  // Slide In from Right
  slideInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: prefersReducedMotion() ? 0.01 : 0.3, ease: [0.4, 0, 0.2, 1] },
    },
    exit: { 
      opacity: 0, 
      x: 10,
      transition: { duration: prefersReducedMotion() ? 0.01 : 0.2 },
    },
  },

  // Glass Card Reveal
  glassReveal: {
    hidden: { opacity: 0, scale: 0.95, backdropFilter: 'blur(0px)' },
    visible: { 
      opacity: 1, 
      scale: 1,
      backdropFilter: 'blur(12px)',
      transition: { 
        duration: prefersReducedMotion() ? 0.01 : 0.4, 
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      backdropFilter: 'blur(0px)',
      transition: { duration: prefersReducedMotion() ? 0.01 : 0.2 },
    },
  },

  // Stagger Container
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion() ? 0 : 0.1,
        delayChildren: prefersReducedMotion() ? 0 : 0.05,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: prefersReducedMotion() ? 0 : 0.05,
        staggerDirection: -1,
      },
    },
  },

  // Stagger Child Item
  staggerItem: {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: prefersReducedMotion() ? 0.01 : 0.3 },
    },
    exit: { 
      opacity: 0, 
      y: 5,
      transition: { duration: prefersReducedMotion() ? 0.01 : 0.2 },
    },
  },
};

/**
 * FadeIn Component
 * Simple fade in animation wrapper
 */
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn = ({ children, delay = 0, duration = 0.3, className = '' }: FadeInProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ 
      duration: prefersReducedMotion() ? 0.01 : duration, 
      delay: prefersReducedMotion() ? 0 : delay,
    }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * SlideIn Component
 * Slide in animation from specified direction
 */
interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

export const SlideIn = ({ 
  children, 
  direction = 'left', 
  delay = 0, 
  duration = 0.3,
  className = '',
}: SlideInProps) => {
  const directions = {
    left: { x: -20 },
    right: { x: 20 },
    up: { y: -20 },
    down: { y: 20 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...directions[direction] }}
      transition={{ 
        duration: prefersReducedMotion() ? 0.01 : duration, 
        delay: prefersReducedMotion() ? 0 : delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * ScaleIn Component
 * Scale in animation with optional rotation
 */
interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  scale?: number;
  className?: string;
}

export const ScaleIn = ({ 
  children, 
  delay = 0, 
  duration = 0.2, 
  scale = 0.9,
  className = '',
}: ScaleInProps) => (
  <motion.div
    initial={{ opacity: 0, scale }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ 
      duration: prefersReducedMotion() ? 0.01 : duration, 
      delay: prefersReducedMotion() ? 0 : delay,
      ease: [0.34, 1.56, 0.64, 1], // Bounce easing
    }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * StaggerContainer Component
 * Container that staggers its children's animations
 */
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
}

export const StaggerContainer = ({ 
  children, 
  staggerDelay = 0.1, 
  delayChildren = 0.05,
  className = '',
}: StaggerContainerProps) => (
  <motion.div
    variants={AuroraVariants.staggerContainer}
    initial="hidden"
    animate="visible"
    exit="exit"
    transition={{
      staggerChildren: prefersReducedMotion() ? 0 : staggerDelay,
      delayChildren: prefersReducedMotion() ? 0 : delayChildren,
    }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * StaggerItem Component
 * Individual item within a StaggerContainer
 */
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export const StaggerItem = ({ children, className = '' }: StaggerItemProps) => (
  <motion.div
    variants={AuroraVariants.staggerItem}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * GlassCard Component
 * Animated glassmorphic card with reveal effect
 */
interface GlassCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const GlassCard = ({ children, delay = 0, className = '' }: GlassCardProps) => (
  <motion.div
    variants={AuroraVariants.glassReveal}
    initial="hidden"
    animate="visible"
    exit="exit"
    transition={{ 
      delay: prefersReducedMotion() ? 0 : delay,
    }}
    className={`glass-card ${className}`}
  >
    {children}
  </motion.div>
);

/**
 * PageTransition Component
 * Animated page transitions with AnimatePresence
 */
interface PageTransitionProps {
  children: ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  className?: string;
}

export const PageTransition = ({ 
  children, 
  mode = 'wait',
  className = '',
}: PageTransitionProps) => (
  <AnimatePresence mode={mode} data-testid="link-element">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: prefersReducedMotion() ? 0.01 : 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

/**
 * HoverScale Component
 * Scale up on hover with smooth transition
 */
interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export const HoverScale = ({ children, scale = 1.02, className = '' }: HoverScaleProps) => (
  <motion.div
    whileHover={{ scale: prefersReducedMotion() ? 1 : scale }}
    whileTap={{ scale: prefersReducedMotion() ? 1 : 0.98 }}
    transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * LayoutShift Component
 * Animated layout changes using shared layoutId
 */
interface LayoutShiftProps {
  children: ReactNode;
  layoutId: string;
  className?: string;
}

export const LayoutShift = ({ children, layoutId, className = '' }: LayoutShiftProps) => (
  <motion.div
    layoutId={layoutId}
    transition={{
      layout: {
        duration: prefersReducedMotion() ? 0.01 : 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * CollapseExpand Component
 * Animated height change for collapse/expand
 */
interface CollapseExpandProps {
  children: ReactNode;
  isOpen: boolean;
  className?: string;
}

export const CollapseExpand = ({ children, isOpen, className = '' }: CollapseExpandProps) => (
  <motion.div
    initial={false}
    animate={{
      height: isOpen ? 'auto' : 0,
      opacity: isOpen ? 1 : 0,
    }}
    transition={{
      duration: prefersReducedMotion() ? 0.01 : 0.3,
      ease: [0.4, 0, 0.2, 1],
    }}
    className={`overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

/**
 * LoadingPulse Component
 * Pulsing animation for loading states
 */
interface LoadingPulseProps {
  children: ReactNode;
  className?: string;
}

export const LoadingPulse = ({ children, className = '' }: LoadingPulseProps) => (
  <motion.div
    animate={{
      opacity: prefersReducedMotion() ? 1 : [0.5, 1, 0.5],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className={className}
  >
    {children}
  </motion.div>
);

/**
 * SuccessPop Component
 * Pop animation for success states
 */
interface SuccessPopProps {
  children: ReactNode;
  show: boolean;
  className?: string;
}

export const SuccessPop = ({ children, show, className = '' }: SuccessPopProps) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: [0.8, 1.1, 1],
        }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          duration: prefersReducedMotion() ? 0.01 : 0.4,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        className={className}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

/**
 * CounterAnimation Component
 * Animated number counter
 */
interface CounterAnimationProps {
  value: number;
  duration?: number;
  className?: string;
}

export const CounterAnimation = ({ value, duration = 1, className = '' }: CounterAnimationProps) => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: prefersReducedMotion() ? 0.01 : 0.3 }}
    className={className}
  >
    <motion.span
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{
        duration: prefersReducedMotion() ? 0.01 : duration,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {value}
    </motion.span>
  </motion.span>
);

/**
 * Export all components and variants
 */
export { AnimatePresence, motion };
