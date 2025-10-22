/**
 * Mobile Service
 * MB.MD Track 4: Mobile Infrastructure
 * Implements: PWA support, responsive design helpers, touch optimizations
 */

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  touchEnabled: boolean;
}

export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  icons: Array<{ src: string; sizes: string; type: string }>;
}

class MobileService {
  /**
   * Detect device type from user agent
   */
  detectDevice(userAgent: string): DeviceInfo['type'] {
    const ua = userAgent.toLowerCase();
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  /**
   * Parse device info from headers
   */
  parseDeviceInfo(userAgent: string, viewport?: { width: number; height: number }): DeviceInfo {
    const type = this.detectDevice(userAgent);
    const os = this.detectOS(userAgent);
    const browser = this.detectBrowser(userAgent);

    return {
      type,
      os,
      browser,
      screenWidth: viewport?.width || 0,
      screenHeight: viewport?.height || 0,
      pixelRatio: 1,
      touchEnabled: type !== 'desktop',
    };
  }

  /**
   * Detect operating system
   */
  private detectOS(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (/android/i.test(ua)) return 'Android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
    if (/windows phone/i.test(ua)) return 'Windows Phone';
    if (/windows/i.test(ua)) return 'Windows';
    if (/mac/i.test(ua)) return 'macOS';
    if (/linux/i.test(ua)) return 'Linux';
    
    return 'Unknown';
  }

  /**
   * Detect browser
   */
  private detectBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (/edg/i.test(ua)) return 'Edge';
    if (/chrome/i.test(ua)) return 'Chrome';
    if (/safari/i.test(ua)) return 'Safari';
    if (/firefox/i.test(ua)) return 'Firefox';
    if (/opera|opr/i.test(ua)) return 'Opera';
    
    return 'Unknown';
  }

  /**
   * Generate PWA manifest
   */
  generateManifest(config: PWAConfig): object {
    return {
      name: config.name,
      short_name: config.shortName,
      description: config.description,
      start_url: '/',
      display: 'standalone',
      background_color: config.backgroundColor,
      theme_color: config.themeColor,
      orientation: 'portrait-primary',
      icons: config.icons,
      categories: ['social', 'lifestyle', 'entertainment'],
      prefer_related_applications: false,
    };
  }

  /**
   * Generate service worker registration script
   */
  generateServiceWorkerScript(): string {
    return `
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(registration => {
              console.log('SW registered:', registration);
            })
            .catch(error => {
              console.log('SW registration failed:', error);
            });
        });
      }
    `;
  }

  /**
   * Check if device supports PWA features
   */
  checkPWASupport(userAgent: string): {
    serviceWorker: boolean;
    manifest: boolean;
    pushNotifications: boolean;
    cameraAccess: boolean;
    geolocation: boolean;
  } {
    const deviceInfo = this.parseDeviceInfo(userAgent);
    
    return {
      serviceWorker: true, // Most modern browsers support this
      manifest: deviceInfo.type === 'mobile' || deviceInfo.type === 'tablet',
      pushNotifications: deviceInfo.os !== 'iOS' || deviceInfo.browser === 'Safari',
      cameraAccess: deviceInfo.type === 'mobile',
      geolocation: true,
    };
  }

  /**
   * Generate responsive image srcset
   */
  generateResponsiveSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
  }

  /**
   * Optimize content for mobile
   */
  optimizeForMobile(content: string, deviceType: DeviceInfo['type']): string {
    if (deviceType === 'desktop') return content;

    // Remove heavy elements for mobile
    let optimized = content;
    
    // Simplify images (would integrate with image service)
    // Reduce animation complexity
    // Minimize DOM nodes
    
    return optimized;
  }
}

// Export singleton instance
export const mobileService = new MobileService();
