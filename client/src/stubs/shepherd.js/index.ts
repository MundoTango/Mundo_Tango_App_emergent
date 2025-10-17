/**
 * Stub for shepherd.js - Provides minimal Shepherd.js tour stubs
 * This stub allows the app to run without the actual shepherd.js package
 */

export interface ShepherdOptions {
  useModalOverlay?: boolean;
  defaultStepOptions?: any;
  [key: string]: any;
}

export interface StepOptions {
  id?: string;
  title?: string;
  text?: string;
  attachTo?: { element: string; on: string };
  buttons?: Array<{
    text: string;
    action?: () => void;
    classes?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

class Tour {
  constructor(options?: ShepherdOptions) {
    console.warn('Shepherd.js is not installed - interactive tours are stubbed');
  }

  addStep(options: StepOptions): void {}

  start(): void {}

  next(): void {}

  back(): void {}

  cancel(): void {}

  complete(): void {}

  hide(): void {}

  show(id?: string): void {}

  on(event: string, callback: Function): void {}

  off(event: string, callback: Function): void {}

  isActive(): boolean {
    return false;
  }
}

export default Tour;

export { Tour };
