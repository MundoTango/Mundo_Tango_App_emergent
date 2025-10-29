/**
 * Aurora Tide - GSAP Animation Utilities
 * Centralized GSAP animation helpers with React hooks
 * Automatic cleanup, performance optimizations, and accessibility
 */

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useEffect } from 'react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation duration based on user preferences
 */
export const getAnimationDuration = (duration: number): number => {
  return prefersReducedMotion() ? 0.01 : duration;
};

/**
 * Aurora Tide Easing Presets
 * Matches CSS custom properties from design tokens
 */
export const AuroraEasing = {
  smooth: 'power2.inOut',      // Matches --ease-smooth
  bounce: 'back.out(1.7)',     // Matches --ease-bounce  
  elastic: 'elastic.out(1, 0.5)', // Matches --ease-elastic
  swift: 'power3.out',         // Matches --ease-swift
  anticipate: 'power2.in',     // Matches --ease-anticipate
  inOut: 'power4.inOut',       // Matches --ease-in-out
} as const;

/**
 * Aurora Tide Duration Presets (in seconds)
 */
export const AuroraDuration = {
  instant: 0.1,    // --duration-instant
  fast: 0.15,      // --duration-fast
  base: 0.2,       // --duration-base
  moderate: 0.3,   // --duration-moderate
  slow: 0.4,       // --duration-slow
  slower: 0.6,     // --duration-slower
} as const;

/**
 * Aurora Tide Stagger Delays (in seconds)
 */
export const AuroraStagger = {
  sm: 0.05,   // --delay-stagger-sm
  md: 0.1,    // --delay-stagger-md
  lg: 0.15,   // --delay-stagger-lg
} as const;

/**
 * Fade In Animation
 * @param element - Target element or selector
 * @param options - Animation options
 */
