/**
 * Stub for @react-three/fiber - Provides minimal React Three Fiber stubs
 * This stub allows the app to run without the actual @react-three/fiber package
 */

import { ReactNode } from 'react';

export const Canvas = ({ children, ...props }: { children?: ReactNode; [key: string]: any }) => {
  console.warn('@react-three/fiber is not installed - Canvas component is stubbed');
  return null;
};

export const useFrame = (callback: any, priority?: number) => {
  console.warn('@react-three/fiber is not installed - useFrame hook is stubbed');
};

export const useThree = () => {
  console.warn('@react-three/fiber is not installed - useThree hook is stubbed');
  return {
    camera: {},
    scene: {},
    gl: {},
    size: { width: 0, height: 0 },
  };
};

export const extend = (objects: any) => {
  console.warn('@react-three/fiber is not installed - extend function is stubbed');
};

export default Canvas;
