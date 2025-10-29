/**
 * ESA LIFE CEO 61x21 - PWA Utilities (Phase 16)
 * Progressive Web App utilities and helpers
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export class PWAManager {
  private static instance: PWAManager;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private updateAvailable = false;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.init();
  }

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private async init() {
    // Check if app is installed
    this.checkIfInstalled();
    
    // Listen for install prompt
    this.setupInstallPrompt();
    
    // Setup service worker
    await this.registerServiceWorker();
    
    // Setup update detection
    this.setupUpdateDetection();
    
    // Setup app installed event
    this.setupAppInstalledEvent();
  }

  private checkIfInstalled() {
    // Check if app is running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      return;
    }

    // Check for iOS
    if ('standalone' in window.navigator && (window.navigator as any).standalone) {
      this.isInstalled = true;
      return;
    }

    // Check if installed via getInstalledRelatedApps (if available)
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
        if (apps.length > 0) {
          this.isInstalled = true;
        }
      });
    }
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      
      // Notify UI that install is available
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
      
      // Track install prompt shown
      this.trackEvent('install_prompt_shown');
    });
  }

  private async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', this.registration);

      // Check for updates every hour
      setInterval(() => {
        this.registration?.update();
      }, 60 * 60 * 1000);

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private setupUpdateDetection() {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.updateAvailable = true;
          window.dispatchEvent(new CustomEvent('pwa-update-available'));
          this.trackEvent('update_available');
        }
      });
    });

    // Listen for skip waiting message
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_UPDATED') {
        window.location.reload();
      }
    });
  }

  private setupAppInstalledEvent() {
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.trackEvent('app_installed');
      
      // Hide install prompt
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
  }

  // Public methods
  
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('Install prompt not available');
      return false;
    }

    try {
      // Show the install prompt
      await this.deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await this.deferredPrompt.userChoice;
      
      // Track the outcome
      this.trackEvent('install_prompt_outcome', { outcome });
      
      // Clear the prompt
      this.deferredPrompt = null;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }

  skipWaiting() {
    if (!this.registration?.waiting) return;
    
    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  getInstallState() {
    return {
      isInstalled: this.isInstalled,
      canInstall: !!this.deferredPrompt,
      updateAvailable: this.updateAvailable
    };
  }

  // iOS install instructions
  getIOSInstallInstructions(): string[] {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    if (!isIOS) return [];
    
    const isSafari = /safari/.test(userAgent) && !/crios|fxios|opr/.test(userAgent);
    
    if (isSafari) {
      return [
        'Tap the Share button (square with arrow)',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to install Mundo Tango'
      ];
    } else {
      return [
        'Open this page in Safari',
        'Tap the Share button',
        'Select "Add to Home Screen"'
      ];
    }
  }

  // Network status
  isOnline(): boolean {
    return navigator.onLine;
  }

  onNetworkChange(callback: (online: boolean) => void) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  }

  // Cache management
  async getCacheSize(): Promise<number> {
    if (!('estimate' in navigator.storage)) return 0;
    
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }

  async clearCache(): Promise<void> {
    if (!('caches' in window)) return;
    
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    
    // Unregister service worker
    if (this.registration) {
      await this.registration.unregister();
      window.location.reload();
    }
  }

  // Analytics tracking
  private trackEvent(event: string, data?: any) {
    // Send to analytics
    if (typeof window.plausible !== 'undefined') {
      window.plausible('PWA', { props: { event, ...data } });
    }
    
    // Log for debugging
    console.log(`[PWA Event] ${event}`, data);
  }

  // Permissions
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.trackEvent('notification_permission', { result: permission });
      return permission;
    }

    return Notification.permission;
  }

  async checkPermissions() {
    const permissions = {
      notifications: Notification.permission,
      camera: null as PermissionState | null,
      geolocation: null as PermissionState | null,
      microphone: null as PermissionState | null
    };

    // Check other permissions
    if ('permissions' in navigator) {
      try {
        const camera = await navigator.permissions.query({ name: 'camera' as PermissionName });
        permissions.camera = camera.state;
      } catch {}

      try {
        const geo = await navigator.permissions.query({ name: 'geolocation' });
        permissions.geolocation = geo.state;
      } catch {}

      try {
        const mic = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        permissions.microphone = mic.state;
      } catch {}
    }

    return permissions;
  }

  // Share API
  async share(data: { title?: string; text?: string; url?: string; files?: File[] }) {
    if (!('share' in navigator)) {
      // Fallback to copying to clipboard
      if (data.url) {
        await navigator.clipboard.writeText(data.url);
        return { shared: false, copied: true };
      }
      return { shared: false, copied: false };
    }

    try {
      // Check if can share files
      if (data.files && !('canShare' in navigator || !(navigator as any).canShare({ files: data.files }))) {
        delete data.files;
      }

      await navigator.share(data);
      this.trackEvent('content_shared', { hasFiles: !!data.files });
      return { shared: true };
    } catch (error) {
      console.error('Share failed:', error);
      return { shared: false, error };
    }
  }

  // Vibration API
  vibrate(pattern: number | number[] = 100) {
    if (!('vibrate' in navigator)) return;
    navigator.vibrate(pattern);
  }

  // Screen orientation
  async lockOrientation(orientation: OrientationLockType) {
    if (!('orientation' in screen)) return;
    
    try {
      await (screen.orientation as any).lock(orientation);
    } catch (error) {
      console.error('Failed to lock orientation:', error);
    }
  }

  unlockOrientation() {
    if (!('orientation' in screen)) return;
    (screen.orientation as any).unlock();
  }

  // Badge API
  async setBadge(count: number) {
    if (!('setAppBadge' in navigator)) return;
    
    try {
      if (count > 0) {
        await (navigator as any).setAppBadge(count);
      } else {
        await (navigator as any).clearAppBadge();
      }
    } catch (error) {
      console.error('Failed to set badge:', error);
    }
  }

  async clearBadge() {
    if (!('clearAppBadge' in navigator)) return;
    
    try {
      await (navigator as any).clearAppBadge();
    } catch (error) {
      console.error('Failed to clear badge:', error);
    }
  }
}

// Export singleton instance
export const pwaManager = PWAManager.getInstance();

// Utility functions
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         ('standalone' in window.navigator && (window.navigator as any).standalone);
};

export const isIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

export const isAndroid = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
};

export const isMobile = () => {
  return isIOS() || isAndroid();
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};