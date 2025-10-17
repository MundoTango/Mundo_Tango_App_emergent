/**
 * ESA LIFE CEO 61x21 - PWA Hook (Phase 16)
 * React hook for PWA functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { pwaManager, isPWA, isIOS, isAndroid, formatBytes } from '@/lib/pwa-utils';
import { pushNotifications } from '@/lib/push-notifications';
import { useToast } from '@/hooks/use-toast';

export interface PWAStatus {
  isInstalled: boolean;
  canInstall: boolean;
  updateAvailable: boolean;
  isOnline: boolean;
  isPWA: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  cacheSize: number;
  notificationsEnabled: boolean;
  notificationPermission: NotificationPermission;
}

export function usePWA() {
  const { toast } = useToast();
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    canInstall: false,
    updateAvailable: false,
    isOnline: navigator.onLine,
    isPWA: isPWA(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    cacheSize: 0,
    notificationsEnabled: false,
    notificationPermission: 'default'
  });

  // Update PWA status
  const updateStatus = useCallback(async () => {
    const installState = pwaManager.getInstallState();
    const cacheSize = await pwaManager.getCacheSize();
    const notificationStatus = pushNotifications.getStatus();
    
    setStatus(prev => ({
      ...prev,
      ...installState,
      cacheSize,
      notificationsEnabled: notificationStatus.isSubscribed,
      notificationPermission: Notification.permission
    }));
  }, []);

  useEffect(() => {
    // Initial status update
    updateStatus();

    // Listen for PWA events
    const handleInstallAvailable = () => {
      setStatus(prev => ({ ...prev, canInstall: true }));
    };

    const handleInstalled = () => {
      setStatus(prev => ({ 
        ...prev, 
        isInstalled: true, 
        canInstall: false 
      }));
    };

    const handleUpdateAvailable = () => {
      setStatus(prev => ({ ...prev, updateAvailable: true }));
    };

    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "Back Online",
        description: "Your connection has been restored",
      });
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "You're Offline",
        description: "Some features may be limited",
        variant: "destructive"
      });
    };

    // Add event listeners
    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network change detection
    pwaManager.onNetworkChange((online) => {
      setStatus(prev => ({ ...prev, isOnline: online }));
    });

    // Periodic cache size check
    const cacheInterval = setInterval(async () => {
      const size = await pwaManager.getCacheSize();
      setStatus(prev => ({ ...prev, cacheSize: size }));
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(cacheInterval);
    };
  }, [updateStatus, toast]);

  // Install PWA
  const install = useCallback(async () => {
    try {
      const installed = await pwaManager.promptInstall();
      if (installed) {
        await updateStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Install failed:', error);
      toast({
        title: "Installation Failed",
        description: "Unable to install the app. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [updateStatus, toast]);

  // Update PWA
  const update = useCallback(() => {
    pwaManager.skipWaiting();
    toast({
      title: "Updating...",
      description: "The app will reload with the latest version",
    });
  }, [toast]);

  // Enable push notifications
  const enableNotifications = useCallback(async () => {
    try {
      const enabled = await pushNotifications.subscribe();
      if (enabled) {
        setStatus(prev => ({ 
          ...prev, 
          notificationsEnabled: true,
          notificationPermission: 'granted'
        }));
        toast({
          title: "Notifications Enabled",
          description: "You'll receive updates about events and messages",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      toast({
        title: "Notifications Failed",
        description: "Unable to enable notifications. Please check your settings.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Disable push notifications
  const disableNotifications = useCallback(async () => {
    try {
      const disabled = await pushNotifications.unsubscribe();
      if (disabled) {
        setStatus(prev => ({ 
          ...prev, 
          notificationsEnabled: false 
        }));
        toast({
          title: "Notifications Disabled",
          description: "You won't receive push notifications",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      return false;
    }
  }, [toast]);

  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      await pwaManager.clearCache();
      setStatus(prev => ({ ...prev, cacheSize: 0 }));
      toast({
        title: "Cache Cleared",
        description: "All cached data has been removed",
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast({
        title: "Clear Cache Failed",
        description: "Unable to clear the cache. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Share content
  const share = useCallback(async (data: {
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
  }) => {
    const result = await pwaManager.share(data);
    if (result.shared) {
      toast({
        title: "Shared Successfully",
        description: "Content has been shared",
      });
    } else if (result.copied) {
      toast({
        title: "Link Copied",
        description: "The link has been copied to your clipboard",
      });
    }
    return result;
  }, [toast]);

  // Vibrate
  const vibrate = useCallback((pattern?: number | number[]) => {
    pwaManager.vibrate(pattern);
  }, []);

  // Set badge
  const setBadge = useCallback(async (count: number) => {
    await pwaManager.setBadge(count);
  }, []);

  // Clear badge
  const clearBadge = useCallback(async () => {
    await pwaManager.clearBadge();
  }, []);

  // Check permissions
  const checkPermissions = useCallback(async () => {
    return await pwaManager.checkPermissions();
  }, []);

  // Get iOS install instructions
  const getIOSInstructions = useCallback(() => {
    return pwaManager.getIOSInstallInstructions();
  }, []);

  // Format cache size
  const formattedCacheSize = formatBytes(status.cacheSize);

  return {
    status,
    install,
    update,
    enableNotifications,
    disableNotifications,
    clearCache,
    share,
    vibrate,
    setBadge,
    clearBadge,
    checkPermissions,
    getIOSInstructions,
    formattedCacheSize
  };
}

// Hook for network status only
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Hook for install prompt
export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkInstall = () => {
      const { canInstall } = pwaManager.getInstallState();
      setCanInstall(canInstall);
    };

    checkInstall();

    const handleInstallAvailable = () => setCanInstall(true);
    const handleInstalled = () => setCanInstall(false);

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const promptInstall = async () => {
    const installed = await pwaManager.promptInstall();
    if (installed) {
      toast({
        title: "App Installed!",
        description: "Mundo Tango has been added to your home screen",
      });
    }
    return installed;
  };

  return { canInstall, promptInstall };
}