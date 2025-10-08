/**
 * ESA Life CEO 61x21 - Consent Modal Component
 * GDPR-compliant consent modal for analytics and monitoring
 */

import { useState } from 'react';
import { Shield, Eye, BarChart, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/glass/GlassComponents';


interface ConsentModalProps {
  onAccept: (analytics: boolean, sessionRecording: boolean, errorTracking: boolean) => void;
  onReject: () => void;
}

export function ConsentModal({ onAccept, onReject }: ConsentModalProps) {
  const [analytics, setAnalytics] = useState(true);
  const [sessionRecording, setSessionRecording] = useState(true);
  const [errorTracking, setErrorTracking] = useState(true);

  const handleAcceptSelected = () => {
    onAccept(analytics, sessionRecording, errorTracking);
  };

  const handleAcceptAll = () => {
    onAccept(true, true, true);
  };

  const handleRejectAll = () => {
    onReject();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4" data-testid="consent-modal">
      {/* Backdrop */}
      <GlassCard depth={1} className="fixed inset-0"
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 transform transition-all animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 duration-300">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy & Analytics</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Help us improve your experience</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              We value your privacy. Your data is encrypted, never sold to third parties, and you can change these settings anytime in your privacy preferences.
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Analytics Option */}
          <div className="flex items-start justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              <BarChart className="w-5 h-5 text-ocean-500 flex-shrink-0 mt-1" />
              <div className="space-y-1 flex-1">
                <Label htmlFor="analytics-toggle" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  Product Analytics
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Understand how you use our features to improve the platform
                </p>
              </div>
            </div>
            <Switch
              id="analytics-toggle"
              checked={analytics}
              onCheckedChange={setAnalytics}
              data-testid="switch-analytics"
            />
          </div>

          {/* Session Recording Option */}
          <div className="flex items-start justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              <Eye className="w-5 h-5 text-ocean-500 flex-shrink-0 mt-1" />
              <div className="space-y-1 flex-1">
                <Label htmlFor="session-toggle" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  Session Recording
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Help us identify and fix user experience issues
                </p>
              </div>
            </div>
            <Switch
              id="session-toggle"
              checked={sessionRecording}
              onCheckedChange={setSessionRecording}
              data-testid="switch-session"
            />
          </div>

          {/* Error Tracking Option */}
          <div className="flex items-start justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-ocean-500 flex-shrink-0 mt-1" />
              <div className="space-y-1 flex-1">
                <Label htmlFor="error-toggle" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  Error Tracking
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically report technical issues for faster resolution
                </p>
              </div>
            </div>
            <Switch
              id="error-toggle"
              checked={errorTracking}
              onCheckedChange={setErrorTracking}
              data-testid="switch-errors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleRejectAll}
            className="flex-1"
            data-testid="button-reject-all"
          >
            Reject All
          </Button>
          <Button
            variant="outline"
            onClick={handleAcceptSelected}
            disabled={!analytics && !sessionRecording && !errorTracking}
            className="flex-1"
            data-testid="button-accept-selected"
          >
            Accept Selected
          </Button>
          <Button
            onClick={handleAcceptAll}
            className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            data-testid="button-accept-all"
          >
            Accept All
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By clicking "Accept", you agree to the storing of cookies on your device to enhance site navigation and analyze site usage.
          </p>
        </div>
      </div>
    </div>
  );
}