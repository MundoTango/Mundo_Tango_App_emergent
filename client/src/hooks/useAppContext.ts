/**
 * useAppContext - Collect platform context for Mr Blue AI
 * Gives Mr Blue "superpowers" to understand where user is and what they're doing
 */

import { useLocation } from 'wouter';
import { useAuth } from './useAuth';
import { isSuperAdmin } from '@/utils/accessControl';

export interface AppContext {
  route: string;
  pageName: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    role: string;
    isSuperAdmin: boolean;
  } | null;
  visualEditorState?: {
    isActive: boolean;
    selectedElement?: string;
  };
  platformContext: {
    timestamp: string;
    userAgent: string;
  };
}

export function useAppContext(): AppContext {
  const [location] = useLocation();
  const { user } = useAuth();

  // Map routes to friendly page names
  const getPageName = (route: string): string => {
    const pageMap: Record<string, string> = {
      '/': 'Home Feed',
      '/memories': 'Memories',
      '/events': 'Events',
      '/groups': 'Groups',
      '/profile': 'Profile',
      '/visual-editor': 'Visual Editor',
      '/life-ceo': 'Life CEO Performance Dashboard',
      '/admin': 'Admin Dashboard',
      '/settings': 'Settings',
    };
    return pageMap[route] || route;
  };

  // Detect Visual Editor state from DOM
  const detectVisualEditorState = () => {
    if (location !== '/visual-editor') return undefined;

    // Check if Visual Editor is active
    const selectedElement = document.querySelector('[data-selected="true"]');
    
    return {
      isActive: true,
      selectedElement: selectedElement?.getAttribute('data-element-type') || undefined,
    };
  };

  const isAdmin = isSuperAdmin(user);

  return {
    route: location,
    pageName: getPageName(location),
    user: user ? {
      id: user.id,
      username: user.username,
      displayName: user.name || user.username,
      role: isAdmin ? 'Super Admin' : 'User',
      isSuperAdmin: isAdmin,
    } : null,
    visualEditorState: detectVisualEditorState(),
    platformContext: {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    },
  };
}
