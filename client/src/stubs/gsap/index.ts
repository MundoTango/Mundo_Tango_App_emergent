/**
 * Stub for gsap - Provides minimal GSAP animation library stubs
 * This stub allows the app to run without the actual gsap package
 */

export interface GSAPTarget {
  [key: string]: any;
}

export interface GSAPTweenVars {
  [key: string]: any;
}

const gsap = {
  to: (target: GSAPTarget | GSAPTarget[], vars: GSAPTweenVars) => {
    console.warn('GSAP is not installed - animations are stubbed');
    return {
      kill: () => {},
      pause: () => {},
      play: () => {},
      resume: () => {},
      reverse: () => {},
      restart: () => {},
      seek: (time: number) => {},
      progress: (value?: number) => value || 0,
      duration: () => 0,
    };
  },
  
  from: (target: GSAPTarget | GSAPTarget[], vars: GSAPTweenVars) => {
    return gsap.to(target, vars);
  },
  
  fromTo: (target: GSAPTarget | GSAPTarget[], fromVars: GSAPTweenVars, toVars: GSAPTweenVars) => {
    return gsap.to(target, toVars);
  },
  
  set: (target: GSAPTarget | GSAPTarget[], vars: GSAPTweenVars) => {
    return gsap.to(target, vars);
  },
  
  timeline: (vars?: GSAPTweenVars) => {
    return {
      to: gsap.to,
      from: gsap.from,
      fromTo: gsap.fromTo,
      set: gsap.set,
      add: (child: any, position?: any) => {},
      kill: () => {},
      pause: () => {},
      play: () => {},
      resume: () => {},
      reverse: () => {},
      restart: () => {},
      seek: (time: number) => {},
      progress: (value?: number) => value || 0,
      duration: () => 0,
    };
  },
  
  registerPlugin: (...plugins: any[]) => {
    console.warn('GSAP plugins are stubbed');
  },
  
  utils: {
    toArray: (value: any) => Array.isArray(value) ? value : [value],
    selector: (selector: string) => document.querySelectorAll(selector),
    random: (min: number, max?: number, snap?: number) => {
      if (max === undefined) {
        max = min;
        min = 0;
      }
      const value = Math.random() * (max - min) + min;
      return snap ? Math.round(value / snap) * snap : value;
    },
  },
  
  quickSetter: (target: GSAPTarget, property: string, unit?: string) => {
    return (value: any) => {
      console.warn('GSAP quickSetter is stubbed');
    };
  },
};

// Export as both default and named export
export default gsap;
export { gsap };

// Export commonly used types
export const TweenMax = gsap;
export const TweenLite = gsap;
export const TimelineMax = gsap.timeline;
export const TimelineLite = gsap.timeline;
