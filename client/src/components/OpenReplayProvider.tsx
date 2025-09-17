import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { openReplayEnhanced } from '@/lib/openreplay-enhanced';
import { useAuth } from '@/hooks/useAuth';

export function OpenReplayProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const initRef = useRef(false);
  
  useEffect(() => {
    // Initialize OpenReplay once
    if (!initRef.current) {
      initRef.current = true;
      
      openReplayEnhanced.init({
        privacyMode: 'moderate', // Balance between privacy and debugging
        esaLayerTracking: true
      });
    }
  }, []);
  
  useEffect(() => {
    // Track page changes
    openReplayEnhanced.event('page_view', {
      path: location,
      category: getPageCategory(location)
    });
  }, [location]);
  
  useEffect(() => {
    // Identify user when authenticated
    if (user?.id) {
      openReplayEnhanced.identify(user.id.toString(), {
        name: user.name,
        email: user.email,
        username: user.username,
        tangoRoles: user.tangoRoles,
        isOnboardingComplete: user.isOnboardingComplete
      });
      
      openReplayEnhanced.setMetadata('user_roles', user.tangoRoles?.join(',') || 'none');
      openReplayEnhanced.setMetadata('onboarding_status', user.isOnboardingComplete ? 'complete' : 'pending');
    }
  }, [user]);
  
  // Provide session URL for support
  useEffect(() => {
    const sessionURL = openReplayEnhanced.getSessionURL();
    if (sessionURL) {
      console.log(`🎥 Session Recording: ${sessionURL}`);
      // Store in window for support access
      (window as any).__openReplaySessionURL = sessionURL;
    }
  }, []);
  
  return <>{children}</>;
}

function getPageCategory(path: string): string {
  if (path.startsWith('/auth') || path.startsWith('/login') || path.startsWith('/register')) return 'authentication';
  if (path.startsWith('/profile')) return 'user';
  if (path.startsWith('/events')) return 'events';
  if (path.startsWith('/messages')) return 'communication';
  if (path.startsWith('/admin')) return 'administration';
  if (path.startsWith('/community')) return 'community';
  if (path.startsWith('/groups')) return 'social';
  if (path.startsWith('/housing')) return 'housing';
  if (path.startsWith('/life-ceo')) return 'ai_agents';
  if (path === '/' || path === '/moments' || path === '/memories') return 'home';
  return 'other';
}