/**
 * Stub for @react-three/drei - Provides minimal React Three Drei stubs
 * This stub allows the app to run without the actual @react-three/drei package
 */

import { ReactNode } from 'react';

export const OrbitControls = (props: any) => {
  console.warn('@react-three/drei is not installed - OrbitControls component is stubbed');
  return null;
};

export const PerspectiveCamera = (props: any) => {
  console.warn('@react-three/drei is not installed - PerspectiveCamera component is stubbed');
  return null;
};

export const Environment = (props: any) => {
  console.warn('@react-three/drei is not installed - Environment component is stubbed');
  return null;
};

export const ContactShadows = (props: any) => {
  console.warn('@react-three/drei is not installed - ContactShadows component is stubbed');
  return null;
};

export const Html = ({ children, ...props }: { children?: ReactNode; [key: string]: any }) => {
  console.warn('@react-three/drei is not installed - Html component is stubbed');
  return null;
};

export const useGLTF = (path: string) => {
  console.warn('@react-three/drei is not installed - useGLTF hook is stubbed');
  return { scene: {}, nodes: {}, materials: {} };
};
