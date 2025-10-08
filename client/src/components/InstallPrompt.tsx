import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Share2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { pwaManager, isIOS, isPWA } from '@/lib/pwa-utils';
import { useToast } from '@/hooks/use-toast';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (isPWA() || dismissed) return;

    // Check if previously dismissed (stored for 7 days)
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setDismissed(true);
        return;
      }
    }

    // Listen for install available event
    const handleInstallAvailable = () => {
      setShowPrompt(true);
    };

    // Listen for app installed event
    const handleInstalled = () => {
      setShowPrompt(false);
      toast({
        title: "App Installed! 🎉",
        description: "Mundo Tango has been added to your home screen",
      });
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    // Check if iOS and not installed
    if (isIOS() && !isPWA()) {
      // Show iOS prompt after user has been on site for 30 seconds
      setTimeout(() => {
        if (!dismissed) {
          setShowPrompt(true);
          setShowIOSInstructions(true);
        }
      }, 30000);
    }

    // Check current install state
    const { canInstall } = pwaManager.getInstallState();
    if (canInstall) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, [dismissed, toast]);

  const handleInstall = async () => {
    const installed = await pwaManager.promptInstall();
    if (installed) {
      setShowPrompt(false);
      toast({
        title: "Installation started",
        description: "Mundo Tango is being installed...",
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const getIOSInstructions = () => {
    const instructions = pwaManager.getIOSInstallInstructions();
    return instructions.length > 0 ? instructions : null;
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <Card className="relative bg-gradient-to-br from-teal-500/10 via-cyan-600/10 to-teal-700/10 backdrop-blur-lg border-teal-400/20 shadow-2xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-gray-600 dark:text-gray-400 hover:text-gray-600"
            onClick={handleDismiss}
           
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Install Mundo Tango
                </h3>
                
                {showIOSInstructions ? (
                  <IOSInstructions instructions={getIOSInstructions()} />
                ) : (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-300 mb-4">
                      Get the full app experience with offline access, push notifications, and more!
                    </p>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleInstall}
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                       
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Install App
                      </Button>
                      
                      <Button
                        variant="ghost"
                        onClick={handleDismiss}
                        className="w-full text-gray-600 dark:text-gray-600 dark:text-gray-400"
                       
                      >
                        Maybe Later
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Features list */}
            {!showIOSInstructions && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    Offline access
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    Push notifications
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    Home screen icon
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    Full screen mode
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

function IOSInstructions({ instructions }: { instructions: string[] | null }) {
  if (!instructions) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-600 dark:text-gray-300 mb-3">
        To install on iOS:
      </p>
      
      <ol className="space-y-2">
        {instructions.map((step, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-600 dark:text-gray-300">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 text-xs flex items-center justify-center font-semibold">
              {index + 1}
            </span>
            <span>{step}</span>
            {index === 0 && <Share2 className="h-4 w-4 text-ocean-500 ml-auto" />}
            {index === 1 && <Plus className="h-4 w-4 text-ocean-500 ml-auto" />}
          </li>
        ))}
      </ol>
      
      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          💡 Tip: Make sure you're using Safari browser
        </p>
      </div>
    </div>
  );
}

// Standalone mini install button that can be placed in the header
export function MiniInstallButton() {
  const [canInstall, setCanInstall] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isPWA()) return;

    const checkInstallState = () => {
      const { canInstall } = pwaManager.getInstallState();
      setCanInstall(canInstall);
    };

    checkInstallState();
    window.addEventListener('pwa-install-available', checkInstallState);
    window.addEventListener('pwa-installed', () => setCanInstall(false));

    return () => {
      window.removeEventListener('pwa-install-available', checkInstallState);
      window.removeEventListener('pwa-installed', () => setCanInstall(false));
    };
  }, []);

  const handleInstall = async () => {
    const installed = await pwaManager.promptInstall();
    if (installed) {
      toast({
        title: "Installing Mundo Tango",
        description: "The app is being added to your device",
      });
    }
  };

  if (!canInstall) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleInstall}
        className="relative"
       
      >
        <Download className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
      </Button>
    </motion.div>
  );
}