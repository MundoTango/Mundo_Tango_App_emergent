/**
 * Stub for gsap/ScrollTrigger - Provides minimal GSAP ScrollTrigger plugin stubs
 * This stub allows the app to run without the actual gsap/ScrollTrigger package
 */

export interface ScrollTriggerConfig {
  trigger?: string | Element;
  start?: string | number;
  end?: string | number;
  scrub?: boolean | number;
  pin?: boolean | Element;
  markers?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
  onUpdate?: (self: any) => void;
  [key: string]: any;
}

export class ScrollTrigger {
  constructor(config: ScrollTriggerConfig) {
    console.warn('GSAP ScrollTrigger is not installed - scroll animations are stubbed');
  }

  static create(config: ScrollTriggerConfig) {
    return new ScrollTrigger(config);
  }

  static getAll() {
    return [];
  }

  static getById(id: string) {
    return null;
  }

  static refresh() {
    console.warn('ScrollTrigger.refresh() is stubbed');
  }

  static update() {
    console.warn('ScrollTrigger.update() is stubbed');
  }

  static kill() {
    console.warn('ScrollTrigger.kill() is stubbed');
  }

  static normalizeScroll(config?: any) {
    console.warn('ScrollTrigger.normalizeScroll() is stubbed');
  }

  kill() {
    console.warn('ScrollTrigger instance kill() is stubbed');
  }

  refresh() {
    console.warn('ScrollTrigger instance refresh() is stubbed');
  }

  update() {
    console.warn('ScrollTrigger instance update() is stubbed');
  }

  enable() {
    console.warn('ScrollTrigger instance enable() is stubbed');
  }

  disable() {
    console.warn('ScrollTrigger instance disable() is stubbed');
  }
}

export default ScrollTrigger;
