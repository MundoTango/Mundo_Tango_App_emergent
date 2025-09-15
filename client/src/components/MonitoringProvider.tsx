/**
 * ESA Life CEO 61x21 - Monitoring Provider Component
 * Provides monitoring context and consent management UI
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { monitoring } from '@/services/monitoring';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Shield, Eye, BarChart, X } from 'lucide-react';

interface MonitoringContextValue {
  hasConsent: boolean;
  requestConsent: () => Promise<void>;
  revokeConsent: () => void;
  showPrivacySettings: boolean;
  setShowPrivacySettings: (show: boolean) => void;
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
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check initial consent status
    checkConsent();
  }, []);

  const checkConsent = async () => {
    const consentGiven = await monitoring.requestConsent();
    setHasConsent(consentGiven);
    
    if (!consentGiven) {
      // Show consent banner after a delay
      setTimeout(() => setShowConsentBanner(true), 3000);
    }
  };

  const requestConsent = async () => {
    const consentGiven = await monitoring.requestConsent();
    setHasConsent(consentGiven);
    setShowConsentBanner(false);
    
    if (consentGiven) {
      toast({
        title: "Privacy Settings Updated",
        description: "Thank you for helping us improve your experience",
      });
    }
  };

  const revokeConsent = () => {
    monitoring.revokeConsent();
    setHasConsent(false);
    toast({
      title: "Privacy Settings Updated",
      description: "Analytics and monitoring have been disabled",
    });
  };

  return (
    <MonitoringContext.Provider value={{
      hasConsent,
      requestConsent,
      revokeConsent,
      showPrivacySettings,
      setShowPrivacySettings
    }}>
      {children}

      {/* Consent Banner */}
      {showConsentBanner && !hasConsent && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-500" data-testid="consent-banner">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Shield className="w-5 h-5 text-teal-500" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
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
                    onClick={requestConsent}
                    className="text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                    data-testid="button-enable"
                  >
                    Enable Analytics
                  </Button>
                </div>
              </div>
              <button
                onClick={() => setShowConsentBanner(false)}
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPrivacySettings(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Settings</h3>
              <button
                onClick={() => setShowPrivacySettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <BarChart className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Analytics</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Product usage and feature adoption</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${hasConsent ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {hasConsent ? 'Enabled' : 'Disabled'}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Session Recording</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Help us identify UX issues</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${hasConsent ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {hasConsent ? 'Enabled' : 'Disabled'}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Error Tracking</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Automatic error reporting</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${hasConsent ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
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
                  onClick={requestConsent}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  data-testid="button-enable-all"
                >
                  Enable Analytics
                </Button>
              )}
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Your privacy is important to us. Data is encrypted and never sold to third parties.
            </p>
          </div>
        </div>
      )}
    </MonitoringContext.Provider>
  );
}