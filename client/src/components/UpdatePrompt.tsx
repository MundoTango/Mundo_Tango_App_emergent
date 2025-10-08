import { useState, useEffect } from 'react';
import { RefreshCw, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { pwaManager } from '@/lib/pwa-utils';
import { useToast } from '@/hooks/use-toast';

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for update available event
    const handleUpdateAvailable = () => {
      setShowPrompt(true);
      toast({
        title: "Update Available",
        description: "A new version of Mundo Tango is ready to install",
        action: (
          <Button
            size="sm"
            onClick={handleUpdate}
            className="bg-ocean-500 hover:bg-teal-600"
          >
            Update
          </Button>
        ),
      });
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    // Check if update is already available on mount
    const { updateAvailable } = pwaManager.getInstallState();
    if (updateAvailable) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, [toast]);

  const handleUpdate = async () => {
    setUpdating(true);
    
    // Tell service worker to skip waiting
    pwaManager.skipWaiting();
    
    // Show updating message
    toast({
      title: "Updating...",
      description: "Mundo Tango is being updated to the latest version",
    });

    // The page will reload automatically when update is complete
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Show reminder in 1 hour
    setTimeout(() => {
      const { updateAvailable } = pwaManager.getInstallState();
      if (updateAvailable) {
        setShowPrompt(true);
      }
    }, 60 * 60 * 1000);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <Card className="relative bg-gradient-to-br from-amber-500/10 via-orange-600/10 to-amber-700/10 backdrop-blur-lg border-amber-400/20 shadow-2xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-gray-600 dark:text-gray-400 hover:text-gray-600"
            onClick={handleDismiss}
            disabled={updating}
           
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                  <RefreshCw className={`h-6 w-6 text-white ${updating ? 'animate-spin' : ''}`} />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Update Available! 🎉
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-300 mb-4">
                  We've made Mundo Tango even better! Update now to get the latest features and improvements.
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                   
                  >
                    {updating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Update Now
                      </>
                    )}
                  </Button>
                  
                  {!updating && (
                    <Button
                      variant="outline"
                      onClick={handleDismiss}
                      className="border-gray-300 dark:border-gray-600"
                     
                    >
                      Later
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* What's new section */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-600 dark:text-gray-300 mb-2">
                What's New:
              </p>
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-1">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>Performance improvements and bug fixes</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>Enhanced offline capabilities</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>New features and UI improvements</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Auto update check component
export function AutoUpdateChecker() {
  const { toast } = useToast();

  useEffect(() => {
    // Check for updates every 30 minutes
    const checkInterval = setInterval(() => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
      }
    }, 30 * 60 * 1000);

    // Also check on visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(checkInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}