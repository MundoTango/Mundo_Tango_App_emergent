/**
 * Stub for react-helmet - Provides minimal React Helmet stubs
 * This stub allows the app to run without the actual react-helmet package
 */

import { ReactNode } from 'react';

export interface HelmetProps {
  children?: ReactNode;
  title?: string;
  meta?: Array<{ name?: string; property?: string; content?: string; [key: string]: any }>;
  link?: Array<{ rel?: string; href?: string; [key: string]: any }>;
  [key: string]: any;
}

export const Helmet = ({ children, title, ...props }: HelmetProps) => {
  console.warn('react-helmet is not installed - SEO meta tags are stubbed');
  
  if (title && typeof document !== 'undefined') {
    document.title = title;
  }
  
  return null;
};

export default Helmet;