export const fadeIn = (
  element: gsap.TweenTarget,
  options: {
    duration?: number;
    delay?: number;
    y?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) => {
  const {
    duration = AuroraDuration.moderate,
    delay = 0,
    y = 10,
    ease = AuroraEasing.smooth,
    onComplete,
  } = options;

  return gsap.from(element, {
    opacity: 0,
    y,
    duration: getAnimationDuration(duration),
    delay,
    ease,
    onComplete,
  });
};

/**
 * Scale In Animation (Pop Effect)
 */
export const scaleIn = (
  element: gsap.TweenTarget,
  options: {
    duration?: number;
    delay?: number;
    scale?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) => {
  const {
    duration = AuroraDuration.fast,
    delay = 0,
    scale = 0.9,
    ease = AuroraEasing.bounce,
    onComplete,
  } = options;

  return gsap.from(element, {
    opacity: 0,
    scale,
    duration: getAnimationDuration(duration),
    delay,
    ease,
    onComplete,
  });
};

/**
 * Slide In Animation
 */
export const slideIn = (
  element: gsap.TweenTarget,
  options: {
    duration?: number;
    delay?: number;
    direction?: 'left' | 'right' | 'up' | 'down';
    distance?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) => {
  const {
    duration = AuroraDuration.moderate,
    delay = 0,
    direction = 'left',
    distance = 20,
    ease = AuroraEasing.smooth,
    onComplete,
  } = options;

  const transforms: Record<string, { x?: number; y?: number }> = {
    left: { x: -distance },
    right: { x: distance },
    up: { y: -distance },
    down: { y: distance },
  };

  return gsap.from(element, {
    opacity: 0,
    ...transforms[direction],
    duration: getAnimationDuration(duration),
    delay,
    ease,
    onComplete,
  });
};

/**
 * Stagger Children Animation
 * Animates multiple elements with a delay between each
 */
export const staggerChildren = (
  elements: gsap.TweenTarget,
  options: {
    duration?: number;
    stagger?: number;
    y?: number;
    ease?: string;
    onComplete?: () => void;
  } = {}
) => {
  const {
    duration = AuroraDuration.moderate,
    stagger = AuroraStagger.md,
    y = 10,
    ease = AuroraEasing.smooth,
    onComplete,
  } = options;

  return gsap.from(elements, {
    opacity: 0,
    y,
    duration: getAnimationDuration(duration),
    stagger: prefersReducedMotion() ? 0 : stagger,
    ease,
    onComplete,
  });
};

/**
 * Scroll Reveal Animation
 * Element fades in when scrolled into view
 */
export const scrollReveal = (
  element: gsap.TweenTarget,
  options: {
    trigger?: gsap.DOMTarget;
    start?: string;
    end?: string;
    scrub?: boolean;
    markers?: boolean;
    y?: number;
    duration?: number;
    ease?: string;
  } = {}
) => {
  const {
    trigger,
    start = 'top 80%',
    end = 'top 20%',
    scrub = false,
    markers = false,
    y = 30,
    duration = AuroraDuration.moderate,
    ease = AuroraEasing.smooth,
  } = options;

  if (prefersReducedMotion()) {
    return gsap.set(element, { opacity: 1, y: 0 });
  }

  return gsap.from(element, {
    opacity: 0,
    y,
    duration,
    ease,
    scrollTrigger: {
      trigger: (trigger || element) as gsap.DOMTarget,
      start,
      end,
      scrub,
      markers,
    },
  });
};

/**
 * Parallax Scroll Effect
 */
export const parallaxScroll = (
  element: gsap.TweenTarget,
  options: {
    trigger?: gsap.DOMTarget;
    speed?: number;
    start?: string;
    end?: string;
    markers?: boolean;
  } = {}
) => {
  const {
    trigger,
    speed = 0.5,
    start = 'top bottom',
    end = 'bottom top',
    markers = false,
  } = options;

  if (prefersReducedMotion()) {
    return gsap.set(element, { y: 0 });
  }

  return gsap.to(element, {
    y: () => window.innerHeight * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: (trigger || element) as gsap.DOMTarget,
      start,
      end,
      scrub: true,
      markers,
    },
  });
};

/**
 * Magnetic Button Effect
 * Button follows cursor on hover
 */
export const magneticButton = (button: HTMLElement, strength: number = 0.3) => {
  if (prefersReducedMotion()) return;

  const handleMouseMove = (e: MouseEvent) => {
    const { left, top, width, height } = button.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    gsap.to(button, {
      x: deltaX,
      y: deltaY,
      duration: AuroraDuration.fast,
      ease: AuroraEasing.swift,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: AuroraDuration.moderate,
      ease: AuroraEasing.elastic,
    });
  };

  button.addEventListener('mousemove', handleMouseMove);
  button.addEventListener('mouseleave', handleMouseLeave);

  // Cleanup
  return () => {
    button.removeEventListener('mousemove', handleMouseMove);
    button.removeEventListener('mouseleave', handleMouseLeave);
  };
};

/**
 * Create GSAP Timeline with defaults
 */
export const createTimeline = (options: gsap.TimelineVars = {}) => {
  return gsap.timeline({
    defaults: {
      ease: AuroraEasing.smooth,
      duration: getAnimationDuration(AuroraDuration.base),
    },
    ...options,
  });
};

/**
 * Hover Lift Effect
 * Subtle lift on hover with shadow
 */
export const hoverLift = (element: HTMLElement) => {
  if (prefersReducedMotion()) return;

  const handleMouseEnter = () => {
    gsap.to(element, {
      y: -4,
      duration: AuroraDuration.fast,
      ease: AuroraEasing.swift,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      y: 0,
      duration: AuroraDuration.fast,
      ease: AuroraEasing.swift,
    });
  };

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  // Cleanup
  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
};

/**
 * React Hook: useScrollReveal
 * Automatically reveals element on scroll
 */
export const useScrollReveal = (options: Parameters<typeof scrollReveal>[1] = {}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (elementRef.current) {
      scrollReveal(elementRef.current, options);
    }
  }, [options]);

  return elementRef;
};

/**
 * React Hook: useParallax
 * Automatically adds parallax effect
 */
export const useParallax = (options: Parameters<typeof parallaxScroll>[1] = {}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (elementRef.current) {
      parallaxScroll(elementRef.current, options);
    }
  }, [options]);

  return elementRef;
};

/**
 * React Hook: useMagneticButton
 * Automatically adds magnetic effect to button
 */
export const useMagneticButton = (strength: number = 0.3) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      const cleanup = magneticButton(buttonRef.current, strength);
      return cleanup;
    }
  }, [strength]);

  return buttonRef;
};

/**
 * React Hook: useHoverLift
 * Automatically adds hover lift effect
 */
export const useHoverLift = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      const cleanup = hoverLift(elementRef.current);
      return cleanup;
    }
  }, []);

  return elementRef;
};

/**
 * Cleanup all ScrollTriggers
 * Call this when unmounting components
 */
export const cleanupScrollTriggers = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
};

/**
 * Refresh all ScrollTriggers
 * Call this after dynamic content loads
 */
export const refreshScrollTriggers = () => {
  ScrollTrigger.refresh();
};

/**
 * Performance: Enable GPU acceleration
 */
export const enableGPU = (element: gsap.TweenTarget) => {
  return gsap.set(element, {
    force3D: true,
    transformPerspective: 1000,
  });
};

/**
 * Batch animations for better performance
 */
export const batchAnimate = (
  elements: Element[],
  animation: (element: Element, index: number) => gsap.core.Tween
) => {
  return elements.map((element, index) => animation(element, index));
};
