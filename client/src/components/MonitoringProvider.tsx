/**
 * ESA Life CEO 61x21 - Monitoring Provider Component
 * Provides monitoring context and consent management UI
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { monitoring } from '@/services/monitoring';
import { ConsentModal } from './ConsentModal';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Shield, Eye, BarChart, X } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassComponents';


interface MonitoringContextValue {
  hasConsent: boolean;
  isInitialized: boolean;
  requestConsent: () => Promise<void>;
  revokeConsent: () => void;
  showPrivacySettings: boolean;
  setShowPrivacySettings: (show: boolean) => void;
  updateConsent: (analytics: boolean, sessionRecording: boolean, errorTracking: boolean) => void;
}

const MonitoringContext = createContext<MonitoringContextValue | undefined>(undefined);

export function useMonitoringContext() {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoringContext must be used within MonitoringProvider');
  }
  return context;
}

interface MonitoringProviderProps {
  children: ReactNode;
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  const [hasConsent, setHasConsent] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [isCheckingConsent, setIsCheckingConsent] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check initial consent status
    checkInitialConsent();
  }, []);

  const checkInitialConsent = async () => {
    try {
      // Get the consent manager from monitoring service
      const consentManager = (monitoring as any).consentManager;
      
      // Check if user has already given consent
      const existingConsent = await consentManager.checkConsent();
      
      if (existingConsent) {
        // User already gave consent, initialize monitoring
        await monitoring.initialize();
        setHasConsent(true);
        setIsInitialized(true);
        console.log('[MonitoringProvider] Monitoring initialized with existing consent');
      } else {
        // No existing consent - user must enable in settings
        console.log('[MonitoringProvider] No consent - user can enable analytics in Settings > Privacy');
      }
    } catch (error) {
      console.error('[MonitoringProvider] Failed to check consent:', error);
    } finally {
      setIsCheckingConsent(false);
    }
  };

  const handleConsentDecision = async (analytics: boolean, sessionRecording: boolean, errorTracking: boolean) => {
    try {
      const consentManager = (monitoring as any).consentManager;
      
      // Update consent state in consent manager
      consentManager.updateConsent({
        analytics,
        sessionRecording,
        errorTracking,
      });

      if (analytics || sessionRecording || errorTracking) {
        // Initialize monitoring with new consent
        await monitoring.initialize();
        setHasConsent(true);
        setIsInitialized(true);
        
        toast({
          title: "Privacy Settings Updated",
          description: "Thank you for helping us improve your experience",
        });
        
        console.log('[MonitoringProvider] Monitoring initialized with user consent');
      } else {
        // User rejected all tracking
        setHasConsent(false);
        
        toast({
          title: "Privacy Settings Updated",
          description: "All tracking has been disabled",
        });
        
        console.log('[MonitoringProvider] User rejected all tracking');
      }
      
      setShowConsentModal(false);
      setShowConsentBanner(false);
    } catch (error) {
      console.error('[MonitoringProvider] Failed to handle consent decision:', error);
    }
  };

  const requestConsent = async () => {
    setShowConsentModal(true);
  };

  const revokeConsent = () => {
    monitoring.revokeConsent();
    setHasConsent(false);
    setIsInitialized(false);
    
    toast({
      title: "Privacy Settings Updated",
      description: "Analytics and monitoring have been disabled",
    });
  };

  const updateConsent = (analytics: boolean, sessionRecording: boolean, errorTracking: boolean) => {
    handleConsentDecision(analytics, sessionRecording, errorTracking);
  };

  // Don't render children until we've checked consent
  if (isCheckingConsent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <MonitoringContext.Provider value={{
      hasConsent,
      isInitialized,
      requestConsent,
      revokeConsent,
      showPrivacySettings,
      setShowPrivacySettings,
      updateConsent,
    }}>
      {children}

      {/* Privacy settings moved to Settings > Privacy page - no automatic popups */}
      {/* showConsentModal removed - users manage privacy in settings */}

      {/* Consent Banner - Disabled - users manage privacy in settings */}
      {false && showConsentBanner && !hasConsent && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-500" data-testid="consent-banner">
          <div className="bg-[var(--color-surface)] dark:bg-gray-900 rounded-2xl shadow-2xl border border-[var(--color-border)] dark:border-gray-800 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Shield className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-semibold text-[var(--color-text)] dark:text-white">
                  Help us improve your experience
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  We use analytics to understand how you use our platform and fix issues quickly. Your data is encrypted and never sold.
                </p>
                <div className="flex space-x-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowConsentBanner(false)}
                    className="text-xs"
                    data-testid="button-later"
                  >
                    Later
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowConsentModal(true)}
                    className="text-xs bg-gradient-to-r from-[var(--color-primary)] to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                    data-testid="button-enable"
                  >
                    Enable Analytics
                  </Button>
                </div>
              </div>
              <button
                onClick={() = aria-label="Button"> setShowConsentBanner(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                data-testid="button-close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      {showPrivacySettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="privacy-modal">
          <GlassCard depth={1} className="fixed inset-0" onClick={() => setShowPrivacySettings(false)} />
          <div className="relative bg-[var(--color-surface)] dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-text)] dark:text-white">Privacy Settings</h3>
              <button
                onClick={() = aria-label="Button"> setShowPrivacySettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-elevated)] dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <BarChart className="w-5 h-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="font-medium text-[var(--color-text)] dark:text-white">Analytics (PostHog)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Product usage and feature adoption</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${hasConsent ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-[var(--color-neutral-100)] text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {hasConsent ? 'Enabled' : 'Disabled'}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-elevated)] dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="font-medium text-[var(--color-text)] dark:text-white">Session Recording (OpenReplay)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Help us identify UX issues</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${hasConsent ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-[var(--color-neutral-100)] text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {hasConsent ? 'Enabled' : 'Disabled'}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-elevated)] dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="font-medium text-[var(--color-text)] dark:text-white">Error Tracking (Sentry)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Automatic error reporting</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${hasConsent ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-[var(--color-neutral-100)] text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {hasConsent ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>

            <div className="pt-4 flex space-x-3">
              {hasConsent ? (
                <Button
                  variant="destructive"
                  onClick={revokeConsent}
                  className="flex-1"
                  data-testid="button-revoke"
                >
                  Disable All Tracking
                </Button>
              ) : (
                <Button
                  onClick={() => setShowConsentModal(true)}
                  className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  data-testid="button-enable-all"
                >
                  Configure Analytics
                </Button>
              )}
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Your privacy is important to us. Data is encrypted and never sold to third parties.
              {isInitialized && (
                <span className="block mt-1 text-[var(--color-primary-hover)] dark:text-teal-400 font-medium">
                  ✓ Monitoring services active
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </MonitoringContext.Provider>
  );
}