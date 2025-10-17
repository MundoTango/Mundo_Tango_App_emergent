import { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ESA LIFE CEO 61×21 AGENTS FRAMEWORK - Layer 53: Internationalization Agent
 * 
 * Higher-Order Component to automatically inject translation functionality
 * into any component for comprehensive site-wide internationalization
 */

interface WithTranslationProps {
  t: any;
  i18n: any;
}

/**
 * HOC that wraps a component with translation capabilities
 * Usage: export default withTranslation(MyComponent);
 */
export function withTranslation<P extends object>(
  Component: ComponentType<P & WithTranslationProps>,
  namespace: string = 'translation'
) {
  return function TranslatedComponent(props: P) {
    const { t, i18n } = useTranslation(namespace);
    
    return <Component {...props} t={t} i18n={i18n} />;
  };
}

/**
 * Hook for components that need translation with automatic namespace detection
 */
export function useAutoTranslation(componentName?: string) {
  // Determine namespace based on component location
  const namespace = componentName ? getNamespaceFromComponent(componentName) : 'translation';
  return useTranslation(namespace);
}

/**
 * Maps component names to appropriate translation namespaces
 */
function getNamespaceFromComponent(componentName: string): string {
  const namespaceMap: Record<string, string> = {
    // Auth components
    'Login': 'auth',
    'Signup': 'auth',
    'ForgotPassword': 'auth',
    
    // Profile components
    'Profile': 'profile',
    'EditProfile': 'profile',
    'ProfileSettings': 'profile',
    
    // Event components
    'Events': 'events',
    'EventDetail': 'events',
    'CreateEvent': 'events',
    
    // Group components
    'Groups': 'groups',
    'GroupDetail': 'groups',
    'CreateGroup': 'groups',
    
    // Message components
    'Messages': 'messages',
    'MessageThread': 'messages',
    'Compose': 'messages',
    
    // Friend components
    'Friends': 'friends',
    'FriendRequests': 'friends',
    'FindFriends': 'friends',
    
    // Settings components
    'Settings': 'settings',
    'AccountSettings': 'settings',
    'PrivacySettings': 'settings',
    
    // Default to translation namespace
    default: 'translation'
  };
  
  return namespaceMap[componentName] || namespaceMap.default;
}