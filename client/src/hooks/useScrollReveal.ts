import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  once?: boolean;
  stagger?: number;
  respectReducedMotion?: boolean;
}

export function useScrollReveal(
  selector: string,
  animation: gsap.TweenVars = {},
  options: ScrollRevealOptions = {}
) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (
      options.respectReducedMotion !== false &&
      prefersReducedMotion
    ) {
      return;
    }

    if (!elementRef.current) return;

    // Delay execution to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      if (!elementRef.current) return;

      const elements = elementRef.current.querySelectorAll(selector);
      if (elements.length === 0) return;

      const defaultAnimation: gsap.TweenVars = {
        opacity: 0,
        y: 50,
        ...animation,
      };

      const scrollTriggerConfig: ScrollTrigger.Vars = {
        trigger: options.trigger || elementRef.current,
        start: options.start || 'top 80%',
        end: options.end || 'bottom 20%',
        scrub: options.scrub || false,
        markers: options.markers || false,
        once: options.once !== false,
        toggleActions: 'play none none none',
      };

      const tween = gsap.from(elements, {
        ...defaultAnimation,
        stagger: options.stagger || 0.1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: scrollTriggerConfig,
      });

      return () => {
        tween.kill();
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.vars.trigger === elementRef.current) {
            trigger.kill();
          }
        });
      };
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [selector, animation, options]);

  return elementRef;
}

export function useParallax(
  selector: string,
  distance: number = 100,
  options: Omit<ScrollRevealOptions, 'scrub'> = {}
) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (
      options.respectReducedMotion !== false &&
      prefersReducedMotion
    ) {
      return;
    }

    if (!elementRef.current) return;

    const elements = elementRef.current.querySelectorAll(selector);
    if (elements.length === 0) return;

    const scrollTriggerConfig: ScrollTrigger.Vars = {
      trigger: options.trigger || elementRef.current,
      start: options.start || 'top bottom',
      end: options.end || 'bottom top',
      scrub: 1,
      markers: options.markers || false,
    };

    const tween = gsap.to(elements, {
      y: distance,
      ease: 'none',
      scrollTrigger: scrollTriggerConfig,
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === elementRef.current) {
          trigger.kill();
        }
      });
    };
  }, [selector, distance, options]);

  return elementRef;
}

export function usePinElement(
  selector: string,
  options: {
    start?: string;
    end?: string;
    pinSpacing?: boolean;
    markers?: boolean;
  } = {}
) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current.querySelector(selector);
    if (!element) return;

    const scrollTrigger = ScrollTrigger.create({
      trigger: element,
      start: options.start || 'top top',
      end: options.end || 'bottom top',
      pin: true,
      pinSpacing: options.pinSpacing !== false,
      markers: options.markers || false,
    });

    return () => {
      scrollTrigger.kill();
    };
  }, [selector, options]);

  return elementRef;
}

export function useScrollProgress(
  selector: string,
  options: {
    start?: string;
    end?: string;
    onUpdate?: (progress: number) => void;
  } = {}
) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current.querySelector(selector);
    if (!element) return;

    const scrollTrigger = ScrollTrigger.create({
      trigger: element,
      start: options.start || 'top top',
      end: options.end || 'bottom bottom',
      onUpdate: (self) => {
        if (options.onUpdate) {
          options.onUpdate(self.progress);
        }
      },
    });

    return () => {
      scrollTrigger.kill();
    };
  }, [selector, options]);

  return elementRef;
}
