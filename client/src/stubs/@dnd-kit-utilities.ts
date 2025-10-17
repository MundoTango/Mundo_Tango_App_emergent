/**
 * Stub for @dnd-kit/utilities - Provides minimal DnD Kit Utilities stubs
 * This stub allows the app to run without the actual @dnd-kit/utilities package
 */

export const CSS = {
  Transform: {
    toString: (transform: any) => {
      if (!transform) return '';
      const { x = 0, y = 0, scaleX = 1, scaleY = 1 } = transform;
      return `translate3d(${x}px, ${y}px, 0) scaleX(${scaleX}) scaleY(${scaleY})`;
    },
  },
  Translate: {
    toString: (transform: any) => {
      if (!transform) return '';
      const { x = 0, y = 0 } = transform;
      return `translate3d(${x}px, ${y}px, 0)`;
    },
  },
};

export const getClientRect = (element: HTMLElement) => {
  return element?.getBoundingClientRect() || {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    bottom: 0,
    right: 0,
  };
};
